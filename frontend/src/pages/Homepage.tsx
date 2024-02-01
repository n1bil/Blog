import axios from "axios";
import {InPageNavigation, activeTabRef} from "../components/homepage_components/InPageNavigation";
import { WrapperUserForm } from "../components/auxiliary_components/WrapperUserForm";
import { useEffect, useState } from "react";
import Loader from "../components/auxiliary_components/Loader";
import { PostCard } from "../components/homepage_components/PostCard";
import { LastPostsResult, TrendPosts } from "../types/data";
import { TrendPost } from "../components/homepage_components/TrendPost";
import { NoDataMessage } from "../components/homepage_components/NoDataMessage";
import {filterPaginationData, filterPaginationDataByCategory} from "../common/filter_pagination";
import { LoadMoreDataBtn } from "../components/homepage_components/LoadMoreData";

export const Homepage = () => {
    const [posts, setPosts] = useState<LastPostsResult>();
    const [trendingPosts, setTrendingPosts] = useState<TrendPosts[]>();
    const [pageState, setPageState] = useState("home");
    const categories = ["programming", "movie", "sport", "social media", "cooking", "tech", "history", "travel"];
    // const page = 1;

    const fetchLatestPosts = async (page: number) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/latest-posts/${page}`);
            const data = response.data;
            const formattedData = await filterPaginationData({
                stateArray: posts,
                newDataFromBackend: data.posts,
                page,
                countRoute: "/all-latest-posts-count",
            });

            setPosts(formattedData);
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error("An unknown error occurred");
            }
        }
    };

    const fetchBlogsByCategory = async (page: number) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/search-posts`, {
                params: { tag: pageState, page }
            });
            const data = response.data;

            const formattedData = await filterPaginationDataByCategory({
                stateArray: posts,
                newDataFromBackend: data.posts,
                page,
                countRoute: "/search-posts-count",
                data_to_send: { tag: pageState },
            });

            setPosts(formattedData);
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error("An unknown error occurred");
            }
        }
    };

    const fetchTrendPosts = async () => {
        try {
            const response = await axios.get(import.meta.env.VITE_API_URL + "/trending-posts");
            const data = response.data;

            setTrendingPosts(data.posts);
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error("An unknown error occurred");
            }
        }
    };

    const loadPostByCategory = (event: React.MouseEvent<HTMLButtonElement>) => {
        const category = (event.target as HTMLButtonElement).innerText.toLowerCase();

        setPosts(undefined);

        if (pageState == category) {
            setPageState("home");
            return;
        }

        setPageState(category);
    };

    useEffect(() => {
        activeTabRef.current?.click();

        if (pageState == "home") {
            fetchLatestPosts(1);        // it needed to be fixed
        } else {
            fetchBlogsByCategory(1);    // it needed to be fixed
        }

        if (!trendingPosts) {
            fetchTrendPosts();
        }
    }, [pageState]);

    return (
        <WrapperUserForm>
            <section className="h-cover flex justify-center gap-10">
                {/* latest posts */}
                <div className="w-full">
                    <InPageNavigation
                        routes={[pageState, "trending posts"]}
                        defaultHidden={["trending posts"]}
                    >
                        <>
                            {posts == null ? (
                                <Loader />
                            ) : posts.results.length ? (
                                posts.results.map((post, index) => {
                                    return (
                                        <WrapperUserForm transition={{duration:1, delay: index * 0.1 }} key={index}>
                                            <PostCard content={post} author={post.author.personal_info}/>
                                        </WrapperUserForm>
                                    );
                                })
                            ) : (
                                <NoDataMessage message="No blogs published" />
                            )}
                            <LoadMoreDataBtn
                                state={posts}
                                fetchDataFunction={({ page }) =>
                                    (pageState === "home"
                                        ? fetchLatestPosts
                                        : fetchBlogsByCategory)(page)
                                }
                            />
                        </>

                        {trendingPosts == null ? (
                            <Loader />
                        ) : trendingPosts.length ? (
                            trendingPosts.map((post, index) => {
                                return (
                                    <WrapperUserForm transition={{duration: 1, delay: index * 0.1 }} key={index}>
                                        <TrendPost post={post} index={index} />
                                    </WrapperUserForm>
                                );
                            })
                        ) : (
                            <NoDataMessage message="No trending posts" />
                        )}
                    </InPageNavigation>
                </div>

                {/* filters and trending posts */}
                <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
                    <div className="flex flex-col gap-10">
                        <div>
                            <h1 className="font-medium text-xl mb-8">
                                Stories form all interests
                            </h1>

                            <div className="flex gap-3 flex-wrap">
                                {categories.map((category, index) => {
                                    return (
                                        <button
                                            onClick={loadPostByCategory}
                                            className={"tag " + (pageState == category ? " bg-black text-white " : " ")}
                                            key={index}
                                        >
                                            {category}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <h1 className="font-medium text-xl mb-8">
                                Popular Articles{" "}
                                <i className="fi fi-rr-arrow-trend-up"></i>
                            </h1>
                            {trendingPosts == null ? (
                                <Loader />
                            ) : trendingPosts.length ? (
                                trendingPosts.map((post, index) => {
                                    return (
                                        <WrapperUserForm transition={{duration: 1, delay: index * 0.1 }} key={index}>
                                            <TrendPost post={post} index={index} />
                                        </WrapperUserForm>
                                    );
                                })
                            ) : (
                                <NoDataMessage message="No trending posts" />
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </WrapperUserForm>
    );
};
