import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MapPin, Clock, CreditCard, CheckCircle2, Plus } from 'lucide-react';
import { useLazyQuery, useMutation, useQuery, useApolloClient } from '@apollo/client';
import { GET_CUSTOMER_DELIVERY_ADDRESS_BY_CUSTOMER_ID, GET_CUSTOMER_DELIVERY_ADDRESS_BY_ID, ADD_CUSTOMER_DELIVERY_ADDRESS, UPDATE_CUSTOMER_DELIVERY_ADDRESS } from '@/graphql/ecommerce/b2cCustomerAddressQueries.ts';
import { GET_COUNTRIES, GET_STATES_BY_COUNTRY_ID } from '@/graphql/stateCountryQueries.ts';
import { toast } from 'sonner';
import axios from 'axios';
import {ADD_B2C_ORDER} from "@/graphql/ecommerce/b2cOrderQueries"
import { REMOVE_B2C_CUSTOMER_CART } from "@/graphql/Product/Cartqueries";
import Loader from "@/components/ui/loader";

const steps = [
  { id: 1, title: 'Address', icon: MapPin },
  { id: 2, title: 'Delivery', icon: Clock },
  { id: 3, title: 'Payment', icon: CreditCard },
  { id: 4, title: 'Summary', icon: CheckCircle2 }
];

export default function Checkout() {
  const navigate = useNavigate();
  const apolloClient = useApolloClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [selectedDeliverySlot, setSelectedDeliverySlot] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const progress = (currentStep / steps.length) * 100;
  const todayStr = new Date().toISOString().slice(0, 10);

  // Load delivery slot from localStorage on mount
  useEffect(() => {
    const savedSlot = localStorage.getItem("selectedDeliverySlot");
    if (savedSlot) {
      const slotData = JSON.parse(savedSlot);
      setSelectedDeliverySlot(slotData);
      setSelectedDate(slotData.date || "");
    }
  }, []);

  const [getDeliveryAddressesByCustomerId] = useLazyQuery(GET_CUSTOMER_DELIVERY_ADDRESS_BY_CUSTOMER_ID, { fetchPolicy: "no-cache" });
  const [getDeliveryAddressById] = useLazyQuery(GET_CUSTOMER_DELIVERY_ADDRESS_BY_ID, { fetchPolicy: "no-cache" });
  const [addAddress] = useMutation(ADD_CUSTOMER_DELIVERY_ADDRESS);
  const [updateAddress] = useMutation(UPDATE_CUSTOMER_DELIVERY_ADDRESS);
  const [addB2COrder] = useMutation(ADD_B2C_ORDER);
  const [removeCartMutation] = useMutation(REMOVE_B2C_CUSTOMER_CART);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Fetch addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      const savedUser = JSON.parse(localStorage.getItem("b2cUser") || "{}");
      if (!savedUser?.b2cCustomerId) {
        toast.error("User not found");
        return;
      }

      try {
        const res = await getDeliveryAddressesByCustomerId({
          variables: { customerId: savedUser.b2cCustomerId }
        });
        const addressList = res.data?.b2CCustomerDeliveryAddressByCustomerId?.customerAddress || [];
        
        if (Array.isArray(addressList) && addressList.length > 0) {
          setAddresses(addressList);
          
          // Set default address
          const defaultAddr = addressList.find((a: any) => a.isDefault);
          setSelectedAddress(defaultAddr || addressList[0]);
        }
      } catch (err) {
        console.error("Error fetching addresses:", err);
        toast.error("Failed to fetch addresses");
      }
    };

    fetchAddresses();
  }, [getDeliveryAddressesByCustomerId]);

  // AddAddressDialog Component
  function AddAddressDialog({ onAddressAdded }: { onAddressAdded: () => void }) {
    const [form, setForm] = useState({
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      b2cCustomerId: 0,
      countryId: "",
      stateId: "",
        b2cDeliveryAddressId: 0,
      postalCode: "",
      floorNo: "",
      unitNo: "",
      emailId: "",
      mobileNo: "",
      phoneNo: "",
      faxNo: "",
      isDefault: true,
      isActive: true,
      branchId: 0,
      orgId: localStorage.getItem("b2cUser.orgId") ? Number(localStorage.getItem("b2cUser.orgId")) : 0,
      createdOn: new Date().toISOString(),
      createdBy: localStorage.getItem("b2cUser.b2cCustomerId") || "Guest",
    });
    const [stateOptions, setStateOptions] = useState([]);
    const [countryId, setCountryId] = useState("");
    const [stateId, setStateId] = useState("");
    const [pincodeError, setPincodeError] = useState("");
    const [isStateRequired, setIsStateRequired] = useState(false);
    
    const { data: countriesData } = useQuery(GET_COUNTRIES, { fetchPolicy: "network-only" });
    const countryOptions = countriesData?.allCountry?.country || [];
    const [fetchStates, { data: statesData }] = useLazyQuery(GET_STATES_BY_COUNTRY_ID, { fetchPolicy: "network-only" });

    useEffect(() => {
      const savedUser = JSON.parse(localStorage.getItem("b2cUser") || "{}");
      setForm((prev) => ({ ...prev, b2cCustomerId: savedUser?.b2cCustomerId || 0 }));
    }, []);

    useEffect(() => {
      if (countryId) {
        fetchStates({ variables: { countryId: Number(countryId) } });
        setStateId("");
        setForm((prev) => ({ ...prev, countryId, stateId: "" }));
      } else {
        setStateOptions([]);
        setStateId("");
        setForm((prev) => ({ ...prev, countryId: "", stateId: "" }));
      }
    }, [countryId, fetchStates]);

    useEffect(() => {
      const newStates = statesData?.allState?.state || statesData?.stateByCountryId?.states || [];
      setStateOptions(newStates);
      setIsStateRequired(newStates.length > 0);
    }, [statesData]);

    useEffect(() => {
      const fetchLocationFromPincode = async () => {
        const pin = form.postalCode?.trim();
        setPincodeError("");
        if (countryId !== "76") return;
        if (!pin || pin.length !== 6) return;
        try {
          const response = await axios.get(`https://api.postalpincode.in/pincode/${pin}`);
          const data = response.data?.[0];
          if (data?.Status === "Success" && data?.PostOffice?.length > 0) {
            const location = data.PostOffice[0];
            const matchedCountry = countryOptions.find(
              (c) => c.countryName.trim().toLowerCase() === location.Country.trim().toLowerCase()
            );
            const matchedState = stateOptions.find(
              (s) => s.stateName.trim().toLowerCase() === location.State.trim().toLowerCase()
            );
            if (matchedCountry) {
              setCountryId(matchedCountry.countryID.toString());
              setForm((prev) => ({ ...prev, countryId: matchedCountry.countryID.toString() }));
            }
            if (matchedState) {
              setStateId(matchedState.stateID.toString());
              setForm((prev) => ({ ...prev, stateId: matchedState.stateID.toString() }));
            }
          } else {
            setPincodeError("Invalid Postal Code. Please enter a valid one.");
          }
        } catch {
          setPincodeError("Unable to validate postal code. Try again later.");
        }
      };
      fetchLocationFromPincode();
    }, [form.postalCode, countryId, stateId, countryOptions, stateOptions]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      let newValue = value;
      if (type === "checkbox" && e.target instanceof HTMLInputElement) {
        newValue = e.target.checked.toString();
      } else if (["mobileNo", "postalCode", "floorNo"].includes(name)) {
        newValue = newValue.replace(/[^0-9]/g, "");
      }
      setForm((prev) => ({ ...prev, [name]: newValue }));
    };

    const handleSave = async () => {
      setAddLoading(true);
      const savedUser = JSON.parse(localStorage.getItem("b2cUser") || "{}");
      const payload = {
        ...form,
        countryId: countryId ? Number(countryId) : null,
        stateId: stateId ? Number(stateId) : null,
        createdBy: savedUser?.b2cCustomerId || "Guest",
        createdOn: new Date().toISOString(),
      };
      try {
        // If this address is being set as default, update existing default address first
        if (form.isDefault && addresses.length > 0) {
          const existingDefault = addresses.find((a: any) => a.isDefault);
          if (existingDefault) {
            const { __typename, ...updatePayload } = existingDefault;
            await updateAddress({
              variables: {
                customerAddress: {
                  ...updatePayload,
                  isDefault: false,
                }
              }
            });
          }
        }

        const { data } = await addAddress({ variables: { customerAddress: payload } });
        if (data?.addB2CCustomerDeliveryAddress?.isSuccess) {
          toast.success("Address added successfully!");
          setIsAddDialogOpen(false);
          onAddressAdded();
        } else {
          toast.error(data?.addB2CCustomerDeliveryAddress?.errorMessage?.[0] || "Failed to add address.");
        }
      } catch (err) {
        toast.error("Unable to add address.");
      }
      setAddLoading(false);
    };

    return (
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add New Address
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input id="addressLine1" name="addressLine1" value={form.addressLine1} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input id="addressLine2" name="addressLine2" value={form.addressLine2} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine3">Address Line 3</Label>
              <Input id="addressLine3" name="addressLine3" value={form.addressLine3} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="countryId">Country</Label>
              <select
                id="countryId"
                name="countryId"
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className="input w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select Country</option>
                {countryOptions.map((c: any) => (
                  <option key={c.countryID} value={c.countryID}>
                    {c.countryName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stateId">State</Label>
              <select
                id="stateId"
                name="stateId"
                value={stateId}
                onChange={(e) => setStateId(e.target.value)}
                className="input w-full border rounded px-3 py-2"
                required={isStateRequired}
                disabled={!stateOptions.length}
              >
                <option value="">Select State</option>
                {stateOptions.map((s: any) => (
                  <option key={s.stateID} value={s.stateID}>
                    {s.stateName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" name="postalCode" value={form.postalCode} onChange={handleChange} maxLength={6} />
              {pincodeError && <p className="text-xs text-destructive">{pincodeError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="floorNo">Floor No</Label>
              <Input id="floorNo" name="floorNo" value={form.floorNo} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitNo">Unit No</Label>
              <Input id="unitNo" name="unitNo" value={form.unitNo} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailId">Email</Label>
              <Input id="emailId" name="emailId" value={form.emailId} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobileNo">Mobile No</Label>
              <Input id="mobileNo" name="mobileNo" value={form.mobileNo} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNo">Phone No</Label>
              <Input id="phoneNo" name="phoneNo" value={form.phoneNo} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faxNo">Fax No</Label>
              <Input id="faxNo" name="faxNo" value={form.faxNo} onChange={handleChange} />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={form.isDefault}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isDefault: !!checked }))}
              />
              <Label htmlFor="isDefault" className="text-sm font-normal cursor-pointer">
                Set as default delivery address
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={addLoading}>
              {addLoading ? <Loader size={18} /> : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const placeOrder = async () => {
    try {
      setIsPlacingOrder(true);
      
      // Get data from localStorage
      const orderSummary = JSON.parse(localStorage.getItem("orderSummary") || "{}");
      const selectedDeliveryAddress = JSON.parse(localStorage.getItem("selectedDeliveryAddress") || "{}");
      const selectedDeliverySlot = JSON.parse(localStorage.getItem("selectedDeliverySlot") || "{}");
      const taxInfo = JSON.parse(localStorage.getItem("taxInfo") || "{}");
      const b2cUser = JSON.parse(localStorage.getItem("b2cUser") || "{}");

      // Validate required data
      if (!paymentMethod || paymentMethod !== "cash") {
        toast.error("Only Cash on Delivery is supported currently");
        return;
      }

      if (!orderSummary.cartItems || orderSummary.cartItems.length === 0) {
        toast.error("Cart is empty");
        return;
      }

      // Build order payload - taxType must be a string
      const b2COrder = {
        orgId: Number(localStorage.getItem("orgID")) || 1,
        branchId: 1,
        b2cOrderId: 0, // New order
        b2cOrderNo:'',
        b2cOrderDate: new Date().toISOString(),
        b2cCustomerId: b2cUser.b2cCustomerId,
        b2cCustomerName: b2cUser.b2cCustomerName || "Customer",
        billToAddress: `${selectedDeliveryAddress.addressLine1}, ${selectedDeliveryAddress.addressLine2}, ${selectedDeliveryAddress.addressLine3}`,
        deliveryAddressId: selectedDeliveryAddress.b2cDeliveryAddressId || 0,
        deliveryAddress: `${selectedDeliveryAddress.addressLine1}, ${selectedDeliveryAddress.addressLine2}`,
        currencyId: 1,
        currencyRate: 1,
        taxId: taxInfo.taxId || 1,
        taxType: "GST",
        taxPrice: parseFloat(orderSummary.taxAmount) || 0,
        billDiscount: 0,
        billDiscPer: 0,
        total: parseFloat(orderSummary.subtotal) || 0,
        subTotal: parseFloat(orderSummary.subtotal) || 0,
        totalTax: parseFloat(orderSummary.taxAmount) || 0,
        netTotal: parseFloat(orderSummary.netTotal) || 0,
        paidAmount: parseFloat(orderSummary.netTotal) || 0,
        balanceAmount: 0,
        deliveryAmount: parseFloat(orderSummary.deliveryFee) || 0,
        deliveryDate: selectedDeliverySlot.date ? new Date(selectedDeliverySlot.date).toISOString() : new Date().toISOString(),
        orderStatus: "Pending",
        remarks: `Delivery Slot: ${selectedDeliverySlot.label || "Standard"}`,
        isActive: true,
        createdBy: b2cUser.b2cCustomerId,
        createdOn: new Date().toISOString(),
        // Add receipt details per spec
        receiptDetails: [
          {
            b2cReceiptId: 0,
            b2cReceiptCode: "",
            b2cReceiptDate: new Date().toISOString(),
            branchId: 1,
            orgId: 1,
            orderDate: new Date().toISOString(),
            orderNo: "",
            orderId: 0,
            paymodeId: paymentMethod === "cash" ? 0 : 1,
            payModeName: paymentMethod === "cash" ? "Cash" : "UPI",
            totalAmount: parseFloat(orderSummary.netTotal) || 0,
            paidAmount: parseFloat(orderSummary.netTotal) || 0,
            balanceAmount: 0,
            isActive: true,
            createdBy: b2cUser?.b2cCustomerId || 1,
            createdOn: new Date().toISOString(),
          },
        ],
        soDetail: orderSummary.cartItems.map((item: any) => ({
          b2cOrderDetailId: 0,
          b2cOrderId: 0,
          orgId: Number(localStorage.getItem("orgID")) || 1,
          branchId: 1,
          productId: item.productId,
          productDetailId: item.productDetailId || 0,
          productName: item.productName ?? item.name ?? item.title ?? "",
          qty: item.quantity,
          price: item.price,
          taxId: taxInfo.taxId || 1,
          taxType: "GST",
          taxPrice: (item.price * item.quantity * (taxInfo.taxPercentage || 0)) / 100,
          total: item.price * item.quantity,
          subTotal: item.price * item.quantity,
          itemTotalTax: (item.price * item.quantity * (taxInfo.taxPercentage || 0)) / 100,
          netTotal: item.price * item.quantity + ((item.price * item.quantity * (taxInfo.taxPercentage || 0)) / 100),
          isActive: true,
          createdBy: b2cUser.b2cCustomerId,
          createdOn: new Date().toISOString(),
        })),
      };

      // Submit order
      const { data } = await addB2COrder({ variables: { b2COrder } });

      if (data?.addB2COrder?.isSuccess) {
        toast.success("Order placed successfully!");
        // Attempt to clear cart in backend
        try {
          const savedOrderSummary = JSON.parse(localStorage.getItem("orderSummary") || "{}");
          const items = Array.isArray(savedOrderSummary?.cartItems) ? savedOrderSummary.cartItems : [];
          const customerId = b2cUser?.b2cCustomerId;
          const customerType = 2;
          await Promise.all(
            items.map((item: any) =>
              removeCartMutation({
                variables: {
                  customerId: customerId,
                  customerType: customerType,
                  productId: item.productId,
                  productDetailId: item.productDetailId || 0,
                },
              }).catch(() => null)
            )
          );
        } catch (e) {
          // Non-blocking: ignore backend cart clear errors
          console.warn("Cart clear failed", e);
        }
        
        // Clear localStorage
        localStorage.removeItem("orderSummary");
        localStorage.removeItem("selectedDeliveryAddress");
        localStorage.removeItem("selectedDeliverySlot");
        localStorage.removeItem("taxInfo");
        // Reset cart to 0
        try {
          localStorage.setItem("cartCount", "0");
          localStorage.setItem("cartItems", JSON.stringify([]));
        } catch {}
        
        // Reset Apollo caches so cart refetches as empty
        try {
          await apolloClient.resetStore();
        } catch {}

        // Navigate to home
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        toast.error(data?.addB2COrder?.errorMessage || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Unable to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleCheckout = () => {
    // On final step, place order instead of moving to next step
    if (currentStep === steps.length) {
      // Validate delivery slot and payment method
      if (!selectedAddress) {
        toast.error("Please select a delivery address");
        return;
      }
      if (!selectedDate) {
        toast.error("Please select a delivery date");
        return;
      }
      if (!paymentMethod) {
        toast.error("Please select a payment method");
        return;
      }
      placeOrder();
    } else {
      nextStep();
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      // Save selected address to localStorage when moving from address step
      if (currentStep === 1 && selectedAddress) {
        localStorage.setItem("selectedDeliveryAddress", JSON.stringify(selectedAddress));
      }
      // Require delivery date when moving past Delivery step
      if (currentStep === 2) {
        if (!selectedDate) {
          toast.error("Please select a delivery date");
          return;
        }
        const updatedSlot = {
          ...selectedDeliverySlot,
          date: selectedDate,
        };
        localStorage.setItem("selectedDeliverySlot", JSON.stringify(updatedSlot));
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep === 1) {
      navigate('/cart');
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddressAdded = async () => {
    const savedUser = JSON.parse(localStorage.getItem("b2cUser") || "{}");
    try {
      const res = await getDeliveryAddressesByCustomerId({
        variables: { customerId: savedUser.b2cCustomerId }
      });
      const addressList = res.data?.b2CCustomerDeliveryAddressByCustomerId?.customerAddress || [];
      
      if (Array.isArray(addressList) && addressList.length > 0) {
        setAddresses(addressList);
        
        const defaultAddr = addressList.find((a: any) => a.isDefault);
        setSelectedAddress(defaultAddr || addressList[0]);
      }
    } catch (err) {
      console.error("Error refreshing addresses:", err);
      toast.error("Failed to refresh addresses");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Delivery Address</CardTitle>
              <AddAddressDialog onAddressAdded={handleAddressAdded} />
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedAddress ? (
                <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{selectedAddress.addressLine1}</h3>
                    {selectedAddress.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedAddress.addressLine2}</p>
                  <p className="text-sm text-muted-foreground">{selectedAddress.addressLine3}</p>
                  <p className="text-sm font-medium mt-2">
                    {selectedAddress.postalCode} • {selectedAddress.floorNo ? `Floor ${selectedAddress.floorNo}` : ""} {selectedAddress.unitNo ? `Unit ${selectedAddress.unitNo}` : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedAddress.mobileNo}</p>
                  <p className="text-sm text-muted-foreground">{selectedAddress.emailId}</p>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6">No default address found. Please add one.</p>
              )}
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Select Delivery Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Delivery Date</Label>
                  <Input 
                    id="deliveryDate" 
                    type="date" 
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedDeliverySlot({
                        ...selectedDeliverySlot,
                        date: e.target.value,
                      });
                    }}
                  />
                </div>
                {selectedDate && (
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">Selected Date:</p>
                    <p className="font-semibold">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                {/* Cash on Delivery Option */}
                <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => setPaymentMethod("cash")}>
                  <RadioGroupItem value="cash" id="cash-option" />
                  <div className="flex-1">
                    <Label htmlFor="cash-option" className="cursor-pointer font-semibold">
                      Cash on Delivery
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pay with cash when your order is delivered
                    </p>
                  </div>
                </div>

                {/* Existing Card Details Option */}
                <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => setPaymentMethod("card")}>
                  <RadioGroupItem value="card" id="card-option" />
                  <div className="flex-1">
                    <Label htmlFor="card-option" className="cursor-pointer font-semibold">
                      Use Card
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pay with your card details
                    </p>
                  </div>
                </div>
              </RadioGroup>

              {/* Show Card Details Form only when Card is selected */}
              {paymentMethod === "card" && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="nameOnCard">Name on Card</Label>
                    <Input id="nameOnCard" placeholder="John Doe" />
                  </div>
                </div>
              )}

              {/* Cash on Delivery Info */}
              {paymentMethod === "cash" && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">No payment details required</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please have exact cash amount ready at the time of delivery
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      case 4:
        const orderSummary = JSON.parse(localStorage.getItem("orderSummary") || "{}");
        const selectedDeliveryAddress = JSON.parse(localStorage.getItem("selectedDeliveryAddress") || "{}");
        const selectedDeliverySlotFromStorage = JSON.parse(localStorage.getItem("selectedDeliverySlot") || "{}");
        
        return (
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{parseFloat(orderSummary.subtotal || "0").toFixed(2)}</span>
                </div>
                {parseFloat(orderSummary.savings || "0") > 0 && (
                  <div className="flex justify-between text-success">
                    <span>You Save</span>
                    <span>-₹{parseFloat(orderSummary.savings || "0").toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>₹{parseFloat(orderSummary.deliveryFee || "0").toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{parseFloat(orderSummary.taxAmount || "0").toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{parseFloat(orderSummary.netTotal || "0").toFixed(2)}</span>
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Delivery Address</h4>
                  <p className="text-sm text-muted-foreground">{selectedDeliveryAddress.addressLine1}</p>
                  {selectedDeliveryAddress.addressLine2 && (
                    <p className="text-sm text-muted-foreground">{selectedDeliveryAddress.addressLine2}</p>
                  )}
                  {selectedDeliveryAddress.addressLine3 && (
                    <p className="text-sm text-muted-foreground">{selectedDeliveryAddress.addressLine3}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{selectedDeliveryAddress.postalCode}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Delivery Slot</h4>
                  {selectedDeliverySlotFromStorage.date ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedDeliverySlotFromStorage.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                      {selectedDeliverySlotFromStorage.time && (
                        <p className="text-sm text-muted-foreground">{selectedDeliverySlotFromStorage.time}</p>
                      )}
                      {selectedDeliverySlotFromStorage.label && (
                        <Badge variant="secondary" className="mt-2">{selectedDeliverySlotFromStorage.label}</Badge>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No delivery slot selected</p>
                  )}
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Payment Method</h4>
                  <p className="text-sm text-muted-foreground">{paymentMethod === "cash" ? "Cash on Delivery" : "Card Payment"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep >= step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2
                    ${isActive 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'border-muted-foreground text-muted-foreground'
                    }
                    ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-sm ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          {renderStepContent()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={prevStep}
            >
              Previous
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleCheckout}
                    disabled={currentStep === steps.length && (isPlacingOrder || !selectedAddress || !selectedDate || !paymentMethod)}
                  >
                    {currentStep === steps.length ? (
                      isPlacingOrder ? 'Placing Order...' : 'Place Order'
                    ) : (
                      'Next'
                    )}
                  </Button>
                </TooltipTrigger>
                {currentStep === steps.length && (!selectedAddress || !selectedDate || !paymentMethod) && (
                  <TooltipContent>
                    {!selectedAddress && <p>Please select a delivery address</p>}
                    {!selectedDate && <p>Please select a delivery date</p>}
                    {!paymentMethod && <p>Please select a payment method</p>}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}