export interface NotificationResponse {
    _id: string;
    type: string;
    blog: {
        _id: string;
        blog_id: string;
        title: string;
    };
    user: {
        personal_info: {
            name: string;
            surname: string;
            username: string;
            profile_img: string;
        };
        _id: string;
    };
    seen: boolean;
    createdAt: Date;
    comment: {
        _id: string;
        comment: string;
    };
    replied_on_comment: {
        _id: string;
        comment: string;
    };
    reply?: {
        comment: string;
        _id: string;
    };
}

export interface NotificationResult {
    page: number;
    results: NotificationResponse[];
    totalDocs: number;
}
