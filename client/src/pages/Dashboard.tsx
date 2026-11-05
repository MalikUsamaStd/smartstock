import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Package, Users, ShoppingCart, Truck } from "lucide-react";
import { fetchCounts } from "../lib/api";

type Counts = { products: number; suppliers: number; customers: number; orders: number };

export default function Dashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCounts().then(setCounts).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="text-red-600 p-4 bg-red-50 rounded-lg">Error: {error}</div>;
  if (!counts) return <div className="text-slate-500">Loading dashboard...</div>;

  const cards = [
    { label: "Products",  value: counts.products,  Icon: Package,      color: "text-blue-600",    bg: "bg-blue-50" },
    { label: "Suppliers", value: counts.suppliers, Icon: Truck,        color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Customers", value: counts.customers, Icon: Users,        color: "text-violet-600",  bg: "bg-violet-50" },
    { label: "Orders",    value: counts.orders,    Icon: ShoppingCart, color: "text-orange-600",  bg: "bg-orange-50" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(({ label, value, Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5"
          >
            <div className={`p-4 rounded-xl ${bg} ${color}`}>
              <Icon size={28} />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">{label}</div>
              <div className="text-3xl font-bold text-slate-800 mt-1">{value}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
