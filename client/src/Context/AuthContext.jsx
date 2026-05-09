import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Initialize auth state from localStorage on mount
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userId = localStorage.getItem('user_id');
        const userRole = localStorage.getItem('user_role');
        
        if (token && userId) {
            try {
                const userData = {
                    id: userId,
                    role: userRole || 'client',
                    token: token
                };
                setUser(userData);
            } catch (error) {
                console.error('Failed to parse stored user data:', error);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_id');
                localStorage.removeItem('user_role');
            }
        }
    }, []);

    const login = (userData) => {
        const userObj = {
            id: userData.user?.id || userData.user_id,
            role: userData.user?.role || userData.role || 'client',
            token: userData.access_token,
            ...userData
        };
        setUser(userObj);
        // Tokens are already stored by the API functions
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
