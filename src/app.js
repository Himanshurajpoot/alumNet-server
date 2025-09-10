import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';
import eventRoutes from './routes/event.routes.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';

const app = express();

app.use(helmet());
app.use(cors({
	origin: process.env.CLIENT_ORIGIN?.split(',') || '*',
	credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'AlumniConnect API' }));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/events', eventRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
