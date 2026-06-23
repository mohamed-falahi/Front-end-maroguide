import { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from '../components/Toast';

const ToastContext = createContext(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showSuccess = useCallback((message) => addToast(message, 'success'), [addToast]);
    const showError = useCallback((message) => addToast(message, 'error'), [addToast]);
    const showWarning = useCallback((message) => addToast(message, 'warning'), [addToast]);
    const showInfo = useCallback((message) => addToast(message, 'info'), [addToast]);

    return (
        <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
            {children}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map(({ id, message, type, duration }) => (
                    <Toast
                        key={id}
                        message={message}
                        type={type}
                        duration={duration}
                        onClose={() => removeToast(id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}