import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LastPostsResult, UserProfile } from "../types/data";
import axios from "axios";
import { WrapperUserForm } from "../components/auxiliary_components/WrapperUserForm";
import Loader from "../components/auxiliary_components/Loader";
import { UserContext } from "../App";
import { AboutUser } from "../components/profile_user_components/AboutUser";
import { filterPaginationDataByCategory } from "../common/filter_pagination";
import { InPageNavigation } from "../components/homepage_components/InPageNavigation";
import { PostCard } from "../components/homepage_components/PostCard";
import { NoDataMessage } from "../components/homepage_components/NoDataMessage";
import { LoadMoreDataBtn } from "../components/homepage_components/LoadMoreData";
import { PageNotFound } from "./PageNotFound";

export const ProfilePage = () => {
    const { id: profileId } = useParams();
    const [profile, setProfile] = useState<UserProfile>();
    const [loading, setLoading] = useState(true);
    const {userAuth: { username }} = useContext(UserContext);
    const [posts, setPosts] = useState<LastPostsResult>();
    const [profileLoaded, setProfileLoaded] = useState<string | undefined>("");
    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/get-profile/${profileId}`);
            const user = response.data;
            if (user != null) {
                setProfile(user);
            }
            setProfileLoaded(profileId);
            getPosts({ user_id: user._id });
            setLoading(false);
        } catch (error) {
            if (error instanceof Error) {
                console.log(error);
                setLoading(false);
            } else {
                console.log("An unknown error occurred");
            }
        }
    };

    const getPosts = async ({page = 1, user_id}: {page?: number; user_id?: string | undefined;}) => {
        user_id = user_id == undefined ? posts?.user_id : user_id;

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/search-posts`, {
                params: { author: user_id, page: page }
            });
            const data = response.data;

            const formattedDate = await filterPaginationDataByCategory({
                stateArray: posts,
                newDataFromBackend: data.posts,
                page,
                countRoute: "/search-posts-count",
                data_to_send: { author: user_id },
            });

            formattedDate.user_id = user_id;
            setPosts(formattedDate);
        } catch (error) {
            if (error instanceof Error) {
                console.log(error);
                setLoading(false);
            } else {
                console.log("An unknown error occurred");
            }
        }
    };

    useEffect(() => {
        if (profileId != profileLoaded) {
            setPosts(undefined);
        }

        if (posts == null) {
            resetStates();
            fetchUserProfile();
        }
    }, [profileId, posts]);

    const resetStates = () => {
        setProfile(undefined);
        setLoading(true);
        setProfileLoaded("");
    };

    return (
        <WrapperUserForm>
            {loading ? (
                <Loader />
            ) : profile?.personal_info.username.length ? (
                <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
                    <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-10">
                        <img
                            src={profile?.personal_info.profile_img}
                            className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32"
                        />

                        <h1 className="text-2xl font-medium">@{profile?.personal_info.username}</h1>
                        <p className="text-xl capitalize h-6">
                            {profile?.personal_info.name}{" "}
                            {profile?.personal_info.surname}
                        </p>

                        <p>
                            {profile?.account_info.total_posts.toLocaleString()}{" "}
                            Posts -{" "}
                            {profile?.account_info.total_reads.toLocaleString()}{" "}
                            Reads
                        </p>

                        <div className="flex gap-4 mt-2">
                            {profileId == username ? (
                                <Link to="/settings/edit-profile" className="btn-light rounded-md">
                                    Edit Profile
                                </Link>
                            ) : (
                                " "
                            )}
                        </div>

                        <AboutUser className="max-md:hidden" profile={profile} />
                    </div>

                    <div className="max-md:mt-12 w-full">
                        <InPageNavigation routes={["Posts Published", "About"]} defaultHidden={["About"]}>
                            <>
                                {posts == null ? (
                                    <Loader />
                                ) : posts.results.length ? (
                                    posts.results.map((post, index) => {
                                        return (
                                            <WrapperUserForm transition={{duration: 1, delay: index * 0.1}} key={index}>
                                                <PostCard content={post} author={post.author.personal_info}/>
                                            </WrapperUserForm>
                                        );
                                    })
                                ) : (
                                    <NoDataMessage message="No blogs published" />
                                )}
                                <LoadMoreDataBtn state={posts} fetchDataFunction={getPosts}/>
                            </>

                            <AboutUser profile={profile} />
                        </InPageNavigation>
                    </div>
                </section>
            ) : (
                <PageNotFound />
            )}
        </WrapperUserForm>
    );
};
