
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MarketItem } from "@/contexts/MarketContext";

export const fetchMarketPrices = async (region?: string): Promise<MarketItem[]> => {
  try {
    let query = supabase
      .from('market_prices')
      .select('*')
      .order('updated_at', { ascending: false });
    
    // Filter by region if provided
    if (region && region !== "all") {
      query = query.eq('region', region);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching market prices:", error);
      throw error;
    }
    
    // Check if we have any data
    if (data && data.length > 0) {
      // Check if data is recent (less than 24 hours)
      const mostRecentDate = new Date(data[0].updated_at);
      const now = new Date();
      const timeDiff = now.getTime() - mostRecentDate.getTime();
      
      // If we have recent data (less than 24 hours old)
      if (timeDiff < 24 * 60 * 60 * 1000) {
        return data.map(item => ({
          crop: item.crop,
          price: item.price,
          unit: item.unit,
          change: item.change || 0,
          region: item.region
        }));
      }
    }
    
    // If no data or data is too old, generate and store new data
    return await generateAndStoreMarketPrices();
  } catch (error) {
    console.error("Market service error:", error);
    toast.error("Could not update market prices");
    return [];
  }
};

export const generateAndStoreMarketPrices = async (): Promise<MarketItem[]> => {
  // Sample crops and regions
  const crops = ["Maize", "Rice", "Cassava", "Yam", "Plantain", "Tomatoes", "Onions", "Peppers", "Cocoa", "Palm Oil"];
  const regions = [
    "Greater Accra", "Ashanti Region", "Northern Region", "Central Region",
    "Western Region", "Eastern Region", "Volta Region", "Upper East Region",
    "Upper West Region", "Bono Region"
  ];
  const units = ["kg", "bunch", "sack", "tuber", "crate", "liter"];
  
  // Generate market data
  const marketData: MarketItem[] = [];
  
  // Ensure we have at least one item per region
  regions.forEach(region => {
    // Random number of crops per region (1-3)
    const numCrops = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numCrops; i++) {
      const randomCropIndex = Math.floor(Math.random() * crops.length);
      const randomUnitIndex = Math.floor(Math.random() * units.length);
      
      const crop = crops[randomCropIndex];
      const unit = units[randomUnitIndex];
      const price = parseFloat((Math.random() * 10 + 1).toFixed(2)); // Random price between 1-11 GH₵
      const change = parseFloat((Math.random() * 2 - 1).toFixed(1)); // Random change between -1% and +1%
      
      marketData.push({
        crop,
        price,
        unit,
        change,
        region
      });
    }
  });
  
  // Store data in the database
  try {
    // Insert new market data
    const { error } = await supabase.from('market_prices').insert(marketData);
    
    if (error) {
      console.error("Error storing market data:", error);
      throw error;
    }
    
    return marketData;
  } catch (error) {
    console.error("Error generating market data:", error);
    toast.error("Failed to update market prices");
    return [];
  }
};
