import dotenv from 'dotenv';

let loaded = false;

export function loadEnv() {
	if (loaded) return;
	dotenv.config();
	loaded = true;
	const required = ['MONGO_URI', 'JWT_SECRET'];
	const missing = required.filter((k) => !process.env[k]);
	if (missing.length) {
		// eslint-disable-next-line no-console
		console.warn(`Missing env vars: ${missing.join(', ')}`);
	}
}
