import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const storedToken = localStorage.getItem("auth_token");

    if (storedToken) {
        config.headers.Authorization = `Basic ${storedToken}`;
    }

    return config;
});

export default api;