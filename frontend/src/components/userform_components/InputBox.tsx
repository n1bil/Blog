import { useState } from "react";

type Props = {
    name: string;
    type: string;
    id?: string;
    value?: string;
    placeholder: string;
    icon: string;
    disable?: boolean;
    customClassName?: string;
};

export const InputBox = (props: Props) => {

    const [passwordVisible, setPasswordVisible] = useState(false);
    const combinedClassName = `${props.customClassName || 'relative w-[100%] mb-4'}`;

    return (
        <div className={combinedClassName}>
            <input
                name={props.name}
                type={props.type == 'password' ? passwordVisible ? 'text' : 'password' : props.type}
                placeholder={props.placeholder}
                defaultValue={props.value}
                id={props.id}
                disabled={props.disable}
                className="input-box"
            />

            <i className={"fi " + props.icon + " input-icon"}></i>

            {props.type == 'password' ? 
            <i className={"fi fi-rr-eye" + (!passwordVisible ? "-crossed" : "") + " input-icon left-[auto] right-4 cursor-pointer"}
            onClick={() => setPasswordVisible(currentValue => !currentValue)}
            ></i>
            : ''}
        </div>
    );
};
