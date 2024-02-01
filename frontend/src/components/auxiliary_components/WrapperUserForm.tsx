import { AnimatePresence, motion } from "framer-motion";

interface WrapperUserFormProps {
    children: React.ReactNode;
    keyValue?: string;
    initial?: { opacity: number } | undefined;
    animate?: { opacity: number } | undefined;
    transition?: { duration?: number, delay?: number } | undefined;
    className?: string;
}

export const WrapperUserForm = ({children, keyValue, initial = { opacity: 0 }, animate = { opacity: 1 }, transition = { duration: 1 }, className}: WrapperUserFormProps) => {
    return (
        <AnimatePresence>
            <motion.div
                key={keyValue}
                initial={initial}
                animate={animate}
                transition={transition}
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};
