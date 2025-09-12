import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function signJwt(payload, options = {}) {
	const secret = process.env.JWT_SECRET;
	const expiresIn = options.expiresIn || '7d';
	return jwt.sign(payload, secret, { expiresIn });
}

export async function requireAuth(req, res, next) {
	try {
		const header = req.headers.authorization || '';
		const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.token;
		if (!token) return res.status(401).json({ message: 'Unauthorized' });
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.sub).select('-password');
		if (!user) return res.status(401).json({ message: 'Unauthorized' });
		if (user.isActive === false) return res.status(403).json({ message: 'Account is inactive. Contact admin.' });
		req.user = user;
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid or expired token' });
	}
}

export function requireRole(roles) {
	const allowed = Array.isArray(roles) ? roles : [roles];
	return function checkRole(req, res, next) {
		if (!req.user || !allowed.includes(req.user.role)) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		next();
	};
}
