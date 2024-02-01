import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { UserProfile } from "../types/data";
import { profileDataStructure } from "../types/constant";
import { WrapperUserForm } from "../components/auxiliary_components/WrapperUserForm";
import Loader from "../components/auxiliary_components/Loader";
import toast, { Toaster } from "react-hot-toast";
import { InputBox } from "../components/userform_components/InputBox";
import { uploadImage } from "../common/aws";
import { storeInSession } from "../common/session";

export const EditProfile = () => {
    const {userAuth, userAuth: { access_token, username }, setUserAuth } = useContext(UserContext);
    const [profile, setProfile] = useState<UserProfile>(profileDataStructure);
    const [loading, setLoading] = useState(true);
    const {personal_info: {name, surname, username: profile_username, profile_img, email, bio }, social_links } = profile;
    const bioLimit = 150;
    const [charactersLeft, setCharactersLeft] = useState(150);
    const profileImgElement = useRef<HTMLImageElement | null>(null);
    const editProfileForm = useRef<HTMLFormElement>(null);
    const [updatedProfileImg, setUpdatedProfileImg] = useState<File | null>(null);

    const fetchUserProfile = async () => {
        try {
            if (access_token) {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/get-profile/${username}`);
                setProfile(response.data);
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [access_token]);

    

    const handleCharacterChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCharactersLeft(bioLimit - event.target.value.length)
    };

    const handlerImagePreview = (event: React.ChangeEvent<HTMLInputElement>) => {
        const img: File | null = event.target.files && event.target.files[0];
    
        if (img && profileImgElement.current) {
            profileImgElement.current.src = URL.createObjectURL(img);
            setUpdatedProfileImg(img);
        }
    };
    

    const handleImageUpload = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    
        if (updatedProfileImg) {
            const loadingToast = toast.loading("Uploading...");
            const buttonElement = event.currentTarget;
    
            if (buttonElement instanceof HTMLButtonElement) {
                buttonElement.setAttribute("disabled", "true");
    
                try {
                    const url = await uploadImage({ image: updatedProfileImg });
                    if (url) {
                        const response = await axios.put(import.meta.env.VITE_API_URL + "/update-profile-img", { url }, {
                            headers: { 'Authorization': `Bearer ${access_token}` }
                        });

                        const data = response.data;
                        const newUserAuth = { ...userAuth, profile_img: data.profile_img }
                        storeInSession("user", JSON.stringify(newUserAuth));
                        setUserAuth(newUserAuth);

                        setUpdatedProfileImg(null);
                        toast.success("Uploaded");
                    }
                } catch (error) {
                    console.log(error);
                    if (error instanceof Error) {
                        toast.error(error.message);
                    }
                } finally {
                    buttonElement.removeAttribute("disabled");
                    toast.dismiss(loadingToast);
                }
            }
        }
    };
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        let loadingToast;
    
        try {
            event.preventDefault();
    
            if (editProfileForm.current) {
                const form = new FormData(editProfileForm.current);
                const formData: Record<string, string | File> = {};
    
                form.forEach((value, key) => {
                    formData[key] = value as string | File;
                });
    
                const { username, bio, youtube, facebook, twitter, github, instagram, website } = formData;
    
                if (typeof username === "string" && username.length < 3) {
                    return toast.error("Username should be at least 3 letters long");
                }
    
                if (typeof bio === "string" && bio.length > bioLimit) {
                    return toast.error(`Bio should not be more than ${bioLimit}`);
                }
    
                loadingToast = toast.loading("Updating...");
                event.currentTarget.setAttribute("disabled", "true");
    
                const response = await axios.put(`${import.meta.env.VITE_API_URL}/update-profile`,
                    {
                        username,
                        bio,
                        social_links: { youtube, facebook, twitter, github, instagram, website }
                    },
                    { headers: { 'Authorization': `Bearer ${access_token}` } }
                );
    
                const { data } = response;
    
                if (data.updatedUsername && userAuth.username !== data.updatedUsername) {
                    const newUserAuth = { ...userAuth, username: data.updatedUsername };
                    storeInSession("user", JSON.stringify(newUserAuth));
                    setUserAuth(newUserAuth);
                }
    
                toast.dismiss(loadingToast);
                event.currentTarget.removeAttribute("disabled");
                toast.success("Profile updated");
            }
        } catch (error) {
            console.error(error);
            toast.dismiss(loadingToast);
            event.currentTarget.removeAttribute("disabled");
            if (axios.isAxiosError(error) && error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error("An unknown error occurred");
            }
        }
    };

    return (
        <WrapperUserForm>
            {loading ? (
                <Loader />
            ) : (
                <form ref={editProfileForm}>
                    <Toaster />

                    <h1 className="max-md:hidden">Edit profile</h1>

                    <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
                        <div className="max-lg:center mb-5">
                            <label
                                htmlFor="uploadImg"
                                id="profileImgLabel"
                                className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden"
                            >
                                <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/30 opacity-0 hover:opacity-100 cursor-pointer">
                                    Upload Image
                                </div>
                                <img ref={profileImgElement} src={profile_img} />
                            </label>

                            <input
                                type="file"
                                id="uploadImg"
                                accept=".png, .jpg, .jpeg"
                                hidden
                                onChange={handlerImagePreview}
                            />

                            <button 
                                className="btn-light mt-5 max-lg:center lg:w-full px-10"
                                onClick={handleImageUpload}    
                            >
                                Upload
                            </button>
                        </div>

                        <div className="w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                                <div>
                                    <InputBox 
                                        name="name" 
                                        type="text"
                                        value={name}
                                        placeholder="Name"
                                        disable={true}
                                        icon="fi-rr-user"
                                    />
                                </div>
                                <div>
                                    <InputBox 
                                        name="surname" 
                                        type="text"
                                        value={surname}
                                        placeholder="Surname"
                                        disable={true}
                                        icon="fi-rr-user"
                                    />
                                </div>
                            </div>
                            <InputBox 
                                name="email" 
                                type="email"
                                value={email}
                                placeholder="Email"
                                disable={true}
                                icon="fi-rr-envelope"
                            />

                            <InputBox 
                                type="text" 
                                name="username"
                                value={profile_username}
                                placeholder="Username"
                                icon="fi-rr-at"
                            />

                            <p className="text-dark-grey -mt-3">Username will use to search and will be visible to all users</p>

                            <textarea
                                name="bio"
                                maxLength={bioLimit}
                                defaultValue={bio}
                                className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5"
                                placeholder="Bio"
                                onChange={handleCharacterChange}
                            ></textarea>

                            <p className="mt-1 text-dark-grey">{ charactersLeft } characters left</p>

                            <p className="my-6 text-dark-grey">Add your social handles below</p>

                            <div className="md:grid md:grid-cols-2 gap-x-6">
                                {Object.keys(social_links).map((key, index) => {
                                    const link = social_links[key as keyof typeof social_links];

                                    return <InputBox 
                                        key={index}
                                        name={key}
                                        type="text"
                                        value={link}
                                        placeholder="https://"
                                        icon={"fi " + (key != 'website' ? "fi-brands-" + key : "fi-rr-globe")}
                                    />
                                })}
                            </div>

                            <button 
                                className="btn-dark w-auto px-10"
                                type="submit"   
                                onClick={handleSubmit}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </WrapperUserForm>
    );
};
