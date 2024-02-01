import { Link } from "react-router-dom";
import lightPageNotFound from "../assets/404-light.png";
import darkPageNotFound from "../assets/404-dark.png";
import { useContext } from "react";
import { ThemeContext } from "../App";

export const PageNotFound = () => {
    const { theme } = useContext(ThemeContext);

    return (
        <section className="flex flex-col lg:flex-row relative items-center justify-center text-center">
            <div className="lg:mr-0 mb-8">
                <h1 className="text-4xl font-gelasio leading-7 mt-10 lg:mt-0">Page not Found</h1>
                <p className="text-dark-grey text-xl leading-7 mt-8 lg:mt-8">Looks like the page you're searching for doesn't exist. Head back to our central hub the <Link to="/" className="text-black text-xl leading-7 mt-8 lg:mt-8 underline">home page</Link> and explore further.</p>
            </div>
            <img
                src={ theme == 'light' ? darkPageNotFound : lightPageNotFound }
                alt="404 Not Found"
                className="w-full lg:w-1/2"
            />
        </section>
    );
};