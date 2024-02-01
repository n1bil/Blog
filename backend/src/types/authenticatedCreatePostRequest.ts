import { Request } from "express";
import { ParsedQs } from 'qs';

export interface AuthenticatedBodyRequest<T> extends Request {
    user?: UserAuth;
    body: T;
}

export interface AuthenticatedRequest extends Request {
    user?: UserAuth;
}

export interface AuthenticatedRequestWithParams extends Request {
    user?: UserAuth;
    params: { post_id: string };
}

export interface AuthenticatedRequestWithQueryString extends Request {
    user?: UserAuth;
    query: {
        page?: number;
        filter?: string;
        deletedDocCount?: number;
    } & ParsedQs;
}

export interface UserWrittenPostsAuthenticatedRequestWithQueryString extends Request {
    user?: UserAuth;
    query: {
        page?: number;
        draft?: boolean;
        query?: string;
        deletedDocCount?: number;
    } & ParsedQs;
}

export interface CreatePostParams {
    title: string;
    des: string;
    banner: string;
    tags: string[];
    content: { blocks: string[] };
    draft: boolean;
    id?: string;
}

export interface UserAuth {
    _id: string;
    id: string;
    name: string;
    surname: string;
    email: string;
    password: string;
}

export interface LikeParams {
    blog_id: string;
    isLikedByUser: boolean;
}

export interface CreateCommentBody {
    blog_id: string;
    comment: string;
    replying_to: string;
    blog_author: string;
    notification_id: string;
}

export interface ChangePassword {
    currentPassword: string;
    newPassword: string;
}

export interface ChangeProfile {
    username: string;
    bio: string;
    social_links: object;
}