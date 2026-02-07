import { useState, useEffect } from "react";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { GET_STATES_BY_COUNTRY_ID, GET_COUNTRIES } from "@/graphql/stateCountryQueries";
import { ADD_CUSTOMER } from "../graphql/ecommerce/b2cCustomer"
import { B2C_CUSTOMER_LOGIN } from "@/graphql/LoginQueries";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Add tabValue state to control Tabs
  const [tabValue, setTabValue] = useState("signin");
  const [form, setForm] = useState({
    name: "",
    mobileNo: "",
    emailId: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    country: "",
    state: "",
    postalCode: "",
    floorNo: "",
    unitNo: "",
    password: "",
    confirmPassword: "",
  });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [countryId, setCountryId] = useState("");
  const [stateId, setStateId] = useState("");
  const [stateOptions, setStateOptions] = useState([]);
  const [pincodeError, setPincodeError] = useState("");
  const [stateMismatchError, setStateMismatchError] = useState("");
  const [isStateRequired, setIsStateRequired] = useState(false);

  const navigate = useNavigate();
    // Fetch all countries
    const { data: countriesData } = useQuery(GET_COUNTRIES, { fetchPolicy: "network-only" });
    const countryOptions = countriesData?.allCountry?.country || [];

    // Fetch states for selected country
    const [fetchStates, { data: statesData }] = useLazyQuery(GET_STATES_BY_COUNTRY_ID, { fetchPolicy: "network-only" });

    useEffect(() => {
      if (countryId) {
        fetchStates({ variables: { countryId: Number(countryId) } });
        setStateId("");
        setForm((prev) => ({ ...prev, state: "" }));
      } else {
        setStateOptions([]);
        setStateId("");
        setForm((prev) => ({ ...prev, state: "" }));
      }
    }, [countryId, fetchStates]);

    useEffect(() => {
      // Support both allState.state and stateByCountryId.states
      const newStates = statesData?.allState?.state || statesData?.stateByCountryId?.states || [];
      setStateOptions(newStates);
      setIsStateRequired(newStates.length > 0);
      // If stateId is set but not in new stateOptions, reset it
      if (stateId && newStates && !newStates.find((s: any) => s.stateID.toString() === stateId)) {
        setStateId("");
        setForm((prev) => ({ ...prev, state: "" }));
      }
    }, [statesData]);

    // Handle pincode change and auto-fill for India
    useEffect(() => {
      const fetchLocationFromPincode = async () => {
        const pin = form.postalCode?.trim();
        setPincodeError("");
        setStateMismatchError("");
        if (countryId !== "76") return; // 76 = India
        if (!pin || pin.length !== 6) return;
        try {
          const response = await axios.get(`https://api.postalpincode.in/pincode/${pin}`);
          const data = response.data?.[0];
          if (data?.Status === "Success" && data?.PostOffice?.length > 0) {
            // Use the first PostOffice entry for mapping
            const location = data.PostOffice[0];
            // Find country and state
            const matchedCountry = countryOptions.find(
              (c) => c.countryName.trim().toLowerCase() === location.Country.trim().toLowerCase()
            );
            const matchedState = stateOptions.find(
              (s) => s.stateName.trim().toLowerCase() === location.State.trim().toLowerCase()
            );
            if (matchedCountry) {
              setCountryId(matchedCountry.countryID.toString());
              setForm((prev) => ({ ...prev, country: matchedCountry.countryID.toString() }));
            }
            if (matchedState) {
              setStateId(matchedState.stateID.toString());
              setForm((prev) => ({ ...prev, state: matchedState.stateID.toString() }));
            } else {
              setStateId("");
              setForm((prev) => ({ ...prev, state: "" }));
            }
            if (stateId && matchedState && stateId !== matchedState.stateID.toString()) {
              setStateMismatchError("State selected does not match with postal code!");
            }
          } else {
            setPincodeError("Invalid Postal Code. Please enter a valid one.");
          }
        } catch {
          setPincodeError("Unable to validate postal code. Try again later.");
        }
      };
      fetchLocationFromPincode();
      // eslint-disable-next-line
    }, [form.postalCode, countryId, stateId, countryOptions, stateOptions]);
  const [errors, setErrors] = useState<any>({});
  const [addCustomer] = useMutation(ADD_CUSTOMER);
  const [login, { data, loading, error }] = useLazyQuery(B2C_CUSTOMER_LOGIN, {
    fetchPolicy: "no-cache",
  });

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login({
        variables: {
          userName: formData.email,
          password: formData.password,
        },
      });

      const result = response?.data?.b2cCustomerLogin;

      if (!result) {
        toast({
          title: "Error",
          description: "Server not responding.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (result.isSuccess) {
        toast({
          title: "Success",
          description: "Logged in successfully!",
          variant: "default",
        });

        // Save logged user
        localStorage.setItem("b2cUser", JSON.stringify(result.b2cCustomer));

        navigate("/");
      } else {
        toast({
          title: "Login Failed",
          description: result.errorMessage || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong!",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const validate = () => {
    const newErrors: any = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!form.mobileNo) newErrors.mobileNo = "Mobile number is required";
    else if (!/^\d{6,15}$/.test(form.mobileNo)) newErrors.mobileNo = "Mobile number must be 6-15 digits";
    if (!form.emailId) newErrors.emailId = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.emailId)) newErrors.emailId = "Invalid email address";
    if (!form.addressLine1) newErrors.addressLine1 = "Address Line 1 is required";
    if (!form.country) newErrors.country = "Country is required";
    if (isStateRequired && !form.state) newErrors.state = "State is required";
    if (!form.postalCode) newErrors.postalCode = "Postal code is required";
    else if (!/^\d{6}$/.test(form.postalCode)) newErrors.postalCode = "Postal code must be 6 digits";
    if (!form.floorNo) newErrors.floorNo = "Floor No is required";
    if (!form.unitNo) newErrors.unitNo = "Unit No is required";
    if (!form.password) newErrors.password = "Password is required";
    else if (!/^.*(?=.{8,})(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/.test(form.password)) {
      newErrors.password = "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 symbol";
    }
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setIsLoading(true);
    try {
      // Prepare payload for add customer
      const payload = {
        b2cCustomerId: 0, // New customer
        b2CCustomerName: form.name,
        userName: form.emailId, // Use email as username
        b2cCustomerCode: '', // Can be generated by backend
        orgId: 1, // Replace with actual orgId if available
        branchId: 0, // Replace with actual branchId if available
        mobileNo: form.mobileNo,
        emailId: form.emailId,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        addressLine3: form.addressLine3,
        countryId: countryId ? Number(countryId) : null,
        stateId: stateId ? Number(stateId) : null,
        postalCode: form.postalCode,
        floorNo: form.floorNo,
        unitNo: form.unitNo,
        isApproved: true,
        loyaltyPoints: 0,
        redeemPoints: 0,
        password: form.password,
        isActive: true,
        createdBy: 1,
        createdOn: new Date().toISOString(),
      };
      const { data } = await addCustomer({ variables: { customer: payload } });
      setIsLoading(false);
      if (data?.addB2CCustomer?.isSuccess) {
        toast({
          title: "Success",
          description: "Registered successfully!",
          variant: "default",
        });
        // Reset form and switch to Sign In tab
        setForm({
          name: "",
          mobileNo: "",
          emailId: "",
          addressLine1: "",
          addressLine2: "",
          addressLine3: "",
          country: "",
          state: "",
          postalCode: "",
          floorNo: "",
          unitNo: "",
          password: "",
          confirmPassword: "",
        });
        setCountryId("");
        setStateId("");
        setTabValue("signin");
      } else {
        // Always show error message from API if present, otherwise generic error
        const errorMsg = data?.addB2CCustomer?.errorMessage && data.addB2CCustomer.errorMessage.length
          ? data.addB2CCustomer.errorMessage[0]
          : "Registration failed. Please try again.";
        toast({
          title: "Registration Failed",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setIsLoading(false);
      setErrors({ api: error.message || 'Failed to create account' });
      toast({
        title: "Registration Failed",
        description: error.message || 'Failed to create account',
        variant: "destructive",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    // Only allow numbers for specific fields
    if (["mobileNo", "postalCode", "floorNo"].includes(name)) {
      newValue = newValue.replace(/[^0-9]/g, "");
    }
    setForm({ ...form, [name]: newValue });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-2xl">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={tabValue}
              onValueChange={setTabValue}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">Password</Label>
                      <Link
                        to="/forgotPassword"
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">
                        Full Name<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="signup-name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                      {errors.name && (
                        <span className="text-xs text-red-500">
                          {errors.name}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-mobile">
                        Mobile Number<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="signup-mobile"
                        name="mobileNo"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="e.g. 9876543210"
                        value={form.mobileNo}
                        onChange={handleChange}
                        minLength={6}
                        maxLength={15}
                        required
                      />
                      {errors.mobileNo && (
                        <span className="text-xs text-red-500">
                          {errors.mobileNo}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">
                        Email<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="signup-email"
                        name="emailId"
                        type="email"
                        placeholder="you@example.com"
                        value={form.emailId}
                        onChange={handleChange}
                        required
                      />
                      {errors.emailId && (
                        <span className="text-xs text-red-500">
                          {errors.emailId}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-address1">
                        Address Line 1<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="signup-address1"
                        name="addressLine1"
                        type="text"
                        placeholder="Address Line 1"
                        value={form.addressLine1}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-address2">Address Line 2</Label>
                      <Input
                        id="signup-address2"
                        name="addressLine2"
                        type="text"
                        placeholder="Address Line 2"
                        value={form.addressLine2}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-address3">Address Line 3</Label>
                      <Input
                        id="signup-address3"
                        name="addressLine3"
                        type="text"
                        placeholder="Address Line 3"
                        value={form.addressLine3}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-country">
                        Country<span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="signup-country"
                        name="country"
                        value={countryId}
                        onChange={(e) => {
                          setCountryId(e.target.value);
                          setForm((prev) => ({
                            ...prev,
                            country: e.target.value,
                            state: "",
                          }));
                          setStateId("");
                          // Fetch states for the new country
                          if (e.target.value) {
                            fetchStates({
                              variables: { countryId: Number(e.target.value) },
                            });
                          } else {
                            setStateOptions([]);
                          }
                        }}
                        className="input w-full border rounded px-3 py-2"
                        required
                      >
                        <option value="">Select Country</option>
                        {countryOptions.map((c) => (
                          <option key={c.countryID} value={c.countryID}>
                            {c.countryName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-state">
                        State
                        {isStateRequired && (
                          <span className="text-red-500">*</span>
                        )}
                      </Label>
                      <select
                        id="signup-state"
                        name="state"
                        value={stateId}
                        onChange={(e) => {
                          setStateId(e.target.value);
                          setForm((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }));
                        }}
                        className="input w-full border rounded px-3 py-2"
                        required={isStateRequired}
                        disabled={!stateOptions.length}
                      >
                        <option value="">Select State</option>
                        {stateOptions.map((s) => (
                          <option key={s.stateID} value={s.stateID}>
                            {s.stateName}
                          </option>
                        ))}
                      </select>
                      {stateMismatchError && (
                        <span className="text-xs text-red-500">
                          {stateMismatchError}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-postal">
                        Postal Code<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="signup-postal"
                        name="postalCode"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="e.g. 600001"
                        value={form.postalCode}
                        onChange={handleChange}
                        minLength={6}
                        maxLength={6}
                        required
                      />
                      {errors.postalCode && (
                        <span className="text-xs text-red-500">
                          {errors.postalCode}
                        </span>
                      )}
                      {pincodeError && (
                        <span className="text-xs text-red-500">
                          {pincodeError}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-floor">
                        Floor No<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="signup-floor"
                        name="floorNo"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Floor No"
                        value={form.floorNo}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-unit">
                        Unit No<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="signup-unit"
                        name="unitNo"
                        type="text"
                        placeholder="Unit No"
                        value={form.unitNo}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 relative">
                      <Label htmlFor="signup-password">
                        Password<span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={form.password}
                          onChange={handleChange}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setShowPassword((v) => !v)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <span className="text-xs text-red-500">
                          {errors.password}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 relative">
                      <Label htmlFor="signup-confirm">
                        Confirm Password<span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-confirm"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <span className="text-xs text-red-500">
                          {errors.confirmPassword}
                        </span>
                      )}
                    </div>
                  </div>
                  {errors.api && (
                    <span className="text-xs text-red-500 block mb-2">
                      {errors.api}
                    </span>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Auth;

