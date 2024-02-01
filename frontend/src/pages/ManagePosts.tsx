import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { filterPostsPaginationData } from "../common/filter_pagination";
import { UserWrittenPostsResult } from "../types/postResponse";
import { Toaster } from "react-hot-toast";
import { InPageNavigation } from "../components/homepage_components/InPageNavigation";
import Loader from "../components/auxiliary_components/Loader";
import { NoDataMessage } from "../components/homepage_components/NoDataMessage";
import { WrapperUserForm } from "../components/auxiliary_components/WrapperUserForm";
import { ManagePublishedPostCard } from "../components/manage_posts_components/ManagePublishedPostCard";
import { ManageDraftPostCard } from "../components/manage_posts_components/ManageDraftPostCard";
import { LoadMoreDataBtn } from "../components/homepage_components/LoadMoreData";
import { useSearchParams } from "react-router-dom";

export type GetPostsProps = {
    page: number;
    draft?: boolean;
    deletedDocCount?: number;
}

export const ManagePosts = () => {
    const [posts, setPosts] = useState<UserWrittenPostsResult | null>(null);
    const [drafts, setDrafts] = useState<UserWrittenPostsResult | null>(null);
    const [query, setQuery] = useState("");
    const activeTab = useSearchParams()[0].get("tab");
    const { userAuth: { access_token } } = useContext(UserContext);

    const getPosts = async ({ page, draft, deletedDocCount = 0 }: GetPostsProps) => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/user-written-posts`, {
                params: { page, draft, query, deletedDocCount },
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });
      
             const formattedData = await filterPostsPaginationData({
                stateArray: draft ? drafts : posts,
                newDataFromBackend: data.posts,
                page: page,
                user: access_token,
                countRoute: "/user-written-posts-count",
                data_to_send: { draft, query }
            });
            
            if (draft) {
                setDrafts(formattedData);
            } else {
                setPosts(formattedData);
            }
            } catch (err) {
            console.error(err);
            }
        };
      

    useEffect(() => {
        if (access_token) {
            if (posts == null) {
                getPosts({ page: 1, draft: false })
            }
            if (drafts == null) {
                getPosts({ page: 1, draft: true })
            }
        }
    }, [access_token, posts, drafts, query]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchQuery = event.target.value;
        setQuery(searchQuery);
    };

    const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            setPosts(null);
            setDrafts(null);
        }
    };

    return (
        <>
            <h1 className="max-md:hidden">Manage Posts</h1>

            <Toaster />

            <div className="relative max-md:mt-5 md:mt-8 mb-10">
                <input 
                    type="search"
                    className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey"
                    placeholder="Search Posts"
                    onChange={handleChange}
                    onKeyDown={handleSearch}
                />

                <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
            </div>

            <InPageNavigation routes={["Published Posts", "Drafts"]} defaultActiveIndex={activeTab != 'draft' ? 0 : 1}>

                {/* {published posts} */
                posts == null ? (
                    <Loader />
                ) : (
                    posts.results.length
                ) ? (
                    <>
                        {posts.results.map((post, index) => {
                            return <WrapperUserForm key={index} transition={{ delay: index * 0.04 }}>
                                <ManagePublishedPostCard post={{ ...post, index, setStateFunction: setPosts }} />
                            </WrapperUserForm>
                        })}

                        <LoadMoreDataBtn state={posts} fetchDataFunction={getPosts} additionalParam={{ draft: false, deletedDocCount: posts.deletedDocCount! }} />
                    </>
                ) : (
                    <NoDataMessage message="No published posts" />
                )}
                
                {/* {draft posts} */
                drafts == null ? (
                    <Loader />
                ) : (
                    drafts.results.length
                ) ? (
                    <>
                        {drafts.results.map((post, index) => {
                            return <WrapperUserForm key={index} transition={{ delay: index * 0.04 }}>
                                <ManageDraftPostCard post={{ ...post, index, setStateFunction: setDrafts }} />
                            </WrapperUserForm>
                        })}

                        <LoadMoreDataBtn state={drafts} fetchDataFunction={getPosts} additionalParam={{ draft: true, deletedDocCount: drafts.deletedDocCount! }} />
                    </>
                ) : (
                    <NoDataMessage message="No draft posts" />
                )}
            </InPageNavigation>
        </>
    );
};
