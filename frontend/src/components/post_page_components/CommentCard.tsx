import { useContext, useState } from "react";
import { getDay } from "../../common/date";
import { Comment } from "../../types/comment";
import { UserContext } from "../../App";
import toast from "react-hot-toast";
import { CommentField } from "./CommentField";
import { PostContext } from "../../pages/PostPage";
import axios from "axios";

type Props = {
    index: number;
    leftVal: number;
    commentData: Comment;
}

export const CommentCard = ({ index, leftVal, commentData }: Props) => {
    const { commented_by: { personal_info: { profile_img, name, surname, username: commentedByUsername } }, commentedAt, comment, _id, children } = commentData
    const { userAuth: { access_token, username } } = useContext(UserContext);
    const [ isReplying, setReplying ] = useState(false);
    const { post, post: { comments, activity, activity: { total_parent_comments }, comments: { results: commentsArr }, author: { personal_info: { username: blog_author } } }, setPost, setTotalParentCommentsLoaded } = useContext(PostContext);

    const getParentIndex = () => {
        let startingPoint: number | undefined = index - 1;

        try {
            while(commentsArr[startingPoint].childrenLevel >= commentData.childrenLevel) {
                startingPoint--;
            }
        } catch (error) {
            startingPoint = undefined
        }
        return startingPoint
    }

    const removeCommentsCard = (startingPoint: number, isDelete = false) => {
        if (commentsArr[startingPoint]) {
            while(commentsArr[startingPoint].childrenLevel > commentData.childrenLevel) {
                commentsArr.splice(startingPoint, 1);

                if (!commentsArr[startingPoint]) {
                    break;
                }
            } 
        }

        if (isDelete) {
            const parentIndex = getParentIndex();

            if (parentIndex != undefined) {
                commentsArr[parentIndex].children = commentsArr[parentIndex].children.filter(child => child._id != _id)

                if (!commentsArr[parentIndex].children.length) {
                    commentsArr[parentIndex].isReply = false;
                }
            }

            commentsArr.splice(index, 1);
        }

        if (commentData.childrenLevel == 0 && isDelete) {
            setTotalParentCommentsLoaded(preVal => preVal - 1);
        }

        setPost({ ...post, comments: { results: commentsArr }, activity: { ...activity, total_parent_comments: total_parent_comments - (commentData.childrenLevel == 0 && isDelete ? 1 : 0) } })
    };

    const loadReplies = async ({ skip = 0, currentIndex = index }) => {
        if (commentsArr[currentIndex].children.length) {
            hideReplies();

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/get-replies/${commentsArr[currentIndex]._id}`, {
                    params: { skip }
                });
            
                const { replies } = response.data;
            
                commentsArr[currentIndex].isReply = true;
            
                for (let i = 0; i < replies.length; i++) {
                    replies[i].childrenLevel = commentsArr[currentIndex].childrenLevel + 1;
            
                    commentsArr.splice(currentIndex + 1 + i + skip, 0, replies[i]);
                }
            
                setPost({ ...post, comments: { ...comments, results: commentsArr } });
            } catch (error) {
                console.error(error);
            }
        }
    };

    const deleteComment = (event: React.MouseEvent<HTMLButtonElement>) => {
        const button = event.currentTarget as HTMLButtonElement;
        button.setAttribute("disabled", "true");
    
        axios.delete(`${import.meta.env.VITE_API_URL}/delete-comment/${_id}`, {
            headers: { 'Authorization': `Bearer ${access_token}` }
        })
        .then(() => {
            button.removeAttribute("disabled");
            removeCommentsCard(index + 1, true);
        })
        .catch(error => {
            console.log(error);
        });
    };

    const hideReplies = () => {
        commentData.isReply = false;

        removeCommentsCard(index + 1);
    };

    const handleReplyClick = () => {
        if (!access_token) {
            return toast.error("login first to leave a reply");
        }

        setReplying(preVal => !preVal);
    };

    const LoadMoreRepliesButton = () => {
        const parentIndex: number | undefined = getParentIndex();
        const button = <button 
            className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
            onClick={() => loadReplies({ skip: index - parentIndex!, currentIndex: parentIndex })}
        >Load More Replies</button>

        if (commentsArr[index + 1]) {
            if (commentsArr[index + 1].childrenLevel < commentsArr[index].childrenLevel) {
                if ((index - parentIndex!) < commentsArr[parentIndex!].children.length) {
                    return button;
                }

                
            }
        } else {
            if (parentIndex) {
                if ((index - parentIndex!) < commentsArr[parentIndex!].children.length) {
                    return button;
                }
            }
        }
    };

    return (
        <div className="w-full" style={{ paddingLeft: `${leftVal * 10}px` }}>
            <div className="my-5 p-6 rounded-md border border-grey">
                <div className="flex gap-3 items-center mb-8">
                    <img src={profile_img} className="w-6 h-6 rounded-full" />

                    <p className="line-clamp-1">{name} {surname} @{commentedByUsername}</p>
                    <p className="min-w-fit">{getDay(commentedAt)}</p>
                </div>

                <p className="font-gelasio text-xl ml-3">{comment}</p>

                <div className="flex gap-5 items-center mt-5">
                    {commentData.isReply ? (
                        <button 
                            className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
                            onClick={hideReplies}
                        >
                            <i className="fi fi-rs-comment-dots"></i>Hide Reply
                        </button>
                    ) : (
                        <button 
                            className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
                            onClick={() => loadReplies({ skip: 0 })}
                        >
                            <i className="fi fi-rs-comment-dots"></i>
                            {children.length} Reply
                        </button>
                    )}
                    <button 
                        className="underline"
                        onClick={handleReplyClick}
                    >Reply</button>

                    {username == commentedByUsername || username == blog_author ? (
                        <button 
                            className="p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red/30 hover:text-red flex items-center"
                            onClick={deleteComment}
                        >
                            <i className="fi fi-rr-trash pointer-events-none"></i>
                        </button>
                    ) : (
                        ""
                    )}

                </div>

                {isReplying ? (
                    <div className="mt-8">
                        <CommentField action="reply" index={index} replyingTo={_id} setReplying={setReplying} />
                    </div>
                ) : (
                    ""
                )}
            </div>

            <LoadMoreRepliesButton />
        </div>  
    );
};
