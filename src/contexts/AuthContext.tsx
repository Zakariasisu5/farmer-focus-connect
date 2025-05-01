
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  region?: string;
  language: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, region?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in local storage
    const storedUser = localStorage.getItem("farmer-user");
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Log user activity on app load
      if (parsedUser && parsedUser.id) {
        logUserActivity(parsedUser.id, "app_login");
      }
    }
    
    setIsLoading(false);
  }, []);

  // Function to log user activities
  const logUserActivity = async (userId: string, activityType: string, details?: any) => {
    try {
      await supabase.from('user_activities').insert({
        user_id: userId,
        activity_type: activityType,
        details: details || {}
      });
    } catch (error) {
      console.error("Failed to log user activity:", error);
    }
  };

  // Mock login function - in a real app, this would connect to a backend
  const login = async (email: string, password: string) => {
    // Simulate API request
    setIsLoading(true);
    
    try {
      // Mock successful login
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser: User = {
        id: "user-1",
        name: "Test Farmer",
        email,
        region: "Central Region",
        language: "en",
      };
      
      setUser(mockUser);
      localStorage.setItem("farmer-user", JSON.stringify(mockUser));
      
      // Log login activity
      logUserActivity(mockUser.id, "login");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (name: string, email: string, password: string, region?: string) => {
    // Simulate API request
    setIsLoading(true);
    
    try {
      // Mock successful registration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser: User = {
        id: "user-" + Math.floor(Math.random() * 1000),
        name,
        email,
        region: region || "Greater Accra", // Use selected region or default
        language: "en",
      };
      
      setUser(mockUser);
      localStorage.setItem("farmer-user", JSON.stringify(mockUser));
      
      // Log registration activity
      logUserActivity(mockUser.id, "registration", { region: mockUser.region });
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    if (user) {
      // Log logout activity
      logUserActivity(user.id, "logout");
    }
    
    setUser(null);
    localStorage.removeItem("farmer-user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
