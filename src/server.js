import http from 'http';
import app from './app.js';
import { loadEnv } from './config/env.js';
import { connectMongo } from './config/mongo.js';
import dotenv from "dotenv";
dotenv.config({ path: ".env" }); // 👈 make sure it loads from root

console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("JWT_SECRET:", process.env.JWT_SECRET);


loadEnv();

const PORT = process.env.PORT || 8000;

async function start() {
	try {
		await connectMongo();
		const server = http.createServer(app);
		server.listen(PORT, () => {
			// eslint-disable-next-line no-console
			console.log(`AlumniConnect API listening on port ${PORT}`);
		});
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('Failed to start server:', err);
		process.exit(1);
	}
}

start();
