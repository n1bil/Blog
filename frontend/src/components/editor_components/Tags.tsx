import { SyntheticEvent, useContext } from "react";
import { EditorContext } from "../../pages/Editor";

type Props = {
    tag: string;
    tagIndex: number;
};

export const Tag = (props: Props) => {
    // eslint-disable-next-line prefer-const
    let { post, post: { tags }, setPost } = useContext(EditorContext);

    const addEditable = (event: SyntheticEvent) => {
        const target = event.target as HTMLElement;
        target.setAttribute('contentEditable', 'true');
        target.focus();
    };

    const handleTagEdit = (event: React.KeyboardEvent) => {
        if (event.keyCode == 13 || event.keyCode == 188) {
            event.preventDefault();
            const target = event.target as HTMLElement;
            const currentTag = target.innerText;
            tags[props.tagIndex] = currentTag;

            setPost({ ...post, tags });
            
            target.setAttribute("contentEditable", "false");
        }
    };

    const handleTagDelete = () => {
        tags = tags.filter(tag => tag != props.tag);
        setPost({ ...post, tags });
    };

    return (
        <div className="relative p-2 mt-2 mr-2 px-5 bg-white rounded-full inline-block hover:bg-opacity-50 pr-10">
            <p className="outline-none" onKeyDown={handleTagEdit} onClick={addEditable}>
                {props.tag}
            </p>
            <button className="mt-[2px] rounded-full absolute right-3 top-1/2 -translate-y-1/2"
                onClick={handleTagDelete}
            >
                <i className="fi fi-br-cross text-sm pointer-events-none"></i>
            </button>
        </div>
    );
};
