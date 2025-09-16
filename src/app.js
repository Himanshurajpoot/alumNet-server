import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
// import mongoSanitize from 'express-mongo-sanitize';
import sanitizeBodyAndParams from './middleware/sanitize.js';
import path from 'path';
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';
import eventRoutes from './routes/event.routes.js';
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './routes/user.routes.js';
import profileRoutes from './routes/profile.routes.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';

const app = express();

// Rate limiting
const limiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 15 minutes
	max: 1000, // limit each IP to 100 requests per windowMs
	message: 'Too many requests from this IP, please try again later.',
	standardHeaders: true,
	legacyHeaders: false,
	skip: (req) => req.method === 'OPTIONS',
	handler: (req, res) => {
		// Ensure CORS headers present even when rate limited
		const origin = req.headers.origin || '*';
		res.header('Access-Control-Allow-Origin', origin);
		res.header('Access-Control-Allow-Credentials', 'true');
		res.status(429).json({ message: 'Too many requests from this IP, please try again later.' });
	},
});

const authLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 15 minutes
	max: 500, // limit each IP to 5 requests per windowMs for auth endpoints
	message: 'Too many authentication attempts, please try again later.',
	standardHeaders: true,
	legacyHeaders: false,
	skip: (req) => req.method === 'OPTIONS',
	handler: (req, res) => {
		const origin = req.headers.origin || '*';
		res.header('Access-Control-Allow-Origin', origin);
		res.header('Access-Control-Allow-Credentials', 'true');
		res.status(429).json({ message: 'Too many authentication attempts, please try again later.' });
	},
});

app.use(limiter);
app.use('/api/auth', authLimiter);

// CORS must be configured before other middleware
app.use(cors({
	origin: function (origin, callback) {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);
		
		const allowedOrigins = process.env.CLIENT_ORIGIN?.split(',') || ['http://localhost:3000'];
		if (allowedOrigins.includes(origin)) {
			return callback(null, true);
		}
		
		// For development, allow localhost on any port
		if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
			return callback(null, true);
		}
		
		return callback(new Error('Not allowed by CORS'));
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
	exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
	optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Handle preflight requests for all routes
app.use((req, res, next) => {
	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
		res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
		res.header('Access-Control-Allow-Credentials', 'true');
		return res.sendStatus(200);
	}
	next();
});

app.use(helmet({
	crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Custom sanitize middleware to avoid mutating req.query under Express 5
app.use(sanitizeBodyAndParams);

app.use(morgan('dev'));

// Static for uploads

app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'AlumniConnect API' }));

// CORS test endpoint
app.get('/api/cors-test', (_req, res) => {
	res.json({ 
		message: 'CORS is working!', 
		timestamp: new Date().toISOString(),
		origin: _req.headers.origin || 'No origin header'
	});
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
