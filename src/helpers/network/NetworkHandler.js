import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const NetworkHandler = ({ children }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const navigate = useNavigate();

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    useEffect(() => {
        if (!isOnline) {
            navigate("/no-internet");
        }
    }, [isOnline, navigate]);

    return children;
};

export default NetworkHandler;