import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import menuRoutes from "../routes/menuRoutes.js";
import authRoutes from "../routes/authRoutes.js";
import qrRoutes from "../routes/qrRoutes.js";
import qrRoutes from "../routes/qrRoutes.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use((req, res, next) => {
  connectDB()
    .then(() => next())
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.use("/api/menu", menuRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/qr", qrRoutes);

export default app;