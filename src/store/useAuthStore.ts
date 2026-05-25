import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface AuthState {
    token: string | null;
    role: 'USER' | 'ADMIN' | null;
    setToken: (token: string) => void;
    logout: () => Promise<void>;
    refreshAccessToken: () => Promise<void>;
    isAuthenticated: () => boolean;
}

const extractRole = (decoded: any): 'ADMIN' | 'USER' => {
    if (!decoded) return 'USER';

    const roleFields = [
        decoded.role,
        decoded.roles,
        decoded.authorities,
        decoded.scope,
        decoded.groups,
        decoded.realm_access?.roles
    ];

    const roleString = JSON.stringify(roleFields).toUpperCase();

    if (roleString.includes('ADMIN')) {
        return 'ADMIN';
    }

    return 'USER';
};

let isRefreshing = false;

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            role: null,

            setToken: (token) => {
                try {
                    const decoded: any = jwtDecode(token);
                    const determinedRole = extractRole(decoded);

                    set({ token, role: determinedRole });
                } catch {
                    set({ token: null, role: null });
                }
            },

            logout: async () => {
                try {
                    await axios.post('http://api.market.local/auth/logout', {}, {
                        withCredentials: true
                    });
                } catch (error) {
                    console.warn("Backend session already terminated or unreachable.");
                } finally {
                    set({ token: null, role: null });
                }
            },

            refreshAccessToken: async () => {
                if (isRefreshing) return;

                isRefreshing = true;
                try {
                    const response = await axios.post('http://api.market.local/auth/refresh', {}, {
                        withCredentials: true
                    });

                    get().setToken(response.data.accessToken);
                } catch (error) {
                    console.warn("Silent refresh failed. Session expired.");
                    set({ token: null, role: null });
                } finally {
                    isRefreshing = false;
                }
            },

            isAuthenticated: () => {
                const { token, refreshAccessToken } = get();
                if (!token) return false;

                try {
                    const decoded: any = jwtDecode(token);
                    const timeRemaining = (decoded.exp * 1000) - Date.now();

                    if (timeRemaining < 10000) {
                        refreshAccessToken().catch((err) => {
                            console.error("Background refresh sequence encountered an error", err);
                        });
                    }

                    return true;
                } catch {
                    return false;
                }
            },
        }),
        { name: 'auth-storage' }
    )
);