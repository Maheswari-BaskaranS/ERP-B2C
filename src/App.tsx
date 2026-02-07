import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import Category from "./pages/Category";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import OrderManagement from "./pages/OrderManagement";
import OrderDetails from "./pages/OrderDetails";
import OrderReturn from "@/pages/OrderReturn";
import ReturnDetails from "./pages/ReturnDetails";
import AddressManagement from "./pages/AddressManagement";
import LoyaltyRewards from "./pages/LoyaltyRewards";
import NotFound from "./pages/NotFound";
import Wishlist from "./pages/Wishlist";
import ForgotPassword from "./pages/ForgotPassword";

const App = () => (
  <ErrorBoundary>
    <div style={{ zoom: '0.9' }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Category />} />
            <Route path="/category/:categoryId" element={<Category />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account" element={<Account />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/orders/:orderId" element={<OrderDetails />} />
            <Route path="/orders/:orderId/return" element={<OrderReturn />} />
            <Route path="/returns/:returnId" element={<ReturnDetails />} />
            <Route path="/addresses" element={<AddressManagement />} />
            <Route path="/loyalty" element={<LoyaltyRewards />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            <Route path="/forgotPassword" element={<ForgotPassword />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </div>
  </ErrorBoundary>
);

export default App;
