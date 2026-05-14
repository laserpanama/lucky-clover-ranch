import { useState } from "react";
import { Beef, Hash } from "lucide-react";
import { Animal } from "../../types";
import { apiRequest } from "../../lib/api";
import { getCat } from "../../lib/constants";
import { toDateInput } from "../../lib/dates";
import {
  ModalShell,
  ModalActions,
  Field,
  CategorySelector,
  inputCls,
} from "../ui";

export function AddAnimalModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    tagNumber: "",
    breed: "",
    status: "active",
    category: "rodeo",
    dateOfBirth: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!form.name || !form.tagNumber || !form.breed || !form.dateOfBirth) {
      setError("All fields required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiRequest("/animals", { method: "POST", body: JSON.stringify(form) });
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title="Add Animal" onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" icon={Beef}>
            <input className={inputCls} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Toro Bravo 1" />
          </Field>
          <Field label="Tag #" icon={Hash}>
            <input className={inputCls} value={form.tagNumber} onChange={(e) => setForm((p) => ({ ...p, tagNumber: e.target.value }))} placeholder="TB-001" />
          </Field>
        </div>
        <Field label="Category">
          <CategorySelector value={form.category} onChange={(v) => setForm((p) => ({ ...p, category: v }))} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Breed">
            <input className={inputCls} value={form.breed} onChange={(e) => setForm((p) => ({ ...p, breed: e.target.value }))} placeholder="Brahman" />
          </Field>
          <Field label="Status">
            <select className={inputCls} value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
              <option value="active">Active</option>
              <option value="healthy">Healthy</option>
              <option value="injured">Injured</option>
              <option value="rented">Rented</option>
            </select>
          </Field>
        </div>
        <Field label="Date of Birth">
          <input type="date" className={inputCls} value={form.dateOfBirth} onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))} />
        </Field>
        <Field label="Notes (optional)">
          <textarea className={inputCls + " resize-none"} rows={2} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
        </Field>
        {error && <p className="text-rose-500 text-sm bg-rose-50 px-4 py-2.5 rounded-xl">{error}</p>}
        <ModalActions onClose={onClose} onSubmit={submit} loading={loading} label="Create Animal" />
      </div>
    </ModalShell>
  );
}

export function EditAnimalModal({
  animal,
  onClose,
  onSuccess,
}: {
  animal: Animal;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    name: animal.name,
    tagNumber: animal.tagNumber,
    breed: animal.breed,
    status: animal.status,
    category: animal.category ?? "rodeo",
    dateOfBirth: toDateInput(animal.dateOfBirth ?? ""),
    notes: animal.notes ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!form.name || !form.tagNumber || !form.breed || !form.dateOfBirth) {
      setError("All fields required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiRequest(`/animals/${animal.id}`, { method: "PUT", body: JSON.stringify(form) });
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title={`Edit — ${animal.name}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" icon={Beef}>
            <input className={inputCls} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </Field>
          <Field label="Tag #" icon={Hash}>
            <input className={inputCls} value={form.tagNumber} onChange={(e) => setForm((p) => ({ ...p, tagNumber: e.target.value }))} />
          </Field>
        </div>
        <Field label="Category">
          <CategorySelector value={form.category} onChange={(v) => setForm((p) => ({ ...p, category: v }))} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Breed">
            <input className={inputCls} value={form.breed} onChange={(e) => setForm((p) => ({ ...p, breed: e.target.value }))} />
          </Field>
          <Field label="Status">
            <select className={inputCls} value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
              <option value="active">Active</option>
              <option value="healthy">Healthy</option>
              <option value="injured">Injured</option>
              <option value="rented">Rented</option>
            </select>
          </Field>
        </div>
        <Field label="Date of Birth">
          <input type="date" className={inputCls} value={form.dateOfBirth} onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))} />
        </Field>
        <Field label="Notes">
          <textarea className={inputCls + " resize-none"} rows={2} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
        </Field>
        {error && <p className="text-rose-500 text-sm bg-rose-50 px-4 py-2.5 rounded-xl">{error}</p>}
        <ModalActions onClose={onClose} onSubmit={submit} loading={loading} label="Save Changes" />
      </div>
    </ModalShell>
  );
}

export function DeleteAnimalModal({
  animal,
  onClose,
  onSuccess,
}: {
  animal: Animal;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    setLoading(true);
    try {
      await apiRequest(`/animals/${animal.id}`, { method: "DELETE" });
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const cat = getCat(animal.category);

  return (
    <ModalShell title="Delete Animal" onClose={onClose}>
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-rose-50 rounded-2xl border border-rose-100">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
            {cat.emoji}
          </div>
          <div>
            <div className="font-bold text-slate-900">{animal.name}</div>
            <div className="text-sm text-slate-500 font-mono">{animal.tagNumber} · {animal.breed}</div>
          </div>
        </div>
        <p className="text-slate-600 text-sm">
          This will permanently delete <strong>{animal.name}</strong> and all associated records. This cannot be undone.
        </p>
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
