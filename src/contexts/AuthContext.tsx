import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const savedToken = localStorage.getItem('token');
    return savedToken || null;
  });

  const isAuthenticated = !!token;

  useEffect(() => {
    console.log('AuthProvider: isAuthenticated =', isAuthenticated);
  }, [isAuthenticated]);

  // 🔐 Login logic
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Attempting login with email:', email); // Debugging log

    try {
      const response = await fetch('http://34.238.181.131:5600/user/login', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        console.error('Login failed with status:', response.status, response.statusText);
        return false;
      }

      const data = await response.json();
      console.log('Login successful:', data);

      if (data.success && data.data?.token) {
        const token = data.data.token;

        // 💾 Save token
        localStorage.setItem('token', token);

        setToken(token);
        console.log('Login successful:', { token });
        return true;
      } else {
        console.error('Login failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to connect to the server. Please try again later.'); // User-friendly message
      return false;
    }
  };

  // 🚪 Logout logic
  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    setToken(null);
  };

  const value: AuthContextType = {
    token,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
