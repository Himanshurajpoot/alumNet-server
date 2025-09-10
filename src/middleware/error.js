export function notFoundHandler(_req, res, _next) {
	res.status(404).json({ message: 'Route not found' });
}

export function errorHandler(err, _req, res, _next) {
	const status = err.status || 500;
	const message = err.message || 'Internal Server Error';
	const details = err.details || undefined;
	res.status(status).json({ message, details });
}
