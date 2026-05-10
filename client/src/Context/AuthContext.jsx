import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Initialize auth state from localStorage on mount
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userId = localStorage.getItem('user_id');
        const userRole = localStorage.getItem('user_role');
        const userData = localStorage.getItem('userData');
        
        if (token && userId) {
            try {
                let userObj = {
                    id: userId,
                    role: userRole || 'client',
                    token: token
                };
                
                // Parse stored user data if available
                if (userData) {
                    const parsedUserData = JSON.parse(userData);
                    userObj = { ...userObj, ...parsedUserData };
                }
                
                setUser(userObj);
            } catch (error) {
                console.error('Failed to parse stored user data:', error);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_id');
                localStorage.removeItem('user_role');
                localStorage.removeItem('userData');
            }
        }
    }, []);

    const login = (userData) => {
        const role = userData.user?.role || userData.role || 'client';
        const isSenior = userData.is_senior ?? userData.user?.is_senior ?? false;
        const userObj = {
            id: userData.user?.id || userData.user_id,
            token: userData.access_token,
            firstName: userData.user?.first_name || userData.first_name,
            lastName: userData.user?.last_name || userData.last_name,
            email: userData.user?.email || userData.email,
            membership: userData.user?.membership || userData.membership,
            avatar: userData.user?.avatar_url || userData.avatar_url || userData.avatar,
            // role and is_senior last so they are never overwritten by the spread
            role,
            is_senior: isSenior,
        };
        setUser(userObj);
        
        // Store complete user data in localStorage
        const dataToStore = {
            id: userObj.id,
            role: userObj.role,
            is_senior: userObj.is_senior,
            firstName: userObj.firstName,
            lastName: userObj.lastName,
            email: userObj.email,
            membership: userObj.membership,
            avatar: userObj.avatar,
        };
        localStorage.setItem('userData', JSON.stringify(dataToStore));
        localStorage.setItem('user_role', userObj.role);
    };
    
    const logout = () => {
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_role');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('remembered_email');
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
