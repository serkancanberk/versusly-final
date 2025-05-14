import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user on mount
  useEffect(() => {
    const fetchCurrentUser = async (retryCount = 0) => {
      try {
        console.log('Fetching current user...');
        const response = await fetch('http://localhost:8080/api/auth/me', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        console.log('Auth response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('User data received:', data);
          setUser(data);
        } else if (response.status === 401) {
          console.log('User not authenticated');
          setUser(null);
        } else if (retryCount < 3) {
          console.log(`Retrying fetch (attempt ${retryCount + 1})...`);
          setTimeout(() => {
            fetchCurrentUser(retryCount + 1);
          }, Math.pow(2, retryCount) * 1000);
          return;
        } else {
          console.error('Failed to fetch user after retries');
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        if (retryCount < 3) {
          console.log(`Retrying fetch after error (attempt ${retryCount + 1})...`);
          setTimeout(() => {
            fetchCurrentUser(retryCount + 1);
          }, Math.pow(2, retryCount) * 1000);
          return;
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Logout function
  const logout = async () => {
    try {
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    setUser,
    isLoading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 