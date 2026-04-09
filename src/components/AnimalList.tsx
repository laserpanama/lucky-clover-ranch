
import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { AnimalStatusBadge } from "./AnimalStatusBadge";

export type AnimalWithAvailability = {
  id: number;
  name: string;
  tagNumber: string;
  breed: string;
  status: string;
  category: string;
  isAvailable: boolean;
  currentRental?: { client: { name: string }; endDate: string };
  nextRental?: { client: { name: string }; startDate: string };
};

export const AnimalList = () => {
  const [animals, setAnimals] = useState<AnimalWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "available" | "rented">("all");

  useEffect(() => {
    apiRequest<AnimalWithAvailability[]>(
      "/animals/availability"
    )
      .then(setAnimals)
      .catch((err) => setError(err.message || "Failed to load animals"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading animals...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  const filteredAnimals = animals.filter((animal) => {
    if (filter === "available") return animal.isAvailable;
    if (filter === "rented") return !animal.isAvailable;
    return true;
  });

  return (
    <div style={{ padding: "20px" }}>
      <h2>Animal Availability</h2>
      
      {/* FILTER CONTROL */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          Show:
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "available" | "rented")}
            style={{ marginLeft: "8px", padding: "4px 8px" }}
          >
            <option value="all">All Animals</option>
            <option value="available">Available Only 🟢</option>
            <option value="rented">Rented Only 🔴</option>
          </select>
        </label>
      </div>

      {/* ANIMAL GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
        {filteredAnimals.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>No animals match your filter</p>
        ) : (
          filteredAnimals.map((animal) => (
            <div key={animal.id} style={styles.animalCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{animal.name}</h3>
                <span style={{ fontSize: "0.9rem", color: "#666" }}>(TAG: {animal.tagNumber})</span>
              </div>

              <div style={{ marginBottom: "8px", fontSize: "0.9rem" }}>
                <strong>Breed:</strong> {animal.breed}<br />
                <strong>Status:</strong> {animal.status}<br />
                <strong>Category:</strong> {animal.category}
              </div>

              {/* THE BADGE - CORE OF THIS FEATURE */}
              <AnimalStatusBadge
                isAvailable={animal.isAvailable}
                currentRental={animal.currentRental}
                nextRental={animal.nextRental}
              />

              {/* NEXT AVAILABLE DATE (OPTIONAL TEXT DISPLAY) */}
              {!animal.isAvailable && animal.nextRental && (
                <div style={styles.nextAvailableText}>
                  Next available: <strong>{new Date(animal.nextRental.startDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric"
                  })}</strong>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// STYLES (DO NOT MODIFY - ENSURES CONSISTENT UI)
const styles = {
  animalCard: {
    border: "1px solid #eee",
    borderRadius: "8px",
    padding: "16px",
    background: "#fafafa",
    position: "relative",
  },
  nextAvailableText: {
    fontSize: "0.85rem",
    color: "#6c757d",
    marginTop: "8px",
    textAlign: "center",
  }
};

