
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Log user activity but handle string IDs
        if (parsedUser && parsedUser.id) {
          logUserActivity(parsedUser.id, "app_login").catch(err => {
            console.error("Failed to log activity:", err);
          });
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.removeItem("farmer-user");
      }
    }
    
    setIsLoading(false);
  }, []);

  // Function to log user activities - modified for string IDs
  const logUserActivity = async (userId: string, activityType: string, details?: any) => {
    try {
      // Direct insert without RPC function to avoid UUID issues
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
      toast.success("Login successful!");
      
      // Log login activity
      await logUserActivity(mockUser.id, "login");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please try again.");
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
      toast.success("Registration successful!");
      
      // Log registration activity
      await logUserActivity(mockUser.id, "registration", { region: mockUser.region });
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    if (user) {
      // Log logout activity
      logUserActivity(user.id, "logout").catch(console.error);
      toast.success("Logged out successfully");
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
