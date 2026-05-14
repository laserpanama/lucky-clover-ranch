import { motion } from "motion/react";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { Rental } from "../types";
import { getCat } from "../lib/constants";
import { EmptyState, statusColor, statusIcon } from "../components/ui";

interface Props {
  filteredRentals: Rental[];
  onEdit: (r: Rental) => void;
  onDelete: (r: Rental) => void;
}

export default function RentalsPage({ filteredRentals, onEdit, onDelete }: Props) {
  return (
    <div className="space-y-3">
      {filteredRentals.map((rental) => (
        <motion.div
          key={rental.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:border-emerald-200 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl">
              {getCat(rental.animal?.category ?? "rodeo").emoji}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-slate-900">{rental.animal?.name ?? `#${rental.animalId}`}</span>
                <span className="text-slate-300">→</span>
                <span className="text-slate-600">{rental.client?.name ?? `#${rental.clientId}`}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>{new Date(rental.startDate).toLocaleDateString()} – {new Date(rental.endDate).toLocaleDateString()}</span>
                <span className="font-bold text-slate-700">${Number(rental.price).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase ${statusColor(rental.status)}`}>
              {statusIcon(rental.status)}{rental.status}
            </span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(rental)} className="p-1.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(rental)} className="p-1.5 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 rounded-lg transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
      {filteredRentals.length === 0 && <EmptyState icon={Calendar} label="No rentals found" />}
    </div>
  );
}
