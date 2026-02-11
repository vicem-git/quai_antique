import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// routes here

import authRoutes from './routes/auth.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import menuRoutes from './routes/menu.routes.js';
import galleryRoutes from './routes/gallery.routes.js';
import reservationRoutes from './routes/reservation.routes.js';

const app = express();

// middlewares
app.use(cors({
    origin: 'http://localhost:5173',
}));
app.use(express.json());

// routes
app.use('/auth', authRoutes);
app.use('/settings', settingsRoutes);
app.use('/menu', menuRoutes);
app.use('/gallery', galleryRoutes);
app.use('/reservations', reservationRoutes);
// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

export default app;

