import { Link } from "react-router-dom";
import { NotificationResponse, NotificationResult } from "../../types/notification";
import { getDay } from "../../common/date";
import { useContext, useState } from "react";
import { NotificationCommentField } from "./NotificationCommentField";
import { UserContext } from "../../App";
import axios from "axios";

type Props = {
    data: NotificationResponse;
    index: number;
    notificationState: {
        notifications: NotificationResult,
        setNotifications: React.Dispatch<React.SetStateAction<NotificationResult | null>>
    }
};
 
export const NotificationCard = ({ data, index, notificationState }: Props) => {
    const { seen, type, reply, createdAt, comment, replied_on_comment, user, user: { personal_info: { name, surname, username, profile_img } }, blog: { _id, blog_id, title }, _id: notification_id } = data
    const [isReplying, setReplying] = useState(false);
    const { userAuth: { username: author_username, profile_img: author_profile_img, access_token } } = useContext(UserContext);
    const { notifications, notifications: { results, totalDocs }, setNotifications } = notificationState;

    const handleReplyClick = () => {
        setReplying(preVal => !preVal);
    };

    const handleDelete = (comment_id: string, type: string, target: HTMLElement) => {
        target.setAttribute("disabled", "true");
    
        axios.delete(`${import.meta.env.VITE_API_URL}/delete-comment/${comment_id}`, {
            headers: { 'Authorization': `Bearer ${access_token}` }
        })
        .then(() => {
            if (type === 'comment') {
                results.splice(index, 1);
            } else {
                delete results[index].reply;
            }
    
            target.removeAttribute("disabled");
            setNotifications({ ...notifications, results, totalDocs: totalDocs - 1 });
        })
        .catch(error => {
            console.log(error);
        });
    };

    return (
        <div className={"p-6 border-b border-grey border-l-black " + (!seen ? "border-l-2" : "" ) }>
            <div className="flex gap-5 mb-3">
                <img src={profile_img} className="w-14 h-14 flex-none rounded-full" />
                <div className="w-full ">
                    <h1 className="font-medium text-xl text-dark-grey">
                        <span className="lg:inline-block hidden capitalize">{name} {surname}</span>
                        <Link 
                            to={`/user/${username}`}
                            className="mx-1 text-black underline"
                        >@{username}</Link>
                        <span className="font-normal">
                            {type == 'like' ? (
                                "liked your post"
                            ) : (
                                type == 'comment'
                            ) ? (
                                "commented on"
                            ) : (
                                "replied on"
                            )}
                        </span>
                    </h1>

                    {type == 'reply' ? (
                        <div className="p-4 mt-4 rounded-md bg-grey">
                            <p>{replied_on_comment.comment}</p>
                        </div>
                    ) : (
                        <Link 
                            to={`/post/${blog_id}`}
                            className="font-medium text-dark-grey hover:underline line-clamp-1"
                        >{`"${title}"`}</Link>
                    )}
                </div>
            </div>

            {type != 'like' ? (
                <p className="ml-14 pl-5 font-gelasio text-xl my-5">{comment.comment}</p>
            ) : (
                ""
            )}

            <div className="ml-14 pl-5 mt-3 text-dark-grey flex gap-8">
                <p>{getDay(createdAt)}</p>

                {type != 'like' ? (
                    <>
                        {!reply ? (
                            <button 
                                className="underline hover:text-black"
                                onClick={handleReplyClick}    
                            >Reply</button>
                        ) : (
                            ""
                        )}
                        <button 
                            className="underline hover:text-black"
                            onClick={(event) => handleDelete(comment._id, "comment", event.target as HTMLButtonElement)}
                        >Delete</button>
                    </>
                ) : (
                    ""
                )}
            </div>

            {isReplying ? (
                <div className="mt-8">
                    <NotificationCommentField id={_id} blog_author={user} index={index} replyingTo={comment._id} setReplying={setReplying} notification_id={notification_id} notificationData={notificationState} />
                </div>
            ) : (
                ""
            )}

            {reply ? (
                <div className="ml-20 p-5 bg-grey mt-5 rounded-md">
                    <div className="flex gap-3 mb-3">
                        <img src={author_profile_img} className="w-8 h-8 rounded-full" />

                        <div>
                            <h1 className="font-medium text-xl text-dark-grey">
                                <Link 
                                    to={`/user/${author_username}`}
                                    className="mx-1 text-black underline"    
                                >@{author_username}</Link>

                                <span className="font-normal">replied to</span>

                                
                                <Link 
                                    to={`/user/${username}`}
                                    className="mx-1 text-black underline"    
                                >@{username}</Link>
                            </h1>
                        </div>
                    </div>

                    <p className="ml-14 font-gelasio text-xl my-2">{reply.comment}</p>

                    <button 
                        className="underline hover:text-black ml-14 mt-2"
                        onClick={(event) => handleDelete(comment._id, "reply", event.target as HTMLButtonElement)}
                    >Delete</button>

                </div>
            ) : (
                ""
            )}
        </div>
    );
};
