type Props = {
    message: string;
};

export const NoDataMessage = (props: Props) => {
    return (
        <div className="text-center w-full p-4 rounded-full bg-grey/50 mt-4">
            <p>{props.message}</p>
        </div>
    );
};
