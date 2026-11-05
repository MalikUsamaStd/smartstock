import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ComingSoon from "./pages/ComingSoon";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/products"  element={<Products />} />
          <Route path="/suppliers" element={<ComingSoon title="Suppliers" />} />
          <Route path="/customers" element={<ComingSoon title="Customers" />} />
          <Route path="/inventory" element={<ComingSoon title="Inventory" />} />
          <Route path="/orders"    element={<ComingSoon title="Orders" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}