import { Link } from "react-router-dom";
import { TrendPosts } from "../../types/data";
import { getDay } from "../../common/date";

type Props = {
    post: TrendPosts;
    index: number;
};

export const TrendPost = (props: Props) => {
    const { title, blog_id, author: { personal_info: { username, profile_img } }, publishedAt } = props.post;
    
    return (
        <Link to={`/post/${blog_id}`} className="flex gap-5 mb-8 items-center">
            <img src={profile_img} className="w-14 h-14 rounded-full" />

            <div>
                <div className="flex gap-2 items-center mb-2">
                    
                    <p className="line-clamp-1">@{username}</p>
                    <p className="min-w-fit">{getDay(publishedAt)}</p>
                </div>

                <h1 className="post-title">{title}</h1>
            </div>
        </Link>
    );
};
