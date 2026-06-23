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
    }, []);                         // ← run once on mount only, not on every token change

    const fetchUser = async () => {
        try {
            const data = await api.authGet("/user", token);
            setUser(data.user || data);
        } catch {
            localStorage.removeItem("token");
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const saveSession = (data) => {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
    };

    const login = async (email, password) => {
        try {
            const data = await api.login({ email, password });
            saveSession(data);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };   // real error now
        }
    };

    const register = async (name, email, password, password_confirmation) => {
        try {
            const data = await api.register({ name, email, password, password_confirmation });
            saveSession(data);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };   // real error now
        }
    };

    const logout = async () => {
        try { if (token) await api.logout(token); } catch { /* ignore */ }
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