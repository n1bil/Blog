import { InputBox } from "../components/userform_components/InputBox";
import { Link, Navigate } from "react-router-dom";
import { WrapperUserForm } from "../components/auxiliary_components/WrapperUserForm";
import { SyntheticEvent, useContext, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";
import { emailRegex, passwordRegex } from "../utils/rules";

type Props = {
    type: string;
};

type FormFields = {
    [key: string]: string;
    email: string;
    password: string;
};

export const UserForm = (props: Props) => {
    const { userAuth: {access_token}, setUserAuth } = useContext(UserContext);
    const formRef = useRef<HTMLFormElement>(null);

    const userAuthThroughServer = async (serverRoute: string, formData: FormFields) => {
        try {
            const response = await axios.post(import.meta.env.VITE_API_URL + serverRoute, formData);
            const data = response.data;
    
            storeInSession("user", JSON.stringify(data));
            setUserAuth(data);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error("An unknown error occurred");
            }
        }
    };

    const handleSubmit = (event: SyntheticEvent) => {
        event.preventDefault();
        const formElement = formRef.current;

        if (!formElement) {
            console.error("Form element not found");
            return;
        }
        const serverRoute = props.type == "sign-in" ? "/signin" : "/signup";

        const form = new FormData(formElement);
        const formData: FormFields = { email: '', password: '' };

        for (const [key, value] of form.entries()) {
            if (typeof value === "string") {
                formData[key] = value;
            }
        }
        
        const { name, surname, email, password } = formData;
        

        if (name) {
            if (name.length < 3) {
                return toast.error("Name must be at least 3 letters long");
            }
        }

        if (surname) {
            if (surname.length < 3) {
                return toast.error("Surname must be at least 3 letters long");
            }
        }
    
        if (!email.length) {
            return toast.error("Enter Email");
        }
    
        if (!emailRegex.test(email)) {
            return toast.error("Email is invalid");
        }
    
        if (!passwordRegex.test(password)) {
            return toast.error("Invalid password. Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters");
        }

        userAuthThroughServer(serverRoute, formData);
        
    }

    

    return (
        access_token ? 
        <Navigate to="/" />
        :
        <WrapperUserForm keyValue={props.type}>
            <section className="h-cover flex items-center justify-center">
            <Toaster />
            <form ref={formRef} id="formElement" className="w-[80%] max-w-[400px] flex flex-col items-center">
                <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
                    {props.type == "sign-in" ? "Back in action" : "Become a Member"}
                </h1>

                {props.type != "sign-in" ? (
                    <div className="flex w-full">
                        <InputBox
                            customClassName="relative w-[50%] mb-4 mr-2"
                            name="name"
                            type="text"
                            placeholder="Name"
                            icon="fi-rr-user" 
                        />
                        <InputBox
                            customClassName="relative w-[50%] mb-4 ml-2"
                            name="surname"
                            type="text"
                            placeholder="Surname"
                            icon="fi-rr-user" 
                        />
                    </div>
                ) : (
                    ""
                )}

                <InputBox
                    name="email"
                    type="email"
                    placeholder="Email"
                    icon="fi-rr-envelope"
                />

                <InputBox
                    name="password"
                    type="password"
                    placeholder="Password"
                    icon="fi-rr-key"
                />

                <button
                    className="btn-dark center mt-14"
                    type="submit"
                    onClick={handleSubmit}
                >
                    {props.type.replace("-", " ")}
                </button>

                <div className="relative w-full flex items-center gap-2 my-10 opacity-10 text-black font-bold">
                    <hr className="w-1/2 border-black"/>
                    <p>or</p>
                    <hr className="w-1/2 border-black"/>
                </div>

                {props.type == 'sign-in' ?
                <p className="mt-6 text-dark-grey text-xl text-center">
                  No account yet ?
                  <Link to='/signup' className="underline text-black text-xl ml-1">
                  Register Now
                  </Link>
                </p>
                :
                <p className="mt-6 text-dark-grey text-xl text-center">
                  Have an account ?
                  <Link to='/signin' className="underline text-black text-xl ml-1">
                    Sign in here.
                  </Link>
                </p>}

            </form>
            </section>
        </WrapperUserForm>
        
    );
};
