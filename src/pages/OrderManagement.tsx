import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package, Search, ShoppingCart, RotateCcw } from "lucide-react";
import { useLazyQuery } from "@apollo/client";
import {GET_ORDERS_BY_CUSTOMER_ID} from "@/graphql/ecommerce/b2cOrderQueries";
import { GET_RETURNS_BY_CUSTOMER_ID } from "@/graphql/ecommerce/b2cReturnQueries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Loader from "@/components/ui/loader";

interface Order {
  b2cOrderId: number;
  b2cOrderNo: string;
  b2cOrderDate?: string;
  b2cCustomerName?: string;
  netTotal?: number;
  orderStatus?: string;
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchOrders, { loading: ordersLoading }] = useLazyQuery(GET_ORDERS_BY_CUSTOMER_ID, { fetchPolicy: "network-only" });
  const [fetchReturns, { loading: returnsLoading }] = useLazyQuery(GET_RETURNS_BY_CUSTOMER_ID, { fetchPolicy: "network-only" });
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const tabParam = params.get("tab");
  const [activeTab, setActiveTab] = useState<string>(tabParam === "returns" ? "returns" : "orders");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("b2cUser") || "{}");
    const customerId = savedUser?.b2cCustomerId;
    if (!customerId) return;
    fetchOrders({ variables: { customerId } }).then(res => {
      const result = res.data?.b2COrderByCustomerId;
      if (result?.isSuccess) {
        setOrders(result.b2COrder || []);
      } else {
        setOrders([]);
      }
    }).catch(() => setOrders([]));

    fetchReturns({ variables: { customerId } }).then(res => {
      const r = res.data?.b2CReturnByCustomerId;
      if (r?.isSuccess) {
        setReturns(r.return || []);
      } else {
        setReturns([]);
      }
    }).catch(() => setReturns([]));
  }, [fetchOrders]);

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      Delivered: { label: "Delivered", variant: "secondary" },
      "In Transit": { label: "In Transit", variant: "default" },
      Processing: { label: "Processing", variant: "outline" },
      Cancelled: { label: "Cancelled", variant: "destructive" },
    };
    const config = variants[status] || variants.Processing;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredOrders = orders.filter(order =>
    (order.b2cOrderNo || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReturns = returns.filter((ret) =>
    (ret.orderNo || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canReturn = (orderDate?: string) => {
    if (!orderDate) return false;
    const placed = new Date(orderDate).getTime();
    const now = Date.now();
    const diff = now - placed;
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
    return diff <= twoDaysMs;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Order Management</h1>
                <p className="text-muted-foreground">Manage and track all your orders</p>
              </div>
              <div className="flex gap-2">
                <Link to="/account?tab=orders">
                  <Button variant="outline">Back to Account</Button>
                </Link>
              </div>
              {/* Removed create/edit dialog per requirement to show list only */}
            </div>

            <Tabs value={activeTab} onValueChange={(v) => {
              setActiveTab(v);
              const base = "/orders";
              navigate(v === "returns" ? `${base}?tab=returns` : base, { replace: true });
            }}>
              <TabsList>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="returns">Returns</TabsTrigger>
              </TabsList>

              {/* Search */}
              <div className="mb-6 mt-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={activeTab === "orders" ? "Search orders by number..." : "Search returns by order no..."}
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value="orders">
                <div className="space-y-4">
                  {ordersLoading ? (
                        <div className="flex items-center justify-center py-8"><Loader /></div>
                      ) : filteredOrders.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center">
                          {searchQuery ? "No orders found matching your search" : "No orders yet"}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredOrders.map((order) => (
                      <Card key={order.b2cOrderId} className="border-border/50">
                        <CardContent className="p-6">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-3">
                              <h3 className="text-lg font-semibold text-foreground">
                                Order #{order.b2cOrderNo}
                              </h3>
                              <div className="flex gap-2">
                                <Link to={`/orders/${order.b2cOrderId}`}>
                                  <Button variant="outline" size="icon" aria-label="View order details">
                                    <ShoppingCart className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span>
                                        <Link to={`/orders/${order.b2cOrderId}/return`}>
                                          <Button variant="outline" size="sm" disabled={!canReturn(order.b2cOrderDate)}>
                                            Return Items
                                          </Button>
                                        </Link>
                                      </span>
                                    </TooltipTrigger>
                                    {!canReturn(order.b2cOrderDate) && (
                                      <TooltipContent>
                                        Return window expired (after 2 days)
                                      </TooltipContent>
                                    )}
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">ID: {order.b2cOrderId}</Badge>
                              <Badge variant="secondary">
                                {order.b2cOrderDate ? new Date(order.b2cOrderDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }) : "-"}
                              </Badge>
                              {getStatusBadge(order.orderStatus)}
                              <Badge>₹{(order.netTotal ?? 0).toFixed(2)}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="returns">
                <div className="space-y-4">
                  {returnsLoading ? (
                    <div className="flex items-center justify-center py-8"><Loader /></div>
                  ) : filteredReturns.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <RotateCcw className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center">
                          {searchQuery ? "No returns found matching your search" : "No returns yet"}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredReturns.map((ret) => (
                      <Card key={`${ret.returnId ?? ret.orderId}-${ret.orderNo ?? ret.b2cOrderNo}`} className="border-border/50">
                        <CardContent className="p-6">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-3">
                              <h3 className="text-lg font-semibold text-foreground">
                                Order #{ret.orderNo ?? ret.b2cOrderNo}
                              </h3>
                              {ret.returnId ? (
                                <Link to={`/returns/${ret.returnId}`}>
                                  <Button variant="outline" size="icon" aria-label="View return details">
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                </Link>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">Return ID: {ret.returnId ?? '-'}</Badge>
                              {ret.returnCode ? (
                                <Badge variant="outline">Code: {ret.returnCode}</Badge>
                              ) : null}
                              <Badge variant="outline">Order ID: {ret.orderId ?? '-'}</Badge>
                              <Badge variant="secondary">
                                Order Date: {(ret.orderDate ?? ret.b2cOrderDate) ? new Date(ret.orderDate ?? ret.b2cOrderDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }) : "-"}
                              </Badge>
                              <Badge variant="secondary">
                                Return Date: {ret.returnDate ? new Date(ret.returnDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }) : "-"}
                              </Badge>
                              {typeof ret.totalAmount === 'number' ? (
                                <Badge>₹{(ret.totalAmount ?? 0).toFixed(2)}</Badge>
                              ) : typeof ret.netTotal === 'number' ? (
                                <Badge>₹{(ret.netTotal ?? 0).toFixed(2)}</Badge>
                              ) : null}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderManagement;
