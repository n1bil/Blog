import Notification from "../model/Notification";

export const newNotificationService = async (user_id: string) => {
    try {
        const result = await Notification.exists({
            notification_for: user_id,
            seen: false,
            user: { $ne: user_id }
        });

        if (result) {
            return { new_notification_available: true };
        } else {
            return { new_notification_available: false };
        }
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            throw error.message;
        }
    }
};

export const notificationsService = async (user_id: string, page: number, filter: string, deletedDocCount: number) => {
    const maxLimit = 10;
    const findQuery = { notification_for: user_id, user: { $ne: user_id } };
    let skipDocs = ( page - 1 ) * maxLimit;

    try {
        if (filter !== 'all') {
            Object.assign(findQuery, { type: filter });
        }

        if (deletedDocCount) {
            skipDocs -= deletedDocCount;
        }

        const notifications = await Notification.find(findQuery)
            .skip(skipDocs)
            .limit(maxLimit)
            .populate("blog", "title blog_id")
            .populate("user", "personal_info.name personal_info.surname personal_info.username personal_info.profile_img")
            .populate("comment", "comment")
            .populate("replied_on_comment", "comment")
            .populate("reply", "comment")
            .sort({ createdAt: -1 })
            .select("createdAt type seen reply");

        await Notification.updateMany(findQuery, { seen: true })
        .skip(skipDocs)
        .limit(maxLimit)        

        return notifications;
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            throw error.message;
        }
    }
};

export const allNotificationsCountService = async (user_id: string, filter: string) => {
    try {
        const findQuery = { notification_for: user_id, user: { $ne: user_id } };

        if (filter !== 'all') {
            Object.assign(findQuery, { type: filter });
        }

        const count = await Notification.countDocuments(findQuery);
        return { totalDocs: count };
    } catch (error) {
        if (error instanceof Error) {
            throw error.message;
        }
    }
};