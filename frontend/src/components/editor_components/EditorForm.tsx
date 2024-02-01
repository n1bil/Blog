import { Link, useNavigate, useParams } from "react-router-dom";
import lightLogo from "../../assets/logo-color-light.png";
import darkLogo from "../../assets/logo-color-dark.png";
import { WrapperUserForm } from "../auxiliary_components/WrapperUserForm";
import lightBanner from "../../assets/blog banner light.png";
import darkBanner from "../../assets/blog banner dark.png";
import { uploadImage } from "../../common/aws";
import { useContext, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../../pages/Editor";
import EditorJS from "@editorjs/editorjs";
import { tools } from "../../utils/tools";
import axios from "axios";
import { ThemeContext, UserContext } from "../../App";

export const EditorForm = () => {
    const { post, post: { title, banner, content, tags, des }, setEditorState, setPost, textEditor, setTextEditor } = useContext(EditorContext);    
    const { userAuth: { access_token } } = useContext(UserContext);
    const { theme } = useContext(ThemeContext);
    const { blog_id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!textEditor.isReady) {
            setTextEditor(new EditorJS({
                holder: "textEditor",
                data: Array.isArray(content) ? content[0] : content,
                tools: tools,
                placeholder: "Let's write an awesome story"
            }));
        }
    }, []);

    const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const imageFile: File | null = event.target.files && event.target.files[0];
    
            if (imageFile) {
                const loadingToast = toast.loading("Uploading...");
    
                try {
                    const url = await uploadImage({ image: imageFile });
    
                    if (url) {
                        toast.dismiss(loadingToast);
                        toast.success("Uploaded");

                        setPost({ ...post, banner: url })
                    }
                } catch (err) {
                    toast.dismiss(loadingToast);
                    if (err instanceof Error) {
                        toast.error(err.message);
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleTitleKeyDown = (event: React.KeyboardEvent) => {
        if (event.keyCode == 13) {
            event.preventDefault();
        }
    };

    const handleTitleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = event.target;
    
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + "px";

        setPost({ ...post, title: textarea.value })
    };

    const handleError = (event: React.ChangeEvent<HTMLImageElement>) => {
        const image = event.target;
    
        image.src = theme == 'light' ? lightBanner : darkBanner;
    };

    const handlePublishEvent = async () => {
        if (!banner.length) {
            return toast.error("Upload a blog banner tu publish it");
        }

        if (!title.length) {
            return toast.error("Write blog title to publish it");
        }

        try {
            const data = await textEditor.save();
        
            if (data.blocks.length) {
                setPost({ ...post, content: data });
                setEditorState("publish");
            } else {
                toast.error("Write something in your post to publish it");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleSaveDraft = async (event: React.MouseEvent<HTMLButtonElement>) => {
        const target = event.target as HTMLElement;
        if (target.className.includes("disable")) {
            return;
        }

        if (!title.length) {
            return toast.error("Write post title before saving it as a draft");
        }

        const loadingToast = toast.loading("Saving Draft...");
        target.classList.add('disable');

        if (textEditor.isReady) {
            try {
                const content = await textEditor.save();
                const postObj = { title, banner, des, content, tags, draft: true };
        
                await axios.post(import.meta.env.VITE_API_URL + "/create-post", { ...postObj, id: blog_id }, { 
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                });
        
                target.classList.remove('disable');
                toast.dismiss(loadingToast);
                toast.success("Saved");
        
                setTimeout(() => {
                    navigate("/dashboard/posts?tab=draft");
                }, 500);
            } catch (error) {
                target.classList.remove('disable');
                toast.dismiss(loadingToast);
        
                if (axios.isAxiosError(error) && error.response?.data?.error) {
                    toast.error(error.response.data.error);
                } else {
                    toast.error("An unknown error occurred");
                }
            }
        }

        
    };

    return (
      <>
        <nav className="navbar">
            <Link to="/" className="flex-none w-10">
                <img src={ theme == 'dark' ? darkLogo : lightLogo } alt="logo" />
            </Link>
            <p className="max-md:hidden text-black line-clamp-1 w-full">
                { title.length ? title : 'New Post' }
            </p>

            <div className="flex gap-4 ml-auto">
                <button className="btn-dark py-2"
                    onClick={handlePublishEvent}    
                >
                    Publish
                </button>
                <button className="btn-light py-2"
                    onClick={handleSaveDraft}
                >
                    Save Draft
                </button>
            </div>
        </nav>
        <Toaster />
        <WrapperUserForm>
            <section>
                <div className="mx-auto max-w-[900px] w-full">
                    <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
                        <label htmlFor="uploadBanner">
                          <img 
                              alt="Banner"
                              src={banner}
                              className="z-20"
                              onError={handleError}
                          />
                            <input
                                id="uploadBanner"
                                type="file"
                                accept=".png, .jpg, .jpeg"
                                hidden
                                onChange={handleBannerUpload}
                            />
                        </label>
                    </div>

                    <textarea
                        defaultValue={title}
                        placeholder="Content Title"
                        className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 bg-white"
                        onKeyDown={handleTitleKeyDown}
                        onChange={handleTitleChange}
                    ></textarea>

                    <hr className="w-full opacity-10 my-5" />

                    <div id="textEditor" className="font-gelasio"></div>
                </div>
            </section>
        </WrapperUserForm>
      </>
    );
};