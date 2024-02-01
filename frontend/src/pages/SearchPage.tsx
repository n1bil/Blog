import { useParams } from "react-router-dom";
import { InPageNavigation } from "../components/homepage_components/InPageNavigation";
import { useEffect, useState } from "react";
import Loader from "../components/auxiliary_components/Loader";
import { LastPostsResult, User } from "../types/data";
import { WrapperUserForm } from "../components/auxiliary_components/WrapperUserForm";
import { PostCard } from "../components/homepage_components/PostCard";
import { NoDataMessage } from "../components/homepage_components/NoDataMessage";
import axios from "axios";
import { filterPaginationDataByCategory } from "../common/filter_pagination";
import { LoadMoreDataBtn } from "../components/homepage_components/LoadMoreData";
import { UserCard } from "../components/search_components/UserCard";

export const SearchPage = () => {
    const { query } = useParams();
    const [posts, setPosts] = useState<LastPostsResult>();
    const [users, setUsers] = useState<User[]>();

    const searchPosts = async ({ page = 1, create_new_arr = false }) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/search-posts`, {
                params: { query: query, page: page }
            });
            const data = response.data;
            const formattedData = await filterPaginationDataByCategory({
                stateArray: posts,
                newDataFromBackend: data.posts,
                page,
                countRoute: "/search-posts-count",
                data_to_send: { query },
                create_new_arr,
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

    const fetchUsers = async () => {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/search-users?query=${query}`);
        const data = response.data;
        setUsers(data.users);
    };

    useEffect(() => {
        resetState();
        searchPosts({ page: 1, create_new_arr: true });
        fetchUsers();
    }, [query]);

    const resetState = () => {
        setPosts(undefined);
        setUsers(undefined);
    };

    const UserCardWrapper = () => {
        return (
            <>
                {users == null ? (
                    <Loader />
                ) : users.length ? (
                    users.map((user, index) => {
                        return <WrapperUserForm key={index} transition={{duration: 1, delay: index*0.08}}>
                            <UserCard user={user}/>
                        </WrapperUserForm>
                    })
                ) : (
                    <NoDataMessage message="No user found" />
                )}
            </>
        );
    };

    return (
        <section className="h-cover flex justify-center gap-10">
            <div className="w-full">
                <InPageNavigation routes={[`Search Results from "${query}"`, "Accounts Matched"]} defaultHidden={["Accounts Matched"]}>
                    <>
                        {posts == null ? (
                            <Loader />
                        ) : posts.results.length ? (
                            posts.results.map((post, index) => {
                                return (
                                    <WrapperUserForm
                                        transition={{
                                            duration: 1,
                                            delay: index * 0.1,
                                        }}
                                        key={index}
                                    >
                                        <PostCard
                                            content={post}
                                            author={post.author.personal_info}
                                        />
                                    </WrapperUserForm>
                                );
                            })
                        ) : (
                            <NoDataMessage message="No blogs published" />
                        )}
                        <LoadMoreDataBtn
                            state={posts}
                            fetchDataFunction={({ page }) =>
                                searchPosts({ page, create_new_arr: true })
                            }
                        />
                    </>

                    <UserCardWrapper />

                </InPageNavigation>
            </div>

            <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
                <h1 className="font-medium text-xl mb-8">User related to search <i className="fi fi-rr-user mt-1"></i></h1>

                <UserCardWrapper />
            </div>
        </section>
    );
};
