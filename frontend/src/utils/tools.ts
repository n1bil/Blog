import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import { uploadImage } from "../common/aws";
import { ToolConstructable, ToolSettings } from "@editorjs/editorjs";

type Props = {
    image: File;
};

const uploadImageByFile = async (e: Props) => {
    const url = await uploadImage(e);    
    if (url) {
        return {
            success: 1,
            file: { url }
        };
    }
};

const uploadImageByURL = async (e: unknown) => {
    const link = new Promise((resolve, reject) => {
        try {
            resolve(e);
        } catch (err) {
            reject(err);
        }
    });

    const url = await link;
    return {
        success: 1,
        file: { url }
    };
};

export const tools: Record<string, ToolConstructable | ToolSettings> = {
    embed: Embed as ToolConstructable,
    link: {
        class: List as ToolConstructable,
        inlineToolbar: true,
    },
    image: {
        class: Image as ToolConstructable,
        config: {
            uploader: {
                uploadByUrl: uploadImageByURL,
                uploadByFile: uploadImageByFile,
            },
        },
    },
    header: {
        class: Header as ToolConstructable,
        config: {
            placeholder: "Type Heading...",
            levels: [2, 3],
            defaultLevel: 2,
        },
    },
    quote: {
        class: Quote as ToolConstructable,
        inlineToolbar: true,
    },
    marker: Marker as ToolConstructable,
    inlineCode: InlineCode as ToolConstructable,
};
