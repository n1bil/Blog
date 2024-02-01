import mongoose, { Document, Schema } from "mongoose";

interface Notification extends Document {
    type: "like" | "comment" | "reply";
    blog: Schema.Types.ObjectId;
    notification_for: Schema.Types.ObjectId;
    user: Schema.Types.ObjectId;
    comment?: Schema.Types.ObjectId;
    reply?: Schema.Types.ObjectId;
    replied_on_comment?: Schema.Types.ObjectId;
    seen: boolean;
}

const notificationSchema = new Schema<Notification>(
    {
        type: { type: String, enum: ["like", "comment", "reply"], required: true },
        blog: { type: Schema.Types.ObjectId, required: true, ref: 'blogs' },
        notification_for: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
        user: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
        comment: { type: Schema.Types.ObjectId, ref: 'comments' },
        reply: { type: Schema.Types.ObjectId, ref: 'comments' },
        replied_on_comment: { type: Schema.Types.ObjectId, ref: 'comments' },
        seen: { type: Boolean, default: false }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<Notification>("notification", notificationSchema);
