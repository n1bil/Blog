import { Request, Response } from "express";
import { AuthenticatedBodyRequest, CreateCommentBody } from "../types/authenticatedCreatePostRequest";
import { addComment, deleteCommentService, getPostWithComments, getRepliesService } from "../service/commentService";

export const createComment = async (req: AuthenticatedBodyRequest<CreateCommentBody>, res: Response) => {
    const user_id = req.user;
    const { blog_id, comment, blog_author, replying_to, notification_id } = req.body; 

    try {
        const result = await addComment(user_id!, blog_id, comment, blog_author, replying_to, notification_id);
        
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
};

export const getBlogComments = async (req: Request<{blog_id: string}, object, object, {skip: number}>, res: Response) => {
    const { blog_id } = req.params;
    const { skip } = req.query;
    
    try {
        const result = await getPostWithComments(blog_id, skip);
        
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
};

export const getReplies = async (req: Request<{id: string}, object, object, {skip: number}>, res: Response) => {
    const { id } = req.params;
    const { skip } = req.query;

    try {
        const replies = await getRepliesService(id!, skip!);
        
        res.status(200).json(replies);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
};

export const deleteComment = async (req: AuthenticatedBodyRequest<{id: string}>, res: Response) => {
    const user_id = req.user;
    const { id } = req.params;    

    try {
        const status = await deleteCommentService(user_id!, id)
        
        res.status(200).json(status);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
};