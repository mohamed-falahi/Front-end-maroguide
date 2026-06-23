const API_BASE_URL = "http://127.0.0.1:8000/api";

const handleResponse = async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        // Laravel validation errors come in data.errors, general in data.message
        const message =
            data.errors
                ? Object.values(data.errors).flat().join(" ")
                : data.message || `Error ${response.status}`;
        throw new Error(message);
    }
    return data;
};

export const api = {
    register: (data) =>
        fetch(`${API_BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }).then(handleResponse),

    login: (data) =>
        fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }).then(handleResponse),

    logout: (token) =>
        fetch(`${API_BASE_URL}/logout`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        }).then(handleResponse),

    get: (url) =>
        fetch(`${API_BASE_URL}${url}`).then(handleResponse),

    authGet: (url, token) =>
        fetch(`${API_BASE_URL}${url}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then(handleResponse),

    authPost: (url, data, token) =>
        fetch(`${API_BASE_URL}${url}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }).then(handleResponse),

    authPostFormData: (url, formData, token) =>
        fetch(`${API_BASE_URL}${url}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        }).then(handleResponse),

    authPut: (url, data, token) =>
        fetch(`${API_BASE_URL}${url}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }).then(handleResponse),

    authDelete: (url, token) =>
        fetch(`${API_BASE_URL}${url}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        }).then(handleResponse),
};