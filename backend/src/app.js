import express from 'express';
import cors from 'cors';
// import 'body-parser' from 'body-parser';

// routes here

import authRoutes from './routes/auth.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import menuRoutes from './routes/menu.routes.js';
import galleryRoutes from './routes/gallery.routes.js';
import reservationRoutes from './routes/reservation.routes.js';

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use('/auth', authRoutes);
app.use('/settings', settingsRoutes);
app.use('/menu', menuRoutes);
app.use('/gallery', galleryRoutes);
app.use('/reservations', reservationRoutes);

export default app;

