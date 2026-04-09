import express from "express";
import cors from "cors";
import animalRoutes from "./src/routes/animalRoutes";
import clientRoutes from "./src/routes/clientRoutes";
import rentalRoutes from "./src/routes/rentalRoutes";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors());
app.use(express.json());

app.use("/api/animals", animalRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/rentals", rentalRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`   Animals : http://localhost:${PORT}/api/animals`);
  console.log(`   Clients : http://localhost:${PORT}/api/clients`);
  console.log(`   Rentals : http://localhost:${PORT}/api/rentals`);
});
