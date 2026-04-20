import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

export const apiClient = axios.create({
    baseURL: 'http://api.market.local',
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token as string);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const errorData = error.response?.data;

        const isBanned =
            errorData?.code === 'INACTIVE_USER_ACTION' ||
            (errorData?.message && (
                errorData.message.toLowerCase().includes('deactivated') ||
                errorData.message.toLowerCase().includes('banned')
            ));

        if (isBanned && window.location.pathname !== '/banned') {
            useAuthStore.getState().logout();
            window.location.href = '/banned';
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {

            if (originalRequest.url?.includes('/login')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshResponse = await axios.post('http://api.market.local/auth/refresh', {}, {
                    withCredentials: true
                });

                const newAccessToken = refreshResponse.data.accessToken;
                useAuthStore.getState().setToken(newAccessToken);

                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                useAuthStore.getState().logout();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export const customClient = <T>(
    url: string,
    options?: RequestInit
): Promise<T> => {
    const axiosConfig: import('axios').AxiosRequestConfig = {
        url,
        method: options?.method,
        headers: options?.headers as any,
        data: options?.body ? JSON.parse(options?.body as string) : undefined,
    };

    return apiClient(axiosConfig) as Promise<T>;
};