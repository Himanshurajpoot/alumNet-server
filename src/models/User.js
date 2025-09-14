import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, index: true },
		password: { type: String, required: true, select: false },
		role: { type: String, enum: ['alumni', 'student', 'admin'], default: 'student' },
		graduationYear: { type: Number },
		department: { type: String },
		avatarUrl: { type: String , default: 'https://cdn-icons-png.flaticon.com/128/3177/3177440.png'},
		// Password reset
		resetPasswordToken: { type: String },
		resetPasswordExpires: { type: Date },
		// Alumni-specific profile fields
		batch: { type: Number },
		course: { type: String },
		currentJob: { type: String },
		// Verification for alumni
		verified: { type: Boolean, default: true },
		// Moderation/state
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

// Secondary indexes for common queries
userSchema.index({ role: 1 });
userSchema.index({ verified: 1 });




userSchema.pre('save', async function preSave(next) {
	if (!this.isModified('password')) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
	return bcrypt.compare(candidate, this.password);
};

userSchema.methods.generatePasswordResetToken = function generatePasswordResetToken() {
	const resetToken = crypto.randomBytes(32).toString('hex');
	this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
	this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
	return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User;
