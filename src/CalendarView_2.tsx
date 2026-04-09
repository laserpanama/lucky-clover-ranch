import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar, DollarSign } from 'lucide-react';

interface Animal { id: number; name: string; tagNumber: string; category: string; }
interface Rental {
  id: number; animalId: number; clientId: number;
  startDate: string; endDate: string; status: string; price: number;
  animal: Animal; client: { id: number; name: string; };
}

const CATEGORY_COLORS: Record<string, string> = {
  rodeo:    'bg-amber-500',
  beef:     'bg-rose-500',
  breeding: 'bg-violet-500',
};

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-blue-500',
  active:    'bg-emerald-500',
  completed: 'bg-slate-400',
  cancelled: 'bg-red-500',
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

interface Props { rentals: Rental[]; animals: Animal[]; }

export default function CalendarView({ rentals, animals }: Props) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Get rentals active on a given day
  const getRentalsForDay = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return rentals.filter(r => {
      const start = new Date(r.startDate + 'T00:00:00');
      const end = new Date(r.endDate + 'T00:00:00');
      return date >= start && date <= end;
    });
  };

  const selectedRentals = selectedDay ? getRentalsForDay(selectedDay) : [];

  // Stats for this month
  const monthRevenue = rentals
    .filter(r => {
      const start = new Date(r.startDate);
      return start.getMonth() === currentMonth && start.getFullYear() === currentYear;
    })
    .reduce((sum, r) => sum + Number(r.price), 0);

  const monthRentals = rentals.filter(r => {
    const start = new Date(r.startDate);
    return start.getMonth() === currentMonth && start.getFullYear() === currentYear;
  });

  return (
    <div className="space-y-6">
      {/* Month stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Month Revenue</p>
          <p className="text-2xl font-black text-emerald-600">${monthRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Rentals This Month</p>
          <p className="text-2xl font-black text-slate-900">{monthRentals.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Animals in Herd</p>
          <p className="text-2xl font-black text-slate-900">{animals.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-500" />
            </button>
            <h3 className="text-lg font-black text-slate-900">
              {MONTHS[currentMonth]} {currentYear}
            </h3>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {DAYS.map(d => (
              <div key={d} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 border-r border-b border-slate-50" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayRentals = getRentalsForDay(day);
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              const isSelected = day === selectedDay;

              return (
                <motion.div
                  key={day}
                  whileHover={{ backgroundColor: '#f8fafc' }}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`h-20 border-r border-b border-slate-50 p-1.5 cursor-pointer transition-colors relative ${isSelected ? 'bg-emerald-50 border-emerald-200' : ''}`}
                >
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold mb-1 ${isToday ? 'bg-emerald-600 text-white' : 'text-slate-700'}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayRentals.slice(0, 2).map(r => (
                      <div key={r.id} className={`text-white text-xs px-1.5 py-0.5 rounded-md truncate ${CATEGORY_COLORS[r.animal?.category ?? 'rodeo'] ?? 'bg-slate-400'}`}>
                        {r.animal?.name ?? `#${r.animalId}`}
                      </div>
                    ))}
                    {dayRentals.length > 2 && (
                      <div className="text-xs text-slate-400 px-1">+{dayRentals.length - 2} more</div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category:</span>
            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-xs text-slate-600 capitalize">{cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Selected day details */}
          <AnimatePresence mode="wait">
            {selectedDay ? (
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-bold text-slate-800">
                    {MONTHS[currentMonth]} {selectedDay}
                  </h4>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                    {selectedRentals.length} rental{selectedRentals.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {selectedRentals.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No rentals this day</p>
                    </div>
                  ) : (
                    selectedRentals.map(r => (
                      <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className={`w-2 h-10 rounded-full ${CATEGORY_COLORS[r.animal?.category ?? 'rodeo'] ?? 'bg-slate-400'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-slate-800 truncate">
                            {r.animal?.name ?? `Animal #${r.animalId}`}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {r.client?.name ?? `Client #${r.clientId}`}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <DollarSign className="w-3 h-3 text-emerald-500" />
                            <span className="text-xs font-bold text-emerald-600">{Number(r.price).toLocaleString()}</span>
                          </div>
                        </div>
                        <span className={`text-white text-xs px-2 py-1 rounded-full font-bold ${STATUS_COLORS[r.status] ?? 'bg-slate-400'}`}>
                          {r.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl border border-slate-100 p-8 text-center"
              >
                <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-medium">Click a day to see rentals</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upcoming this month */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h4 className="font-bold text-slate-800">Upcoming This Month</h4>
            </div>
            <div className="p-4 space-y-2">
              {monthRentals
                .filter(r => new Date(r.startDate) >= today)
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .slice(0, 5)
                .map(r => (
                  <div key={r.id} className="flex items-center gap-3">
                    <div className="text-center min-w-[2.5rem]">
                      <div className="text-lg font-black text-slate-900 leading-none">
                        {new Date(r.startDate).getDate()}
                      </div>
                      <div className="text-xs text-slate-400">{MONTHS[new Date(r.startDate).getMonth()].slice(0,3)}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">{r.animal?.name}</div>
                      <div className="text-xs text-slate-400 truncate">{r.client?.name}</div>
                    </div>
                    <div className="text-xs font-bold text-emerald-600">${Number(r.price).toLocaleString()}</div>
                  </div>
                ))
              }
              {monthRentals.filter(r => new Date(r.startDate) >= today).length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No upcoming rentals</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
