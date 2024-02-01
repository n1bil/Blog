import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PostResponse } from "../types/postResponse";
import { WrapperUserForm } from "../components/auxiliary_components/WrapperUserForm";
import Loader from "../components/auxiliary_components/Loader";
import { getDay } from "../common/date";
import { PostInteraction } from "../components/post_page_components/PostInteraction";
import { PostCard } from "../components/homepage_components/PostCard";
import { PostContent } from "../components/post_page_components/PostContent";
import { CommentContainer, fetchComments } from "../components/post_page_components/CommentContainer";

const postStructure: PostResponse = {
    title: "",
    banner: "",
    des: "",
    content: [],
    author: { personal_info: { name: "", surname: "", username: "", profile_img: "" } },
    comments: { results: [] },
    publishedAt: "",
    activity: {total_likes: 0, total_comments: 0, total_reads: 0, total_parent_comments: 0 }
};

export interface PostContextType {
    post: PostResponse;
    setPost: React.Dispatch<React.SetStateAction<PostResponse>>;
    isLikedByUser: boolean;
    setLikedByUser: React.Dispatch<React.SetStateAction<boolean>>;
    commentsWrapper: boolean;
    setCommentsWrapper: React.Dispatch<React.SetStateAction<boolean>>;
    totalParentCommentsLoaded: number;
    setTotalParentCommentsLoaded: React.Dispatch<React.SetStateAction<number>>;
}

export const PostContext = createContext<PostContextType>({
    post: postStructure,
    setPost: () => {},
    isLikedByUser: false,
    setLikedByUser: () => {},
    commentsWrapper: false,
    setCommentsWrapper: () => {},
    totalParentCommentsLoaded: 0,
    setTotalParentCommentsLoaded: () => {},
});

export const PostPage = () => {
    const { post_id } = useParams();
    const [post, setPost] = useState<PostResponse>(postStructure);
    const [similarPosts, setSimilarPosts] = useState<PostResponse[] | null>([]);
    const { title, content, banner, author: { personal_info: { name, surname, username, profile_img } }, publishedAt } = post as PostResponse;
    const [loading, setLoading] = useState(true);
    const [isLikedByUser, setLikedByUser] = useState(false);
    const [commentsWrapper, setCommentsWrapper] = useState(false);
    const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);

    const fetchPost = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/get-post/${post_id}`);
            const { post } = response.data;            

            post.comments = await fetchComments({ blog_id: post._id, setParentCommentCountFunction: setTotalParentCommentsLoaded });            
            setPost(post);                                    

            const response2 = await axios.get(`${import.meta.env.VITE_API_URL}/search-posts`, {
                params: { tag: post.tags[0], limit: 6, page: 1, eliminate_post: post_id }
            });
            const { posts } = response2.data;
            
            setSimilarPosts(posts);
            setLoading(false);
        } catch (error) {
            const err = error instanceof Error ? error.message : "Unknown error";
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        resetStates();
        fetchPost();
    }, [post_id]);

    const resetStates = () => {
        setPost(postStructure);
        setSimilarPosts(null);
        setLoading(true);
        setLikedByUser(false);
        setTotalParentCommentsLoaded(0);
    };

    return (
        <WrapperUserForm>
            {loading ? (
                <Loader />
            ) : (
                <PostContext.Provider value={{ post, setPost, isLikedByUser, setLikedByUser, commentsWrapper, setCommentsWrapper, totalParentCommentsLoaded, setTotalParentCommentsLoaded }}>

                    <CommentContainer />

                    <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
                        <img src={banner} className="aspect-video" />

                        <div className="mt-12">
                            <h2>{title}</h2>

                            <div className="flex max-sm:flex-col justify-between my-8">
                                <div className="flex gap-5 items-start">
                                    <img src={profile_img} className="w-12 h-12 rounded-full"/>

                                    <p className="capitalize">
                                        {name} {surname}
                                        <br />
                                        @
                                        <Link to={`/user/${username}`} className="underline">{username}</Link>
                                    </p>
                                </div>

                            <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">Published on {getDay(publishedAt)}</p>
                        </div>
                        </div>

                        <div className="my-12 font-gelasio post-page-content">
                            {content[0].blocks.map((block, index) => {
                                return <div key={index} className="my-4 md:my-8">
                                    <PostContent block={block} />
                                </div>
                            })}
                        </div>

                        <PostInteraction />

                        {similarPosts != undefined && similarPosts.length ? (
                            <>
                                <h1 className="text-2xl mt-14 mb-10">Similar Posts</h1>

                                {similarPosts.map((post, index) => {
                                    const { author: { personal_info } } = post;

                                    return <WrapperUserForm key={index} transition={{ duration: 1, delay: index*0.08 }}>
                                        <PostCard content={post} author={personal_info}/>
                                    </WrapperUserForm>
                                })}
                            </>
                        ) : (
                            " "
                        )}
                    </div>
                </PostContext.Provider>
            )}
        </WrapperUserForm>
    );
};
