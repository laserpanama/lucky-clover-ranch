import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  DollarSign, Activity, TrendingUp, Beef, Calendar, AlertTriangle, Plus
} from "lucide-react";

const API = '/api';

interface Animal { id: number; name: string; tagNumber: string; status: string; }
interface Rental {
  id: number; animalId: number; clientId: number;
  startDate: string; endDate: string; status: string; price: number;
  animal: Animal; client: { id: number; name: string; };
}

// UNIFIED KPI CARD - same style for ALL metrics
function StatCard({ label, value, sub, icon: Icon, delay }: {
  label: string; value: string; sub?: string; icon: any; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      className="bg-white rounded-xl p-5 border border-slate-200"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-xl font-bold text-slate-900 truncate">{value}</div>
        </div>
      </div>
      <div className="text-sm font-medium text-slate-700">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
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

  // Validate: filter out rentals with illogical date ranges
  const validRentals = rentals.filter(r => new Date(r.startDate) <= new Date(r.endDate));

  // Metrics
  const totalRevenue = validRentals.reduce((sum, r) => sum + Number(r.price), 0);
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const monthRevenue = validRentals
    .filter(r => {
      const d = new Date(r.startDate);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((sum, r) => sum + Number(r.price), 0);

  const activeRentals = validRentals.filter(r => {
    const start = new Date(r.startDate);
    const end = new Date(r.endDate);
    return start <= now && end >= now;
  });

  const upcomingRentals = validRentals.filter(r => {
    const start = new Date(r.startDate);
    return start > now && start <= in7Days;
  });

  const rentedAnimalIds = new Set(activeRentals.map(r => r.animalId));
  const availableAnimals = animals.filter(a => !rentedAnimalIds.has(a.id));
  const avgRentalValue = validRentals.length > 0 ? Math.round(totalRevenue / validRentals.length) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* KPI Cards - unified emerald style */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard label="Revenue (Month)" value={`$${monthRevenue.toLocaleString()}`} icon={DollarSign} delay={0} />
        <StatCard label="Revenue (All Time)" value={`$${totalRevenue.toLocaleString()}`} icon={TrendingUp} delay={0.03} />
        <StatCard label="Active Rentals" value={String(activeRentals.length)} sub={`${validRentals.length} total`} icon={Activity} delay={0.06} />
        <StatCard label="Available" value={`${availableAnimals.length}/${animals.length}`} sub="animals" icon={Beef} delay={0.09} />
        <StatCard label="Upcoming" value={String(upcomingRentals.length)} sub="next 7 days" icon={Calendar} delay={0.12} />
        <StatCard label="Avg Value" value={`$${avgRentalValue.toLocaleString()}`} sub="per contract" icon={DollarSign} delay={0.15} />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Availability */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Animal Availability</h3>
            <span className="text-xs font-medium text-slate-400">Current</span>
          </div>
          <div className="p-4 space-y-1">
            {animals.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No animals registered.</p>
            )}
            {animals.map(animal => {
              const isRented = rentedAnimalIds.has(animal.id);
              return (
                <div key={animal.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Beef className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-slate-900">{animal.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{animal.tagNumber}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${isRented ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {isRented ? 'Rented' : 'Available'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Rentals */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Upcoming Rentals</h3>
            <span className="text-xs font-medium text-slate-400">Next 7 days</span>
          </div>
          <div className="p-4 space-y-1">
            {upcomingRentals.length === 0 && (
              <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500 mb-3">No rentals starting this week</p>
                {onCreateRental && (
                  <button
                    onClick={onCreateRental}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
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
                <div key={rental.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-slate-900">{rental.animal?.name ?? `Animal #${rental.animalId}`}</div>
                      <div className="text-xs text-slate-500">{rental.client?.name ?? `Client #${rental.clientId}`} · ${Number(rental.price).toLocaleString()}</div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Contracts Table */}
      {activeRentals.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Active Contracts</h3>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {activeRentals.length} live
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-2.5 text-xs font-medium text-slate-500 uppercase">Animal</th>
                  <th className="px-5 py-2.5 text-xs font-medium text-slate-500 uppercase">Client</th>
                  <th className="px-5 py-2.5 text-xs font-medium text-slate-500 uppercase">End Date</th>
                  <th className="px-5 py-2.5 text-xs font-medium text-slate-500 uppercase text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeRentals.map(rental => {
                  const daysLeft = Math.ceil((new Date(rental.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={rental.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-900 text-sm">{rental.animal?.name ?? `#${rental.animalId}`}</td>
                      <td className="px-5 py-3 text-sm text-slate-600">{rental.client?.name ?? `#${rental.clientId}`}</td>
                      <td className="px-5 py-3 text-sm">
                        <span className={`font-medium ${daysLeft <= 2 ? 'text-red-600' : 'text-slate-600'}`}>
                          {new Date(rental.endDate).toLocaleDateString()} · {daysLeft}d left
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-slate-900 text-right">${Number(rental.price).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}