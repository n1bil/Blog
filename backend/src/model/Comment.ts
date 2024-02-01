import mongoose, { Document, Schema } from "mongoose";

interface Comment extends Document {
    blog_id: Schema.Types.ObjectId;
    blog_author: Schema.Types.ObjectId;
    comment: string;
    children?: Schema.Types.ObjectId[];
    commented_by: Schema.Types.ObjectId;
    isReply?: boolean;
    parent?: Schema.Types.ObjectId;
}

const commentSchema = new Schema<Comment>(
    {
        blog_id: { type: Schema.Types.ObjectId, required: true, ref: 'blogs' },
        blog_author: { type: Schema.Types.ObjectId, required: true, ref: 'blogs' },
        comment: { type: String, required: true },
        children: { type: [Schema.Types.ObjectId], ref: 'comments' },
        commented_by: { type: Schema.Types.ObjectId, require: true, ref: 'users' },
        isReply: { type: Boolean, default: false },
        parent: { type: Schema.Types.ObjectId, ref: 'comments' }
    },
    {
        timestamps: { createdAt: 'commentedAt' }
    }
);

export default mongoose.model<Comment>("comments", commentSchema);
