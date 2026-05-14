import React, { useEffect } from "react";
import { motion } from "motion/react";
import { CheckCircle2, AlertCircle, Clock, X } from "lucide-react";
import { CATEGORIES } from "../lib/constants";

export const inputCls =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all";

export function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </label>
      {children}
    </div>
  );
}

export function ModalActions({
  onClose,
  onSubmit,
  loading,
  label,
}: {
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  label: string;
}) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        onClick={onClose}
        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-all text-slate-700"
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={loading}
        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        )}
        {loading ? "Saving..." : label}
      </button>
    </div>
  );
}

export function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="col-span-full py-20 text-center bg-white border border-dashed border-slate-200 rounded-3xl">
      <Icon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
      <p className="text-slate-400 font-medium text-sm">{label}</p>
    </div>
  );
}

export function Toast({
  message,
  type,
  onClose,
}: {
  key?: React.Key;
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-semibold text-sm max-w-sm ${
        type === "success" ? "bg-emerald-600" : "bg-rose-600"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 className="w-5 h-5 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 shrink-0" />
      )}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export const statusColor = (s: string) =>
  ({
    healthy: "text-emerald-600 bg-emerald-50",
    injured: "text-rose-600 bg-rose-50",
    rented: "text-amber-600 bg-amber-50",
    active: "text-blue-600 bg-blue-50",
    completed: "text-slate-500 bg-slate-100",
  }[s.toLowerCase()] ?? "text-slate-500 bg-slate-100");

export const statusIcon = (s: string) =>
  ({
    healthy: <CheckCircle2 className="w-3.5 h-3.5" />,
    completed: <CheckCircle2 className="w-3.5 h-3.5" />,
    injured: <AlertCircle className="w-3.5 h-3.5" />,
    rented: <Clock className="w-3.5 h-3.5" />,
    active: <Clock className="w-3.5 h-3.5" />,
  }[s.toLowerCase()] ?? null);

export function CategorySelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          type="button"
          onClick={() => onChange(cat.value)}
          className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
            value === cat.value
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-slate-50 text-slate-500"
          }`}
        >
          {cat.emoji} {cat.label}
        </button>
      ))}
    </div>
  );
}
