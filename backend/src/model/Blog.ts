import mongoose, { Document, Schema } from "mongoose";

interface Activity {
    total_likes: number;
    total_comments: number;
    total_reads: number;
    total_parent_comments: number;
}

interface Blog extends Document {
    blog_id: string;
    title: string;
    banner?: string;
    des?: string;
    content?: unknown[]; // Уточните тип данных массива
    tags?: string[];
    author: Schema.Types.ObjectId;
    activity: Activity;
    comments?: Schema.Types.ObjectId[];
    draft: boolean;
}

const blogSchema = new Schema<Blog>(
    {
        blog_id: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        banner: { type: String, /* required: true */ },
        des: { type: String, maxlength: 200, /* required: true */ },
        content: { type: [], /* required: true */ },
        tags: { type: [String], /* required: true */ },
        author: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
        activity: {
            total_likes: { type: Number, default: 0 },
            total_comments: { type: Number, default: 0 },
            total_reads: { type: Number, default: 0 },
            total_parent_comments: { type: Number, default: 0 },
        },
        comments: { type: [Schema.Types.ObjectId], ref: 'comments' },
        draft: { type: Boolean, default: false }
    },
    {
        timestamps: { createdAt: 'publishedAt' }
    }
);

export default mongoose.model<Blog>("blogs", blogSchema);