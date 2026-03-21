import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Lifecycle: Check for existing session on startup
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('authToken');

        if (savedUser && token) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    // 2. Action: Handle Login (Works for Google & Manual Login)
    const handleLogin = (userData, token) => {
        // Save to LocalStorage for persistence
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userRole', userData.role);

        // Update React State for immediate UI change
        setUser(userData);
    };

    // 3. Action: Handle Logout
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLogin: !!user,
            handleLogin,
            handleLogout,
            loading
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};