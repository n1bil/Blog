import User from "../model/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateUsername } from "../util/utils";
import { emailRegex, isDuplicateEmailError, passwordRegex } from "../util/rules";

interface UserResponseDto {
    access_token: string;
    profile_img?: string;
    name: string;
    surname: string;
    username: string;
}

export const registerUser = async (name: string, surname: string, email: string, password: string): Promise<UserResponseDto> => {
    try {
        if (name.length < 3) {
            throw new Error("Name must be at least 3 letters long");
        }

        if (surname.length < 3) {
            throw new Error("Surname must be at least 3 letters long");
        }

        if (!email.length) {
            throw new Error("Enter Email");
        }

        if (!emailRegex.test(email)) {
            throw new Error("Email is invalid");
        }

        if (!passwordRegex.test(password)) {
            throw new Error(
                "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters"
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const username = await generateUsername(email);

        const user = new User({
            personal_info: {
                name,
                surname,
                email,
                password: hashedPassword,
                username,
            },
        });

        const savedUser = await user.save();

        const access_token = jwt.sign(
            { _id: user._id },
            process.env.JWT_SECRET!
        );

        const userResponseDto: UserResponseDto = {
            access_token,
            username: savedUser.personal_info.username,
            name: savedUser.personal_info.name,
            surname: savedUser.personal_info.surname,
            profile_img: savedUser.personal_info.profile_img,
        };

        return userResponseDto;
    } catch (error) {
        if (isDuplicateEmailError(error)) {
            throw new Error('Email already exists');
        } else {
            throw error;
        }
    }
};

export const loginUser = async ( email: string, password: string): Promise<UserResponseDto> => {
    const foundUser = await User.findOne({ "personal_info.email": email });

    if (!foundUser) {
        throw new Error("Email not found");
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        foundUser.personal_info.password
    );

    if (!isPasswordCorrect) {
        throw new Error("Invalid password");
    } else {
        const userResponseDto: UserResponseDto = {
            username: foundUser.personal_info.username,
            name: foundUser.personal_info.name,
            surname: foundUser.personal_info.surname,
            profile_img: foundUser.personal_info.profile_img,
            access_token: jwt.sign(
                { _id: foundUser._id },
                process.env.JWT_SECRET!
            ),
        };

        return userResponseDto;
    }
};

export const searchUser = async (query: string) => {
    try {
        return await User.aggregate([
            {
                $match: {
                    "personal_info.username": {
                        $regex: query,
                        $options: 'i' 
                    }
                }
            },
            {
                $limit: 50
            },
            {
                $project: {
                    _id: 0,
                    personal_info: {
                        name: 1,
                        surname: 1,
                        username: 1,
                        profile_img: 1
                    }
                }
            }
        ]);
    } catch (err) {
        if (err instanceof Error) {
            throw err;
        }
    }
};

export const getUser = async (username: string) => {
    try {
        return User.findOne(
            { "personal_info.username": username },
            { 
                "personal_info.password": 0,
                "google_auth": 0,
                "updatedAt": 0,
                "blogs": 0,
            }
        );
    } catch (err) {
        if (err instanceof Error) {
            throw err;
        }
    }
};

export const changePasswordService = async (user_id: string, currentPassword: string, newPassword: string) => {
    try {
        if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
            throw new Error("Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters");
        }

        const user = await User.findOne({ _id: user_id });

        if (!user) {
            throw new Error("User not found");
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.personal_info.password);

        if (!passwordMatch) {
            throw new Error("Incorrect current password");
        }

        const hashed_password = await bcrypt.hash(newPassword, 10);

        await User.findOneAndUpdate({ _id: user_id }, { "personal_info.password": hashed_password });

        return { status: 'Password changed' };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error("Some error occurred while changing the password, please try again later");
        } else {
            throw new Error("Unexpected error");
        }
    }
};

export const updateProfileImgService = async (user_id: string, url: string) => {
    try {
        await User.findOneAndUpdate(
            { _id: user_id },
            { "personal_info.profile_img": url }
        );

        return { profile_img: url };
    } catch (error) {
        if (error instanceof Error) {
            throw error.message;
        }
    }
};

export const updateProfileService = async (user_id: string, username: string, bio: string, social_links: object) => {
    const bioLimit = 150;

    if (username.length < 3) {
        throw new Error("Username should be at least 3 letters long")
    }

    if (bio.length > bioLimit) {
        throw new Error(`Bio should not be more than ${bioLimit} characters`);
    }

    const socialLinksArr = Object.keys(social_links);

    for (let i = 0; i < socialLinksArr.length; i++) {
        const key: string = socialLinksArr[i];
        if ((social_links as Record<string, string>)[key].length) {
            try {
                const hostname = new URL((social_links as Record<string, string>)[key]).hostname;

                if (!hostname.includes(`${key}.com`) && key !== 'website') {
                    throw new Error(`${key} link is invalid. You must enter a full link`);
                }
            } catch (error) {
                throw new Error("You must provide full social links with http(s) included");
            }
        }
    }

    const UpdateObj = {
        "personal_info.username": username,
        "personal_info.bio": bio,
        social_links
    };

    try {
        await User.findOneAndUpdate(
            { _id: user_id },
            UpdateObj,
            { runValidators: true }
        );

        return username;
    } catch (error) {
        if (isDuplicateEmailError(error)) {
            throw new Error('Username is already taken');
        } else {
            throw error;
        }
    }

};