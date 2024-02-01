import { SyntheticEvent, useContext, useRef } from "react";
import { WrapperUserForm } from "../components/auxiliary_components/WrapperUserForm";
import { InputBox } from "../components/userform_components/InputBox";
import toast, { Toaster } from "react-hot-toast";
import { passwordRegex } from "../utils/rules";
import axios from "axios";
import { UserContext } from "../App";

type FormPasswordFields = {
    [key: string]: string;
    oldPassword: string;
    newPassword: string;
};

export const ChangePassword = () => {
    const changePasswordForm = useRef<HTMLFormElement | null>(null);
    const { userAuth: { access_token } } = useContext(UserContext);

    const handleSubmit = async (event: SyntheticEvent) => {
        event.preventDefault();
        const form = new FormData(changePasswordForm.current!);

        const formData: FormPasswordFields = { oldPassword: '', newPassword: '' };

        for(const [key, value] of form.entries()) {
            if (typeof value === "string") {
                formData[key] = value
            }
        }

        const { currentPassword, newPassword } = formData;

        if (!currentPassword.length || !newPassword.length) {
            return toast.error("Fill all the inputs");
        }

        if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
            return toast.error("Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters");
        }

        (event.target as HTMLButtonElement).setAttribute("disabled", "true");

        const loadingToast = toast.loading("Updating...")

        try {
            await axios.put(import.meta.env.VITE_API_URL + "/change-password", formData, {
                headers: { 'Authorization': `Bearer ${access_token}` }
            });
    
            toast.dismiss(loadingToast);
            (event.target as HTMLButtonElement).removeAttribute("disabled");
            toast.success("Password Updated");
        } catch (error) {
            toast.dismiss(loadingToast);
            (event.target as HTMLButtonElement).removeAttribute("disabled");
    
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unknown error occurred");
            }
        }

    };

    return (
        <WrapperUserForm>
            <Toaster />
            <form ref={changePasswordForm}>
                <h1 className="max-md:hidden">Change Password</h1>

                <div className="py-10 w-full md:max-w-[400px]">
                    <InputBox
                        name="currentPassword"
                        type="password"
                        placeholder="Current password"
                        icon="fi-rr-unlock"
                    />

                    <InputBox
                        name="newPassword"
                        type="password"
                        placeholder="New password"
                        icon="fi-rr-unlock"
                    />

                    <button onClick={handleSubmit} className="btn-dark px-10" type="submit">Change password</button>
                </div>
            </form>
        </WrapperUserForm>
    );
};