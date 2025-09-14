import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
	destination(_req, _file, cb) {
		cb(null, uploadsDir);
	},
	filename(_req, file, cb) {
		const ext = path.extname(file.originalname);
		const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '');
		cb(null, `${base}-${Date.now()}${ext}`);
	},
});

function fileFilter(_req, file, cb) {
	// Check MIME type
	if (!/^image\/(png|jpe?g|gif|webp)$/.test(file.mimetype)) {
		return cb(new Error('Only image uploads are allowed (PNG, JPEG, GIF, WebP)'));
	}
	
	// Check file extension
	const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
	const fileExtension = path.extname(file.originalname).toLowerCase();
	if (!allowedExtensions.includes(fileExtension)) {
		return cb(new Error('Invalid file extension. Only PNG, JPEG, GIF, WebP files are allowed'));
	}
	
	cb(null, true);
}

export const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });


