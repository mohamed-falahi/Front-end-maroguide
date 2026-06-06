// API Configuration
const API_BASE_URL = "http://127.0.0.1:8000/api";

export const api = {
    register: async (data) => {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    login: async (data) => {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    logout: async (token) => {
        const response = await fetch(`${API_BASE_URL}/logout`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });
        return response.json();
    },
    authPut: async (url, data, token) => {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },
    authGet: async (url, token) => {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        return response.json();
    },

    authPost: async (url, data, token) => {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    authPostFormData: async (url, formData, token) => {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });
        return response.json();
    },

    authDelete: async (url, token) => {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        return response.json();
    },

    get: async (url) => {
        const response = await fetch(`${API_BASE_URL}${url}`);
        return response.json();
    },
};