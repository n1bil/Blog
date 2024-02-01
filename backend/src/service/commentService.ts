import Comment from "../model/Comment";
import Blog from "../model/Blog";
import { UserAuth } from "../types/authenticatedCreatePostRequest";
import Notification from "../model/Notification";

export const addComment = async (user_id: UserAuth, blog_id: string, comment: string, blog_author: string, replying_to: string, notification_id: string) => {
    if (!comment.length) {
        throw new Error("Write something to leave a comment"); 
    }

    // creating a comment doc
    const newComment = {
        blog_id,
        blog_author,
        comment,
        commented_by: user_id
    };

    try {
        if (replying_to) {
            Object.assign(newComment, { parent: replying_to });
            Object.assign(newComment, { isReply: true });
        }

        

        const savedComment = await new Comment(newComment).save();
        const { _id: commentId, comment, commentedAt, children } = savedComment as Comment & Document;

        await Blog.findOneAndUpdate(
            { _id: blog_id },
            { 
                $push: { "comments": commentId }, 
                $inc: { "activity.total_comments": 1, "activity.total_parent_comments": replying_to ? 0 : 1 },
            }
        );

        const newNotification = {
            type: replying_to ? "reply" : "comment",
            blog: blog_id,
            notification_for: blog_author,
            user: user_id,
            comment: commentId
        };

        if (replying_to) {
            Object.assign(newNotification, { replied_on_comment: replying_to });
            const replyingToComment =  await Comment.findOneAndUpdate(
                { _id: replying_to },
                { $push: { children: commentId } }
            );
            
            Object.assign(newNotification, { notification_for: replyingToComment?.commented_by });

            if (notification_id) {
                await Notification.findOneAndUpdate(
                    { _id: notification_id },
                    { reply: commentId }
                );
                console.log("Notification updated");
            }
        }

        await new Notification(newNotification).save();
        
        return { comment, commentedAt, commentId, user_id, children };
    } catch (error) {
        if (error instanceof Error) {
            console.error(error);
            throw error.message;
        }
    }
};

export const getPostWithComments = async (blog_id: string, skip: number) => {
    const maxLimit = 5;
    return await Comment.find({ blog_id, isReply: false })
    .populate("commented_by", "personal_info.username personal_info.name personal_info.surname personal_info.profile_img")
    .skip(skip)
    .limit(maxLimit)
    .sort({ 'commentedAt': -1 })
    .then(comment => {
        return comment;
    })
    .catch(error => {
        if (error instanceof Error) {
            console.error(error);
            throw error.message;
        }
    })
};

export const getRepliesService = async (_id: string, skip: number) => {
    const maxLimit = 5;

    try {
        const replies = await Comment.findOne({ _id })
            .populate({
                path: "children",
                options: {
                    limit: maxLimit,
                    skip: skip,
                    sort: { 'commentedAt': -1 }
                },
                populate: {
                    path: 'commented_by',
                    select: "personal_info.profile_img personal_info.name personal_info.surname personal_info.username"
                },
                select: "-blog_id -updatedAt"
            })
            .select("children");

        return { replies: replies?.children };
    } catch (error) {
        if (error instanceof Error) {
            console.error(error);
            throw error.message;
        }
    }
};

const deleteComments = (_id: string) => {
    Comment.findOneAndDelete({ _id })
        .then(comment => {
            if (!comment) {
                console.log("Comment not found");
                return;
            }

            if (comment.parent) {
                Comment.findOneAndUpdate(
                    { _id: comment.parent },
                    { $pull: { children: _id } }
                )
                .then(() => console.log("comment delete from parent"))
                .catch(err => console.log(err));
            }

            Notification.findOneAndDelete({ comment: _id })
                .then(() => console.log("Comment notification deleted"));

            Notification.findOneAndUpdate({ reply: _id }, { $unset: { reply: 1 } })
                .then(() => console.log("Reply notification deleted"));

            Blog.findOneAndUpdate(
                { _id: comment.blog_id },
                {
                    $pull: { comments: _id },
                    $inc: { "activity.total_comments": -1 }, 
                    "activity.total_parent_comments": comment.parent ? 1 : 0
                }
            )
            .then(() => {
                if (comment && comment.children && comment.children.length) {
                    comment.children.map(replies => {
                        deleteComments(replies.toString());
                    });
                }
            })
        })
        .catch(err => {
            console.log(err.message);
        });
};

export const deleteCommentService = async (user_id: UserAuth, _id: string) => {
    Comment.findOne({ _id })
        .then(comment => {
            if (!comment) {
                throw new Error("Comment not found");
            }          

            if (user_id._id == comment.commented_by.toString() || user_id._id == comment.blog_author.toString()) {
                deleteComments(_id);

                return { status: 'done' };
            } else {
                throw new Error("You can not delete this comment");
            }
        })
        .catch(error => {
            console.error(error);
            throw error;
        });
};