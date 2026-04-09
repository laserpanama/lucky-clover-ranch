import { useState } from "react";
import { useRentalFormData } from "../hooks/useRentalFormData";
import { apiRequest } from "../lib/api";

export const RentalForm = () => {
  const [form, setForm] = useState({
    animalId: "",
    clientId: "",
    startDate: "",
    endDate: "",
    price: "",
    notes: "",
    contractUrl: "",
  });

  const { animals, clients, loading, error } = useRentalFormData();

  const selectedAnimal = animals.find((a) => a.id === Number(form.animalId));

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const payload = {
      animalId: Number(form.animalId),
      clientId: Number(form.clientId),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      price: Number(form.price),
      notes: form.notes || undefined,
      contractUrl: form.contractUrl || undefined,
    };

    try {
      await apiRequest("/rentals", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      alert("✅ Rental created successfully!");

      // Reset form
      setForm({
        animalId: "",
        clientId: "",
        startDate: "",
        endDate: "",
        price: "",
        notes: "",
        contractUrl: "",
      });
    } catch (err: any) {
      alert("❌ " + (err.message || "Something went wrong"));
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "500px", margin: "20px auto" }}>
      <h2>Create Rental</h2>

      {/* ANIMAL DROPDOWN */}
      <label style={{ display: "block", marginBottom: "10px" }}>
        Animal:*
        <select
          value={form.animalId}
          onChange={(e) => setForm({ ...form, animalId: e.target.value })}
          required
          style={{ display: "block", marginTop: "5px" }}
        >
          <option value="">-- Select Animal --</option>
          {animals.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.tagNumber})
            </option>
          ))}
        </select>
      </label>

      {/* CLIENT DROPDOWN */}
      <label style={{ display: "block", marginBottom: "10px" }}>
        Client:*
        <select
          value={form.clientId}
          onChange={(e) => setForm({ ...form, clientId: e.target.value })}
          required
          style={{ display: "block", marginTop: "5px", width: "100%", padding: "8px" }}
        >
          <option value="">-- Select Client --</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.email})
            </option>
          ))}
        </select>
      </label>

      {/* DATES */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <label style={{ flex: 1 }}>
          Start Date:*
          <input
            type="date"
            required
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            style={{ display: "block", marginTop: "5px", width: "100%", padding: "8px" }}
          />
        </label>
        <label style={{ flex: 1 }}>
          End Date:*
          <input
            type="date"
            required
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            style={{ display: "block", marginTop: "5px", width: "100%", padding: "8px" }}
          />
        </label>
      </div>

      {/* PRICE */}
      <label style={{ display: "block", marginBottom: "10px" }}>
        Price:*
        <input
          type="number"
          step="0.01"
          required
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          style={{ display: "block", marginTop: "5px", width: "100%", padding: "8px" }}
        />
      </label>

      {/* NOTES */}
      <label style={{ display: "block", marginBottom: "10px" }}>
        Notes:
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ display: "block", marginTop: "5px", width: "100%", padding: "8px", minHeight: "80px" }}
        />
      </label>

      {/* CONTRACT URL */}
      <label style={{ display: "block", marginBottom: "20px" }}>
        Contract URL:
        <input
          type="url"
          value={form.contractUrl}
          onChange={(e) => setForm({ ...form, contractUrl: e.target.value })}
          style={{ display: "block", marginTop: "5px", width: "100%", padding: "8px" }}
        />
      </label>

      <button type="submit" style={{ width: "100%", padding: "12px", background: "#007bff", color: "white", border: "none", borderRadius: "5px", fontSize: "16px", cursor: "pointer" }}>
        Create Rental
      </button>
    </form>
  );
};
