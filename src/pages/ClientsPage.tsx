import { Users, Pencil, Trash2 } from "lucide-react";
import { Client } from "../types";
import { EmptyState } from "../components/ui";

interface Props {
  filteredClients: Client[];
  onEdit: (c: Client) => void;
  onDelete: (c: Client) => void;
}

export default function ClientsPage({ filteredClients, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Organization</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredClients.map((client) => (
            <tr key={client.id} className="hover:bg-slate-50/60 group">
              <td className="px-6 py-4 font-bold text-slate-800">{client.name}</td>
              <td className="px-6 py-4">
                <div className="text-sm text-slate-600">{client.email}</div>
                <div className="text-xs text-slate-400">{client.phone}</div>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold">
                  {client.organization || "Individual"}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(client)} className="p-1.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onDelete(client)} className="p-1.5 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredClients.length === 0 && <EmptyState icon={Users} label="No clients found" />}
    </div>
  );
}
