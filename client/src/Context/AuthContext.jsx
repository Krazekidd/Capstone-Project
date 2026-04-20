import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('authToken', userData.token); // Example: Storing token
    };
    const logout = () => {
        setUser(null);
        localStorage.removeItem('authToken');
    };
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuthContext = () => {
    return useContext(AuthContext);
};

export const useAuth = () => {
    const { user, login, logout } = useAuthContext();
    const isLoggedIn = !!user;
    return { user, isLoggedIn, login, logout };
};
