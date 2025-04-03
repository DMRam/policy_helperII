import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface AuthContextType {
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    user: string | null;
    login: (credentials: { username: string; password: string; baseUrl: string }) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

// Configure axios instance
const apiClient = axios.create({
    baseURL: 'http://localhost:3001/api', // Match your backend port
    withCredentials: true,
    timeout: 10000,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, setState] = useState({
        isAuthenticated: false,
        loading: false,
        error: null as string | null,
        user: null as string | null
    });
    const navigate = useNavigate();

    const verifySession = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const response: any = await apiClient.get('/session');
            setState(prev => ({
                ...prev,
                isAuthenticated: response.data.authenticated,
                user: response.data.user,
                loading: false
            }));
            return response.data.authenticated;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isAuthenticated: false,
                user: null,
                loading: false
            }));
            return false;
        }
    }, []);

    const login = useCallback(async (credentials: { username: string; password: string; baseUrl: string }) => {
        try {
            setState({
                isAuthenticated: false,
                loading: true,
                error: null,
                user: null
            });

            console.log("Attempting login with:", {
                baseUrl: credentials.baseUrl,
                username: credentials.username
            });

            const response: any = await apiClient.post('/login', credentials);

            console.log("Login response:", response.data);

            if (!response.data.success) {
                throw new Error('Login failed - no success flag');
            }

            // Verify session
            const sessionCheck: any = await apiClient.get('/session');
            console.log("Session check:", sessionCheck.data);

            if (!sessionCheck.data.authenticated) {
                throw new Error('Session verification failed');
            }

            setState({
                isAuthenticated: true,
                loading: false,
                error: null,
                user: credentials.username
            });

            navigate('/policies');

        } catch (error: any) {
            console.error("Login error details:", {
                message: error.message,
                response: error.response?.data,
                code: error.code
            });

            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                error.message ||
                'Login failed. Please try again.';

            setState({
                isAuthenticated: false,
                loading: false,
                error: errorMessage,
                user: null
            });

            throw error;
        }
    }, [navigate]);

    const logout = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            await apiClient.post('/logout');
            setState({
                isAuthenticated: false,
                loading: false,
                error: null,
                user: null
            });
            navigate('/login');
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'Logout failed'
            }));
        }
    }, [navigate]);

    // Check initial auth state
    useEffect(() => {
        verifySession();
    }, [verifySession]);

    return (
        <AuthContext.Provider value={{
            isAuthenticated: state.isAuthenticated,
            loading: state.loading,
            error: state.error,
            user: state.user,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);