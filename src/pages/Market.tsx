
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MarketPriceCard from "../components/MarketPriceCard";
import NavigationBar from "../components/NavigationBar";
import LanguageSelector from "../components/LanguageSelector";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Market: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [region, setRegion] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Enhanced market data with all Ghana regions
  const [marketData, setMarketData] = useState([
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

  // All Ghana regions
  const ghanaRegions = [
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
    <div className="pb-20 min-h-screen bg-background">
      {/* Header */}
      <div className="bg-farm-green p-4 text-white shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">{t("marketPrices")}</h1>
          <LanguageSelector />
        </div>
      </div>

      {/* Filters */}
      <div className="container px-4 pt-4 pb-2">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder={t("searchCrops")}
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Select 
            value={region} 
            onValueChange={handleRegionChange}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={t("selectRegion")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allRegions")}</SelectItem>
              {ghanaRegions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={refreshPrices}
            disabled={isLoading}
            className="shrink-0"
          >
            <RefreshCw size={18} className={`${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>
            {t("lastUpdated")}: {lastUpdated.toLocaleTimeString()}
          </span>
          <span>
            {filteredData.length} {filteredData.length === 1 ? t("result") : t("results")}
          </span>
        </div>
      </div>

      {/* Market Prices List */}
      <div className="container px-4 py-2">
        <Card className="shadow-sm">
          <CardContent className="space-y-4 pt-4">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <MarketPriceCard
                  key={index}
                  crop={item.crop}
                  price={item.price}
                  unit={item.unit}
                  change={item.change}
                  region={item.region}
                />
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                {t("noCropsFound")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  );
};

export default Market;
