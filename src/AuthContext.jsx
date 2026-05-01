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
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUserInfo = (newData) => {
    setUser((prevUser) => {
      if(!prevUser) return null
      const updateUser = {...prevUser, ...newData}
      localStorage.setItem('user', JSON.stringify(updateUser))
      return updateUser
    })
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLogin: !!user,
      handleLogin,
      handleLogout,
      updateUserInfo,
      loading
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};