export interface LastPosts {
    blog_id: string;
    title: string;
    banner: string;
    des: string;
    tags: string[];
    author: {
        personal_info: {
            name: string;
            surname: string;
            username: string;
            profile_img: string;
        };
    };
    activity: {
        total_likes: number;
        total_comments: number;
        total_reads: number;
        total_parent_comments: number;
    };
    publishedAt: string;
}

export interface LastPostsResult {
    page: number;
    results: Array<{
        blog_id: string;
        title: string;
        banner: string;
        des: string;
        tags: string[];
        author: {
            personal_info: {
                name: string;
                surname: string;
                username: string;
                profile_img: string;
            };
        };
        activity: {
            total_likes: number;
            total_comments: number;
            total_reads: number;
            total_parent_comments: number;
        };
        publishedAt: string;
    }>;
    totalDocs: number;
    user_id?: string;
}

export interface TrendPosts {
    blog_id: string;
    title: string;
    author: {
        personal_info: {
            name: string;
            surname: string;
            username: string;
            profile_img: string;
        };
    };
    publishedAt: string;
}

export interface User {
    personal_info: {
        name: string;
        surname: string;
        username: string;
        profile_img: string;
    };
}

export interface UserProfile {
    personal_info: {
        name: string;
        surname: string;
        email: string;
        username: string;
        bio: string;
        profile_img: string;
    };
    social_links: {
        youtube: string;
        instagram: string;
        facebook: string;
        twitter: string;
        github: string;
        website: string;
    };
    account_info: {
        total_posts: number;
        total_reads: number;
    };
    _id: string;
    joinedAt: string;
}
