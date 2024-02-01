type Props = {
    stats: {
        total_likes: number;
        total_comments: number;
        total_reads: number;
        total_parent_comments: number;
    }
};

export const PostStats = ({ stats }: Props) => {
    return (
        <div className="flex gap-2 max-lg:mb-6 max-lg:pb-6 border-grey max-lg:border-b">
            {Object.keys(stats).map((key, index) => {
                return !key.includes("parent") ? (
                    <div key={index} className={"flex flex-col items-center w-full h-full justify-center p-4 px-6 " + (index != 0 ? " border-grey border-l " : "")}>
                        <h1 className="text-xl lg:text-2xl mb-2">
                            {stats[key as keyof typeof stats].toLocaleString()}
                        </h1>
                        <p className="max-lg:text-dark-grey capitalize">
                            {key.split("_")[1]}
                        </p>
                    </div>
                ) : (
                    ""
                )
            })}
        </div>
    );
};
