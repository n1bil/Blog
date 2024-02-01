import { ReactNode, SetStateAction, useEffect, useRef, useState } from "react";

type Props = {
    routes: string[];
    defaultHidden?: string[];
    defaultActiveIndex?: number;
    children?: ReactNode;
};

export let activeTabLineRef;
export let activeTabRef;

export const InPageNavigation = ({routes, defaultHidden = [], defaultActiveIndex = 0, children}: Props) => {
    activeTabLineRef = useRef<HTMLHRElement | null>(null);
    activeTabRef = useRef<HTMLButtonElement | null>(null);
    const [inPageNavIndex, setInPageNavIndex] = useState(defaultActiveIndex);
    const [isResizeEventAdded, setIsResizeEventAdded] = useState(false);
    const [width, setWidth] = useState(window.innerWidth);

    const changePageState = (btn: HTMLButtonElement, index: SetStateAction<number>) => {
        const { offsetWidth, offsetLeft } = btn;
    
        activeTabLineRef.current!.style.width = offsetWidth + "px";
        activeTabLineRef.current!.style.left = offsetLeft + "px";
    
        setInPageNavIndex(index);
    };

    useEffect(() => {
        if (width > 766 && inPageNavIndex != defaultActiveIndex) {
            changePageState(activeTabRef.current, defaultActiveIndex);
        }  

        if (!isResizeEventAdded) {
            window.addEventListener('resize', () => {
                if (!isResizeEventAdded) {
                    setIsResizeEventAdded(true);
                }

                setWidth(window.innerWidth);
            })
        }
    }, [width]);

    return (
        <>
            <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">
                {routes.map((route, index) => {
                    return (
                        <button 
                            ref={index == defaultActiveIndex ? activeTabRef : null}
                            key={index} 
                            className={"p-4 px-5 capitalize " + ( inPageNavIndex == index ? "text-black " : "text-dark-grey " ) + ( defaultHidden.includes(route) ? " md:hidden " : " "  )}
                            onClick={(event) => {
                                const button = event.target as HTMLButtonElement;
                                changePageState(button, index);
                            }}
                        >
                            {route}
                        </button>
                    );
                })}
            
                <hr ref={activeTabLineRef} className="absolute bottom-0 duration-300 border-dark-grey"/>
            
            </div>

            {Array.isArray(children) ? children[inPageNavIndex] : children}
        </>
    );
};
