import { CreatePostParams, UserAuth } from './../types/authenticatedCreatePostRequest';
import { nanoid } from "nanoid";
import Blog from "../model/Blog";
import User from "../model/User";
import Notification from "../model/Notification";
import Comment from "../model/Comment";
import { ObjectId } from 'mongodb';

export const getLastPosts = async (page: number) => {
    const maxLimit = 5
    const skip = (page - 1) * maxLimit;

    try {
        return await Blog.aggregate([
            { $match: { draft: false } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $unwind: '$author'
            },
            {
                $project: {
                    _id: 0,
                    activity: 1,
                    blog_id: 1,
                    title: 1,
                    banner: 1,
                    des: 1,
                    tags: 1,
                    publishedAt: 1,
                    author: {
                        personal_info: {
                            name: '$author.personal_info.name',
                            surname: '$author.personal_info.surname',
                            username: '$author.personal_info.username',
                            profile_img: '$author.personal_info.profile_img'
                        }
                    }
                }
            },
            { $sort: { "publishedAt": -1 } },
            { $skip: skip },
            { $limit: 5 }
        ]);
    } catch (err) {
        if (err instanceof Error) {
            return new Error(err.message);
        }
    }
};

export const getFilterLastPosts = async () => {
    try {
        return await Blog.countDocuments({ draft: false });
    } catch (err) {
        if (err instanceof Error) {
            return new Error(err.message);
        }
    }
};

export const getTrendPosts = async () => {
    try {
        return await Blog.aggregate([
            { $match: { draft: false } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $unwind: '$author'
            },
            {
                $project: {
                    _id: 0,
                    blog_id: 1,
                    title: 1,
                    publishedAt: 1,
                    author: {
                        personal_info: {
                            name: '$author.personal_info.name',
                            surname: '$author.personal_info.surname',
                            username: '$author.personal_info.username',
                            profile_img: '$author.personal_info.profile_img'
                        }
                    }
                }
            },
            {
                $sort: {
                    'activity.total_likes': -1,
                    'activity.total_reads': -1,
                    publishedAt: -1
                }
            },
            { $limit: 5 }
        ]);
    } catch (err) {
        if (err instanceof Error) {
            return new Error(err.message);
        }
    }
};

export const searchServicePosts = async (tag: string, query: string, author: string, page: number, limit: number, eliminate_post: string) => {
    const maxLimit = limit ? limit : 2;
    const skip = (page - 1) * maxLimit;
    let findQuery;    

    if (tag) {
        findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_post } };
    } else if (query) {
        findQuery = { draft: false , title: new RegExp(query, 'i') };
    } else if (author) {
        findQuery = { author: new ObjectId(author), draft: false }
    } else {
        findQuery = { draft: false };
    }

    try {
        return await Blog.aggregate([
            { $match: findQuery },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $unwind: '$author'
            },
            {
                $project: {
                    _id: 0,
                    activity: 1,
                    blog_id: 1,
                    title: 1,
                    banner: 1,
                    des: 1,
                    tags: 1,
                    publishedAt: 1,
                    author: {
                        personal_info: {
                            name: '$author.personal_info.name',
                            surname: '$author.personal_info.surname',
                            username: '$author.personal_info.username',
                            profile_img: '$author.personal_info.profile_img'
                        }
                    }
                }
            },
            { $sort: { "publishedAt": -1 } },
            { $skip: skip },
            { $limit: 2 }
        ]);
    } catch (err) {
        if (err instanceof Error) {
            return new Error(err.message);
        }
    }
};

export const searchServicePostsCount = async (tag: string, author: string, query: string) => {
    let findQuery;

    if (tag) {
        findQuery = { tags: tag, draft: false };
    } else if (query) {
        findQuery = { draft: false , title: new RegExp(query, 'i') };
    } else if (author) {
        findQuery = { author, draft: false }; 
    } else {
        findQuery = { draft: false };
    }

    try {
        return await Blog.countDocuments(findQuery);
    } catch (err) {
        if (err instanceof Error) {
            return new Error(err.message);
        }
    }
};

export const createPost = async (authorId: UserAuth, params: CreatePostParams) => {
    const { title, des, banner, tags, content, draft, id } = params;

    if (!title.length) {
        throw new Error("You must provide a title to publish the post");
    }

    if (!draft) {
        if (!des || des.length > 200) {
            throw new Error("You must provide post description under 200 characters");
        }
    
        if (!banner.length) {
            throw new Error("You must provide post banner to publish it");
        }
    
        if (!content.blocks.length) {
            throw new Error("There must be some post content to publish it");
        }
    
        if (!tags.length || tags.length > 10) {
            throw new Error("Provide tags in order to publish the post. Maximum 10");
        }
    }

    const formattedTags = tags.map((tag: string) => tag.toLowerCase());
    const post_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();

    if (id) {
        try {
            await Blog.findOneAndUpdate(
                { blog_id: post_id },
                { title, des, banner, content, tags, draft: draft ? draft : false }
            );

            return { id: post_id };

        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
        }
    } else {
        const post = new Blog({
        title, des: des, banner, content, tags: formattedTags, author: authorId, blog_id: post_id, draft: Boolean(draft)
        });

        const incrementValue = draft ? 0 : 1;

        try {
            const savedPost = await post.save();
            await User.findOneAndUpdate(
                { _id: authorId },
                { $inc: { "account_info.total_posts": incrementValue }, $push: { "blogs": savedPost._id } }
            );

            return { id: savedPost.blog_id };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
        }
    }
};

export const getPost = async (post_id: string, draft: boolean, mode: string) => {
    const incrementValue = mode != 'edit' ? 1 : 0;

    try {
        const post = await Blog.findOneAndUpdate(
            { blog_id: post_id} ,
            { $inc: { "activity.total_reads": incrementValue } }   
            ).populate<{ author: { _id: string, personal_info: { name: string, surname: string, username: string, profile_img: string } } }>('author', 'personal_info.name personal_info.surname personal_info.username personal_info.profile_img');

        if (!post) {
            throw new Error("Post not found");
        }       
        
        if (post.draft && !draft) {
            throw new Error("You can not access draft posts");
        }

        await User.findByIdAndUpdate(
            { _id: post.author._id },
            { $inc: { "account_info.total_reads": incrementValue } }
        )

        return post;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
    }
};

export const likePostService = async (user_id: UserAuth, blog_id: string, isLikedByUser: boolean) => {

    const incrementVal = !isLikedByUser ? 1 : -1;

    try {
        const post = await Blog.findOneAndUpdate(
            { _id: blog_id },
            { $inc: { "activity.total_likes": incrementVal } },
            { new: true }
        );

        if (!isLikedByUser) {
            const like = new Notification(
                { 
                    type: "like", 
                    blog: blog_id, 
                    notification_for: post!.author,
                    user: user_id
                }
            );

            await like.save();
            return { liked_by_user: true };
        } else {
            await Notification.findOneAndDelete({ user: user_id, blog: blog_id, type: "like" })
            return { liked_by_user: false };
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error(error);
            throw error.message;
        }
    }
};

export const isLiked = async (user_id: UserAuth, blog_id: string) => {
    return await Notification.exists(
        { user: user_id, type: "like", blog: blog_id }
    )
};

export const userWrittenPostsService = async (user_id: string, page: number, draft: boolean, query: string, deletedDocCount: number) => {
    const maxLimit = 5;
    let skipDocs = (page - 1) * maxLimit;

    if (deletedDocCount) {
        skipDocs -= deletedDocCount;
    }

    try {
        const posts = await Blog.find(
            { author: user_id, draft, title: new RegExp(query, 'i') }
        )
        .skip(skipDocs)
        .limit(maxLimit)
        .sort({ publishedAt: -1 })
        .select("title banner publishedAt blog_id activity des draft -_id ")
        .exec();

        return posts;
    } catch (error) {
        if (error instanceof Error) {
            throw error.message;
        }
    }
};

export const userWrittenPostsCountService = async (user_id: string, draft: boolean, query: string) => {
    try {
        const count = await Blog.countDocuments({ author: user_id, draft, title: new RegExp(query, 'i') });
        
        return count;
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            throw new Error(error.message);
        }
    }
};

export const deletePostService = async (user_id: string, blog_id: string) => {
    try {
        const post = await Blog.findOneAndDelete({ blog_id });
    
        await Notification.deleteMany({ blog: post?._id });
        console.log("Notifications deleted");
    
        await Comment.deleteMany({ blog_id: post?._id });
        console.log("Comments deleted");

        await User.findOneAndUpdate(
            { _id: user_id },
            { $pull: { blog: post?._id }, $inc: { "account_info.total_posts": -1 } }
        );
        console.log("Post deleted");
    
        return { status: 'done' };
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            throw new Error(error.message);
        }
    }
};