import axios from "axios";

const api = axios.create({
    // baseURL: import.meta.env.VITE_API_BASE_URL || "https://base.migjs.uz:40320/SML_SAP/hs",
    baseURL: import.meta.env.VITE_API_BASE_URL
});

api.interceptors.request.use((config) => {
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
        config.headers.Authorization = `Basic ${storedToken}`;
    } else {
        const username = import.meta.env.VITE_API_USERNAME;
        const password = import.meta.env.VITE_API_PASSWORD;
        if (username && password) {
            config.headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`;
        }
    }
    return config;
});

export default api;