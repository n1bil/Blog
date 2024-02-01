import { Request, Response } from "express";
import { changePasswordService, getUser, loginUser, registerUser, searchUser, updateProfileImgService, updateProfileService } from "../service/userService";
import { generateUploadURL } from "../util/utils";
import { UserRequest } from "../types/postCreateRequest";
import { AuthenticatedBodyRequest, ChangePassword, ChangeProfile } from "../types/authenticatedCreatePostRequest";

export const register = async (req: Request<object, object, UserRequest>, res: Response) => {
    try {        
        const { name, surname, email, password } = req.body;

        const userResponseDto = await registerUser(name!, surname!, email, password);

        return res.status(201).json(userResponseDto);
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(403).json({ error : error.message });
        }

        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const login = async (req: Request<object, object, UserRequest>, res: Response) => {
    try {
        const { email, password } = req.body;
        const userResponseDto = await loginUser(email, password);

        return res.status(200).json(userResponseDto);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
    }
};

export const getProfile = async (req: Request<{username: string}>, res: Response) => {
    try {
        const { username } = req.params;
    
        const user = await getUser(username);
        return res.status(200).json(user);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
    }
};

export const getUploadUrl = async (req: Request, res: Response) => {
    try {
        const url = await generateUploadURL();
        res.status(200).json({ uploadURL: url });
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ error: error.message });
        }
    }
};

export const searchUsers = async (req: Request<object, object, object, {query: string}>, res: Response) => {
    try {
        const { query } = req.query;

        if (typeof query === 'string') {
            const users = await searchUser(query);
            res.status(200).json({ users });
        } else {
            res.status(400).json({ error: 'Invalid query parameter' });
        }
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
    }
};

export const changePassword = async (req: AuthenticatedBodyRequest<ChangePassword>, res: Response) => {
    const user_id = req.user!._id;

    try {
        const { currentPassword, newPassword } = req.body;
        const status = await changePasswordService(user_id!, currentPassword, newPassword);

        return res.status(200).json(status);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        } else {
            return res.status(500).json({ error: "Unexpected error" });
        }
    }
};

export const updateProfileImg = async (req: AuthenticatedBodyRequest<{url: string}>, res: Response) => {
    const user_id = req.user!._id;

    try {
        const { url } = req.body;
        const profile_img = await updateProfileImgService(user_id, url);

        return res.status(200).json(profile_img);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        } else {
            return res.status(500).json({ error: "Unexpected error" });
        }
    }

};

export const updateProfile = async (req: AuthenticatedBodyRequest<ChangeProfile>, res: Response) => {
    const user_id = req.user!._id;

    try {
        const { username, bio, social_links } = req.body;
        const updatedUsername = await updateProfileService(user_id, username, bio, social_links);

        return res.status(200).json(updatedUsername);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        } else {
            return res.status(500).json({ error: "Unexpected error" });
        }
    }
};