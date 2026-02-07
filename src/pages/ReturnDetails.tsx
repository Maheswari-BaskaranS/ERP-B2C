import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_B2C_RETURN_BY_ID } from "@/graphql/ecommerce/b2cReturnQueries";
import Loader from "@/components/ui/loader";

const currency = (n?: number) => `₹${(n ?? 0).toFixed(2)}`;

const ReturnDetails = () => {
  const { returnId } = useParams();
  const id = Number(returnId || 0);
  const { data, loading } = useQuery(GET_B2C_RETURN_BY_ID, { variables: { b2CReturnId: id }, skip: !id, fetchPolicy: "network-only" });

  const header = data?.b2CReturnById?.returnHeader;
  const items = header?.returnDetail || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Return Details</h1>
                <p className="text-muted-foreground">View return header and items</p>
              </div>
              <div className="flex gap-2">
                <Link to="/orders?tab=returns" className="text-sm">Back to Returns</Link>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Return Information</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Return ID</div>
                  <div className="font-medium">{header?.returnId ?? "-"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Order No</div>
                  <div className="font-medium">{header?.orderNo ?? "-"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Order ID</div>
                  <div className="font-medium">{header?.orderId ?? "-"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Return Date</div>
                  <div className="font-medium">{header?.returnDate ? new Date(header.returnDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "-"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Amount</div>
                  <div className="font-medium">{currency(header?.totalAmount)}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Returned Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={4} className="text-center"><Loader /></TableCell></TableRow>
                    ) : items.length === 0 ? (
                      <TableRow><TableCell colSpan={4}>No items</TableCell></TableRow>
                    ) : (
                      items.map((it: any, idx: number) => (
                        <TableRow key={it.returnDetailId ?? idx}>
                          <TableCell className="font-medium">{it.productName}</TableCell>
                          <TableCell className="text-right">{currency(it.price)}</TableCell>
                          <TableCell className="text-right">{it.qty}</TableCell>
                          <TableCell className="text-right">{currency(it.subTotal)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReturnDetails;
