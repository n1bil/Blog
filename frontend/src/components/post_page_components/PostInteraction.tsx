import { useContext, useEffect } from "react";
import { PostContext } from "../../pages/PostPage";
import { Link } from "react-router-dom";
import { UserContext } from "../../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

export const PostInteraction = () => {
    const { post, post: { _id, title, blog_id, activity, activity: { total_likes, total_comments }, author: { personal_info: { username: author_username } } }, setPost, isLikedByUser, setLikedByUser, setCommentsWrapper } = useContext(PostContext)!;
    const { userAuth: { username, access_token } } = useContext(UserContext);
    
    useEffect(() => {
        fetchLikeInfo();
    }, []);

    const fetchLikeInfo = async () => {
        try {
            if (access_token) {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/isLiked-by-user/${_id}`, {
                    headers: { 'Authorization': `Bearer ${access_token}` }
                });
                
                const { data: { result } } = response;
                setLikedByUser(Boolean(result));
            }
        } catch (error) {
            console.error("Error fetching like information:", error);
        }
    };

    const handleLike = async () => {
        try {
            if (access_token) {
                // like the post
                setLikedByUser((prevVal) => !prevVal);
    
                const updatedActivity = { ...activity };
                updatedActivity.total_likes = isLikedByUser ? updatedActivity.total_likes - 1 : updatedActivity.total_likes + 1;
    
                setPost({ ...post, activity: updatedActivity });
    
                await axios.post(import.meta.env.VITE_API_URL + "/like-post",
                    { blog_id: _id, isLikedByUser },
                    { headers: { 'Authorization': `Bearer ${access_token}` } }
                );
    
            } else {
                // not logged in
                toast.error("Please login to like this post");
            }
        } catch (error) {
            console.log("Error handling like:", error);
        }
    };

    return (
        <>
            <Toaster />
            <hr className="border-grey my-2"/>
            <div className="flex gap-6 justify-between">
                <div className="flex gap-3 items-center">
                    <button
                        onClick={handleLike}
                        className={"w-10 h-10 rounded-full flex items-center justify-center " + ( isLikedByUser ? "bg-red/20 text-red" : "bg-grey/80" )}
                    >
                        <i className={"fi " + ( isLikedByUser ? "fi-sr-heart" : "fi-rr-heart")}></i>
                    </button>
                    <p className="text-xl text-dark-grey">{total_likes}</p>
                    <button
                        onClick={() => setCommentsWrapper(preVal => !preVal)}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80"
                    >
                        <i className="fi fi-rr-comment-dots"></i>
                    </button>
                    <p className="text-xl text-dark-grey">{total_comments}</p>
                </div>

                <div className="flex gap-6 items-center">
                    {username == author_username ? (
                        <Link to={`/editor/${blog_id}`} className="underline hover:text-purple">Edit</Link>
                    ) : (
                        ""
                    )}

                    <Link to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}><i className="fi fi-brands-twitter text-xl hover:text-twitter"></i></Link>
                </div>
            </div>
            <hr className="border-grey my-2"/>
        </>
    );
};