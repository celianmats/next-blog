/**
 * Authentication Context and Hooks
 * Manages user authentication state across the application
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

// ================================
// GraphQL Mutations
// ================================
const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
        role
        avatarUrl
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`;

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      role
      avatarUrl
      bio
      isVerified
    }
  }
`;

// ================================
// Types
// ================================
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'SUBSCRIBER';
  avatarUrl?: string;
  bio?: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

// ================================
// Context
// ================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ================================
// Provider Component
// ================================
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: {
          input: { email, password },
        },
      });

      if (!data?.login) {
        throw new Error('Invalid email or password');
      }

      const { token: newToken, user: newUser } = data.login;

      // Store in state
      setToken(newToken);
      setUser(newUser);

      // Store in localStorage
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_user', JSON.stringify(newUser));

      return data.login;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    try {
      const { data } = await registerMutation({
        variables: {
          input: { email, password, name },
        },
      });

      const { token: newToken, user: newUser } = data.register;

      // Store in state
      setToken(newToken);
      setUser(newUser);

      // Store in localStorage
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_user', JSON.stringify(newUser));

      return data.register;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    // Optionally redirect to home
    window.location.href = '/';
  };

  // Update user function
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ================================
// Hook
// ================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ================================
// HOC for protected routes
// ================================
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: User['role']
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}>
          Loading...
        </div>
      );
    }

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }

    if (requiredRole && user?.role !== requiredRole && user?.role !== 'ADMIN') {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}>
          <h1>Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// ================================
// Custom Hooks
// ================================

// Check if user has specific role
export function useHasRole(role: User['role']) {
  const { user } = useAuth();
  return user?.role === role || user?.role === 'ADMIN';
}

// Check if user can edit content
export function useCanEdit() {
  const { user } = useAuth();
  return ['ADMIN', 'EDITOR', 'AUTHOR'].includes(user?.role || '');
}

// Get authorization header
export function useAuthHeader() {
  const { token } = useAuth();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
