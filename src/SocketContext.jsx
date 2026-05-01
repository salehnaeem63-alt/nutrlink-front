// context/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { AuthContext } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useContext(AuthContext)
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        if (!user?._id) return; // Don't connect if not logged in

        const newSocket = io("http://localhost:5000");
        setSocket(newSocket);
        newSocket.emit("setup", user);

        newSocket.on("get-online-users", (users) => {
            setOnlineUsers(users)
        })

        newSocket.on("initial_unread_count", (count) => {
            setUnreadCount(count);
        });

        // 3. Increment badge when a new message arrives while outside the chat
        newSocket.on("new_message_notification", () => {
            setUnreadCount((prev) => prev + 1);
        });

        // 4. Reset badge count when messages are marked as read in chat
        newSocket.on("unread_count_reset", (data) => {
            const { count } = data;
            // If server sends specific count, use it; otherwise reset to 0
            setUnreadCount(count || 0);
        });

        return () => {
            newSocket.off("get-online-users")
            newSocket.off("get-unread-count")
            newSocket.off("new_message_notification")
            newSocket.off("unread_count_reset")
            newSocket.disconnect();
        }
    }, [user?._id]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, unreadCount, setUnreadCount }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
