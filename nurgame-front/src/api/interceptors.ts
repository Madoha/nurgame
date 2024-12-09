import axiosConfig from './axiosConfig';
import {jwtDecode} from 'jwt-decode';
import { Http } from '../models/Models';

interface TokenPayload {
    exp: number;
}

// Helper: Check if the token is expired
const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;
    try {
        const { exp } = jwtDecode<TokenPayload>(token);
        return !exp || Date.now() >= exp * 1000;
    } catch (error) {
        console.error('Error decoding token:', error);
        return true;
    }
};


// Helper: Refresh the authentication token
const refreshAuthToken = async (): Promise<string> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('Refresh token not found in localStorage');

    try {
        const response = await axiosConfig.post(Http.refreshToken, { refreshToken });
        const { token: newToken } = response.data;

        if (newToken) {
            localStorage.setItem('jwtToken', newToken);
            return newToken;
        }

        throw new Error('Received no new token from refresh endpoint');
    } catch (error: any) {
        console.error('Failed to refresh auth token:', error.response?.data || error.message);
        throw new Error('Unable to refresh token');
    }
};


// Request Interceptor: Attach tokens to requests
axiosConfig.interceptors.request.use(
    async (config) => {
        let token = localStorage.getItem('jwtToken');

        if (isTokenExpired(token)) {
            try {
                token = await refreshAuthToken();
            } catch (error) {
                console.error('Token refresh failed:', error);
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('refreshToken');
                window.location.href = Http.login;
                throw error; // Prevent further request execution
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);


// Response Interceptor: Handle API errors
axiosConfig.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check for token expiration errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Prevent infinite retry loop
            try {
                const newToken = await refreshAuthToken();
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosConfig(originalRequest); // Retry original request
            } catch (refreshError) {
                console.error('Token refresh failed after 401 error:', refreshError);
                localStorage.clear();
                window.location.href = Http.login;
            }
        }

        console.error('API error response:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);


export default axiosConfig;
