import { Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { UserForm } from "./pages/UserForm";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/session";
import { Editor } from "./pages/Editor";
import { Homepage } from "./pages/Homepage";
import { SearchPage } from "./pages/SearchPage";
import { PageNotFound } from "./pages/PageNotFound";
import { ProfilePage } from "./pages/ProfilePage";
import { PostPage } from "./pages/PostPage";
import { SideNavbar } from "./components/SideNavbar";
import { ChangePassword } from "./pages/ChangePassword";
import { EditProfile } from "./pages/EditProfile";
import { Notifications } from "./pages/Notifications";
import { ManagePosts } from "./pages/ManagePosts";

interface UserInformation {
    access_token: string | null;
    name?: string;
    surname?: string;
    username?: string;
    profile_img?: string;
    new_notification_available?: boolean;
}

export const UserContext = createContext<{ userAuth: UserInformation; setUserAuth: React.Dispatch<React.SetStateAction<UserInformation>> }>({
    userAuth: { access_token: null },
    setUserAuth: () => {},
});

type Theme = "light" | "dark";

export const ThemeContext = createContext<{theme: Theme; setTheme: React.Dispatch<React.SetStateAction<Theme>>}>({
    theme: "light",
    setTheme: () => {},
});

const darkThemePreference = (): Theme => window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";


const App = () => {

    const [userAuth, setUserAuth] = useState<UserInformation>({ access_token: null });
    const [theme, setTheme] = useState<Theme>(() => darkThemePreference() ? "dark" : "light");

    useEffect(() => {
        const userInSession = lookInSession("user");
        const themeInSession = lookInSession("theme");
        userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({ access_token: null })

        if (themeInSession) {
            setTheme(() => {
                const themeFromSession = themeInSession as Theme;
                document.body.setAttribute('data-theme', themeFromSession);
            
                return themeFromSession;
            });
        } else {
            document.body.setAttribute('data-theme', theme);
        }

    }, [])

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <UserContext.Provider value={{userAuth, setUserAuth}}>
                <Routes>
                    <Route path="/editor" element={<Editor />} />
                    <Route path="/editor/:blog_id" element={<Editor />} />
                    <Route path="/" element={<Navbar />}>
                        <Route index element={<Homepage />} />
                        <Route path="dashboard" element={<SideNavbar />}>
                            <Route path="posts" element={<ManagePosts />} />
                            <Route path="notifications" element={<Notifications />} />
                        </Route>
                        <Route path="settings" element={<SideNavbar />}>
                            <Route path="edit-profile" element={<EditProfile />} />
                            <Route path="change-password" element={<ChangePassword />} />
                        </Route>
                        <Route path="signin" element={<UserForm type="sign-in" />} />
                        <Route path="signup" element={<UserForm type="sign-up" />} />
                        <Route path="search/:query" element={<SearchPage />} />
                        <Route path="user/:id" element={<ProfilePage />} />
                        <Route path="post/:post_id" element={<PostPage />} />
                        <Route path="*" element={<PageNotFound />} />
                    </Route>
                </Routes>
            </UserContext.Provider>
        </ThemeContext.Provider>
    );
};

export default App;
