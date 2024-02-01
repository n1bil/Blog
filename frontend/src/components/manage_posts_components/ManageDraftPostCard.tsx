import { Link } from "react-router-dom";
import { useContext } from "react";
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

export const ManageDraftPostCard = ({ post }: Props) => {
    // eslint-disable-next-line prefer-const
    let { title, des, blog_id, index } = post;
    const { userAuth: { access_token } } = useContext(UserContext);
    index++;

    const deletePost = async ({post, target}: DeletePostParams) => {
        const { index, blog_id, setStateFunction } = post;
        target.setAttribute("disabled", "true");

        try {
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/delete-post/${blog_id}`, {
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

                return { ...preVal, totalDocs: totalDocs - 1, deleteDocCount: newDeletedDocCount! + 1 }
            });
        } catch (error) {
            console.log(error);
        }
        
    };

    return (
        <div className="flex gap-5 lg:gap-10 pb-6 border-b mb-6 border-grey">
            <h1 className="post-index text-center pl-4 md:pl-6 flex-none">
                {index < 10 ? '0' + index : index}
            </h1>

            <div>
                <h1 className="post-title mb-3">{title}</h1>

                <p className="line-clamp-2 font-gelasio">{des.length ? des : 'No Description'}</p>

                <div className="flex gap-6 mt-3">
                    <Link 
                        to={`/editor/${blog_id}`}
                        className="pr-4 py-2 underline"
                    >Edit</Link>

                    <button 
                        className="pr-4 py-2 underline text-red"
                        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => deletePost({ post, access: access_token, target: event.currentTarget })}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

