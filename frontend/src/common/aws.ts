import axios from "axios";

type Props = {
    image: File;
};

export const uploadImage = async ({ image }: Props) => {
    try {
        const { data: { uploadURL } } = await axios.get(import.meta.env.VITE_API_URL + "/get-upload-url");
        await axios.put(uploadURL, image, {
            headers: { 'Content-Type': 'image/jpeg' }
        });
        
        return uploadURL.split("?")[0];
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};
