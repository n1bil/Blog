import { useContext } from "react";
import { PostContext } from "../../pages/PostPage";
import { CommentField } from "./CommentField";
import axios from "axios";
import { NoDataMessage } from "../homepage_components/NoDataMessage";
import { WrapperUserForm } from "../auxiliary_components/WrapperUserForm";
import { CommentCard } from "./CommentCard";

type Property = {
    skip?: number;
    blog_id: string;
    setParentCommentCountFunction: React.Dispatch<React.SetStateAction<number>>;
    comment_array?: unknown[] | null;
};

export const fetchComments = async ({skip = 0, blog_id, setParentCommentCountFunction, comment_array = null }: Property) => {
    try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/get-post-comments/${blog_id}?skip=${skip}`);

        data.map((comment: { childrenLevel: number }) => {
            comment.childrenLevel = 0;
        });

        setParentCommentCountFunction((preVal: number) => preVal + data.length);

        if (comment_array == null) {
            return { results: data };
        } else {
            return { results: [...comment_array, ...data] };
        }
    } catch (error) {
        console.error(error);
        return { results: [] };
    }
};

export const CommentContainer = () => {
    const {
        post,
        post: {_id, title, comments: { results: commentsArr }, activity: { total_parent_comments },},
        commentsWrapper,
        setCommentsWrapper,
        totalParentCommentsLoaded,
        setTotalParentCommentsLoaded,
        setPost
    } = useContext(PostContext);

    const loadMoreComments = async () => {
        const newCommentsArr = await fetchComments({
            skip: totalParentCommentsLoaded,
            blog_id: _id!,
            setParentCommentCountFunction: setTotalParentCommentsLoaded,
            comment_array: commentsArr,
        });

        setPost({ ...post, comments: newCommentsArr })
    };

    

    return (
        <div
            className={
                "max-sm:w-full fixed " +
                (commentsWrapper
                    ? "top-0 sm:right-0"
                    : "top-[100%] sm:right-[-100%]") +
                " duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden"
            }
        >
            <div className="relative">
                <h1 className="text-xl font-medium">Comments</h1>
                <p className="text-lg mt-2 w-[70%] text-dark-grey line-clamp-1">
                    {title}
                </p>

                <button
                    onClick={() => setCommentsWrapper((preVal) => !preVal)}
                    className="absolute top-0 right-0 flex justify-center items-center w-12 h-12 rounded-full bg-grey"
                >
                    <i className="fi fi-br-cross text-2xl mt-1"></i>
                </button>
            </div>

            <hr className="border-grey my-8 w-[120%] -ml-10" />

            <CommentField action="comment" />

            {commentsArr && commentsArr.length ? (
                commentsArr.map((comment, index) => {
                    return (
                        <WrapperUserForm key={index}>
                            <CommentCard
                                index={index}
                                leftVal={comment.childrenLevel * 4}
                                commentData={comment}
                            />
                        </WrapperUserForm>
                    );
                })
            ) : (
                <NoDataMessage message="No Comments" />
            )}

            {total_parent_comments > totalParentCommentsLoaded ? (
                <button
                    onClick={loadMoreComments}
                    className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
                >
                    Load More
                </button>
            ) : (
                ""
            )}
        </div>
    );
};
