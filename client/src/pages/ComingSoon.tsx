import { motion } from "motion/react";
import { Construction } from "lucide-react";

export default function ComingSoon({ title }: { title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-sm border border-slate-100"
    >
      <div className="p-4 bg-amber-50 rounded-full mb-4">
        <Construction size={48} className="text-amber-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
      <p className="text-slate-500">This module is coming in a later lab.</p>
    </motion.div>
  );
}