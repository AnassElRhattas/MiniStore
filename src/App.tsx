import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "@/pages/Home";
import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { OrderSuccessPage } from "@/pages/OrderSuccessPage";
import { TrackOrderPage } from "@/pages/TrackOrderPage";
import { ProductDetail } from "@/components/ProductDetail";

export default function App() {
  return (
    <Router>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/track-order" element={<TrackOrderPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
      </Routes>
    </Router>
  );
}
