import { useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link, useParams } from "react-router-dom";
import { useLazyQuery, useQuery } from "@apollo/client";
import { GET_B2C_ORDER_BY_ID, GET_B2C_ORDER_DETAILS_BY_ID } from "@/graphql/ecommerce/b2cOrderQueries";
import { Separator } from "@/components/ui/separator";
import Loader from "@/components/ui/loader";

const currency = (n?: number) => `₹${(n ?? 0).toFixed(2)}`;

const OrderDetails = () => {
  const { orderId } = useParams();
  const id = useMemo(() => Number(orderId || 0), [orderId]);

  const { data: headerData, loading: headerLoading, error: headerError } = useQuery(
    GET_B2C_ORDER_BY_ID,
    {
      variables: { orderId: id },
      skip: !id,
      fetchPolicy: "network-only",
    }
  );

  const orderHeader = headerData?.b2COrderById?.orderHeader;

  const [fetchDetails, { data: detailsData, loading: detailsLoading }] = useLazyQuery(
    GET_B2C_ORDER_DETAILS_BY_ID,
    { fetchPolicy: "network-only" }
  );

  useEffect(() => {
    if (orderHeader?.b2cOrderId && orderHeader?.orgId && orderHeader?.branchId) {
      fetchDetails({
        variables: {
          orderId: orderHeader.b2cOrderId,
          orgId: orderHeader.orgId,
          branchId: orderHeader.branchId,
        },
      });
    }
  }, [orderHeader?.b2cOrderId, orderHeader?.orgId, orderHeader?.branchId, fetchDetails]);

  const orderDetails = detailsData?.b2COrderDetailsById?.orderDetails || [];

  const savedUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("b2cUser") || "{}"); } catch { return {}; }
  }, []);

  const email = savedUser?.email || "-";
  const payment = (() => {
    const r = orderHeader?.receiptDetails?.[0];
    if (!r) return "-";
    if (r.payModeName) return r.payModeName;
    if (typeof r.paymodeId === "number") return r.paymodeId === 0 ? "Cash" : r.paymodeId === 1 ? "UPI" : `Mode ${r.paymodeId}`;
    return "-";
  })();

  const formattedDate = orderHeader?.b2cOrderDate
    ? new Date(orderHeader.b2cOrderDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "-";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">Order Details</h1>
                <p className="text-muted-foreground">View order header, items, and summary</p>
              </div>
              <div className="flex gap-2">
                <Link to="/orders"><Button variant="outline">Back to Orders</Button></Link>
                <Link to="/account?tab=orders"><Button variant="outline">Account Orders</Button></Link>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Order ID</div>
                  <div className="font-medium">{orderHeader?.b2cOrderId ?? "-"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Order No</div>
                  <div className="font-medium">{orderHeader?.b2cOrderNo ?? "-"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Customer Name</div>
                  <div className="font-medium">{orderHeader?.b2cCustomerName ?? "-"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Order Date</div>
                  <div className="font-medium">{formattedDate}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Email</div>
                  <div className="font-medium">{email}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Shipping Address</div>
                  <div className="font-medium whitespace-pre-line">{orderHeader?.deliveryAddress ?? "-"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Payment Method</div>
                  <div className="font-medium">{payment}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[64px]">S.No</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailsLoading || headerLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center"><Loader /></TableCell></TableRow>
                    ) : orderDetails.length === 0 ? (
                      <TableRow><TableCell colSpan={5}>No items found</TableCell></TableRow>
                    ) : (
                      orderDetails.map((item: any, idx: number) => (
                        <TableRow key={item.b2cOrderDetailId ?? idx}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell className="font-medium">{item.productName ?? "-"}</TableCell>
                          <TableCell className="text-right">{currency(item.price)}</TableCell>
                          <TableCell className="text-right">{item.qty ?? 0}</TableCell>
                          <TableCell className="text-right">{currency(item.total)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">Subtotal</div>
                  <div className="font-medium">{currency(orderHeader?.subTotal)}</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">Shipping</div>
                  <div className="font-medium">{currency(orderHeader?.deliveryAmount)}</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">Tax</div>
                  <div className="font-medium">{currency(orderHeader?.totalTax)}</div>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-base">
                  <div className="font-semibold">Net Total</div>
                  <div className="font-semibold">{currency(orderHeader?.netTotal)}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetails;
