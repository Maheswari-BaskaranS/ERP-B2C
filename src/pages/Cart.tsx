import { useEffect, useState } from "react";
import { ArrowLeft, Minus, Plus, Trash2, Tag, Clock, Calendar, Shield, Truck, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { GET_B2C_CUSTOMER_CART, REMOVE_B2C_CUSTOMER_CART, UPDATE_B2C_CUSTOMER_CART } from "@/graphql/Product/Cartqueries";
import { toast } from "sonner";
import { GET_ORG_BY_ID } from "@/graphql/org/orgQuery";
import { GET_TAX_BY_ID } from "@/graphql/tax/taxQuery";
import { cleanData } from "@/utilities/clean";
import {GET_CUSTOMER_BY_ID} from "@/graphql/ecommerce/b2cCustomer";

const Cart = () => {
  const [promoCode, setPromoCode] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [redeemPoints, setRedeemPoints] = useState("");
  
  // Mock cart data
  const [cartItems, setCartItems] = useState([]);
  const [mounted, setMounted] = useState(false);
  const user = JSON.parse(localStorage.getItem("b2cUser") || "{}");
  const customerId = user.b2cCustomerId;

    const [getOrgById, { data: getOrgByIdData }] = useLazyQuery(GET_ORG_BY_ID, {
    fetchPolicy: 'network-only',
  });

    const [getTaxById, { data: taxByIdData }] = useLazyQuery(GET_TAX_BY_ID, {
    fetchPolicy: 'network-only',
  });

    const [getCustomerById, { data: customerData }] = useLazyQuery(GET_CUSTOMER_BY_ID, {
      fetchPolicy: "no-cache",
    });

  const { data, loading, error, refetch } = useQuery(GET_B2C_CUSTOMER_CART, {
    variables: {
      customerId: customerId,
      customerType: 2,
    },
    fetchPolicy: "network-only",
  });
  const [updateCartMutation] = useMutation(UPDATE_B2C_CUSTOMER_CART);
  const [removeCartMutation] = useMutation(REMOVE_B2C_CUSTOMER_CART);

   const [orgInformation, setOrgInformation] = useState({});
  const [orgCurrency, setOrgCurrency] = useState<number | null>(null);
  const [orgStateId, setOrgStateId] = useState<number | null>(null);
  const [taxCode, setTaxCode] = useState<number | null>(null);
  const [taxData, setTaxData] = useState<any>(null);
const [customerStateId, setCustomerStateId] = useState<number | null>(null);

    useEffect(() => {
      // Read stored b2cUser object and extract customer id
      try {
        const storedUser = JSON.parse(localStorage.getItem("b2cUser") || "{}");
        const storedCustomerId = storedUser?.b2cCustomerId || 0;
        if (storedCustomerId) {
          getCustomerById({ variables: { customerId: Number(storedCustomerId) } });
        }
      } catch (err) {
        console.log("Error reading stored customer id:", err);
      }
  }, []);
    useEffect(() => {
    const customer = customerData?.customerById?.customer;
    setCustomerStateId(customer?.stateId);
  }, [customerData]);
    useEffect(() => {
    const storedOrgId = localStorage.getItem('orgID')||1; // Retrieve orgID from localStorage
    if (storedOrgId) {
      try {
        getOrgById({ variables: { orgId: Number(storedOrgId) } });
      } catch (error) {
        console.log('Error fetching organization data:', error);
      }
    }
  }, []);
    useEffect(() => {
    const organization = getOrgByIdData?.orgById?.organization;
    setOrgInformation(organization);
    setOrgCurrency(organization?.currencyId);
    setOrgStateId(organization?.stateId);
    setTaxCode(organization?.taxCode);
  }, [getOrgByIdData]);

   useEffect(() => {
    if (taxCode) {
      try {
        getTaxById({ variables: { taxId: Number(taxCode) } });
      } catch (error) {
        console.log('error', error);
      }
    }
  }, [taxCode]);

  
  useEffect(() => {
    const tax = cleanData(taxByIdData?.taxById?.tax);
    if (tax) {
      const overallPercent = Number(tax.taxPercentage) || 0;

      // Build component breakdown (e.g., CGST/SGST/IGST) from splitRatio
      let components: Array<{ name: string; percent: number }> = [];
      if (tax.isStateWiseTax && Array.isArray(tax.stateTaxs) && tax.stateTaxs.length > 0) {
        const matched = tax.stateTaxs.filter((st: any) => {
          if (st.isSameState && customerStateId === orgStateId) return true;
          if (!st.isSameState && customerStateId !== orgStateId) return true;
          return false;
        });

        if (matched.length > 0) {
          components = matched.map((st: any) => ({
            name: st.stateTaxDetailName || "Component",
            percent: overallPercent * (Number(st.splitRatio ?? 0) / 100),
          }));
        }
      }

      if (components.length === 0) {
        components = [{ name: tax.taxName || "Tax", percent: overallPercent }];
      }

      setTaxData({
        taxId: tax.taxID,
        taxName: tax.taxName,
        taxType: tax.taxType,
        taxPercentage: overallPercent, // keep overall percent unchanged
        components,
        isProductBasedTax: tax.isProductBasedTax,
        isStateWiseTax: tax.isStateWiseTax,
        stateTaxs: tax.stateTaxs,
      });
    }
  }, [taxByIdData, customerStateId, orgStateId]);

  useEffect(() => {
    // trigger mount animation
    setMounted(true);

    if (data?.customerCartByCustomerId?.isSuccess) {
      const apiCart = data?.customerCartByCustomerId?.customerCart || [];

      const mapped = apiCart.map((item) => ({
        id: item.cratId,
        productId: item.productId,
        productDetailId: item.productDetailId,
        customerId: item.customerId,
        customerType:item.customerType,
        name: item.productName,
        image: item.productImage || "",
        variant: "", // your API doesn’t give variant → keep empty
        price: item.price,
        originalPrice: null, // backend does not provide → set null
        quantity: item.qty,
        isOrganic: false, // backend does not provide → set false
        isFresh: false, // backend does not provide → set false
      }));

      setCartItems(mapped);
    }
  }, [data]);

  // show simple skeleton when loading


  // Available delivery slots
  const deliverySlots = [
    { id: "1", time: "10:00 AM - 02:00 PM", price: 2.99, label: "Morning" },
    { id: "2", time: "02:00 PM - 06:00 PM", price: 2.99, label: "Afternoon" },
    { id: "3", time: "06:00 PM - 10:00 PM", price: 4.99, label: "Evening" },
  ];

  // Generate next 7 days for delivery date selection
  const getDeliveryDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      dates.push({
        id: date.toISOString().split('T')[0],
        label: label,
        date: date
      });
    }
    return dates;
  };

  const deliveryDates = getDeliveryDates();


  // Get delivery fee (always charge slot price when selected)
  const getDeliveryFee = () => {
    if (!selectedSlot) return 0;
    const slot = deliverySlots.find(s => s.id === selectedSlot);
    return slot?.price || 0;
  };

  const updateQuantity = async (item: any, newQuantity: number) => {
    // ❌ If quantity becomes 0 → remove item
    if (newQuantity === 0) {
      const res = await removeCartMutation({
        variables: {
          customerId: item.customerId,
          customerType: item.customerType,
          productId: item.productId,
          productDetailId: item.productDetailId,
        },
      });

      if (res?.data?.reMoveB2CCustomerCart?.isSuccess) {
        toast.success("Item removed from cart");
        await refetch();
        setCartItems((items) => items.filter((i) => i.id !== item.id));
      } else {
        toast.error(
          res?.data?.reMoveB2CCustomerCart?.errorMessage ||
            "Failed to remove item"
        );
      }

      return;
    }

    // ✅ Update qty in API
    const res = await updateCartMutation({
      variables: {
        customerCart: {
          branchId: item.branchId,
          orgId: item.orgId,
          cratId: item.cratId ?? item.id,
          cartCode: item.cartCode ?? "",
          createdBy: 1,
          createdOn: new Date().toISOString(),
          customerId: item.customerId,
          customerType: item.customerType,
          price: item.price,
          productId: item.productId,
          productDetailId: item.productDetailId,
          productName: item.productName ?? item.name,
          productImage: item.productImage ?? item.image,
          qty: newQuantity,
          isActive: true,
        },
      },
    });

    if (res?.data?.updateB2CCustomerCart?.isSuccess) {
      toast.success("Cart updated");
      await refetch();
      setCartItems((items) =>
        items.map((i) =>
          i.id === item.id ? { ...i, quantity: newQuantity } : i
        )
      );
    } else {
      toast.error(
        res?.data?.updateB2CCustomerCart?.errorMessage ||
          "Failed to update quantity"
      );
    }
  };

  const removeItem = async (item: any) => {
    try {
      const res = await removeCartMutation({
        variables: {
          customerId: item.customerId,
          customerType: item.customerType,
          productId: item.productId,
          productDetailId: item.productDetailId,
        },
      });

      if (res?.data?.reMoveB2CCustomerCart?.isSuccess) {
        toast.success("Item removed");
        await refetch();
        setCartItems((items) => items.filter((i) => i.id !== item.id));
      } else {
        toast.error(
          res?.data?.reMoveB2CCustomerCart?.errorMessage ||
            "Failed to remove item"
        );
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Something went wrong");
    }
  };


  // Calculate tax amount
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const calculateTax = () => {
    if (!taxData) return 0;
    // Prefer summed components (CGST+SGST or IGST) otherwise fallback to overall percent
    const totalPercent =
      (taxData.components?.reduce((s: number, c: any) => s + Number(c.percent || 0), 0) ||
        Number(taxData.taxPercentage || 0));
    return (subtotal * totalPercent) / 100;
  };

  const taxAmount = calculateTax();
  
  // Calculate loyalty points earned (₹10 = 1 point)
  const loyaltyPointsEarned = Math.floor(subtotal / 10);
  
  // Get available loyalty points (mock data - should come from user profile)
  const availableLoyaltyPoints = 38; // This should come from user data
  
  // Calculate redeem discount (10 points = ₹1)
  const redeemDiscount = redeemPoints ? Math.min(Number(redeemPoints), availableLoyaltyPoints) / 10 : 0;

  const savings = cartItems.reduce((sum, item) => {
    const itemSavings = item.originalPrice ? (item.originalPrice - item.price) * item.quantity : 0;
    return sum + itemSavings;
  }, 0);
  const deliveryFee = getDeliveryFee();
  
  const totalWithTax = subtotal + deliveryFee - redeemDiscount + taxAmount;

  const handleRedeemPoints = () => {
    const points = Number(redeemPoints);
    if (points > availableLoyaltyPoints) {
      toast.error(`You only have ${availableLoyaltyPoints} points available`);
      return;
    }
    if (points <= 0) {
      toast.error("Please enter valid points");
      return;
    }
    toast.success(`Redeemed ${points} points for ₹${(points / 10).toFixed(2)} discount`);
  };

  const handleCheckout = () => {
    // Save order summary to localStorage
    const orderData = {
      selectedDate,
      selectedSlot,
      subtotal: subtotal.toFixed(2),
      savings: savings.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      loyaltyPointsEarned,
      availableLoyaltyPoints,
      redeemPointsUsed: redeemPoints ? Number(redeemPoints) : 0,
      redeemDiscount: redeemDiscount.toFixed(2),
      netTotal: totalWithTax.toFixed(2),
      cartItems: cartItems,
    };
    localStorage.setItem("orderSummary", JSON.stringify(orderData));
    
    // Save tax information
    if (taxData) {
      const taxInfo = {
        taxId: taxData.taxId,
        taxType: taxData.taxType,
        taxPercentage: taxData.taxPercentage,
        taxAmount: taxAmount.toFixed(2),
        isStateWiseTax: taxData.isStateWiseTax,
        customerStateId: customerStateId,
        orgStateId: orgStateId,
        isSameState: customerStateId === orgStateId,
        components: taxData.components?.map((c: any) => ({
          name: c.name,
          percent: Number(c.percent),
          amount: ((subtotal * Number(c.percent)) / 100).toFixed(2),
        })) || [],
      };
      localStorage.setItem("taxInfo", JSON.stringify(taxInfo));
    }
    
    // Save selected delivery slot with date
    const selectedSlotData = deliverySlots.find(s => s.id === selectedSlot);
    const deliverySlotData = {
      slotId: selectedSlot,
      date: selectedDate,
      time: selectedSlotData?.time || "",
      label: selectedSlotData?.label || "",
      price: selectedSlotData?.price || 0,
    };
    localStorage.setItem("selectedDeliverySlot", JSON.stringify(deliverySlotData));
    
    toast.success("Order summary saved");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#5E3E82] text-white flex items-center justify-center text-sm font-semibold">1</div>
              <span className="ml-2 text-sm font-medium text-[#5E3E82]">Cart</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center text-sm font-semibold">2</div>
              <span className="ml-2 text-sm text-gray-500">Checkout</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center text-sm font-semibold">3</div>
              <span className="ml-2 text-sm text-gray-500">Payment</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-[#5E3E82] transition-colors hover:scale-110 transform duration-200">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600 text-sm">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="bg-[#5E3E82]/10 text-[#5E3E82] border-[#5E3E82]/20 px-3 py-1">
              <Shield className="h-4 w-4 mr-1" />
              Secure Checkout
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[1,2,3].map((i) => (
                <Card key={i} className="animate-pulse border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-4">
              <Card className="animate-pulse border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-[#5E3E82]/10 to-[#5E3E82]/20 rounded-full flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                  <Heart className="h-10 w-10 text-[#5E3E82]" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet</p>
              <Link to="/">
                <Button size="lg" className="px-8 bg-[#5E3E82] hover:bg-[#4A2F6B] text-white transform hover:scale-105 transition-all duration-200">
                  Start Shopping
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-4">
              {/* Cart Items Header */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Cart Items ({cartItems.length})</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Price</span>
                    <span>Quantity</span>
                    <span>Subtotal</span>
                  </div>
                </div>
              </div>

              {cartItems.map((item, idx) => {
                const discount = item.originalPrice 
                  ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                  : 0;

                return (
                  <Card
                    key={item.id}
                    className={`group hover:shadow-lg border-0 shadow-sm transition-all duration-300 hover:-translate-y-1 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{animationDelay: `${idx * 100}ms`}}
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        {/* Product Image */}
                        <div className="relative w-28 h-28 rounded-lg overflow-hidden bg-white border border-gray-100 flex-shrink-0 group-hover:shadow-md transition-shadow duration-300">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-1 bg-gray-300 rounded-lg flex items-center justify-center">
                                  <Heart className="h-6 w-6 text-gray-500" />
                                </div>
                                <span className="text-xs text-gray-500">No Image</span>
                              </div>
                            </div>
                          )}

                          {/* Discount Badge */}
                          {discount > 0 && (
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                                -{discount}%
                              </Badge>
                            </div>
                          )}

                          {/* Badges */}
                          <div className="absolute bottom-2 left-2 flex gap-1">
                            {item.isOrganic && (
                              <Badge className="bg-green-500 text-white text-xs px-1 py-0.5">
                                Organic
                              </Badge>
                            )}
                            {item.isFresh && (
                              <Badge className="bg-blue-500 text-white text-xs px-1 py-0.5">
                                Fresh
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 pr-4">
                              <h3 className="font-semibold text-gray-900 text-lg group-hover:text-[#5E3E82] transition-colors duration-200">
                                {item.name}
                              </h3>
                              {item.variant && (
                                <p className="text-sm text-gray-600 mt-1">{item.variant}</p>
                              )}
                              
                              {/* Rating */}
                              <div className="flex items-center gap-1 mt-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                                <span className="text-sm text-gray-600 ml-1">(4.5)</span>
                              </div>

                              {/* Stock Status */}
                              <div className="flex items-center gap-2 mt-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-green-600 font-medium">In Stock</span>
                              </div>
                            </div>

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeItem(item)}
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 transform hover:scale-110"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>

                          {/* Price & Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-gray-900">
                                  ₹{item.price}
                                </span>
                                {item.originalPrice && (
                                  <span className="text-lg text-gray-500 line-through">
                                    ₹{item.originalPrice}
                                  </span>
                                )}
                              </div>
                              {discount > 0 && (
                                <Badge className="bg-green-100 text-green-700 text-xs">
                                  Save ₹{((item.originalPrice || 0) - item.price).toFixed(2)}
                                </Badge>
                              )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center border border-gray-200 rounded-lg">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-10 w-10 hover:bg-[#5E3E82] hover:text-white transition-colors duration-200"
                                  onClick={() => updateQuantity(item, item.quantity - 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="px-4 py-2 font-semibold text-lg min-w-[3rem] text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-10 w-10 hover:bg-[#5E3E82] hover:text-white transition-colors duration-200"
                                  onClick={() => updateQuantity(item, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-500">Total</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Continue Shopping */}
              <Card className="border-0 shadow-sm border-dashed border-2 border-gray-300">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Want to add more items?</h3>
                  <p className="text-gray-600 mb-4">Continue shopping to explore more products</p>
                  <Link to="/">
                    <Button variant="outline" className="border-[#5E3E82] text-[#5E3E82] hover:bg-[#5E3E82] hover:text-white">
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              {/* Delivery Date Selection */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                    <Truck className="h-5 w-5 text-[#5E3E82]" />
                    Delivery Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={deliveryDates[0].id}
                      max={deliveryDates[deliveryDates.length - 1].id}
                      className="w-full h-12 transition-all duration-200 focus:ring-2 focus:ring-[#5E3E82] focus:border-[#5E3E82]"
                    />
                  </div>
                  
                  {/* Delivery Promise */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-800">FREE Delivery</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">On orders above ₹499</p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card className="border-0 shadow-md sticky top-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-gray-900">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                      <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                    </div>
                    
                    {savings > 0 && (
                      <div className="flex justify-between text-base text-green-600">
                        <span>Discount</span>
                        <span className="font-semibold">-₹{savings.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold text-gray-900">
                        {!selectedSlot ? (
                          <span className="text-gray-400">Select slot</span>
                        ) : deliveryFee === 0 ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          `₹${deliveryFee.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    
                    {taxData && (
                      <div className="flex justify-between text-base">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-semibold text-gray-900">₹{taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />
                  
                  {/* Loyalty Points */}
                  <div className="bg-[#5E3E82]/5 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#5E3E82] rounded-full flex items-center justify-center">
                          <Star className="h-4 w-4 text-white fill-current" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">Earn Rewards</span>
                      </div>
                      <span className="text-lg font-bold text-[#5E3E82]">{loyaltyPointsEarned} pts</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">You'll earn {loyaltyPointsEarned} points on this order</p>
                  </div>

                  <Separator className="my-4" />
                  
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-[#5E3E82]">₹{totalWithTax.toFixed(2)}</span>
                  </div>
                  
                  <Button 
                    size="lg" 
                    className="w-full mt-6 h-12 bg-[#5E3E82] hover:bg-[#4A2F6B] text-white font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl" 
                    disabled={!selectedSlot || !selectedDate} 
                    onClick={handleCheckout} 
                    asChild
                  >
                    <Link to="/checkout">
                      <div className="flex items-center justify-center gap-2">
                        <Shield className="h-5 w-5" />
                        Proceed to Checkout
                      </div>
                    </Link>
                  </Button>

                  {/* Security Features */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>SSL Encrypted Secure Checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Truck className="h-4 w-4 text-blue-500" />
                      <span>Free Returns within 7 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default Cart;