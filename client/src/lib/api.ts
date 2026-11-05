const API_BASE = "/api";

export type Product = {
  product_id: string;
  supplier_id: string | null;
  sku: string;
  name: string;
  description: string | null;
  unit_price: string;
  stock_quantity: number;
  reorder_level: number;
  created_at: string;
  updated_at: string;
};

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
  const json = await res.json();
  return json.data;
}

export async function fetchCounts() {
  const [p, s, c, o] = await Promise.all([
    fetch(`${API_BASE}/products`).then((r) => r.json()),
    fetch(`${API_BASE}/suppliers`).then((r) => r.json()),
    fetch(`${API_BASE}/customers`).then((r) => r.json()),
    fetch(`${API_BASE}/orders`).then((r) => r.json()),
  ]);
  return {
    products: p.data.length,
    suppliers: s.data.length,
    customers: c.data.length,
    orders: o.data.length,
  };
}
