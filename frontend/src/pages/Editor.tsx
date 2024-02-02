import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import { EditorForm } from "../components/editor_components/EditorForm";
import { PublishForm } from "../components/editor_components/PublishForm";
import Loader from "../components/auxiliary_components/Loader";
import axios from "axios";
import EditorJS, { OutputData } from "@editorjs/editorjs";

interface PostData {
    title: string;
    banner: string;
    content: { blocks: string[]; } | OutputData
    tags: string[];
    des: string;
    author: { personal_info: object };
}

interface TextEditor {
    isReady: boolean;
    save: () => Promise<{ blocks: string[] }>;
}

interface EditorContextType {
    post: PostData;
    setPost: React.Dispatch<React.SetStateAction<PostData>>;
    editorState: string;
    setEditorState: React.Dispatch<React.SetStateAction<string>>;
    textEditor: TextEditor | EditorJS;
    setTextEditor: React.Dispatch<React.SetStateAction<TextEditor | EditorJS>>;
}

const structure: PostData = {
    title: "",
    banner: "",
    content: { blocks: [] },
    tags: [],
    des: "",
    author: { personal_info: {} },
};

export const EditorContext = createContext<EditorContextType>({
    post: structure,
    setPost: () => {},
    editorState: "",
    setEditorState: () => {},
    textEditor: {
        isReady: false,
        save: async () => ({ blocks: [] }) 
    },
    setTextEditor: () => {},
});

export const Editor = () => {
    const [post, setPost] = useState<PostData>(structure);
    const [editorState, setEditorState] = useState("editor");
    const [textEditor, setTextEditor] = useState<TextEditor | EditorJS>({ isReady: false, save: async () => ({ blocks: [] }) });
    const { userAuth: { access_token } } = useContext(UserContext);
    const { blog_id } = useParams();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPost();
    }, [blog_id]);

    const fetchPost = async () => {
        try {
            if (blog_id) {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/get-post/${blog_id}?draft=true&mode=edit`);
                const { data: { post } } = response;
            
                setPost(post);
            }
            setLoading(false);
        } catch (error) {
            console.error(error instanceof Error ? error.message : "Unknown error");
            setPost(structure);
            setLoading(false);
        }
    };

    return (
        <EditorContext.Provider value={{ post, setPost, editorState, setEditorState, textEditor, setTextEditor }}>
            {access_token == null ? (
                <Navigate to="/signin" />
            ) : loading ? (
                <Loader />
            ) : editorState == "editor" ? (
                <EditorForm />
            ) : (
                <PublishForm />
            )}
        </EditorContext.Provider>
    );
};