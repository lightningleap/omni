"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (isOpen: boolean) => void;
  wishlist: string[];
  toggleWishlist: (productHandle: string) => void;
  login: (email: string, password: string) => Promise<any>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Initialize from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('unrwly-user');
    const savedWishlist = localStorage.getItem('unrwly-wishlist');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('unrwly-user', JSON.stringify(user));
    else localStorage.removeItem('unrwly-user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('unrwly-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (productHandle: string) => {
    setWishlist(prev => 
      prev.includes(productHandle) 
        ? prev.filter(h => h !== productHandle) 
        : [...prev, productHandle]
    );
  };

  const login = async (email: string, password: string) => {
    console.log("Mock Login:", email);
    const mockUser = { id: 'user_1', email, firstName: 'User', lastName: 'Name' };
    setUser(mockUser);
    return { success: true };
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    console.log("Mock Register:", email);
    const mockUser = { id: 'user_1', email, firstName, lastName };
    setUser(mockUser);
    return { success: true };
  };

  const logout = () => {
    console.log("Mock Logout");
    setUser(null);
    setToken(null);
    setWishlist([]);
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, isLoading, isAuthModalOpen, setIsAuthModalOpen, 
      wishlist, toggleWishlist, login, register, logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
