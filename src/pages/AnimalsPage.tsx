import { motion } from "motion/react";
import { Beef, Tag, Stethoscope, Pencil, Trash2 } from "lucide-react";
import { Animal } from "../types";
import { CATEGORIES, getCat } from "../lib/constants";
import { EmptyState, statusColor, statusIcon } from "../components/ui";

interface Props {
  animals: Animal[];
  filteredAnimals: Animal[];
  categoryFilter: string;
  onCategoryFilter: (v: string) => void;
  onEdit: (a: Animal) => void;
  onDelete: (a: Animal) => void;
}

export default function AnimalsPage({
  animals,
  filteredAnimals,
  categoryFilter,
  onCategoryFilter,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => onCategoryFilter("all")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            categoryFilter === "all" ? "bg-slate-800 text-white" : "bg-white text-slate-500 border border-slate-200"
          }`}
        >
          All ({animals.length})
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryFilter(cat.value)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              categoryFilter === cat.value ? "bg-slate-800 text-white" : "bg-white text-slate-500 border border-slate-200"
            }`}
          >
            {cat.emoji} {cat.label} ({animals.filter((a) => a.category === cat.value).length})
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAnimals.map((animal) => {
          const cat = getCat(animal.category);
          return (
            <motion.div
              key={animal.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all group relative"
            >
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(animal)} className="p-1.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onDelete(animal)} className="p-1.5 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {cat.emoji}
                </div>
                <div className="flex flex-col items-end gap-1.5 mr-12">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cat.color}`}>{cat.label}</span>
                  <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColor(animal.status)}`}>
                    {statusIcon(animal.status)}{animal.status}
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-1">{animal.name}</h3>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Tag className="w-3.5 h-3.5" />
                <span className="font-mono font-semibold text-slate-600">{animal.tagNumber}</span>
                <span className="text-slate-200">|</span>
                <span>{animal.breed}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Born {new Date(animal.dateOfBirth).getFullYear()}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
        {filteredAnimals.length === 0 && <EmptyState icon={Beef} label="No animals found" />}
      </div>
    </div>
  );
}
