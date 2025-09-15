import typeis from 'type-is';

function isPlainObject(value) {
	return Object.prototype.toString.call(value) === '[object Object]';
}

function sanitizeKey(key) {
	if (!key) return key;
	// Replace leading $ and any dot characters
	let newKey = key;
	if (newKey[0] === '$') newKey = '_' + newKey.slice(1);
	if (newKey.includes('.')) newKey = newKey.replace(/\./g, '_');
	return newKey;
}

function deepSanitize(input) {
	if (Array.isArray(input)) {
		return input.map(deepSanitize);
	}
	if (isPlainObject(input)) {
		const out = {};
		for (const [k, v] of Object.entries(input)) {
			const newKey = sanitizeKey(k);
			out[newKey] = deepSanitize(v);
		}
		return out;
	}
	return input;
}

export function sanitizeBodyAndParams(req, _res, next) {
	// Only sanitize JSON and urlencoded bodies, leave raw/other types intact
	try {
		if (req.body && (typeis.is(req.headers['content-type'] || '', ['json', 'urlencoded']) || isPlainObject(req.body))) {
			req.body = deepSanitize(req.body);
		}
		if (req.params && isPlainObject(req.params)) {
			req.params = deepSanitize(req.params);
		}
		// Intentionally DO NOT touch req.query to avoid Express 5 getter error
		return next();
	} catch (err) {
		return next(err);
	}
}

export default sanitizeBodyAndParams;


