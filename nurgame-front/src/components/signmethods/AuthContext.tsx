import React, { createContext, useContext, useState } from "react";

interface AuthContextProps {
    isLoggedIn: boolean;
    userData: { level: string; [key: string]: any } | null;
    login: (data: { level: string; [key: string]: any }) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState<{ level: string } | null>(null);

    const login = (data: { level: string }) => {
        setIsLoggedIn(true);
        setUserData(data);
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUserData(null);
        localStorage.removeItem("authToken"); // Очистить токен при выходе
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, userData, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
