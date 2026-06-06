import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export function AuthModal({ onClose }) {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { login, register } = useAuth();

    const handleSubmit = async () => {
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        if (!isLogin && password !== passwordConfirmation) {
            setError("Passwords do not match");
            return;
        }

        if (!isLogin && !name) {
            setError("Please enter your name");
            return;
        }

        setLoading(true);

        let result;
        if (isLogin) {
            result = await login(email, password);
        } else {
            result = await register(name, email, password, passwordConfirmation);
        }

        setLoading(false);

        if (result.success) {
            onClose();
            setName("");
            setEmail("");
            setPassword("");
            setPasswordConfirmation("");
        } else {
            setError(result.error || "Authentication failed");
        }
    };

    return (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 400 }}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <div className="auth-title">Welcome to maroguide</div>
                <p className="auth-welcome">{isLogin ? "Sign in to share your journey" : "Create an account to start sharing"}</p>

                {error && (
                    <div style={{ color: "red", fontSize: "13px", marginBottom: "12px", textAlign: "center" }}>
                        {error}
                    </div>
                )}

                {!isLogin && (
                    <>
                        <label className="modal-label">Name</label>
                        <input className="modal-input" type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    </>
                )}

                <label className="modal-label">Email</label>
                <input className="modal-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

                <label className="modal-label">Password</label>
                <input className="modal-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

                {!isLogin && (
                    <>
                        <label className="modal-label">Confirm Password</label>
                        <input className="modal-input" type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} />
                    </>
                )}

                <button className={`continue-btn ${email && password ? "active" : ""}`} onClick={handleSubmit} disabled={loading}>
                    {loading ? "Processing..." : (isLogin ? "Sign In" : "Sign Up")}
                </button>

                <div className="auth-divider">
                    <span></span>
                    <span>OR</span>
                    <span></span>
                </div>

                <button className="social-btn" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "Create new account" : "Already have an account? Sign in"}
                </button>
            </div>
        </div>
    );
}