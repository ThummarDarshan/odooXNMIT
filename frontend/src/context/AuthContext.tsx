import React, { useEffect, useState, createContext, useContext } from 'react';
import { authApi, setAuthToken, usersApi } from '../lib/api';
interface User {
  id: string;
  displayName: string;
  email: string;
  profileImage: string;
  phone?: string;
  location?: string;
  bio?: string;
}
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (displayName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateProfile: (profileData: Partial<User>) => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  // Initialize user from localStorage immediately
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });
  
  useEffect(() => {
    // Hydrate user and token
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) setAuthToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));

    // Try to verify token and refresh user profile
    (async () => {
      try {
        const me = await authApi.me();
        if (me?.user) {
          const normalized = normalizeUser(me.user);
          setUser(normalized);
          localStorage.setItem('user', JSON.stringify(normalized));
        }
      } catch (_) {
        // invalid token -> clear
        setUser(null);
        setAuthToken(null);
        localStorage.removeItem('user');
      }
    })();
  }, []);
  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setAuthToken(res.token);
    const normalized = normalizeUser(res.user);
    setUser(normalized);
    localStorage.setItem('user', JSON.stringify(normalized));
  };
  const signup = async (displayName: string, email: string, password: string) => {
    const res = await authApi.register(displayName, email, password);
    setAuthToken(res.token);
    const normalized = normalizeUser(res.user);
    setUser(normalized);
    localStorage.setItem('user', JSON.stringify(normalized));
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    setAuthToken(null);
    
    // Dispatch custom event to notify other contexts
    window.dispatchEvent(new CustomEvent('userLogout'));
  };

  const updateProfile = async (profileData: Partial<User>) => {
    if (!user) return;
    // Persist changes
    const payload: any = {};
    if (profileData.displayName !== undefined) payload.displayName = profileData.displayName;
    if (profileData.email !== undefined) payload.email = profileData.email;
    try {
      if (Object.keys(payload).length) {
        const res = await usersApi.updateProfile(payload);
        const normalized = normalizeUser(res.user);
        setUser(normalized);
        localStorage.setItem('user', JSON.stringify(normalized));
      } else {
        // Local-only changes like profileImage are ignored here
        const updatedUser = { ...user, ...profileData } as User;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (e) {
      // fallback: local update
      const updatedUser = { ...user, ...profileData } as User;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      throw e;
    }
  };

  function normalizeUser(u: any): User {
    return {
      id: String(u.id),
      displayName: u.display_name || u.displayName || '',
      email: u.email,
      profileImage: u.profile_image || u.profileImage || ''
    };
  }
  return <AuthContext.Provider value={{
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    updateProfile
  }}>
      {children}
    </AuthContext.Provider>;
};
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};