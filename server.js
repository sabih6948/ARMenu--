import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import menuRoutes from './routes/menuRoutes.js';
import authRoutes from './routes/authRoutes.js'
import qrRoutes from './routes/qrRoutes.js';
import payRoutes from './routes/payRoutes.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5500;

connectDB();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/menu', menuRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/payment' , payRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


