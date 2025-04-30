
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MarketPriceCard from "../components/MarketPriceCard";
import NavigationBar from "../components/NavigationBar";
import LanguageSelector from "../components/LanguageSelector";
import { useLanguage } from "../contexts/LanguageContext";
import { Search } from "lucide-react";

const Market: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [region, setRegion] = useState("all");

  // Enhanced market data with Ghana regions
  const marketData = [
    {
      crop: "Maize",
      price: 2.45,
      unit: "kg",
      change: 0.3,
      region: "Greater Accra",
    },
    {
      crop: "Tomatoes",
      price: 1.75,
      unit: "kg",
      change: -0.5,
      region: "Ashanti Region",
    },
    {
      crop: "Potatoes",
      price: 3.20,
      unit: "kg",
      change: 1.2,
      region: "Northern Region",
    },
    {
      crop: "Rice",
      price: 4.10,
      unit: "kg",
      change: -0.2,
      region: "Central Region",
    },
    {
      crop: "Beans",
      price: 3.75,
      unit: "kg",
      change: 0.5,
      region: "Western Region",
    },
    {
      crop: "Wheat",
      price: 2.90,
      unit: "kg",
      change: -0.8,
      region: "Eastern Region",
    },
    {
      crop: "Cassava",
      price: 1.85,
      unit: "kg",
      change: 0.7,
      region: "Volta Region",
    },
    {
      crop: "Plantain",
      price: 3.45,
      unit: "bunch",
      change: 1.1,
      region: "Upper East Region",
    },
    {
      crop: "Yam",
      price: 4.25,
      unit: "tuber",
      change: -0.4,
      region: "Upper West Region",
    },
    {
      crop: "Cocoa",
      price: 8.75,
      unit: "kg",
      change: 2.3,
      region: "Bono Region",
    },
    {
      crop: "Groundnuts",
      price: 5.60,
      unit: "kg",
      change: 0.2,
      region: "Ahafo Region",
    },
    {
      crop: "Millet",
      price: 3.10,
      unit: "kg",
      change: -0.1,
      region: "Bono East Region",
    },
    {
      crop: "Sorghum",
      price: 2.95,
      unit: "kg",
      change: 0.4,
      region: "North East Region",
    },
    {
      crop: "Okra",
      price: 2.10,
      unit: "kg",
      change: 1.5,
      region: "Oti Region",
    },
    {
      crop: "Palm Oil",
      price: 6.20,
      unit: "liter",
      change: 0.9,
      region: "Savannah Region",
    },
    {
      crop: "Onions",
      price: 2.35,
      unit: "kg",
      change: -0.3,
      region: "Western North Region",
    }
  ];

  const filteredData = marketData.filter((item) => {
    const matchesSearch = item.crop.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = region === "all" || item.region === region;
    return matchesSearch && matchesRegion;
  });

  const uniqueRegions = Array.from(new Set(marketData.map((item) => item.region)));

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
            placeholder="Search crops..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger>
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {uniqueRegions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Market Prices List */}
      <div className="container px-4 py-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {filteredData.length} {filteredData.length === 1 ? "Result" : "Results"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                No crops found matching your criteria.
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
