import {GET_DELIVERY_ADDRESSES_BY_CUSTOMER_ID, ADD_DELIVERY_ADDRESS, GET_DELIVERY_ADDRESS_BY_ID, UPDATE_DELIVERY_ADDRESS, DEACTIVATE_DELIVERY_ADDRESS} from "@/graphql/ecommerce/b2cDeliveryAddress";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Package, Gift, MapPin, Star, MoveDiagonal } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import Loader from "@/components/ui/loader";
  // Add Address Dialog Component
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
  import { useState as useDialogState } from "react";
  // Add Address Dialog Component
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
  import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  GET_CUSTOMER_BY_ID,
  UPDATE_CUSTOMER,
} from "@/graphql/ecommerce/b2cCustomer";
import{GET_ORDERS_BY_CUSTOMER_ID} from "@/graphql/ecommerce/b2cOrderQueries";
import { GET_COUNTRIES, GET_STATES_BY_COUNTRY_ID } from "@/graphql/stateCountryQueries";


interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export default function Account() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [formData, setFormData] = useState({
    b2CCustomerName: "",
    emailId: "",
    mobileNo: "",
    postalCode: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
  });
  const [orders, setOrders] = useState<any[]>([]);
  // For mapping countryId/stateId to names
  const { data: allCountriesData } = useQuery(GET_COUNTRIES, { fetchPolicy: "network-only" });
  const allCountries = allCountriesData?.allCountry?.country || [];
  const [allStates, setAllStates] = useState<any[]>([]);
  const [fetchStatesByCountry] = useLazyQuery(GET_STATES_BY_COUNTRY_ID, { fetchPolicy: "network-only" });
    const [addresses, setAddresses] = useState<any[]>([]);
const [addressesLoading, setAddressesLoading] = useState(false);
  // Fetch states only for countries that we have addresses for
  useEffect(() => {
    async function fetchStatesForAddresses() {
      if (addresses.length === 0) return;
      
      const uniqueCountryIds = [...new Set(addresses.map(a => a.countryId))];
      let states: any[] = [];
      
      for (const countryId of uniqueCountryIds) {
        try {
          const res = await fetchStatesByCountry({ variables: { countryId: Number(countryId) } });
          const s = res?.data?.stateByCountryId?.states || [];
          states = states.concat(s.map((st: any) => ({ ...st, countryId })));
        } catch {}
      }
      setAllStates(states);
    }
    fetchStatesForAddresses();
    // eslint-disable-next-line
  }, [addresses.length]);

  // Helper to get country/state name
  const getCountryName = (id: number) => allCountries.find((c: any) => c.countryID === id)?.countryName || id;
  const getStateName = (id: number) => allStates.find((s: any) => s.stateID === id)?.stateName || id;
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [getOrdersByCustomerId] = useLazyQuery(GET_ORDERS_BY_CUSTOMER_ID, { fetchPolicy: "no-cache" });

  const [getCustomerById, { loading }] = useLazyQuery(GET_CUSTOMER_BY_ID, {
    fetchPolicy: "no-cache",
  });

  const [updateCustomer, { loading: updateLoading }] =
    useMutation(UPDATE_CUSTOMER);


const [getDeliveryAddressesByCustomerId] = useLazyQuery(GET_DELIVERY_ADDRESSES_BY_CUSTOMER_ID, { fetchPolicy: "no-cache" });
const [getDeliveryAddressById] = useLazyQuery(GET_DELIVERY_ADDRESS_BY_ID, { fetchPolicy: "no-cache" });
const [editingAddress, setEditingAddress] = useState<any | null>(null);
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
const [deactivateAddress] = useMutation(DEACTIVATE_DELIVERY_ADDRESS);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);



  function EditAddressDialog({ address, isOpen, onClose, onAddressAdded }: { address: any; isOpen: boolean; onClose: () => void; onAddressAdded: () => void }) {
    const [open, setOpen] = useState(isOpen);
    const [form, setForm] = useState(address || {});
    const [stateOptions, setStateOptions] = useState<any[]>([]);
    const [countryId, setCountryId] = useState(String(address?.countryId || ""));
    const [stateId, setStateId] = useState(String(address?.stateId || ""));
    const [pincodeError, setPincodeError] = useState("");
    const [isStateRequired, setIsStateRequired] = useState(false);
    const { data: countriesData } = useQuery(GET_COUNTRIES, { fetchPolicy: "network-only" });
    const countryOptions = countriesData?.allCountry?.country || [];
    const [fetchStates, { data: statesData }] = useLazyQuery(GET_STATES_BY_COUNTRY_ID, { fetchPolicy: "network-only" });
    const [updateAddress, { loading: updateLoading }] = useMutation(UPDATE_DELIVERY_ADDRESS, {
      refetchQueries: [
        { query: GET_DELIVERY_ADDRESSES_BY_CUSTOMER_ID, variables: { customerId: address?.b2cCustomerId } }
      ],
      awaitRefetchQueries: true
    });

    useEffect(() => {
      setOpen(isOpen);
      if (isOpen && address) {
        setForm(address);
        setCountryId(String(address.countryId || ""));
        setStateId(String(address.stateId || ""));
      }
    }, [isOpen, address]);

    useEffect(() => {
      if (countryId) {
        fetchStates({ variables: { countryId: Number(countryId) } });
        setStateId(String(address?.stateId || ""));
        setForm((prev: any) => ({ ...prev, countryId, stateId: String(address?.stateId || "") }));
      } else {
        setStateOptions([]);
        setStateId("");
        setForm((prev: any) => ({ ...prev, countryId: "", stateId: "" }));
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
              (c: any) => c.countryName.trim().toLowerCase() === location.Country.trim().toLowerCase()
            );
            const matchedState = stateOptions.find(
              (s: any) => s.stateName.trim().toLowerCase() === location.State.trim().toLowerCase()
            );
            if (matchedCountry) {
              setCountryId(matchedCountry.countryID.toString());
              setForm((prev: any) => ({ ...prev, countryId: matchedCountry.countryID.toString() }));
            }
            if (matchedState) {
              setStateId(matchedState.stateID.toString());
              setForm((prev: any) => ({ ...prev, stateId: matchedState.stateID.toString() }));
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      let newValue = value;
      if (type === "checkbox" && e.target instanceof HTMLInputElement) {
        newValue = e.target.checked.toString();
      } else if (["mobileNo", "postalCode", "floorNo"].includes(name)) {
        newValue = newValue.replace(/[^0-9]/g, "");
      }
      setForm((prev: any) => ({ ...prev, [name]: newValue }));
    };

    const handleSave = async () => {
      const { __typename, ...cleanForm } = form;
      const savedUser = JSON.parse(localStorage.getItem("b2cUser") || "{}");
      const payload = {
        ...cleanForm,
        countryId: countryId ? Number(countryId) : form.countryId,
        stateId: stateId ? Number(stateId) : form.stateId,
        branchId: form.branchId || 0,
        createdBy: form.createdBy || savedUser.b2cCustomerId || 0,
        createdOn: form.createdOn || new Date().toISOString(),
        modifiedBy: savedUser.b2cCustomerId || 0,
        modifiedOn: new Date().toISOString(),
      };
      try {
        const { data } = await updateAddress({ variables: { customerAddress: payload } });
        if (data?.updateB2CCustomerDeliveryAddress?.isSuccess) {
          toast({
            title: "Success",
            description: "Address updated successfully!",
            variant: "default",
          });
          setOpen(false);
          onClose();
          onAddressAdded();
        } else {
          toast({
            title: "Error",
            description: data?.updateB2CCustomerDeliveryAddress?.errorMessage?.[0] || "Failed to update address.",
            variant: "destructive",
          });
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Unable to update address.",
          variant: "destructive",
        });
      }
    };

    return (
      <Dialog open={open} onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) onClose();
      }}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-addressLine1">Address Line 1</Label>
              <Input id="edit-addressLine1" name="addressLine1" value={form.addressLine1 || ""} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-addressLine2">Address Line 2</Label>
              <Input id="edit-addressLine2" name="addressLine2" value={form.addressLine2 || ""} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-addressLine3">Address Line 3</Label>
              <Input id="edit-addressLine3" name="addressLine3" value={form.addressLine3 || ""} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-countryId">Country</Label>
              <select
                id="edit-countryId"
                name="countryId"
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className="input w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select Country</option>
                {countryOptions.map((c: any) => (
                  <option key={c.countryID} value={c.countryID}>{c.countryName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stateId">State{isStateRequired && <span className="text-red-500">*</span>}</Label>
              <select
                id="edit-stateId"
                name="stateId"
                value={stateId}
                onChange={(e) => setStateId(e.target.value)}
                className="input w-full border rounded px-3 py-2"
                required={isStateRequired}
                disabled={!stateOptions.length}
              >
                <option value="">Select State</option>
                {stateOptions.map((s: any) => (
                  <option key={s.stateID} value={s.stateID}>{s.stateName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-postalCode">Postal Code</Label>
              <Input id="edit-postalCode" name="postalCode" value={form.postalCode || ""} onChange={handleChange} maxLength={6} />
              {pincodeError && <span className="text-xs text-red-500">{pincodeError}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-floorNo">Floor No</Label>
              <Input id="edit-floorNo" name="floorNo" value={form.floorNo || ""} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-unitNo">Unit No</Label>
              <Input id="edit-unitNo" name="unitNo" value={form.unitNo || ""} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-emailId">Email</Label>
              <Input id="edit-emailId" name="emailId" value={form.emailId || ""} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-mobileNo">Mobile No</Label>
              <Input id="edit-mobileNo" name="mobileNo" value={form.mobileNo || ""} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phoneNo">Phone No</Label>
              <Input id="edit-phoneNo" name="phoneNo" value={form.phoneNo || ""} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-faxNo">Fax No</Label>
              <Input id="edit-faxNo" name="faxNo" value={form.faxNo || ""} onChange={handleChange} />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-isDefault"
                checked={!!form.isDefault}
                onCheckedChange={(checked) => setForm((prev: any) => ({ ...prev, isDefault: !!checked }))}
              />
              <Label htmlFor="edit-isDefault" className="text-sm font-normal cursor-pointer">
                Set as default delivery address
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setOpen(false);
              onClose();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateLoading}>
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  function AddAddressDialog({ onAddressAdded }: { onAddressAdded: () => void }) {
    const [open, setOpen] = useDialogState(false);
    const [form, setForm] = useState({
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      b2cCustomerId: 0,
      b2cDeliveryAddressId: 0,
      branchId: 0,
      countryId: "",
      createdBy: 1,
      emailId: "",
      faxNo: "",
      floorNo: "",
      isActive: true,
      isDefault: false,
      mobileNo: "",
      orgId: 1,
      phoneNo: "",
      postalCode: "",
      stateId: "",
      unitNo: "",
    });
    const [stateOptions, setStateOptions] = useState([]);
    const [countryId, setCountryId] = useState("");
    const [stateId, setStateId] = useState("");
    const [pincodeError, setPincodeError] = useState("");
    const [isStateRequired, setIsStateRequired] = useState(false);
    const { data: countriesData } = useQuery(GET_COUNTRIES, { fetchPolicy: "network-only" });
    const countryOptions = countriesData?.allCountry?.country || [];
    const [fetchStates, { data: statesData }] = useLazyQuery(GET_STATES_BY_COUNTRY_ID, { fetchPolicy: "network-only" });
    const [addAddress, { loading: addLoading }] = useMutation(ADD_DELIVERY_ADDRESS, {
      refetchQueries: () => {
        const savedUser = JSON.parse(localStorage.getItem("b2cUser") || "{}");
        return [
          { query: GET_DELIVERY_ADDRESSES_BY_CUSTOMER_ID, variables: { customerId: savedUser.b2cCustomerId }, options: { fetchPolicy: "network-only" } }
        ];
      },
      awaitRefetchQueries: true
    });

    // Set customerId from localStorage
    useEffect(() => {
      const savedUser = JSON.parse(localStorage.getItem("b2cUser") || "{}");
      setForm((prev) => ({ ...prev, b2cCustomerId: savedUser?.b2cCustomerId || 0 }));
    }, [open]);

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
      if (stateId && newStates && !newStates.find((s: any) => s.stateID.toString() === stateId)) {
        setStateId("");
        setForm((prev) => ({ ...prev, stateId: "" }));
      }
    }, [statesData]);

    useEffect(() => {
      const fetchLocationFromPincode = async () => {
        const pin = form.postalCode?.trim();
        setPincodeError("");
        if (countryId !== "76") return; // 76 = India
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
            } else {
              setStateId("");
              setForm((prev) => ({ ...prev, stateId: "" }));
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
      // Prepare payload
      const payload = {
        ...form,
        countryId: countryId ? Number(countryId) : null,
        stateId: stateId ? Number(stateId) : null,
        isActive: true,
        isDefault: !!form.isDefault,
      };
      try {
        const { data } = await addAddress({ variables: { customerAddress: payload } });
        if (data?.addB2CCustomerDeliveryAddress?.isSuccess) {
          toast({
            title: "Success",
            description: "Address added successfully!",
            variant: "default",
          });
          setOpen(false);
          onAddressAdded();
        } else {
          toast({
            title: "Error",
            description: data?.addB2CCustomerDeliveryAddress?.errorMessage?.[0] || "Failed to add address.",
            variant: "destructive",
          });
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Unable to add address.",
          variant: "destructive",
        });
      }
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" onClick={() => setOpen(true)}>Add Address</Button>
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
                onChange={e => setCountryId(e.target.value)}
                className="input w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select Country</option>
                {countryOptions.map((c) => (
                  <option key={c.countryID} value={c.countryID}>{c.countryName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stateId">State{isStateRequired && <span className="text-red-500">*</span>}</Label>
              <select
                id="stateId"
                name="stateId"
                value={stateId}
                onChange={e => setStateId(e.target.value)}
                className="input w-full border rounded px-3 py-2"
                required={isStateRequired}
                disabled={!stateOptions.length}
              >
                <option value="">Select State</option>
                {stateOptions.map((s) => (
                  <option key={s.stateID} value={s.stateID}>{s.stateName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" name="postalCode" value={form.postalCode} onChange={handleChange} maxLength={6} />
              {pincodeError && <span className="text-xs text-red-500">{pincodeError}</span>}
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
              <Checkbox id="isDefault" checked={form.isDefault} onCheckedChange={checked => setForm(prev => ({ ...prev, isDefault: !!checked }))} />
              <Label htmlFor="isDefault" className="text-sm font-normal cursor-pointer">
                Set as default delivery address
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={addLoading}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

// Fetch all address IDs for the customer, then fetch full details for each
const fetchAddresses = async (customerId: number) => {
  setAddressesLoading(true);
  try {
    // Force network-only to get fresh data
    const res = await getDeliveryAddressesByCustomerId({ 
      variables: { customerId },
      fetchPolicy: "network-only"
    });
    const addressList = res.data?.b2CCustomerDeliveryAddressByCustomerId?.customerAddress || [];
    if (Array.isArray(addressList) && addressList.length > 0) {
      // Fetch details for each addressId with network-only policy
      const detailPromises = addressList.map(async (addr: any) => {
        const detailRes = await getDeliveryAddressById({ 
          variables: { addressId: addr.b2cDeliveryAddressId },
          fetchPolicy: "network-only"
        });
        return detailRes.data?.b2CCustomerDeliveryAddressById?.customerAddress || null;
      });
      const details = await Promise.all(detailPromises);
      // Filter out inactive addresses
      const activeAddresses = details.filter((addr: any) => addr && addr.isActive !== false);
      setAddresses(activeAddresses);
    } else {
      setAddresses([]);
    }
  } catch (err) {
    setAddresses([]);
  }
  setAddressesLoading(false);
};

  // 🔥 Fetch user details after login
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("b2cUser") || "{}");

    if (!savedUser?.b2cCustomerId) {
      toast({
        title: "Not Logged In",
        description: "Please login to access your account.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    fetchCustomer(savedUser.b2cCustomerId);
    fetchOrders(savedUser.b2cCustomerId);
    fetchAddresses(savedUser.b2cCustomerId);
  }, []);

  const fetchOrders = async (customerId: number) => {
    setOrdersLoading(true);
    try {
      const res = await getOrdersByCustomerId({ variables: { customerId } });
      const result = res.data?.b2COrderByCustomerId;
      if (result?.isSuccess) {
        setOrders(result.b2COrder || []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setOrders([]);
    }
    setOrdersLoading(false);
  };

  const fetchCustomer = async (id: number) => {
    try {
      const res = await getCustomerById({
        variables: { customerId: id },
      });

      const result = res.data?.b2CCustomerById;

      if (result?.isSuccess) {
        setUser(result.customer);
        // Initialize form data with user data
        setFormData({
          b2CCustomerName: result.customer.b2CCustomerName || "",
          emailId: result.customer.emailId || "",
          mobileNo: result.customer.mobileNo || "",
          postalCode: result.customer.postalCode || "",
          addressLine1: result.customer.addressLine1 || "",
          addressLine2: result.customer.addressLine2 || "",
          addressLine3: result.customer.addressLine3 || "",
        });
      } else {
        toast({
          title: "Error",
          description: result?.errorMessage || "Failed to load profile.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Unable to fetch profile details.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleUpdateProfile = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    try {
      const savedUser = JSON.parse(localStorage.getItem("b2cUser") || "{}");

      const updatePayload = {
        b2cCustomerId: savedUser.b2cCustomerId,
        b2CCustomerName: formData.b2CCustomerName,
        emailId: formData.emailId,
        mobileNo: formData.mobileNo,
        postalCode: formData.postalCode,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        addressLine3: formData.addressLine3,
        b2cCustomerCode: user.b2cCustomerCode || "",
        branchId: user.branchId || 0,
        countryId: user.countryId || 1,
        createdOn: user.createdOn || new Date().toISOString(),
        createdBy: user.createdBy || 1,
        floorNo: user.floorNo || "",
        isActive: true,
        isApproved: user.isApproved || true,
        loyaltyPoints: user.loyaltyPoints || 0,
        orgId: user.orgId || 1,
        password: user.password || "",
        redeemPoints: user.redeemPoints || 0,
        stateId: user.stateId || 1,
        totalCount: user.totalCount || 0,
        unitNo: user.unitNo || "",
        userName: user.emailId || "",
        modifiedBy: savedUser.b2cCustomerId || 0,
        modifiedOn: new Date().toISOString(),
      };

      const res = await updateCustomer({
        variables: {
          customer: updatePayload,
        },
      });

      const result = res.data?.updateB2CCustomer;

      if (result?.isSuccess) {
        toast({
          title: "Success",
          description: "Profile updated successfully!",
          variant: "default",
        });
        setIsEditing(false);
        // Refresh user data
        fetchCustomer(savedUser.b2cCustomerId);
      } else {
        toast({
          title: "Error",
          description: result?.errorMessage || "Failed to update profile.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Unable to update profile.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original user data
    setFormData({
      b2CCustomerName: user.b2CCustomerName || "",
      emailId: user.emailId || "",
      mobileNo: user.mobileNo || "",
      postalCode: user.postalCode || "",
      addressLine1: user.addressLine1 || "",
      addressLine2: user.addressLine2 || "",
      addressLine3: user.addressLine3 || "",
    });
  };

  const handleDeleteAddress = async (addressId: number) => {
    try {
      const { data } = await deactivateAddress({ variables: { addressId } });
      if (data?.deactivateB2CCustomerDeliveryAddress?.isSuccess) {
        toast({
          title: "Success",
          description: "Address deleted successfully!",
          variant: "default",
        });
        fetchAddresses(user?.b2cCustomerId);
      } else {
        toast({
          title: "Error",
          description: data?.deactivateB2CCustomerDeliveryAddress?.errorMessage?.[0] || "Failed to delete address.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Unable to delete address.",
        variant: "destructive",
      });
    }
  };

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center text-lg">
        Loading profile...
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("b2cUser");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
      variant: "default",
    });
    navigate("/auth");
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Account</h1>
          <div className="flex gap-2">
            <Link to="/">
              <Button variant="outline" className="text-primary font-semibold">
                Go to Home
              </Button>
            </Link>
            <Button variant="destructive" onClick={() => setShowLogoutDialog(true)}>
              Logout
            </Button>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline">Loyalty</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Addresses</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="b2CCustomerName">Full Name</Label>
                    <Input
                      id="b2CCustomerName"
                      name="b2CCustomerName"
                      value={formData.b2CCustomerName}
                      readOnly={!isEditing}
                      onChange={handleInputChange}
                      onClick={handleInputClick}
                    />
                  </div>

                  <div>
                    <Label htmlFor="emailId">Email</Label>
                    <Input
                      id="emailId"
                      name="emailId"
                      value={formData.emailId}
                      readOnly={!isEditing}
                      onChange={handleInputChange}
                      onClick={handleInputClick}
                    />
                  </div>

                  <div>
                    <Label htmlFor="mobileNo">Mobile</Label>
                    <Input
                      id="mobileNo"
                      name="mobileNo"
                      value={formData.mobileNo}
                      readOnly={!isEditing}
                      onChange={handleInputChange}
                      onClick={handleInputClick}
                    />
                  </div>

                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      readOnly={!isEditing}
                      onChange={handleInputChange}
                      onClick={handleInputClick}
                    />
                  </div>

                  <div>
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      name="addressLine1"
                      value={formData.addressLine1}
                      readOnly={!isEditing}
                      onChange={handleInputChange}
                      onClick={handleInputClick}
                    />
                  </div>

                  <div>
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      name="addressLine2"
                      value={formData.addressLine2}
                      readOnly={!isEditing}
                      onChange={handleInputChange}
                      onClick={handleInputClick}
                    />
                  </div>

                  <div>
                    <Label htmlFor="addressLine3">Address Line 3</Label>
                    <Input
                      id="addressLine3"
                      name="addressLine3"
                      value={formData.addressLine3}
                      readOnly={!isEditing}
                      onChange={handleInputChange}
                      onClick={handleInputClick}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={updateLoading}
                  >
                    {updateLoading
                      ? "Updating..."
                      : isEditing
                      ? "Save Changes"
                      : "Update Profile"}
                  </Button>
                  {isEditing && (
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rest of the tabs content remains the same */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Orders Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-6"><Loader /></div>
                ) : (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Customer Name</p>
                      <p className="text-lg font-semibold">
                        {localStorage.getItem("b2cUser") ? JSON.parse(localStorage.getItem("b2cUser")!).b2CCustomerName : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-lg font-semibold">{orders.length}</p>
                      </div>
                      <Link to="/orders">
                        <Button variant="outline" size="sm">View Orders</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loyalty" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Loyalty Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {user?.loyaltyPoints ?? 0}
                  </div>
                  <p className="text-muted-foreground mb-4">Available Points</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Saved Addresses
                  <AddAddressDialog onAddressAdded={() => fetchAddresses(user?.b2cCustomerId)} />
                </CardTitle>
              </CardHeader>
            <CardContent>
  <div className="space-y-4">
    {addressesLoading ? (
      <div className="flex items-center justify-center py-6"><Loader /></div>
    ) : addresses.length === 0 ? (
      <div>No addresses found.</div>
    ) : (
      // Show default address at the top, highlight it
      [...addresses].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)).map((address: any, idx: number) => (
        <div
          key={address.b2cDeliveryAddressId}
          className={`p-4 border rounded-lg mb-2 ${address.isDefault ? 'bg-gradient-to-r from-purple-200 to-purple-100 border-purple-500 shadow-lg' : ''}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-lg">{address.addressLine1}</p>
              {address.addressLine2 && <p className="text-sm text-muted-foreground">{address.addressLine2}</p>}
              {address.addressLine3 && <p className="text-sm text-muted-foreground">{address.addressLine3}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                  {getCountryName(Number(address.countryId))}
                </span>
                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                  {getStateName(Number(address.stateId))}
                </span>
                {address.isDefault && (
                  <Badge variant="secondary" className="ml-2 bg-purple-600 text-white font-bold px-3 py-1 rounded-full shadow">Default</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingAddress(address);
                  setIsEditDialogOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteAddress(address.b2cDeliveryAddressId)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* Edit Address Dialog */}
      {editingAddress && (
        <EditAddressDialog
          address={editingAddress}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingAddress(null);
          }}
          onAddressAdded={() => fetchAddresses(user?.b2cCustomerId)}
        />
      )}

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be logged out of your account and redirected to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowLogoutDialog(false);
              handleLogout();
            }}>
              Logout
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
