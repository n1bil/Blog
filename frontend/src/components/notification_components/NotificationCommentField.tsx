import { useContext, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { NotificationResult } from "../../types/notification";
import { UserContext } from "../../App";
import axios from "axios";

type Props = {
    id: string;
    blog_author: {
        personal_info: {
            name: string;
            surname: string;
            username: string;
            profile_img: string;
        };
        _id: string;
    },
    index: number | undefined;
    replyingTo: string | undefined;
    setReplying: React.Dispatch<React.SetStateAction<boolean>>;
    notification_id: string;
    notificationData: {
        notifications: NotificationResult;
        setNotifications: React.Dispatch<React.SetStateAction<NotificationResult | null>>;
    }
};

export const NotificationCommentField = ({ id, blog_author, index = undefined, replyingTo = undefined, setReplying, notification_id, notificationData }: Props) => {
    const [comment, setComment] = useState('');
    const { _id: blog_id } = blog_author;
    const { userAuth: { access_token } } = useContext(UserContext);
    const { notifications, notifications: { results }, setNotifications } = notificationData;

    const handleComment = async () => {
        if (!access_token) {
            return toast.error("login first to leave a comment")
        }

        if (!comment.length) {
            return toast.error("Write something to leave a comment...");
        }

        try {
            const response = await axios.post(import.meta.env.VITE_API_URL + "/add-comment", {
                blog_id: id, blog_author: blog_id, comment, replying_to: replyingTo, notification_id
            }, {
                headers: { 'Authorization': `Bearer ${access_token}` }
            });

            const data = response.data;            
            setReplying(false);
            results[index!].reply = { comment, _id: data._id };
            setNotifications({ ...notifications, results })

        } catch (error) {
            console.log(error);
        }
        
    };

    return (
        <>
            <Toaster />
            <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Leave a reply..."
                className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
            ></textarea>
            <button 
                className="btn-dark mt-5 px-10"
                onClick={handleComment}
            >    
                Reply
            </button>
        </>
    );
};
