
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { useLanguage } from "./LanguageContext";
import { useAuth } from "./AuthContext";

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

  // Enhanced market data with all Ghana regions
  const [marketData, setMarketData] = useState<MarketItem[]>([
    { crop: "Maize", price: 2.45, unit: "kg", change: 0.3, region: "Greater Accra" },
    { crop: "Tomatoes", price: 1.75, unit: "kg", change: -0.5, region: "Ashanti Region" },
    { crop: "Potatoes", price: 3.20, unit: "kg", change: 1.2, region: "Northern Region" },
    { crop: "Rice", price: 4.10, unit: "kg", change: -0.2, region: "Central Region" },
    { crop: "Beans", price: 3.75, unit: "kg", change: 0.5, region: "Western Region" },
    { crop: "Wheat", price: 2.90, unit: "kg", change: -0.8, region: "Eastern Region" },
    { crop: "Cassava", price: 1.85, unit: "kg", change: 0.7, region: "Volta Region" },
    { crop: "Plantain", price: 3.45, unit: "bunch", change: 1.1, region: "Upper East Region" },
    { crop: "Yam", price: 4.25, unit: "tuber", change: -0.4, region: "Upper West Region" },
    { crop: "Cocoa", price: 8.75, unit: "kg", change: 2.3, region: "Bono Region" },
    { crop: "Groundnuts", price: 5.60, unit: "kg", change: 0.2, region: "Ahafo Region" },
    { crop: "Millet", price: 3.10, unit: "kg", change: -0.1, region: "Bono East Region" },
    { crop: "Sorghum", price: 2.95, unit: "kg", change: 0.4, region: "North East Region" },
    { crop: "Okra", price: 2.10, unit: "kg", change: 1.5, region: "Oti Region" },
    { crop: "Palm Oil", price: 6.20, unit: "liter", change: 0.9, region: "Savannah Region" },
    { crop: "Onions", price: 2.35, unit: "kg", change: -0.3, region: "Western North Region" }
  ]);

  // Set default region based on user's saved preference if they're logged in
  useEffect(() => {
    if (user?.region && ghanaRegions.includes(user.region)) {
      setRegion(user.region);
    }
  }, [user]);
  
  // Function to simulate fetching updated market data
  const refreshPrices = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Create updated data with random price changes
      const updatedData = marketData.map(item => {
        // Generate random price changes between -5% and +5%
        const changePercent = (Math.random() * 10 - 5) / 100;
        const newPrice = parseFloat((item.price * (1 + changePercent)).toFixed(2));
        
        return {
          ...item,
          price: newPrice,
          change: parseFloat((changePercent * 100).toFixed(1))
        };
      });
      
      setMarketData(updatedData);
      setLastUpdated(new Date());
      setIsLoading(false);
      
      toast.success(t("priceUpdateSuccess"), {
        description: t("latestMarketPrices")
      });
    }, 1500);
  };

  // Save user's region preference
  const handleRegionChange = async (newRegion: string) => {
    setRegion(newRegion);
    
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
