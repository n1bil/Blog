import { nanoid } from "nanoid";
import User from "../model/User";
import aws from "aws-sdk";


export const generateUsername = async (email: string) => {
    let username = email.split("@")[0];
    const usernameExists = await User.exists({ "personal_info.username": username });
    usernameExists ? (username += nanoid().substring(0, 5)) : "";

    return username;
};


// setting up s3 bucket
const s3 = new aws.S3({
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

export const generateUploadURL = async () => {
    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

    return await s3.getSignedUrlPromise('putObject', {
        Bucket: 'quill-hub',
        Key: imageName,
        Expires: 1000,
        ContentType: "image/jpeg"
    })
};