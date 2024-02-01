import mongoose, { Schema, Document } from "mongoose";

interface PersonalInfo {
    name: string;
    surname: string;
    email: string;
    password: string;
    username: string;
    bio?: string;
    profile_img?: string;
}

interface SocialLinks {
    youtube?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    github?: string;
    website?: string;
}

interface AccountInfo {
    total_posts: number;
    total_reads: number;
}

interface GoogleAuth {
    type: boolean;
    default: false;
}

interface Blogs {
    type: Schema.Types.ObjectId[];
    ref: "blogs";
    default: [];
}

interface UserDocument extends Document {
    personal_info: PersonalInfo;
    social_links: SocialLinks;
    account_info: AccountInfo;
    google_auth: GoogleAuth;
    blogs: Blogs;
}

const userSchema = new Schema<UserDocument>({
    personal_info: {
        name: { type: String, lowercase: true, required: true, minlength: [3, 'name must be 3 letters long'] },
        surname: { type: String, lowercase: true, required: true, minlength: [3, 'surname must be 3 letters long'] },
        email: { type: String, required: true, lowercase: true, unique: true },
        password: String,
        username: { type: String, minlength: [3, 'Username must be 3 letters long'], unique: true },
        bio: { type: String, maxlength: [200, 'Bio should not be more than 200'], default: "" },
        profile_img: { type: String, default: "https://www.transparentpng.com/thumb/user/blue-male-user-profile-transparent-png-2lbgMx.png" }},
    social_links: {
        youtube: { type: String, default: "" },
        instagram: { type: String, default: "" },
        facebook: { type: String, default: "" },
        twitter: { type: String, default: "" },
        github: { type: String, default: "" },
        website: { type: String, default: "" }},
    account_info: {
        total_posts: { type: Number, default: 0 },
        total_reads: { type: Number, default: 0 }},
    google_auth: { type: Boolean, default: false },
    blogs: { type: [ Schema.Types.ObjectId ], ref: 'blogs', default: [] }
}, 
{ 
    timestamps: { createdAt: 'joinedAt' }
});

export default mongoose.model<UserDocument>('users', userSchema);