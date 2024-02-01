export interface Comment {
    _id: string;
    blog_id: string;
    blog_author: string;
    comment: string;
    children: Comment[];
    commented_by: {
      personal_info: {
        name: string;
        surname: string;
        username: string;
        profile_img: string;
      };
      _id?: string;
    };
    isReply: boolean;
    commentedAt: string;
    updatedAt: string;
    __v: number;
    childrenLevel: number;
}