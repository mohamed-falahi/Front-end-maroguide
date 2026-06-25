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
    }, []);

    const fetchUser = async () => {
        try {
            const data = await api.authGet("/user", token);
            setUser(data.user || data);
        } catch (error) {
            console.error("Failed to fetch user:", error);
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const saveSession = (data) => {
        console.log("Saving session:", data);

        // Handle different formats
        let userData = data.user || data.data?.user || data.data || null;
        let tokenData = data.token || data.data?.token || null;

        if (tokenData) {
            localStorage.setItem("token", tokenData);
            setToken(tokenData);
        }

        if (userData) {
            setUser(userData);
        } else if (tokenData) {
            // If we have token but no user, fetch the user
            fetchUser();
        }
    };

    const login = async (email, password) => {
        try {
            console.log("Attempting login...");
            const data = await api.login({ email, password });
            console.log("Login response:", data);

            if (data.token && data.user) {
                saveSession(data);
                return { success: true };
            } else {
                return { success: false, error: "Invalid login response" };
            }
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, error: error.message || "Login failed" };
        }
    };

    const register = async (name, email, password, password_confirmation) => {
        try {
            console.log("Attempting registration...");
            console.log("Registration data:", { name, email, password, password_confirmation });

            const data = await api.register({
                name,
                email,
                password,
                password_confirmation
            });

            console.log("Registration response:", data);

            // Check different response formats
            // Format 1: { success: true, user: {...}, token: "..." }
            if (data && data.success === true && data.user && data.token) {
                console.log("Format 1: Success with user and token");
                saveSession({ user: data.user, token: data.token });
                return { success: true };
            }

            // Format 2: { user: {...}, token: "..." } (no success field)
            if (data && data.user && data.token) {
                console.log("Format 2: Direct user and token");
                saveSession({ user: data.user, token: data.token });
                return { success: true };
            }

            // Format 3: { data: { user: {...}, token: "..." } }
            if (data && data.data && data.data.user && data.data.token) {
                console.log("Format 3: Nested data object");
                saveSession({ user: data.data.user, token: data.data.token });
                return { success: true };
            }

            // Format 4: { success: true, data: { user: {...}, token: "..." } }
            if (data && data.success === true && data.data) {
                if (data.data.user && data.data.token) {
                    console.log("Format 4: Success with nested data");
                    saveSession({ user: data.data.user, token: data.data.token });
                    return { success: true };
                }
            }

            // Format 5: Registration returned user but no token - try to login
            if (data && data.user && data.user.id) {
                console.log("Format 5: User created, attempting auto-login...");
                const loginResult = await login(email, password);
                if (loginResult.success) {
                    return { success: true };
                }
                return { success: false, error: "Auto-login after registration failed" };
            }

            // If we get here, we don't recognize the response format
            console.error("Unknown response format:", data);
            return {
                success: false,
                error: data.message || data.error || "Registration failed - unknown response format"
            };
        } catch (error) {
            console.error("Registration error:", error);
            console.error("Error details:", {
                message: error.message,
                status: error.status,
                data: error.data
            });

            let errorMessage = "Registration failed";
            if (error.data && error.data.errors) {
                // Laravel validation errors
                const errors = Object.values(error.data.errors).flat();
                errorMessage = errors.join(" ");
            } else if (error.message) {
                errorMessage = error.message;
            }

            return { success: false, error: errorMessage };
        }
    };

    const logout = async () => {
        try {
            if (token) await api.logout(token);
        } catch (error) {
            console.error("Logout error:", error);
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