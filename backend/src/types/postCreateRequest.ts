export interface SearchPostsQueryStrings {
    tag: string;
    query: string;
    author: string;
    page?: number;
    limit?: number;
    eliminate_post?: string;
}

export interface SearchPostsCountQueryStrings {
    tag: string;
    query: string;
    author: string;
}

export interface UserRequest {
    name?: string;
    surname?: string;
    email: string;
    password: string;
}