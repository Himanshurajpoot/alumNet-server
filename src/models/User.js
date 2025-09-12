import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, index: true },
		password: { type: String, required: true, select: false },
		role: { type: String, enum: ['alumni', 'student', 'admin'], default: 'student' },
		graduationYear: { type: Number },
		department: { type: String },
		avatarUrl: { type: String },
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

const User = mongoose.model('User', userSchema);
export default User;
