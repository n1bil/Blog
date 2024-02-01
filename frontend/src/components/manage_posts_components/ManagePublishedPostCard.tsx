import { Link } from "react-router-dom";
import { getDay } from "../../common/date";
import { useContext, useState } from "react";
import { PostStats } from "./PostStats";
import { UserContext } from "../../App";
import axios from "axios";
import { UserWrittenPostsResult } from "../../types/postResponse";

type Props = {
    post: {
        index: number;
        setStateFunction: React.Dispatch<React.SetStateAction<UserWrittenPostsResult | null>>;
        activity: {
            total_likes: number;
            total_comments: number;
            total_reads: number;
            total_parent_comments: number;
        };
        blog_id: string;
        title: string;
        banner: string;
        des: string;
        draft: boolean;
        publishedAt: string;
    }
};

type DeletePostParams = {
    post: Props['post'];
    access: string | null;
    target: HTMLElement;
};

export const ManagePublishedPostCard = ({ post }: Props) => {
    const { banner, blog_id, title, publishedAt, activity } = post;
    const [showStat, setShowStat] = useState(false);
    const { userAuth: { access_token } } = useContext(UserContext);

    const deletePost = async ({ post, target }: DeletePostParams) => {
        const { index, blog_id: post_id, setStateFunction } = post;
        target.setAttribute("disabled", "true");
        
        try {
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/delete-post/${post_id}`, {
                headers: { 'Authorization': `Bearer ${access_token}` }
            });
            const data = response.data;
            console.log(data);
    
            target.removeAttribute("disabled");
            setStateFunction((preVal: UserWrittenPostsResult | null) => {
                if (!preVal) {
                    return null;
                }

                const { deletedDocCount, totalDocs, results } = preVal;
                let newDeletedDocCount = deletedDocCount;

                results.splice(index, 1);

                if (!deletedDocCount) {
                    newDeletedDocCount = 0;
                }

                if (!results.length && totalDocs - 1 > 0) {
                    return null;
                }

                console.log({ ...preVal, totalDocs: totalDocs - 1, deleteDocCount: newDeletedDocCount!  + 1 });
                
                return { ...preVal, totalDocs: totalDocs - 1, deleteDocCount: newDeletedDocCount!  + 1 }
            });
        } catch (error) {
            console.log(error);
        }
        
    };
    
    return (
        <>
            <div className="flex gap-10 border-b mb-6 max-md:px-4 border-grey pb-6 items-center">
                <img src={banner} className="max-md:hidden lg:hidden xl:block w-28 h-28 flex-none bg-grey object-cover" />

                <div className="flex flex-col justify-between py-2 w-full min-w-[300px]">
                    <div>
                        <Link 
                            to={`/post/${blog_id}`}
                            className="post-title mb-4 hover:underline"    
                        >{title}</Link>

                        <p className="line-clamp-1">Published on {getDay(publishedAt)}</p>
                    </div>

                    <div className="flex gap-6 mt-3">
                        <Link 
                            to={`/editor/${blog_id}`}
                            className="pr-4 py-2 underline"    
                        >Edit</Link>

                        <button 
                            className="lg:hidden pr-4 py-2 underline"
                            onClick={() => setShowStat(preVal => !preVal)}
                        >
                            Stats
                        </button>

                        <button 
                            className="pr-4 py-2 underline text-red"
                            onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => deletePost({ post, access: access_token, target: event.currentTarget })}
                        >
                            Delete
                        </button>
                    </div>
                </div>

                <div className="max-lg:hidden">
                    <PostStats stats={activity} />
                </div>

            </div>

            {showStat ? (
                <div className="lg:hidden">
                    <PostStats stats={activity} />
                </div>
            ) : (
                ""
            )}
        </>
    );
};
