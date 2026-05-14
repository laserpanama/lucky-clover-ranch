import { useState } from "react";
import { Beef, Users, DollarSign, AlertCircle } from "lucide-react";
import { Animal, Client, Rental } from "../../types";
import { apiRequest } from "../../lib/api";
import { getCat } from "../../lib/constants";
import { toDateInput } from "../../lib/dates";
import { ModalShell, ModalActions, Field, inputCls } from "../ui";

export function AddRentalModal({
  animals,
  clients,
  onClose,
  onSuccess,
}: {
  animals: Animal[];
  clients: Client[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({ animalId: "", clientId: "", startDate: "", endDate: "", price: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const rentableAnimals = animals.filter((a) => a.category === "rodeo");

  const submit = async () => {
    if (!form.animalId || !form.clientId || !form.startDate || !form.endDate || !form.price) {
      setError("All fields required.");
      return;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      setError("Start date cannot be after end date.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiRequest("/rentals", {
        method: "POST",
        body: JSON.stringify({
          animalId: Number(form.animalId),
          clientId: Number(form.clientId),
          startDate: form.startDate,
          endDate: form.endDate,
          price: Number(form.price),
        }),
      });
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title="Create Rental" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Animal (Rodeo only)" icon={Beef}>
          <select className={inputCls} value={form.animalId} onChange={(e) => setForm((p) => ({ ...p, animalId: e.target.value }))}>
            <option value="">Select animal...</option>
            {rentableAnimals.map((a) => (
              <option key={a.id} value={a.id}>🤠 {a.name} — {a.tagNumber}</option>
            ))}
          </select>
          {rentableAnimals.length === 0 && <p className="text-xs text-amber-600 mt-1">No rodeo animals yet.</p>}
        </Field>
        <Field label="Client" icon={Users}>
          <select className={inputCls} value={form.clientId} onChange={(e) => setForm((p) => ({ ...p, clientId: e.target.value }))}>
            <option value="">Select client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.organization ? ` (${c.organization})` : ""}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date">
            <input type="date" className={inputCls} value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
          </Field>
          <Field label="End Date">
            <input type="date" className={inputCls} value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
          </Field>
        </div>
        <Field label="Price (USD)" icon={DollarSign}>
          <input type="number" className={inputCls} value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="500" />
        </Field>
        {error && (
          <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-rose-600 text-sm font-semibold">{error}</p>
          </div>
        )}
        <ModalActions onClose={onClose} onSubmit={submit} loading={loading} label="Create Rental" />
      </div>
    </ModalShell>
  );
}

export function EditRentalModal({
  rental,
  animals,
  clients,
  onClose,
  onSuccess,
}: {
  rental: Rental;
  animals: Animal[];
  clients: Client[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    animalId: String(rental.animalId),
    clientId: String(rental.clientId),
    startDate: toDateInput(rental.startDate ?? ""),
    endDate: toDateInput(rental.endDate ?? ""),
    price: String(rental.price),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const rodeoAnimals = animals.filter((a) => a.category === "rodeo");

  const submit = async () => {
    if (!form.startDate || !form.endDate || !form.price) {
      setError("All fields required.");
      return;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      setError("Start date cannot be after end date.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiRequest(`/rentals/${rental.id}`, {
        method: "PUT",
        body: JSON.stringify({
          animalId: Number(form.animalId),
          clientId: Number(form.clientId),
          startDate: form.startDate,
          endDate: form.endDate,
          price: Number(form.price),
        }),
      });
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title="Edit Rental" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Animal (Rodeo only)" icon={Beef}>
          <select className={inputCls} value={form.animalId} onChange={(e) => setForm((p) => ({ ...p, animalId: e.target.value }))}>
            {rodeoAnimals.map((a) => (
              <option key={a.id} value={a.id}>🤠 {a.name} — {a.tagNumber}</option>
            ))}
          </select>
        </Field>
        <Field label="Client" icon={Users}>
          <select className={inputCls} value={form.clientId} onChange={(e) => setForm((p) => ({ ...p, clientId: e.target.value }))}>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.organization ? ` (${c.organization})` : ""}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date">
            <input type="date" className={inputCls} value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
          </Field>
          <Field label="End Date">
            <input type="date" className={inputCls} value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
          </Field>
        </div>
        <Field label="Price (USD)" icon={DollarSign}>
          <input type="number" className={inputCls} value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
        </Field>
        {error && (
          <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-rose-600 text-sm font-semibold">{error}</p>
          </div>
        )}
        <ModalActions onClose={onClose} onSubmit={submit} loading={loading} label="Save Changes" />
      </div>
    </ModalShell>
  );
}

export function DeleteRentalModal({
  rental,
  onClose,
  onSuccess,
}: {
  rental: Rental;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    setLoading(true);
    try {
      await apiRequest(`/rentals/${rental.id}`, { method: "DELETE" });
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const cat = getCat(rental.animal?.category ?? "rodeo");

  return (
    <ModalShell title="Delete Rental" onClose={onClose}>
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-rose-50 rounded-2xl border border-rose-100">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">{cat.emoji}</div>
          <div>
            <div className="font-bold text-slate-900">
              {rental.animal?.name ?? `#${rental.animalId}`} → {rental.client?.name ?? `#${rental.clientId}`}
            </div>
            <div className="text-sm text-slate-500">
              {new Date(rental.startDate).toLocaleDateString()} – {new Date(rental.endDate).toLocaleDateString()} · ${Number(rental.price).toLocaleString()}
            </div>
          </div>
        </div>
        <p className="text-slate-600 text-sm">Permanently delete this rental contract? This cannot be undone.</p>
        {error && <p className="text-rose-500 text-sm bg-rose-50 px-4 py-2.5 rounded-xl">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700">Cancel</button>
          <button onClick={confirm} disabled={loading} className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white rounded-xl font-bold flex items-center justify-center gap-2">
            {loading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
