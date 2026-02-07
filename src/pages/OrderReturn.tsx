import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { GET_B2C_ORDER_BY_ID, GET_B2C_ORDER_DETAILS_BY_ID } from "@/graphql/ecommerce/b2cOrderQueries";
import { ADD_B2C_RETURN } from "@/graphql/ecommerce/b2cReturnQueries";
import { toast } from "sonner";
import Loader from "@/components/ui/loader";

const currency = (n?: number) => `₹${(n ?? 0).toFixed(2)}`;

const OrderReturn = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const id = useMemo(() => Number(orderId || 0), [orderId]);

  const { data: headerData, loading: headerLoading } = useQuery(GET_B2C_ORDER_BY_ID, {
    variables: { orderId: id },
    skip: !id,
    fetchPolicy: "network-only",
  });
  const orderHeader = headerData?.b2COrderById?.orderHeader;
  const [fetchDetails, { data: detailsData, loading: detailsLoading }] = useLazyQuery(GET_B2C_ORDER_DETAILS_BY_ID, { fetchPolicy: "network-only" });

  const [addReturn, { loading: adding }] = useMutation(ADD_B2C_RETURN);

  const [selected, setSelected] = useState<Record<number, { checked: boolean; qty: number }>>({});

  useEffect(() => {
    if (orderHeader?.b2cOrderId && orderHeader?.orgId && orderHeader?.branchId) {
      fetchDetails({ variables: { orderId: orderHeader.b2cOrderId, orgId: orderHeader.orgId, branchId: orderHeader.branchId } });
    }
  }, [orderHeader?.b2cOrderId, orderHeader?.orgId, orderHeader?.branchId, fetchDetails]);

  const details = detailsData?.b2COrderDetailsById?.orderDetails || [];

  const updateSelect = (detailId: number, maxQty: number, change: Partial<{ checked: boolean; qty: number }>) => {
    setSelected((prev) => {
      const curr = prev[detailId] || { checked: false, qty: 1 };
      const next = { ...curr, ...change };
      if (next.qty < 1) next.qty = 1;
      if (next.qty > maxQty) next.qty = maxQty;
      return { ...prev, [detailId]: next };
    });
  };

  const canReturn = useMemo(() => {
    if (!orderHeader?.b2cOrderDate) return false;
    const placed = new Date(orderHeader.b2cOrderDate).getTime();
    const diff = Date.now() - placed;
    return diff <= 2 * 24 * 60 * 60 * 1000; // 2 days
  }, [orderHeader?.b2cOrderDate]);

  const totals = useMemo(() => {
    let sub = 0;
    let tax = 0;
    let net = 0;
    details.forEach((it: any) => {
      const sel = selected[it.b2cOrderDetailId];
      if (sel?.checked) {
        const lineSub = (it.price ?? 0) * sel.qty;
        const lineTax = it.taxPrice ? (it.taxPrice / Math.max(it.qty || 1, 1)) * sel.qty : 0;
        const lineNet = lineSub + lineTax;
        sub += lineSub; tax += lineTax; net += lineNet;
      }
    });
    return { sub, tax, net };
  }, [selected, details]);

  const submitReturn = async () => {
    if (!canReturn) { toast.error("Return window expired"); return; }
    const user = JSON.parse(localStorage.getItem("b2cUser") || "{}");
    const orgId = orderHeader?.orgId || Number(localStorage.getItem("orgID")) || 1;
    const branchId = orderHeader?.branchId || 1;

    const chosen = details.filter((it: any) => selected[it.b2cOrderDetailId]?.checked);
    if (chosen.length === 0) { toast.error("Select at least one item"); return; }

    const returnHeader = {
      returnId: 0,
      returnDate: new Date().toISOString(),
      returnType: "Customer",
      returnCode: "",
      orgId,
      branchId,
      orderId: orderHeader.b2cOrderId,
      orderDate: orderHeader.b2cOrderDate,
      orderNo: orderHeader.b2cOrderNo,
      paymodeId: orderHeader?.receiptDetails?.[0]?.paymodeId ?? 0,
      payModeName: orderHeader?.receiptDetails?.[0]?.payModeName ?? "",
      totalAmount: totals.net,
      referenceNo: "",
      remarks: "Customer return",
      isActive: true,
      createdBy: user?.b2cCustomerId || 1,
      createdOn: new Date().toISOString(),
      returnDetail: chosen.map((it: any) => {
        const qty = selected[it.b2cOrderDetailId].qty;
        const price = it.price ?? 0;
        const taxUnit = it.taxPrice ? (it.taxPrice / Math.max(it.qty || 1, 1)) : 0;
        const subTotal = price * qty;
        const itemTotalTax = taxUnit * qty;
        const total = subTotal; // if tax included in net separately
        const netTotal = subTotal + itemTotalTax;
        return {
          b2ReturnId: 0,
          itemStatus: "Requested",
          returnDetailId: 0,
          orgId,
          branchId,
          productId: it.productId,
          productDetailId: it.productDetailId,
          productName: it.productName,
          qty,
          foc: 0,
          price,
          currencyId: it.currencyId ?? 1,
          currencyRate: it.currencyRate ?? 1,
          taxId: it.taxId ?? 1,
          taxType: it.taxType ?? "GST",
          taxPrice: itemTotalTax,
          itemDiscount: 0,
          itemDiscPer: 0,
          total,
          subTotal,
          itemTotalTax,
          netTotal,
          remarks: "",
          isActive: true,
          createdBy: user?.b2cCustomerId || 1,
          createdOn: new Date().toISOString(),
        };
      }),
    };

    try {
      const { data } = await addReturn({ variables: { b2CReturn: returnHeader } });
      if (data?.addB2CReturn?.isSuccess) {
        toast.success("Return submitted successfully");
        navigate("/orders?tab=returns");
      } else {
        toast.error(data?.addB2CReturn?.errorMessage || "Failed to submit return");
      }
    } catch (e) {
      toast.error("Unable to submit return");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">Return Items</h1>
                <p className="text-muted-foreground">Select products and quantities to return</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/orders/${id}`}><Button variant="outline">Back to Order</Button></Link>
                <Link to="/orders?tab=returns"><Button variant="outline">Returns</Button></Link>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Order #{orderHeader?.b2cOrderNo ?? "-"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <div className="text-muted-foreground">Order Date</div>
                    <div className="font-medium">{orderHeader?.b2cOrderDate ? new Date(orderHeader.b2cOrderDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "-"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Return Window</div>
                    <div className="font-medium">{canReturn ? "Open (2 days)" : "Closed"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Customer</div>
                    <div className="font-medium">{orderHeader?.b2cCustomerName ?? "-"}</div>
                  </div>
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
                      <TableHead className="w-[48px]"></TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Ordered</TableHead>
                      <TableHead className="text-right">Return Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailsLoading || headerLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center"><Loader /></TableCell></TableRow>
                    ) : details.length === 0 ? (
                      <TableRow><TableCell colSpan={5}>No items</TableCell></TableRow>
                    ) : (
                      details.map((it: any) => {
                        const sel = selected[it.b2cOrderDetailId] || { checked: false, qty: 1 };
                        const maxQty = it.qty ?? 1;
                        return (
                          <TableRow key={it.b2cOrderDetailId}>
                            <TableCell>
                              <Checkbox checked={sel.checked} onCheckedChange={(c) => updateSelect(it.b2cOrderDetailId, maxQty, { checked: !!c })} />
                            </TableCell>
                            <TableCell className="font-medium">{it.productName}</TableCell>
                            <TableCell className="text-right">{currency(it.price)}</TableCell>
                            <TableCell className="text-right">{maxQty}</TableCell>
                            <TableCell className="text-right">
                              <Input type="number" min={1} max={maxQty} value={sel.qty} onChange={(e) => updateSelect(it.b2cOrderDetailId, maxQty, { qty: Number(e.target.value || 1) })} className="w-20 ml-auto text-right" disabled={!sel.checked} />
                            </TableCell>
                          </TableRow>
                        );
                      })
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
                  <div className="font-medium">{currency(totals.sub)}</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">Tax</div>
                  <div className="font-medium">{currency(totals.tax)}</div>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-base">
                  <div className="font-semibold">Total Return</div>
                  <div className="font-semibold">{currency(totals.net)}</div>
                </div>
                <Button className="mt-2" onClick={submitReturn} disabled={!canReturn || adding}>Submit Return</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderReturn;
