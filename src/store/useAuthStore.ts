import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
    token: string | null;
    role: 'USER' | 'ADMIN' | null;
    setToken: (token: string) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

// Bulletproof helper to find the ADMIN role regardless of backend framework format
const extractRole = (decoded: any): 'ADMIN' | 'USER' => {
    if (!decoded) return 'USER';

    // 1. Gather ONLY the fields where a backend might put a role.
    // (We intentionally exclude 'sub' or 'email' so users can't spoof it with an admin@... email)
    const roleFields = [
        decoded.role,
        decoded.roles,
        decoded.authorities,
        decoded.scope,
        decoded.groups,
        decoded.realm_access?.roles // Common in Keycloak
    ];

    // 2. Convert whatever structure the backend sent (Array, String, Object) into one big uppercase string
    const roleString = JSON.stringify(roleFields).toUpperCase();

    // 3. If the word ADMIN appears anywhere in those specific fields, they are an admin
    if (roleString.includes('ADMIN')) {
        return 'ADMIN';
    }

    return 'USER';
};

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
            logout: () => set({ token: null, role: null }),
            isAuthenticated: () => {
                const { token } = get();
                if (!token) return false;
                try {
                    const decoded: any = jwtDecode(token);
                    return decoded.exp * 1000 > Date.now();
                } catch {
                    return false;
                }
            },
        }),
        { name: 'auth-storage' }
    )
);