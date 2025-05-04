
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { useLanguage } from "./LanguageContext";
import { useAuth } from "./AuthContext";
import { fetchMarketPrices } from "@/services/MarketService";
import { supabase } from "@/integrations/supabase/client";

// Define types for our market context
export interface MarketItem {
  crop: string;
  price: number;
  unit: string;
  change: number;
  region: string;
}

interface MarketContextType {
  marketData: MarketItem[];
  searchTerm: string;
  region: string;
  isLoading: boolean;
  lastUpdated: Date;
  filteredData: MarketItem[];
  setSearchTerm: (term: string) => void;
  setRegion: (region: string) => void;
  refreshPrices: () => void;
  handleRegionChange: (newRegion: string) => Promise<void>;
}

// All Ghana regions
export const ghanaRegions = [
  "Greater Accra",
  "Ashanti Region",
  "Northern Region",
  "Central Region",
  "Western Region",
  "Eastern Region",
  "Volta Region",
  "Upper East Region",
  "Upper West Region",
  "Bono Region",
  "Ahafo Region",
  "Bono East Region",
  "North East Region",
  "Oti Region",
  "Savannah Region",
  "Western North Region"
];

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [region, setRegion] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [marketData, setMarketData] = useState<MarketItem[]>([]);

  // Function to generate a UUID v4 from a string ID for Supabase compatibility
  const generateUuidFromString = (str: string): string => {
    if (!str) return "";
    
    // This creates a deterministic UUID v4-like string based on the input string
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

  // Initial data fetch on component mount
  useEffect(() => {
    loadMarketPrices();
  }, []);

  // Set default region based on user's saved preference if they're logged in
  useEffect(() => {
    if (user?.region && ghanaRegions.includes(user.region)) {
      setRegion(user.region);
    }
  }, [user]);
  
  // Function to load market prices from database
  const loadMarketPrices = async () => {
    setIsLoading(true);
    
    try {
      const data = await fetchMarketPrices(region !== "all" ? region : undefined);
      
      if (data && data.length > 0) {
        setMarketData(data);
        setLastUpdated(new Date());
        
        // Log user activity if user is logged in
        if (user) {
          logUserActivity("view_market_prices", { region });
        }
      } else {
        toast.error(t("errorFetchingMarketData"));
      }
    } catch (error) {
      console.error("Error loading market prices:", error);
      toast.error(t("errorFetchingMarketData"));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to log user activities
  const logUserActivity = async (activityType: string, details?: any) => {
    if (!user) return;
    
    try {
      // Convert string ID to UUID format
      const uuidUserId = generateUuidFromString(user.id);
      
      await supabase.from('user_activities').insert({
        user_id: uuidUserId,
        activity_type: activityType,
        details: details || {}
      });
    } catch (error) {
      console.error("Failed to log user activity:", error);
    }
  };
  
  // Function to refresh market prices
  const refreshPrices = () => {
    setIsLoading(true);
    
    // Log the refresh attempt
    logUserActivity("refresh_market_prices", { region });
    
    // Load the latest prices
    loadMarketPrices();
  };

  // Save user's region preference
  const handleRegionChange = async (newRegion: string) => {
    setRegion(newRegion);
    
    // Log the region change
    logUserActivity("change_market_region", { 
      previous_region: region,
      new_region: newRegion 
    });
    
    // Only save region preference if user is logged in and region is a specific region (not "all")
    if (user && newRegion !== "all") {
      try {
        // This is a simplified version - in a real app you'd update the user's profile in Supabase
        toast.success(t("regionPreferenceUpdated"), {
          description: newRegion
        });
      } catch (error) {
        console.error("Error saving region preference:", error);
        toast.error(t("errorSavingPreference"));
      }
    }
    
    // Refresh prices for the new region
    await loadMarketPrices();
  };

  const filteredData = marketData.filter((item) => {
    const matchesSearch = item.crop.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = region === "all" || item.region === region;
    return matchesSearch && matchesRegion;
  });

  return (
    <MarketContext.Provider
      value={{
        marketData,
        searchTerm,
        region,
        isLoading,
        lastUpdated,
        filteredData,
        setSearchTerm,
        setRegion,
        refreshPrices,
        handleRegionChange
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (context === undefined) {
    throw new Error("useMarket must be used within a MarketProvider");
  }
  return context;
};
