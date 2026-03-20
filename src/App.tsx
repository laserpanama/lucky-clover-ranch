import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Beef, Users, Calendar, Plus, Stethoscope, Tag, CheckCircle2,
  AlertCircle, Clock, Search, X, DollarSign,
  Phone, Mail, Building2, Hash, LayoutDashboard, Pencil, Trash2
} from 'lucide-react';
import Dashboard from './Dashboard';

const API = '/api';

interface Animal { id: number; tagNumber: string; name: string; breed: string; status: string; dateOfBirth: string; notes?: string; category: string; }
interface Client { id: number; name: string; phone: string; email: string; organization?: string; }
interface Rental { id: number; animalId: number; clientId: number; startDate: string; endDate: string; status: string; price: number; animal: Animal; client: Client; }
type Tab = 'dashboard' | 'animals' | 'clients' | 'rentals';

const CATEGORIES = [
  { value: 'rodeo',    label: 'Rodeo',    emoji: '🤠', color: 'bg-slate-100 text-slate-700' },
  { value: 'beef',     label: 'Beef',     emoji: '🥩', color: 'bg-slate-100 text-slate-700' },
  { value: 'breeding', label: 'Breeding', emoji: '🐃', color: 'bg-slate-100 text-slate-700' },
];
const getCat = (val: string) => CATEGORIES.find(c => c.value === val) ?? CATEGORIES[0];

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4500); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-semibold text-sm max-w-sm ${type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </motion.div>
  );
}

const inputCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all";
function Field({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">{Icon && <Icon className="w-3.5 h-3.5" />}{label}</label>{children}</div>;
}
function ModalActions({ onClose, onSubmit, loading, label }: { onClose: () => void; onSubmit: () => void; loading: boolean; label: string }) {
  return <div className="flex gap-3 pt-2"><button onClick={onClose} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-all text-slate-700">Cancel</button><button onClick={onSubmit} disabled={loading} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2">{loading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}{loading ? 'Saving...' : label}</button></div>;
}
function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"><motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.15 }} className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl"><div className="flex items-center justify-between mb-6"><h3 className="text-2xl font-bold">{title}</h3><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-400" /></button></div>{children}</motion.div></div>;
}
function EmptyState({ icon: Icon, label }: { icon: any; label: string }) {
  return <div className="col-span-full py-20 text-center bg-white border border-dashed border-slate-200 rounded-3xl"><Icon className="w-10 h-10 text-slate-200 mx-auto mb-3" /><p className="text-slate-400 font-medium text-sm">{label}</p></div>;
}
const statusColor = (s: string) => ({ healthy: 'text-emerald-600 bg-emerald-50', injured: 'text-red-600 bg-red-50', rented: 'text-amber-600 bg-amber-50', active: 'text-slate-600 bg-slate-100', completed: 'text-slate-500 bg-slate-100' }[s.toLowerCase()] ?? 'text-slate-500 bg-slate-100');
const statusIcon = (s: string) => ({ healthy: <CheckCircle2 className="w-3.5 h-3.5" />, completed: <CheckCircle2 className="w-3.5 h-3.5" />, injured: <AlertCircle className="w-3.5 h-3.5" />, rented: <Clock className="w-3.5 h-3.5" />, active: <Clock className="w-3.5 h-3.5" /> }[s.toLowerCase()] ?? null);

// ── Category selector shared ───────────────────────────────────────────────
function CategorySelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {CATEGORIES.map(cat => (
        <button key={cat.value} type="button" onClick={() => onChange(cat.value)}
          className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${value === cat.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
          {cat.emoji} {cat.label}
        </button>
      ))}
    </div>
  );
}

// ── Add Animal ─────────────────────────────────────────────────────────────
function AddAnimalModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: '', tagNumber: '', breed: '', status: 'active', category: 'rodeo', dateOfBirth: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    if (!form.name || !form.tagNumber || !form.breed || !form.dateOfBirth) { setError('All fields required.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/animals`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      onSuccess();
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };
  return (
    <ModalShell title="Add Animal" onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" icon={Beef}><input className={inputCls} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Toro Bravo 1" /></Field>
          <Field label="Tag #" icon={Hash}><input className={inputCls} value={form.tagNumber} onChange={e => setForm(p => ({ ...p, tagNumber: e.target.value }))} placeholder="TB-001" /></Field>
        </div>
        <Field label="Category"><CategorySelector value={form.category} onChange={v => setForm(p => ({ ...p, category: v }))} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Breed"><input className={inputCls} value={form.breed} onChange={e => setForm(p => ({ ...p, breed: e.target.value }))} placeholder="Brahman" /></Field>
          <Field label="Status"><select className={inputCls} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}><option value="active">Active</option><option value="healthy">Healthy</option><option value="injured">Injured</option><option value="rented">Rented</option></select></Field>
        </div>
        <Field label="Date of Birth"><input type="date" className={inputCls} value={form.dateOfBirth} onChange={e => setForm(p => ({ ...p, dateOfBirth: e.target.value }))} /></Field>
        <Field label="Notes (optional)"><textarea className={inputCls + ' resize-none'} rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></Field>
        {error && <p className="text-rose-500 text-sm bg-rose-50 px-4 py-2.5 rounded-xl">{error}</p>}
        <ModalActions onClose={onClose} onSubmit={submit} loading={loading} label="Create Animal" />
      </div>
    </ModalShell>
  );
}

// ── Edit Animal ────────────────────────────────────────────────────────────
function EditAnimalModal({ animal, onClose, onSuccess }: { animal: Animal; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: animal.name, tagNumber: animal.tagNumber, breed: animal.breed,
    status: animal.status, category: animal.category ?? 'rodeo',
    dateOfBirth: animal.dateOfBirth.split('T')[0], notes: animal.notes ?? ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    if (!form.name || !form.tagNumber || !form.breed || !form.dateOfBirth) { setError('All fields required.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/animals/${animal.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      onSuccess();
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };
  return (
    <ModalShell title={`Edit — ${animal.name}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" icon={Beef}><input className={inputCls} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></Field>
          <Field label="Tag #" icon={Hash}><input className={inputCls} value={form.tagNumber} onChange={e => setForm(p => ({ ...p, tagNumber: e.target.value }))} /></Field>
        </div>
        <Field label="Category"><CategorySelector value={form.category} onChange={v => setForm(p => ({ ...p, category: v }))} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Breed"><input className={inputCls} value={form.breed} onChange={e => setForm(p => ({ ...p, breed: e.target.value }))} /></Field>
          <Field label="Status"><select className={inputCls} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}><option value="active">Active</option><option value="healthy">Healthy</option><option value="injured">Injured</option><option value="rented">Rented</option></select></Field>
        </div>
        <Field label="Date of Birth"><input type="date" className={inputCls} value={form.dateOfBirth} onChange={e => setForm(p => ({ ...p, dateOfBirth: e.target.value }))} /></Field>
        <Field label="Notes"><textarea className={inputCls + ' resize-none'} rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></Field>
        {error && <p className="text-rose-500 text-sm bg-rose-50 px-4 py-2.5 rounded-xl">{error}</p>}
        <ModalActions onClose={onClose} onSubmit={submit} loading={loading} label="Save Changes" />
      </div>
    </ModalShell>
  );
}

// ── Delete Animal ──────────────────────────────────────────────────────────
function DeleteAnimalModal({ animal, onClose, onSuccess }: { animal: Animal; onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const confirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/animals/${animal.id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      onSuccess();
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };
  return (
    <ModalShell title="Delete Animal" onClose={onClose}>
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-rose-50 rounded-2xl border border-rose-100">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">{getCat(animal.category).emoji}</div>
          <div><div className="font-bold text-slate-900">{animal.name}</div><div className="text-sm text-slate-500 font-mono">{animal.tagNumber} · {animal.breed}</div></div>
        </div>
        <p className="text-slate-600 text-sm">This will permanently delete <strong>{animal.name}</strong> and all associated records. This cannot be undone.</p>
        {error && <p className="text-rose-500 text-sm bg-rose-50 px-4 py-2.5 rounded-xl">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700">Cancel</button>
          <button onClick={confirm} disabled={loading} className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white rounded-xl font-bold flex items-center justify-center gap-2">
            {loading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? 'Deleting...' : '🗑 Delete'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ── Add Client ─────────────────────────────────────────────────────────────
function AddClientModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', organization: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    if (!form.name || !form.phone || !form.email) { setError('Name, phone and email required.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/clients`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      onSuccess();
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };
  return <ModalShell title="Add Client" onClose={onClose}><div className="space-y-4"><Field label="Full Name" icon={Users}><input className={inputCls} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" /></Field><div className="grid grid-cols-2 gap-4"><Field label="Phone" icon={Phone}><input className={inputCls} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+507 000 0000" /></Field><Field label="Email" icon={Mail}><input className={inputCls} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="john@ranch.com" /></Field></div><Field label="Organization (optional)" icon={Building2}><input className={inputCls} value={form.organization} onChange={e => setForm(p => ({ ...p, organization: e.target.value }))} placeholder="Texas Rodeo LLC" /></Field>{error && <p className="text-rose-500 text-sm bg-rose-50 px-4 py-2.5 rounded-xl">{error}</p>}<ModalActions onClose={onClose} onSubmit={submit} loading={loading} label="Create Client" /></div></ModalShell>;
}

// ── Add Rental ─────────────────────────────────────────────────────────────
function AddRentalModal({ animals, clients, onClose, onSuccess }: { animals: Animal[]; clients: Client[]; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ animalId: '', clientId: '', startDate: '', endDate: '', price: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const rentableAnimals = animals.filter(a => a.category === 'rodeo');
  const submit = async () => {
    if (!form.animalId || !form.clientId || !form.startDate || !form.endDate || !form.price) { setError('All fields required.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/rentals`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ animalId: Number(form.animalId), clientId: Number(form.clientId), startDate: form.startDate, endDate: form.endDate, price: Number(form.price) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      onSuccess();
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };
  return (
    <ModalShell title="Create Rental" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Animal (Rodeo only)" icon={Beef}>
          <select className={inputCls} value={form.animalId} onChange={e => setForm(p => ({ ...p, animalId: e.target.value }))}>
            <option value="">Select animal...</option>
            {rentableAnimals.map(a => <option key={a.id} value={a.id}>🤠 {a.name} — {a.tagNumber}</option>)}
          </select>
          {rentableAnimals.length === 0 && <p className="text-xs text-amber-600 mt-1">No rodeo animals yet.</p>}
        </Field>
        <Field label="Client" icon={Users}>
          <select className={inputCls} value={form.clientId} onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}>
            <option value="">Select client...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.organization ? ` (${c.organization})` : ''}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date"><input type="date" className={inputCls} value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} /></Field>
          <Field label="End Date"><input type="date" className={inputCls} value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} /></Field>
        </div>
        <Field label="Price (USD)" icon={DollarSign}><input type="number" className={inputCls} value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="500" /></Field>
        {error && <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl"><AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" /><p className="text-rose-600 text-sm font-semibold">{error}</p></div>}
        <ModalActions onClose={onClose} onSubmit={submit} loading={loading} label="Create Rental" />
      </div>
    </ModalShell>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editAnimal, setEditAnimal] = useState<Animal | null>(null);
  const [deleteAnimal, setDeleteAnimal] = useState<Animal | null>(null);

  useEffect(() => { fetchAll(); }, []);
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [a, c, r] = await Promise.all([fetch(`${API}/animals`).then(r => r.json()), fetch(`${API}/clients`).then(r => r.json()), fetch(`${API}/rentals`).then(r => r.json())]);
      setAnimals(Array.isArray(a) ? a : []); setClients(Array.isArray(c) ? c : []); setRentals(Array.isArray(r) ? r : []);
    } catch { setToast({ message: 'Cannot reach server on :3000', type: 'error' }); }
    finally { setLoading(false); }
  };
  const handleSuccess = (msg: string) => { setShowModal(false); setEditAnimal(null); setDeleteAnimal(null); setToast({ message: msg, type: 'success' }); fetchAll(); };
  const counts = { dashboard: 0, animals: animals.length, clients: clients.length, rentals: rentals.length };
  const catCounts = CATEGORIES.map(c => ({ ...c, count: animals.filter(a => a.category === c.value).length }));
  const filteredAnimals = animals.filter(a => categoryFilter === 'all' || a.category === categoryFilter).filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.tagNumber.toLowerCase().includes(search.toLowerCase()));
  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));
  const filteredRentals = rentals.filter(r => r.animal?.name?.toLowerCase().includes(search.toLowerCase()) || r.client?.name?.toLowerCase().includes(search.toLowerCase()));
  const navItems = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'animals' as Tab, label: 'Animals', icon: Beef },
    { id: 'clients' as Tab, label: 'Clients', icon: Users },
    { id: 'rentals' as Tab, label: 'Rentals', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#1A1A1A] font-sans">
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 p-6 z-10 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white"><Beef className="w-6 h-6" /></div>
          <div><h1 className="font-black text-lg tracking-tight leading-none">Lucky Clover</h1><p className="text-xs text-slate-400 font-medium">Ranch Manager</p></div>
        </div>
        <nav className="space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSearch(''); setCategoryFilter('all'); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}>
              <div className="flex items-center gap-3"><item.icon className="w-5 h-5" />{item.label}</div>
              {item.id !== 'dashboard' && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === item.id ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>{counts[item.id]}</span>}
            </button>
          ))}
        </nav>
        <div className="mt-6 p-4 bg-slate-50 rounded-2xl">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Herd Breakdown</p>
          <div className="space-y-2">
            {catCounts.map(cat => (
              <div key={cat.value} className="flex items-center justify-between">
                <span className="text-xs text-slate-600">{cat.emoji} {cat.label}</span>
                <span className="text-xs font-bold text-slate-800">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="ml-64 p-10">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight capitalize">{activeTab}</h2>
            <p className="text-slate-400 text-sm mt-1">{{ dashboard: 'Business overview', animals: 'Manage your herd', clients: 'Manage rental clients', rentals: 'Track rental contracts' }[activeTab]}</p>
          </div>
          {activeTab !== 'dashboard' && (
            <div className="flex items-center gap-3">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${activeTab}...`} className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-56 text-sm" /></div>
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm"><Plus className="w-4 h-4" />Add {activeTab.slice(0, -1)}</button>
            </div>
          )}
        </header>

        {loading ? <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div> : (
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>

              {activeTab === 'dashboard' && <Dashboard onCreateRental={() => { setActiveTab('rentals'); setShowModal(true); }} />}

              {activeTab === 'animals' && (
                <div>
                  <div className="flex items-center gap-2 mb-6 flex-wrap">
                    <button onClick={() => setCategoryFilter('all')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${categoryFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>All ({animals.length})</button>
                    {CATEGORIES.map(cat => (
                      <button key={cat.value} onClick={() => setCategoryFilter(cat.value)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${categoryFilter === cat.value ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
                        {cat.emoji} {cat.label} ({animals.filter(a => a.category === cat.value).length})
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredAnimals.map(animal => {
                      const cat = getCat(animal.category);
                      return (
                        <motion.div key={animal.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                          className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all group relative">
                          {/* Edit / Delete buttons */}
                          <div className="absolute top-4 right-4 flex gap-1 ">
                            <button onClick={() => setEditAnimal(animal)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setDeleteAnimal(animal)} className="p-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">{cat.emoji}</div>
                            <div className="flex flex-col items-end gap-1.5 mr-12">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cat.color}`}>{cat.label}</span>
                              <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColor(animal.status)}`}>{statusIcon(animal.status)}{animal.status}</span>
                            </div>
                          </div>
                          <h3 className="text-lg font-bold mb-1">{animal.name}</h3>
                          <div className="flex items-center gap-2 text-slate-400 text-sm"><Tag className="w-3.5 h-3.5" /><span className="font-mono font-semibold text-slate-600">{animal.tagNumber}</span><span className="text-slate-200">|</span><span>{animal.breed}</span></div>
                          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400"><Stethoscope className="w-3.5 h-3.5" /><span>Born {new Date(animal.dateOfBirth).getFullYear()}</span></div>
                          </div>
                        </motion.div>
                      );
                    })}
                    {filteredAnimals.length === 0 && <EmptyState icon={Beef} label="No animals found" />}
                  </div>
                </div>
              )}

              {activeTab === 'clients' && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left"><thead><tr className="border-b border-slate-100 bg-slate-50"><th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th><th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th><th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Organization</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">{filteredClients.map(client => (<tr key={client.id} className="hover:bg-slate-50/60"><td className="px-6 py-4 font-bold text-slate-800">{client.name}</td><td className="px-6 py-4"><div className="text-sm text-slate-600">{client.email}</div><div className="text-xs text-slate-400">{client.phone}</div></td><td className="px-6 py-4"><span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold">{client.organization || 'Individual'}</span></td></tr>))}</tbody>
                  </table>
                  {filteredClients.length === 0 && <EmptyState icon={Users} label="No clients found" />}
                </div>
              )}

              {activeTab === 'rentals' && (() => {
                // UI Validation: filter out rentals with illogical date ranges
                const validRentals = filteredRentals.filter(r => new Date(r.startDate) <= new Date(r.endDate));
                const now = new Date();
                return (
                <div className="space-y-3">
                  {validRentals.length === 0 && <EmptyState icon={Calendar} label="No valid rental records found." />}
                  {validRentals.map(rental => {
                    const start = new Date(rental.startDate);
                    const end = new Date(rental.endDate);
                    const isCompleted = now > end;
                    const isActive = start <= now && end >= now;
                    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                    <motion.div key={rental.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">
                            {rental.animal?.name ?? `Animal #${rental.animalId}`}
                          </h4>
                          <div className="flex items-center text-slate-500 text-sm mt-1">
                            <Users className="w-4 h-4 mr-1.5" />
                            <span className="font-medium text-slate-700">{rental.client?.name ?? `Client #${rental.clientId}`}</span>
                          </div>
                        </div>
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase ${
                          isCompleted ? 'bg-slate-100 text-slate-600' :
                          isActive ? 'bg-emerald-100 text-emerald-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {isCompleted ? 'Completed' : isActive ? 'Active' : 'Pending'}
                        </span>
                      </div>
                      <div className="space-y-3 pt-3 border-t border-slate-100">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule
                          </span>
                          <span className="font-semibold text-slate-800">
                            {start.toLocaleDateString()} – {end.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Rental Value
                          </span>
                          <span className="font-bold text-slate-900 text-base">
                            ${Number(rental.price).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 flex items-center justify-center rounded-lg bg-slate-50 text-xs font-bold uppercase tracking-widest">
                        {isCompleted ? (
                          <span className="text-slate-400 py-2">Rental Period Completed</span>
                        ) : isActive ? (
                          <span className="text-emerald-600 py-2">{daysLeft} Days Remaining</span>
                        ) : (
                          <span className="text-amber-600 py-2">Starts in {daysUntil} Days</span>
                        )}
                      </div>
                    </motion.div>
                  )})}
                </div>
              );})()}

            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showModal && activeTab === 'animals' && <AddAnimalModal onClose={() => setShowModal(false)} onSuccess={() => handleSuccess('Animal created!')} />}
        {showModal && activeTab === 'clients' && <AddClientModal onClose={() => setShowModal(false)} onSuccess={() => handleSuccess('Client created!')} />}
        {showModal && activeTab === 'rentals' && <AddRentalModal animals={animals} clients={clients} onClose={() => setShowModal(false)} onSuccess={() => handleSuccess('Rental created!')} />}
        {editAnimal && <EditAnimalModal animal={editAnimal} onClose={() => setEditAnimal(null)} onSuccess={() => handleSuccess('Animal updated!')} />}
        {deleteAnimal && <DeleteAnimalModal animal={deleteAnimal} onClose={() => setDeleteAnimal(null)} onSuccess={() => handleSuccess('Animal deleted.')} />}
      </AnimatePresence>
      <AnimatePresence>{toast && <Toast key={toast.message} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>
    </div>
  );
}
