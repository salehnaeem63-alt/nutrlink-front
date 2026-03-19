import { createContext, useState } from 'react';

// 1. Create the empty Context (the "radio station")
export const AuthContext = createContext();

// 2. Create the Provider (the "broadcaster")
export const AuthProvider = ({ children }) => {
    // Initialize state from the hard drive so the user stays logged in if they refresh the page (F5)
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // This is the function we called inside Login.jsx
    const handleLogin = (userData) => {
        // 1. Save all data to the browser's hard drive
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('authToken', userData.token);
        localStorage.setItem('userRole', userData.role);

        // 2. Broadcast the data to React's internal state
        setUser(userData);
    };

    const handleLogout = () => {
        // 1. Wipe the hard drive
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');

        // 2. Tell React the user is gone
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, handleLogin, handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};