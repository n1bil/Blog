import { RequestHandler, Response } from "express";
import { AuthenticatedRequest, AuthenticatedRequestWithQueryString } from "../types/authenticatedCreatePostRequest";
import { allNotificationsCountService, newNotificationService, notificationsService } from "../service/notificationService";

export const newNotification = async (req: AuthenticatedRequest, res: Response) => {
    const user_id = req.user!._id;

    try {
        const status = await newNotificationService(user_id);
        return res.status(200).json(status);
    } catch (error) {
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unexpected error" });
    }
};

export const notifications: RequestHandler  = async (req: AuthenticatedRequestWithQueryString, res: Response) => {
    const user_id = req.user!._id;
    const { page, filter, deletedDocCount } = req.query;    

    try {
        const notifications = await notificationsService(user_id, page!, filter!, deletedDocCount!);
        
        return res.status(200).json(notifications);
    } catch (error) {
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unexpected error" });
    }
};

export const allNotificationsCount = async (req: AuthenticatedRequestWithQueryString, res: Response) => {
    const user_id = req.user!._id;
    const { filter } = req.query;        

    try {
        const count = await allNotificationsCountService(user_id, filter!);
        
        return res.status(200).json(count);
    } catch (error) {
        return res.status(500).json({ error: error instanceof Error ? error.message : "Unexpected error" });
    }
};