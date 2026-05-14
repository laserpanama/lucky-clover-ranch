import { useState } from "react";
import { Users, Phone, Mail, Building2 } from "lucide-react";
import { Client } from "../../types";
import { apiRequest } from "../../lib/api";
import { ModalShell, ModalActions, Field, inputCls } from "../ui";

export function AddClientModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", organization: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!form.name || !form.phone || !form.email) {
      setError("Name, phone and email required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiRequest("/clients", { method: "POST", body: JSON.stringify(form) });
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title="Add Client" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Full Name" icon={Users}>
          <input className={inputCls} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="John Doe" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone" icon={Phone}>
            <input className={inputCls} value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+507 000 0000" />
          </Field>
          <Field label="Email" icon={Mail}>
            <input className={inputCls} value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="john@ranch.com" />
          </Field>
        </div>
        <Field label="Organization (optional)" icon={Building2}>
          <input className={inputCls} value={form.organization} onChange={(e) => setForm((p) => ({ ...p, organization: e.target.value }))} placeholder="Texas Rodeo LLC" />
        </Field>
        {error && <p className="text-rose-500 text-sm bg-rose-50 px-4 py-2.5 rounded-xl">{error}</p>}
        <ModalActions onClose={onClose} onSubmit={submit} loading={loading} label="Create Client" />
      </div>
    </ModalShell>
  );
}

export function EditClientModal({
  client,
  onClose,
  onSuccess,
}: {
  client: Client;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    name: client.name,
    phone: client.phone,
    email: client.email,
    organization: client.organization ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!form.name || !form.phone || !form.email) {
      setError("Name, phone and email required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiRequest(`/clients/${client.id}`, { method: "PUT", body: JSON.stringify(form) });
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title={`Edit — ${client.name}`} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Full Name" icon={Users}>
          <input className={inputCls} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone" icon={Phone}>
            <input className={inputCls} value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          </Field>
          <Field label="Email" icon={Mail}>
            <input className={inputCls} value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </Field>
        </div>
        <Field label="Organization" icon={Building2}>
          <input className={inputCls} value={form.organization} onChange={(e) => setForm((p) => ({ ...p, organization: e.target.value }))} />
        </Field>
        {error && <p className="text-rose-500 text-sm bg-rose-50 px-4 py-2.5 rounded-xl">{error}</p>}
        <ModalActions onClose={onClose} onSubmit={submit} loading={loading} label="Save Changes" />
      </div>
    </ModalShell>
  );
}

export function DeleteClientModal({
  client,
  onClose,
  onSuccess,
}: {
  client: Client;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    setLoading(true);
    try {
      await apiRequest(`/clients/${client.id}`, { method: "DELETE" });
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title="Delete Client" onClose={onClose}>
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-rose-50 rounded-2xl border border-rose-100">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <Users className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <div className="font-bold text-slate-900">{client.name}</div>
            <div className="text-sm text-slate-500">{client.email}</div>
          </div>
        </div>
        <p className="text-slate-600 text-sm">
          Permanently delete <strong>{client.name}</strong>? Their rentals will remain but will no longer reference a client.
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
