import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { filterNotificationPaginationData } from "../common/filter_pagination";
import { NotificationResult } from "../types/notification";
import Loader from "../components/auxiliary_components/Loader";
import { WrapperUserForm } from "../components/auxiliary_components/WrapperUserForm";
import { NoDataMessage } from "../components/homepage_components/NoDataMessage";
import { NotificationCard } from "../components/notification_components/NotificationCard";
import { LoadMoreDataBtn } from "../components/homepage_components/LoadMoreData";

type fetchNotificationsProps = {
    page: number; 
    deletedDocCount?: number
}

export const Notifications = () => {
    const {userAuth, userAuth: { access_token, new_notification_available }, setUserAuth} = useContext(UserContext);
    const [filter, setFilter] = useState("all");
    const [notifications, setNotifications] = useState<NotificationResult | null>(null);
    const filters = ["all", "like", "comment", "reply"];

    const fetchNotifications = async ({ page, deletedDocCount = 0 }: fetchNotificationsProps) => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/get-notifications`, {
                params: {page, filter, deletedDocCount},
                headers: {Authorization: `Bearer ${access_token}`}
            });    
            
            if (new_notification_available) {
                setUserAuth({ ...userAuth, new_notification_available: false })
            }

            const formattedData = await filterNotificationPaginationData({
                stateArray: notifications,
                newDataFromBackend: data,
                page: page,
                countRoute: "/count-all-notifications",
                data_to_send: { filter },
                user: access_token,
            });

            setNotifications(formattedData);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (access_token) {
            fetchNotifications({ page: 1 });
        }
    }, [access_token, filter]);

    const handleFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
        const btn = event.target as HTMLButtonElement;
        setFilter(btn.innerHTML);

        setNotifications(null);
    };

    return (
        <div>
            <h1 className="max-md:hidden">Recent Notifications</h1>

            <div className="my-8 flex gap-6">
                {filters.map((filterName, index) => {
                    return (
                        <button
                            key={index}
                            className={"py-2 " + (filter == filterName ? "btn-dark" : "btn-light")}
                            onClick={handleFilter}
                        >
                            {filterName}
                        </button>
                    );
                })}
            </div>

            {notifications == null ? <Loader /> :
                <>
                    {notifications.results.length ? (
                        notifications.results.map((notification, index) => {
                            return <WrapperUserForm key={index} transition={{ delay: index * 0.08 }}>
                                <NotificationCard data={notification} index={index} notificationState={{ notifications, setNotifications }}/>
                            </WrapperUserForm>
                        })
                    ) : (
                        <NoDataMessage message="Nothing available" />
                    )}

                    <LoadMoreDataBtn state={notifications} fetchDataFunction={fetchNotifications} additionalParam={{deletedDocCount: notifications.totalDocs}} />
                </>
            }
        </div>
    );
};