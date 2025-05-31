"use client";

import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Carregar o usuário do LocalStorage quando inicializar o app
    useEffect(() => {
        try {
            const savedUser = localStorage.getItem("usuario");
            if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            console.log("Usuário recuperado do localStorage:", parsedUser);
            setUser(parsedUser);
            }
        } catch (error) {
            console.error("Erro ao carregar usuário do localStorage:", error);
        }
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            { children }
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);