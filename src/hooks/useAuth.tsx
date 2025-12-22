import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data.data);
        } catch (error) {
          console.error("Session expired or token invalid, logging out.");
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (credentials: any) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
      const { data } = response.data; // Backend returns { success: true, data: { user, token } }
      const { token, user } = data;

      if (token) {
        // This is the crucial step that was missing
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // The backend responded with an error. We extract the message.
        const errorMessage = error.response.data.message || 'An unexpected error occurred.';
        // It's common for validation errors to be in an 'errors' array.
        const validationErrors = error.response.data.errors?.map((e: any) => e.msg).join(', ');
        throw new Error(validationErrors || errorMessage);
      }
      throw new Error('Login failed. Please check your connection and try again.');
    }
  };

  const logout = () => {
    // Clear the token from storage and state
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};