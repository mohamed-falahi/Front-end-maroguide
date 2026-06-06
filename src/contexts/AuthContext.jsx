import { useState, useEffect, createContext, useContext } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const data = await api.authGet("/user", token);
            setUser(data.user || data);
        } catch (error) {
            console.error("Failed to fetch user:", error);
            localStorage.removeItem("token");
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const data = await api.login({ email, password });
            console.log("Login response:", data);

            if (data.token) {
                localStorage.setItem("token", data.token);
                setToken(data.token);
                setUser(data.user);
                return { success: true };
            }
            return { success: false, error: data.message || "Login failed" };
        } catch (error) {
            return { success: false, error: "Network error" };
        }
    };

    const register = async (name, email, password, password_confirmation) => {
        try {
            const data = await api.register({ name, email, password, password_confirmation });
            console.log("Register response:", data);

            if (data.token) {
                localStorage.setItem("token", data.token);
                setToken(data.token);
                setUser(data.user);
                return { success: true };
            }
            return { success: false, error: data.message || "Registration failed" };
        } catch (error) {
            return { success: false, error: "Network error" };
        }
    };

    const logout = async () => {
        if (token) {
            await api.logout(token);
        }
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}