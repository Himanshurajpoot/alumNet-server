import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
	{
		author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		title: { type: String, required: true, trim: true },
		content: { type: String, required: true },
		imageUrl: { type: String },
		likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
		comments: [
			{
				user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
				text: { type: String, required: true },
				createdAt: { type: Date, default: Date.now },
			},
		],
	},
	{ timestamps: true }
);

const Post = mongoose.model('Post', postSchema);
export default Post;
