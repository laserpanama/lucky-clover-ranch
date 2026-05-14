import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Beef,
  Users,
  Calendar,
  Plus,
  Search,
  LayoutDashboard,
  ClipboardList,
} from "lucide-react";

import Dashboard from "./Dashboard";
import CalendarView from "./CalendarView_2";
import AnimalsPage from "./pages/AnimalsPage";
import ClientsPage from "./pages/ClientsPage";
import RentalsPage from "./pages/RentalsPage";
import { AddAnimalModal, EditAnimalModal, DeleteAnimalModal } from "./components/modals/AnimalModals";
import { AddClientModal, EditClientModal, DeleteClientModal } from "./components/modals/ClientModals";
import { AddRentalModal, EditRentalModal, DeleteRentalModal } from "./components/modals/RentalModals";
import { Toast } from "./components/ui";
import { apiRequest } from "./lib/api";
import { CATEGORIES } from "./lib/constants";
import { Animal, Client, Rental, Tab } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editAnimal, setEditAnimal] = useState<Animal | null>(null);
  const [deleteAnimal, setDeleteAnimal] = useState<Animal | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);
  const [editRental, setEditRental] = useState<Rental | null>(null);
  const [deleteRental, setDeleteRental] = useState<Rental | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [a, c, r] = await Promise.all([
        apiRequest<Animal[]>("/animals"),
        apiRequest<Client[]>("/clients"),
        apiRequest<Rental[]>("/rentals"),
      ]);
      setAnimals(Array.isArray(a) ? a : []);
      setClients(Array.isArray(c) ? c : []);
      setRentals(Array.isArray(r) ? r : []);
    } catch {
      setToast({ message: "Cannot reach API", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (msg: string) => {
    setShowModal(false);
    setEditAnimal(null);
    setDeleteAnimal(null);
    setEditClient(null);
    setDeleteClient(null);
    setEditRental(null);
    setDeleteRental(null);
    setToast({ message: msg, type: "success" });
    fetchAll();
  };

  const counts: Record<Tab, number> = {
    dashboard: 0,
    animals: animals.length,
    clients: clients.length,
    rentals: rentals.length,
    calendar: 0,
  };

  const catCounts = CATEGORIES.map((c) => ({
    ...c,
    count: animals.filter((a) => a.category === c.value).length,
  }));

  const filteredAnimals = animals
    .filter((a) => categoryFilter === "all" || a.category === categoryFilter)
    .filter((a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.tagNumber.toLowerCase().includes(search.toLowerCase())
    );

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRentals = rentals.filter(
    (r) =>
      (r.animal?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.client?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const navItems = [
    { id: "dashboard" as Tab, label: "Dashboard", icon: LayoutDashboard },
    { id: "animals" as Tab, label: "Animals", icon: Beef },
    { id: "clients" as Tab, label: "Clients", icon: Users },
    { id: "rentals" as Tab, label: "Rentals", icon: ClipboardList },
    { id: "calendar" as Tab, label: "Calendar", icon: Calendar },
  ];

  const addLabels: Partial<Record<Tab, string>> = {
    animals: "Animal",
    clients: "Client",
    rentals: "Rental",
  };

  const tabDescriptions: Record<Tab, string> = {
    dashboard: "Business overview",
    animals: "Manage your herd",
    clients: "Manage rental clients",
    rentals: "Track rental contracts",
    calendar: "Rental schedule",
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#1A1A1A] font-sans">
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 p-6 z-10 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Beef className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight leading-none">Lucky Clover</h1>
            <p className="text-xs text-slate-400 font-medium">Ranch Manager</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSearch(""); setCategoryFilter("all"); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                {item.label}
              </div>
              {item.id !== "dashboard" && item.id !== "calendar" && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  activeTab === item.id ? "bg-emerald-200 text-emerald-800" : "bg-slate-100 text-slate-400"
                }`}>
                  {counts[item.id]}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-6 p-4 bg-slate-50 rounded-2xl">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Herd Breakdown</p>
          <div className="space-y-2">
            {catCounts.map((cat) => (
              <div key={cat.value} className="flex items-center justify-between">
                <span className="text-xs text-slate-600">{cat.emoji} {cat.label}</span>
                <span className="text-xs font-bold text-slate-800">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-900 rounded-2xl text-white mt-4">
          <p className="text-xs text-slate-400 mb-1 font-bold uppercase tracking-wider">API Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <p className="text-sm font-semibold">/api</p>
          </div>
        </div>
      </aside>

      <main className="ml-64 p-10">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight capitalize">{activeTab}</h2>
            <p className="text-slate-400 text-sm mt-1">{tabDescriptions[activeTab]}</p>
          </div>
          {addLabels[activeTab] && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-56 text-sm"
                />
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                Add {addLabels[activeTab]}
              </button>
            </div>
          )}
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "dashboard" && (
                <Dashboard onCreateRental={() => { setActiveTab("rentals"); setShowModal(true); }} />
              )}

              {activeTab === "calendar" && (
                <CalendarView rentals={rentals} animals={animals} />
              )}

              {activeTab === "animals" && (
                <AnimalsPage
                  animals={animals}
                  filteredAnimals={filteredAnimals}
                  categoryFilter={categoryFilter}
                  onCategoryFilter={setCategoryFilter}
                  onEdit={setEditAnimal}
                  onDelete={setDeleteAnimal}
                />
              )}

              {activeTab === "clients" && (
                <ClientsPage
                  filteredClients={filteredClients}
                  onEdit={setEditClient}
                  onDelete={setDeleteClient}
                />
              )}

              {activeTab === "rentals" && (
                <RentalsPage
                  filteredRentals={filteredRentals}
                  onEdit={setEditRental}
                  onDelete={setDeleteRental}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <AnimatePresence>
        {showModal && activeTab === "animals" && (
          <AddAnimalModal onClose={() => setShowModal(false)} onSuccess={() => handleSuccess("Animal created!")} />
        )}
        {showModal && activeTab === "clients" && (
          <AddClientModal onClose={() => setShowModal(false)} onSuccess={() => handleSuccess("Client created!")} />
        )}
        {showModal && activeTab === "rentals" && (
          <AddRentalModal animals={animals} clients={clients} onClose={() => setShowModal(false)} onSuccess={() => handleSuccess("Rental created!")} />
        )}
        {editAnimal && (
          <EditAnimalModal animal={editAnimal} onClose={() => setEditAnimal(null)} onSuccess={() => handleSuccess("Animal updated!")} />
        )}
        {deleteAnimal && (
          <DeleteAnimalModal animal={deleteAnimal} onClose={() => setDeleteAnimal(null)} onSuccess={() => handleSuccess("Animal deleted.")} />
        )}
        {editClient && (
          <EditClientModal client={editClient} onClose={() => setEditClient(null)} onSuccess={() => handleSuccess("Client updated!")} />
        )}
        {deleteClient && (
          <DeleteClientModal client={deleteClient} onClose={() => setDeleteClient(null)} onSuccess={() => handleSuccess("Client deleted.")} />
        )}
        {editRental && (
          <EditRentalModal rental={editRental} animals={animals} clients={clients} onClose={() => setEditRental(null)} onSuccess={() => handleSuccess("Rental updated!")} />
        )}
        {deleteRental && (
          <DeleteRentalModal rental={deleteRental} onClose={() => setDeleteRental(null)} onSuccess={() => handleSuccess("Rental deleted.")} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <Toast key={toast.message} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
