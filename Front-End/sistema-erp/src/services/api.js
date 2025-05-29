import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/SistemaERP',
});

// Interceptor para adicionar o token automaticamente nas requisições
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratar as respostas
api.interceptors.request.use (
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
)

export default api;