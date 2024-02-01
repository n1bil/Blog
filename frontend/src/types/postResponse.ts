interface Author {
    personal_info: {
        name: string;
        surname: string;
        username: string;
        profile_img: string;
    };
    _id?: string;
}

interface Comment {
    _id: string;
    blog_id: string;
    blog_author: string;
    comment: string;
    children: Comment[];
    commented_by: Author;
    isReply: boolean;
    commentedAt: string;
    updatedAt: string;
    __v: number;
    childrenLevel: number;
}

export interface PostResponse {
    activity: {
        total_likes: number;
        total_comments: number;
        total_reads: number;
        total_parent_comments: number;
    };
    _id?: string;
    blog_id?: string;
    title: string;
    banner: string;
    des: string;
    content: {
        time: number;
        blocks: {
            id: string;
            type: string;
            data: {
                text: string;
            };
        }[];
        version: string;
    }[];
    tags?: string[];
    author: Author;
    comments: {
        results: Comment[];
    };
    draft?: boolean;
    publishedAt: string;
    updatedAt?: string;
    __v?: number;
}

export interface UserWrittenPostsResponse {
    activity: {
        total_likes: number;
        total_comments: number;
        total_reads: number;
        total_parent_comments: number;
    };
    blog_id: string;
    title: string;
    banner: string;
    des: string;
    draft: boolean;
    publishedAt: string;
}

export interface UserWrittenPostsResult {
    deletedDocCount?: number;
    page: number;
    results: UserWrittenPostsResponse[];
    totalDocs: number;
}
