import axios from "axios";

const username = import.meta.env.VITE_API_USERNAME;
const password = import.meta.env.VITE_API_PASSWORD;

const token = btoa(`${username}:${password}`);

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Authorization": `Basic ${token}`
    }
})

export default api;