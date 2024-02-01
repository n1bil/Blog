import { GetPostsProps } from "../../pages/ManagePosts";
import { LastPostsResult } from "../../types/data";
import { NotificationResult } from "../../types/notification";
import { UserWrittenPostsResult } from "../../types/postResponse";

interface LoadMoreDataBtnProps {
    state: LastPostsResult | null | undefined | NotificationResult | UserWrittenPostsResult;
    fetchDataFunction: (options: GetPostsProps & { create_new_arr?: boolean }) => Promise<void>;
    additionalParam?: { draft?: boolean; deletedDocCount: number; }
}

export const LoadMoreDataBtn = ({ state, fetchDataFunction, additionalParam }: LoadMoreDataBtnProps) => {
    if (state != null && state.totalDocs > state.results.length) {
        return (
            <button
                onClick={() => fetchDataFunction({ ...additionalParam, page: state.page + 1 })}
                className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
            >
                Load More
            </button>
        );
    }
};

