import { Link } from "react-router-dom";
import { User } from "../../types/data";

type Props = {
    user: User;
};

export const UserCard = (props: Props) => {
    const { personal_info: { name, surname, username, profile_img } } = props.user;

    return (
        <Link to={`/user/${username}`} className="flex gap-5 items-center mb-5">
            <img src={profile_img} className="w-14 h-14 rounded-full" />

            <div>
                <h1 className="font-medium text-xl line-clamp-2">{name} {surname}</h1>
                <p className="text-dark-grey"> @{username}</p>
            </div>
        </Link>
    );
};
