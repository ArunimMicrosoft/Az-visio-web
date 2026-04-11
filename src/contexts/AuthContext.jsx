// filepath: c:\Users\labadmin\Desktop\python-mini\Az visio web\src\contexts\AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  supabaseSignIn,
  supabaseSignUp,
  supabaseSignOut,
  getUserProfile,
  profileToAppUser,
  onAuthStateChange,
  supabase,
} from '../utils/supabase';
import { trackLogin } from '../utils/activityTracker';

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

  // Listen for Supabase auth state changes (login, logout, token refresh)
  useEffect(() => {
    // 1. Check current session on mount
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const profile = await getUserProfile(session.user.id);

          // Block banned users on session restore
          if (profile && profile.is_active === false) {
            await supabase.auth.signOut();
            setUser(null);
            setIsLoading(false);
            return;
          }

          const appUser = profileToAppUser(session.user, profile);
          if (appUser) {
            setUser(appUser);
          }
        } else {
          console.log('No existing session found');
        }
      } catch (err) {
        console.error('Session init error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    // 2. Subscribe to future auth changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      }
      // TOKEN_REFRESHED: silently update user
      if (event === 'TOKEN_REFRESHED' && session?.user) {
        const profile = await getUserProfile(session.user.id);
        const appUser = profileToAppUser(session.user, profile);
        if (appUser) setUser(appUser);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      const data = await supabaseSignIn(email, password);
      const profile = await getUserProfile(data.user.id);

      // Block banned users
      if (profile && profile.is_active === false) {
        await supabaseSignOut();
        return { success: false, error: 'Your account has been suspended. Contact support for assistance.' };
      }

      const appUser = profileToAppUser(data.user, profile);
      setUser(appUser);
      trackLogin(data.user.id);

      return { success: true, user: appUser };
    } catch (error) {
      console.error('Login error:', error);
      let message = error.message;
      if (message.includes('Invalid login credentials')) {
        message = 'Invalid email or password.';
      }
      return { success: false, error: message };
    }
  };

  const signup = async (email, password, name) => {
    try {
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      if (password.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters' };
      }

      const data = await supabaseSignUp(email, password, name);

      // If email confirmation is required, tell the user
      if (data.user && !data.session) {
        return {
          success: true,
          user: null,
          message: 'Check your email to confirm your account before signing in.',
          requiresConfirmation: true,
        };
      }

      // Auto-confirmed signup
      if (data.user && data.session) {
        const profile = await getUserProfile(data.user.id);
        const appUser = profileToAppUser(data.user, profile);
        setUser(appUser);
        return { success: true, user: appUser };
      }

      return { success: true, user: null };
    } catch (error) {
      console.error('Signup error:', error);
      let message = error.message;
      if (message.includes('already registered')) {
        message = 'User with this email already exists.';
      }
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      // Pass current user info so the audit log can capture who logged out
      await supabaseSignOut(user?.id || null, user?.email || null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { user: supaUser } } = await supabase.auth.getUser();
      if (supaUser) {
        const profile = await getUserProfile(supaUser.id);
        const appUser = profileToAppUser(supaUser, profile);
        setUser(appUser);
        return appUser;
      }
    } catch (err) {
      console.error('Refresh user error:', err);
    }
    return null;
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
