import axios from "axios";
import { LastPosts, LastPostsResult } from "../types/data";
import { NotificationResponse, NotificationResult } from "../types/notification";
import { UserWrittenPostsResponse, UserWrittenPostsResult } from "../types/postResponse";

interface FilterPaginationDataParams {
    create_new_arr?: boolean;
    stateArray?: LastPostsResult | null;
    newDataFromBackend: LastPosts[];
    page: number;
    countRoute: string;
    data_to_send?: object;
}

interface FilterNotificationPaginationDataParams {
    create_new_arr?: boolean;
    stateArray?: NotificationResult | null;
    newDataFromBackend: NotificationResponse[];
    page: number;
    countRoute: string;
    data_to_send?: object;
    user: string | undefined | null;
}

interface FilterPostsPaginationDataParams {
    create_new_arr?: boolean;
    stateArray?: UserWrittenPostsResult | null;
    newDataFromBackend: UserWrittenPostsResponse[];
    page: number;
    countRoute: string;
    data_to_send?: object;
    user: string | undefined | null;
}

export const filterPaginationData = async ({ create_new_arr = false, stateArray, newDataFromBackend, page, countRoute}: FilterPaginationDataParams) => {
    let obj: LastPostsResult = {
        page: 0, results: [], totalDocs: 0,
    };

    if (stateArray != null && !create_new_arr) {
        obj = { ...stateArray, results: [...stateArray.results, ...newDataFromBackend], page: page };
    } else {
        try {
            const response = await axios.get(import.meta.env.VITE_API_URL + countRoute);
            const { totalDocs } = response.data;
            obj = { results: newDataFromBackend, page: 1, totalDocs };
        } catch (err) {
            console.log(err);
        }
    }

    return obj;
};


export const filterPaginationDataByCategory = async ({ create_new_arr = false, stateArray, newDataFromBackend, page, countRoute, data_to_send = {} }: FilterPaginationDataParams) => {
    let obj: LastPostsResult = { page: 0, results: [], totalDocs: 0 };

    if (stateArray != null && !create_new_arr) {
        obj = { ...stateArray, results: [...stateArray.results, ...newDataFromBackend], page: page };
    } else {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}${countRoute}`, {
                params: data_to_send
            });
            const { totalDocs } = response.data;
            obj = { results: newDataFromBackend, page: 1, totalDocs };
        } catch (err) {
            console.log(err);
        }
    }

    return obj;
};


export const filterNotificationPaginationData = async ({ create_new_arr = false, stateArray, newDataFromBackend, page, countRoute, data_to_send = {}, user = undefined }: FilterNotificationPaginationDataParams) => {
    let obj: NotificationResult = { page: 0, results: [], totalDocs: 0 };
    const config: { headers?: Record<string, string> } = {};

    if (user) {
        config.headers = {
            'Authorization': `Bearer: ${user}`
        };
    }

    if (stateArray != null && !create_new_arr) {
        obj = { ...stateArray, results: [...stateArray.results, ...newDataFromBackend], page: page };
    } else {
        try {
            const response = await axios.get(import.meta.env.VITE_API_URL + countRoute, {
                params: data_to_send,
                headers: config.headers,
            });

            const { totalDocs } = response.data;
            obj = { results: newDataFromBackend, page: 1, totalDocs };
        } catch (err) {
            console.log(err);
        }
    }

    return obj;
};

export const filterPostsPaginationData = async ({ create_new_arr = false, stateArray, newDataFromBackend, page, countRoute, data_to_send = {}, user = undefined }: FilterPostsPaginationDataParams) => {
    let obj: UserWrittenPostsResult = { page: 0, results: [], totalDocs: 0 };
    const headers: { headers?: Record<string, string> } = {};

    if (user) {
        headers.headers = {
            'Authorization': `Bearer: ${user}`
        }
    }

    if (stateArray != null && !create_new_arr) {
        obj = { ...stateArray, results: [...stateArray.results, ...newDataFromBackend], page: page };
    } else {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}${countRoute}`, {
                params: data_to_send,
                headers: headers.headers
            });
            const { totalDocs } = response.data;
            obj = { results: newDataFromBackend, page: 1, totalDocs };
        } catch (err) {
            console.log(err);
        }
    }

    return obj;
};
