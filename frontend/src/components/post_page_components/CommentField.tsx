import { useContext, useState } from "react";
import { UserContext } from "../../App";
import toast, { Toaster } from "react-hot-toast";
import { PostContext } from "../../pages/PostPage";
import axios from "axios";

type Props = {
    action: string;
    index?: number;
    replyingTo?: string;
    setReplying?: React.Dispatch<React.SetStateAction<boolean>>
}

export const CommentField = ({ action, index = 0, replyingTo = undefined, setReplying }: Props) => {
    const [comment, setComment] = useState("");
    const { userAuth: { access_token, username, name, surname, profile_img } } = useContext(UserContext);
    const { post, post: { _id, author: { _id: blog_author }, comments, comments: { results: commentsArr }, activity, activity: { total_comments, total_parent_comments } }, setPost, setTotalParentCommentsLoaded } = useContext(PostContext);

    const handleComment = async () => {
        if (!access_token) {
            return toast.error("login first to leave a comment")
        }

        if (!comment.length) {
            return toast.error("Write something to leave a comment...");
        }

        try {
            const response = await axios.post(import.meta.env.VITE_API_URL + "/add-comment", {
                blog_id: _id, blog_author, comment, replying_to: replyingTo
            }, {
                headers: { 'Authorization': `Bearer ${access_token}` }
            });

            const data = response.data;

            console.log(data);
            
            setComment("");

            data.commented_by = { personal_info: { name, surname, profile_img, username } };

            let newCommentArr;

            
            // TODO need to be fixed
            if (replyingTo) {
                console.log("replyingTo");
                
                commentsArr[index].children.push(data.commentId);
                data.childrenLevel = commentsArr[index].childrenLevel + 1;
                data.parentIndex = index;

                commentsArr[index].isReply = true;
                commentsArr.splice(index + 1, 0, data);
                newCommentArr = commentsArr;
                
                setReplying!(false);
            } else {
                console.log("else");
                data.childrenLevel = 0;
                newCommentArr = [ data, ...commentsArr ];
            }
            
            
            const parentCommentIncrementVal = replyingTo ? 0 : 1;
            
            setPost({ ...post, comments: { ...comments, results: newCommentArr }, activity: { ...activity, total_comments: total_comments + 1, total_parent_comments: total_parent_comments + parentCommentIncrementVal } });
                
            setTotalParentCommentsLoaded(preVal => preVal + parentCommentIncrementVal);
        

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
                placeholder="Leave a comment..."
                className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
            ></textarea>
            <button 
                className="btn-dark mt-5 px-10"
                onClick={handleComment}
            >    
                {action}
            </button>
        </>
    );
};