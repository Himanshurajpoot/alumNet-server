import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';
import eventRoutes from './routes/event.routes.js';
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './routes/user.routes.js';
import profileRoutes from './routes/profile.routes.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';

const app = express();

app.use(helmet({
	crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
	origin: process.env.CLIENT_ORIGIN?.split(',') || '*',
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Static for uploads

app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'AlumniConnect API' }));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
