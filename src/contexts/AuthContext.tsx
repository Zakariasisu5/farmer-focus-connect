
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

  // Function to generate a UUID v4 from a string ID for Supabase compatibility
  const generateUuidFromString = (str: string): string => {
    // This creates a deterministic UUID v4-like string based on the input string
    // For real UUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where y is 8, 9, A, or B
    const hashCode = (s: string) => {
      let h = 0;
      for (let i = 0; i < s.length; i++) {
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
      }
      return h >>> 0;
    };
    
    const hash = hashCode(str);
    const parts = [
      hash.toString(16).padStart(8, '0'),
      (hash >>> 8).toString(16).padStart(4, '0'),
      ((hash >>> 16) & 0x0fff | 0x4000).toString(16),
      ((hash >>> 24) & 0x3fff | 0x8000).toString(16),
      (hashCode(str + 'salt')).toString(16).padStart(12, '0')
    ];
    
    return parts.join('-');
  };

  // Function to log user activities - modified for UUID compatibility
  const logUserActivity = async (userId: string, activityType: string, details?: any) => {
    try {
      // Convert string ID to UUID-like format for Supabase
      const uuidUserId = generateUuidFromString(userId);
      
      // Direct insert without RPC function to avoid UUID issues
      await supabase.from('user_activities').insert({
        user_id: uuidUserId,
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
