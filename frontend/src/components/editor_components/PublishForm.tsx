import toast, { Toaster } from "react-hot-toast";
import { WrapperUserForm } from "../auxiliary_components/WrapperUserForm";
import { useContext } from "react";
import { EditorContext } from "../../pages/Editor";
import { Tag } from "./Tags";
import axios from "axios";
import { UserContext } from "../../App";
import { useNavigate, useParams } from "react-router-dom";

export const PublishForm = () => {
    const { post, post: {banner, title, tags, des, content}, setEditorState, setPost } = useContext(EditorContext);
    const { userAuth: { access_token } } = useContext(UserContext);
    const { blog_id } = useParams()
    const navigate = useNavigate();
    const characterLimit = 200;
    const tagLimit = 10;

    const handleCloseEvent = () => {
        setEditorState("editor");
    };

    const handleBlogTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target;

        setPost({ ...post, title: input.value })
    };

    const handlePostDescription = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const input = event.target;
        
        setPost({ ...post, des: input.value });
    };

    const handleTitleKeyDown = (event: React.KeyboardEvent) => {
        if (event.keyCode == 13) {
            event.preventDefault();
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.keyCode == 13 || event.keyCode == 188) {
            event.preventDefault();

            const tag = event.currentTarget.value;

            if (tags.length < tagLimit) {
                if (!tags.includes(tag) && tag.length) {
                    setPost({ ...post, tags: [ ...tags, tag ] })
                }
            } else {
                toast.error(`You can add max ${tagLimit} Tags`)
            }

            event.currentTarget.value = '';
        }  
    };

    const publishPost = async (event: React.MouseEvent<HTMLButtonElement>) => {
        const target = event.target as HTMLElement;
        if (target.className.includes("disable")) {
            return;
        }

        if (!title.length) {
            return toast.error("Write post title before publishing");
        } 

        if (!des.length || des.length > characterLimit) {
            return toast.error(`Write a description about your post ${characterLimit} characters to publish`);
        }

        if (!tags.length) {
            return toast.error("Enter at least 1 tag to help us rank your post");
        }

        const loadingToast = toast.loading("Publishing...");
        target.classList.add('disable');
        const postObj = { title, banner, des, content, tags, draft: false };        

        try {
            await axios.post(import.meta.env.VITE_API_URL + "/create-post", { ...postObj, id: blog_id }, { 
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });
        
            target.classList.remove('disable');
            toast.dismiss(loadingToast);
            toast.success("Published");
        
            setTimeout(() => {
                navigate("/dashboard/posts");
            }, 500);
        } catch (error) {
            target.classList.remove('disable');
            toast.dismiss(loadingToast);
        
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unknown error occurred");
            }
        }
        
    };

    return (
        <WrapperUserForm>
            <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
                <Toaster />

                <button
                    className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
                    onClick={handleCloseEvent}
                >
                    <i className="fi fi-br-cross"></i>
                </button>

                <div className="max-w-[550px] center">
                    <p className="text-dark-grey mb-1">Preview</p>

                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
                        <img src={banner} alt="" />
                    </div>

                    <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-1">{title}</h1>

                    <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">{des}</p>
                </div>

                <div className="border-grey lg:border-1 lg:pl-8">
                    <p className="text-dark-grey mb-2 mt-9">Post Title</p>
                    <input type="text" placeholder="Post Title" defaultValue={title} className="input-box pl-4" 
                        onChange={handleBlogTitleChange}
                    />

                    <p className="text-dark-grey mb-2 mt-9">Short description</p>
                    <textarea
                        maxLength={characterLimit}
                        defaultValue={des}
                        className="h-40 resize-none leading-7 input-box pl-4"
                        onChange={handlePostDescription}
                        onKeyDown={handleTitleKeyDown}
                    ></textarea>

                    <p className="mt-1 text-dark-grey text-sm text-right">{ characterLimit - des.length } characters left</p>

                    <p className="text-dark-grey mb-2 mt-9">Topics - ( Helps is searching and ranking your post )</p>

                    <div className="relative input-box pl-2 py-2 pb-4">
                        <input type="text" placeholder="Topic" className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white" 
                          onKeyDown={handleKeyDown}
                        />
                        
                        {tags.map((tag, index) => {
                            return <Tag tag={tag} tagIndex={index} key={index} />
                        })}

                    </div>

                    <p className="mt-1 mb-4 text-dark-grey text-right">{ tagLimit - tags.length } Tags left</p>
                    
                    <button className="btn-dark px-8"
                        onClick={publishPost}
                    >Publish</button>

                </div>
            </section>
        </WrapperUserForm>
    );
};
