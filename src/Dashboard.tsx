import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  DollarSign, Activity, CheckCircle2, Clock,
  TrendingUp, Beef, Calendar, AlertTriangle, Plus
} from "lucide-react";

const API = '/api';

interface Animal { id: number; name: string; tagNumber: string; status: string; }
interface Rental {
  id: number; animalId: number; clientId: number;
  startDate: string; endDate: string; status: string; price: number;
  animal: Animal; client: { id: number; name: string; };
}

function StatCard({
  label, value, sub, icon: Icon, accent, delay
}: {
  label: string; value: string; sub: string;
  icon: any; accent: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-100/40 hover:-translate-y-1 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${accent}`}>
          <Icon className="w-6 h-6" />
        </div>
        <TrendingUp className="w-5 h-5 text-emerald-400" />
      </div>
      <div className="text-4xl font-black text-slate-900 mb-1 tracking-tight">{value}</div>
      <div className="text-sm font-bold text-slate-700">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-1 font-medium">{sub}</div>}
    </motion.div>
  );
}

export default function Dashboard({ onCreateRental }: { onCreateRental?: () => void }) {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/rentals`).then(r => r.json()),
      fetch(`${API}/animals`).then(r => r.json()),
    ]).then(([r, a]) => {
      setRentals(Array.isArray(r) ? r : []);
      setAnimals(Array.isArray(a) ? a : []);
    }).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Metrics
  const totalRevenue = rentals.reduce((sum, r) => sum + Number(r.price), 0);

  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const monthRevenue = rentals
    .filter(r => {
      const d = new Date(r.startDate);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((sum, r) => sum + Number(r.price), 0);

  const activeRentals = rentals.filter(r => {
    const start = new Date(r.startDate);
    const end = new Date(r.endDate);
    return start <= now && end >= now;
  });

  const upcomingRentals = rentals.filter(r => {
    const start = new Date(r.startDate);
    return start > now && start <= in7Days;
  });

  const rentedAnimalIds = new Set(activeRentals.map(r => r.animalId));
  const availableAnimals = animals.filter(a => !rentedAnimalIds.has(a.id));
  const avgRentalValue = rentals.length > 0 ? Math.round(totalRevenue / rentals.length) : 0;

  // Validate: filter out rentals with illogical date ranges (start > end)
  const validRentals = rentals.filter(r => new Date(r.startDate) <= new Date(r.endDate));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Revenue This Month"
          value={`$${monthRevenue.toLocaleString()}`}
          sub={`$${totalRevenue.toLocaleString()} all time`}
          icon={DollarSign}
          accent="bg-emerald-100 text-emerald-700"
          delay={0}
        />
        <StatCard
          label="Active Rentals"
          value={String(activeRentals.length)}
          sub={`${rentals.length} total contracts`}
          icon={Activity}
          accent="bg-blue-100 text-blue-700"
          delay={0.05}
        />
        <StatCard
          label="Available Animals"
          value={`${availableAnimals.length}/${animals.length}`}
          sub={`${rentedAnimalIds.size} currently rented`}
          icon={Beef}
          accent="bg-amber-100 text-amber-700"
          delay={0.1}
        />
        <StatCard
          label="Upcoming (7 days)"
          value={String(upcomingRentals.length)}
          sub="new rentals starting"
          icon={Clock}
          accent="bg-violet-100 text-violet-700"
          delay={0.15}
        />
        <StatCard
          label="Avg Rental Value"
          value={`$${avgRentalValue.toLocaleString()}`}
          sub={`across ${rentals.length} contracts`}
          icon={TrendingUp}
          accent="bg-teal-100 text-teal-700"
          delay={0.2}
        />
      </div>

      {/* Two columns: Availability + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Availability */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Animal Availability</h3>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Right now</span>
          </div>
          <div className="p-6 space-y-3">
            {animals.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">No animals registered.</p>
            )}
            {animals.map(animal => {
              const isRented = rentedAnimalIds.has(animal.id);
              return (
                <div key={animal.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isRented ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-600'}`}>
                      <Beef className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-800">{animal.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{animal.tagNumber}</div>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${isRented ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                    {isRented
                      ? <><AlertTriangle className="w-3 h-3" />Rented</>
                      : <><CheckCircle2 className="w-3 h-3" />Available</>
                    }
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Upcoming Rentals */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Upcoming Rentals</h3>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Next 7 days</span>
          </div>
          <div className="p-6 space-y-3">
            {upcomingRentals.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium mb-4">No rentals starting in the next 7 days</p>
                {onCreateRental && (
                  <button
                    onClick={onCreateRental}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Create Rental
                  </button>
                )}
              </div>
            )}
            {upcomingRentals.map(rental => {
              const daysUntil = Math.ceil((new Date(rental.startDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={rental.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-500 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-800">
                        {rental.animal?.name ?? `Animal #${rental.animalId}`}
                      </div>
                      <div className="text-xs text-slate-400">
                        {rental.client?.name ?? `Client #${rental.clientId}`} · ${Number(rental.price).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
                    {daysUntil === 1 ? "Tomorrow" : `In ${daysUntil}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Active Rentals Table */}
      {activeRentals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Active Contracts</h3>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {activeRentals.length} live
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Animal</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeRentals.map(rental => {
                  const daysLeft = Math.ceil((new Date(rental.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={rental.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800 text-sm">
                        {rental.animal?.name ?? `#${rental.animalId}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {rental.client?.name ?? `#${rental.clientId}`}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`font-semibold ${daysLeft <= 2 ? 'text-rose-500' : 'text-slate-600'}`}>
                          {new Date(rental.endDate).toLocaleDateString()} · {daysLeft}d left
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-600 text-right">
                        ${Number(rental.price).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
