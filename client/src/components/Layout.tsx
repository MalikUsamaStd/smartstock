import { NavLink, Outlet } from "react-router-dom";
import { Package, Users, ShoppingCart, Warehouse, LayoutDashboard, Truck } from "lucide-react";

const nav = [
  { to: "/",            label: "Dashboard", Icon: LayoutDashboard },
  { to: "/products",    label: "Products",  Icon: Package },
  { to: "/suppliers",   label: "Suppliers", Icon: Truck },
  { to: "/customers",   label: "Customers", Icon: Users },
  { to: "/inventory",   label: "Inventory", Icon: Warehouse },
  { to: "/orders",      label: "Orders",    Icon: ShoppingCart },
];

export default function Layout() {
  return (
    <div className="flex h-full bg-slate-50">
      <aside className="w-56 shrink-0 bg-slate-900 text-slate-100 p-4 flex flex-col">
        <div className="text-xl font-bold mb-6 text-brand-500">SmartStock</div>
        <nav className="space-y-1 flex-1">
          {nav.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ` +
                (isActive
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100")
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}