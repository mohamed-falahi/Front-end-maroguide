const API_BASE_URL = "http://127.0.0.1:8000/api";

const handleResponse = async (response) => {
    console.log('📡 API Response Status:', response.status);
    console.log('📡 API Response URL:', response.url);

    let data;
    try {
        data = await response.json();
        console.log('📡 API Response Data:', data);
    } catch (e) {
        console.error('❌ Failed to parse JSON:', e);
        data = {};
    }

    if (!response.ok) {
        let errorMessage = '';
        if (data.errors) {
            if (typeof data.errors === 'object') {
                errorMessage = Object.values(data.errors).flat().join(' ');
            } else {
                errorMessage = data.errors;
            }
        } else if (data.message) {
            errorMessage = data.message;
        } else if (data.error) {
            errorMessage = data.error;
        } else {
            errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
        }

        console.error('❌ API Error:', {
            status: response.status,
            statusText: response.statusText,
            data: data,
            errorMessage: errorMessage
        });

        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
};

export const api = {
    register: (data) =>
        fetch(`${API_BASE_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(data),
        }).then(handleResponse),

    login: (data) =>
        fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(data),
        }).then(handleResponse),

    logout: (token) =>
        fetch(`${API_BASE_URL}/logout`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Accept": "application/json"
            },
        }).then(handleResponse),

    get: (url) =>
        fetch(`${API_BASE_URL}${url}`, {
            headers: { "Accept": "application/json" }
        }).then(handleResponse),

    authGet: (url, token) => {
        console.log(`🔐 Auth GET: ${url}`, `Token: ${token ? 'Present' : 'Missing'}`);
        return fetch(`${API_BASE_URL}${url}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Accept': 'application/json',
            },
        }).then(handleResponse);
    },

    authPost: (url, data, token) => {
        console.log(`🔐 Auth POST: ${url}`, data);
        console.log(`Token: ${token ? 'Present' : 'Missing'}`);

        const isFormData = data instanceof FormData;

        const headers = {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json',
        };

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const body = isFormData ? data : JSON.stringify(data);

        console.log('Is FormData?', isFormData);
        console.log('Headers:', headers);

        return fetch(`${API_BASE_URL}${url}`, {
            method: "POST",
            headers: headers,
            body: body,
        }).then(handleResponse);
    },

    authPostFormData: (url, formData, token) => {
        console.log(`🔐 Auth POST FormData: ${url}`);
        console.log('📤 FormData entries:');
        for (let [key, value] of formData.entries()) {
            console.log(`  ${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
        }
        console.log(`Token: ${token ? 'Present' : 'Missing'}`);

        return fetch(`${API_BASE_URL}${url}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: formData,
        })
            .then(async (response) => {
                console.log('📡 FormData Response Status:', response.status);

                // Try to parse as JSON
                let data;
                try {
                    data = await response.json();
                    console.log('📡 FormData Response Data:', data);
                } catch (e) {
                    console.error('❌ Failed to parse FormData response:', e);
                    const text = await response.text();
                    console.log('📡 Raw response:', text);
                    throw new Error('Server returned invalid response');
                }

                if (!response.ok) {
                    let errorMessage = '';
                    if (data.errors) {
                        if (typeof data.errors === 'object') {
                            errorMessage = Object.values(data.errors).flat().join(' ');
                        } else {
                            errorMessage = data.errors;
                        }
                    } else if (data.message) {
                        errorMessage = data.message;
                    } else if (data.error) {
                        errorMessage = data.error;
                    } else {
                        errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
                    }

                    console.error('❌ FormData API Error:', {
                        status: response.status,
                        statusText: response.statusText,
                        data: data,
                        errorMessage: errorMessage
                    });

                    const error = new Error(errorMessage);
                    error.status = response.status;
                    error.data = data;
                    throw error;
                }

                return data;
            });
    },

    authPut: (url, data, token) =>
        fetch(`${API_BASE_URL}${url}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        }).then(handleResponse),

    authDelete: (url, token) =>
        fetch(`${API_BASE_URL}${url}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                'Accept': 'application/json',
            },
        }).then(handleResponse),
};