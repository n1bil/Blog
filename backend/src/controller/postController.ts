import { Request, Response } from "express";
import { createPost, getLastPosts, getTrendPosts, searchServicePosts, getFilterLastPosts, searchServicePostsCount, getPost, likePostService, isLiked, userWrittenPostsService, userWrittenPostsCountService, deletePostService } from "../service/postService";
import { SearchPostsCountQueryStrings, SearchPostsQueryStrings } from "../types/postCreateRequest";
import { AuthenticatedBodyRequest, AuthenticatedRequestWithParams, CreatePostParams, LikeParams, UserWrittenPostsAuthenticatedRequestWithQueryString } from "../types/authenticatedCreatePostRequest";


export const getLatestPosts = async (req: Request<{page: number}>, res: Response) => {
    try {
        const page = req.params.page;
        const posts = await getLastPosts(page);

        return res.status(200).json({ posts });
    } catch (err) {
        return res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
};

export const getFilterLatestPosts = async (req: Request, res: Response) => {
    try {
        const count = await getFilterLastPosts();
        return res.status(200).json({ totalDocs: count });
    } catch (err) {
        return res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
};

export const getTrendingPosts = async (req: Request, res: Response) => {
    try {
        const posts = await getTrendPosts();
        return res.status(200).json({ posts });
    } catch (err) {
        return res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
};

export const searchPosts = async (req: Request<object, object, object, SearchPostsQueryStrings>, res: Response) => {
    try {
        const { tag, query, author, page, limit, eliminate_post } = req.query;    
        const posts = await searchServicePosts(tag, query, author, page!, limit!, eliminate_post!);
        
        return res.status(200).json({ posts });
    } catch (err) {
        return res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
};

export const searchPostsCount = async (req: Request<object, object, object, SearchPostsCountQueryStrings>, res: Response) => {
    try {
        const { tag, author, query } = req.query;
        
        const count = await searchServicePostsCount(tag, author, query);

        return res.status(200).json({ totalDocs: count });
    } catch (err) {
        return res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
};

export const create = async (req: AuthenticatedBodyRequest<CreatePostParams>, res: Response) => {
    try {
        const authorId = req.user;
        const { title, des, banner, tags, content, draft, id } = req.body;
        const result = await createPost(authorId!, { title, des, banner, tags, content, draft, id });

        return res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getPostById = async (req: Request<{post_id: string}, object, object, {draft?: boolean, mode?: string}>, res: Response) => {
    try {
        const { post_id } = req.params;
        const { draft, mode } = req.query;
        const post = await getPost(post_id, draft!, mode!);
            
        return res.status(200).json({ post });
    } catch (err) {
        return res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
};

export const likePost = async (req: AuthenticatedBodyRequest<LikeParams>, res: Response) => {
    try {
        const user_id = req.user;
        const { blog_id, isLikedByUser } = req.body;

        const result = await likePostService(user_id!, blog_id, isLikedByUser);
        res.status(200).json({ result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
};

export const isLikedByUser = async (req: AuthenticatedRequestWithParams, res: Response) => {
    const user_id = req.user;
    const { post_id } = req.params    

    try {
        const result = await isLiked(user_id!, post_id);
        res.status(200).json({ result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
};

export const userWrittenPosts = async (req: UserWrittenPostsAuthenticatedRequestWithQueryString, res: Response) => {
    const user_id = req.user!._id;
    const { page, draft, query, deletedDocCount } = req.query;

    try {
        const posts = await userWrittenPostsService(user_id, page!, draft!, query!, deletedDocCount!);
        res.status(200).json({ posts });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
};

export const userWrittenPostsCount = async (req: UserWrittenPostsAuthenticatedRequestWithQueryString, res: Response) => {
    const user_id = req.user!._id;
    const { draft, query } = req.query;

    try {
        const count = await userWrittenPostsCountService(user_id, draft!, query!);
        res.status(200).json({ totalDocs: count });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
};

export const deletePost = async (req: AuthenticatedRequestWithParams, res: Response) => {
    const user_id = req.user!._id;
    const { post_id } = req.params;    

    try {
        const status = await deletePostService(user_id, post_id);
        res.status(200).json(status);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
};