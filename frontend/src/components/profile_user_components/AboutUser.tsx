import { Link } from "react-router-dom";
import { UserProfile } from "../../types/data";
import { getFullDay } from "../../common/date";

export const AboutUser = ({className, profile}: {className?: string; profile: UserProfile | undefined}) => {
    return (
        <div className={"md:w-[90%] md:mt-7 " + className}>
            <p className="text-xl leading-7">{profile?.personal_info.bio.length ? profile?.personal_info.bio : "Nothing to read here"}</p>

            <div className="flex gap-x-7 gap-y-2 flex-wrap my-7 items-center text-dark-grey">
                {Object.entries(profile?.social_links || {}).map(([key, link]) => (
                    link ? <Link to={link} key={key} target="_blank">
                        <i className={"fi " + (key != 'website' ? "fi-brands-" + key : "fi-rr-globe") + " text-2xl hover:text-black"}></i>
                    </Link> : null
                ))}
            </div>

            <p className="text-xl leading-7 text-dark-grey">Joined on {getFullDay(profile?.joinedAt)}</p>
        </div>
    );
};

// <div className="md:w-[90%] md:mt-7 max-md:hidden">