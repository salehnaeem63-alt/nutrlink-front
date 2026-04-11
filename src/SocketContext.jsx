// context/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { AuthContext } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useContext(AuthContext)
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([])

    useEffect(() => {
        if (!user?._id) return; // Don't connect if not logged in

        const newSocket = io("http://localhost:5000");
        setSocket(newSocket);
        newSocket.emit("setup", user);

        newSocket.on("get-online-users", (users) => {
            setOnlineUsers(users)
        })


        return () => {
            newSocket.off("get-online-users")
            newSocket.disconnect();
        }
    }, [user?._id]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);