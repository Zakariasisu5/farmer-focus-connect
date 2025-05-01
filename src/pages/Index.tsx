
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import WeatherCard from "../components/WeatherCard";
import MarketPriceCard from "../components/MarketPriceCard";
import NavigationBar from "../components/NavigationBar";
import LanguageSelector from "../components/LanguageSelector";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { MapPin, Calendar } from "lucide-react";

const Index: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Sample data
  const weatherData = [
    {
      day: t("today"),
      condition: "sunny" as const,
      temperature: 28,
      humidity: 65,
    },
    {
      day: t("tomorrow"),
      condition: "rainy" as const,
      temperature: 24,
      humidity: 82,
    },
  ];

  const marketData = [
    {
      crop: "Maize",
      price: 12.45,
      unit: "kg",
      change: 0.3,
      region: "Central Region",
    },
    {
      crop: "Tomatoes",
      price: 8.75,
      unit: "kg",
      change: -0.5,
      region: "Eastern District",
    },
  ];

  return (
    <div className="pb-20 min-h-screen bg-background">
      {/* Header */}
      <div className="bg-farm-green p-4 text-white shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Farmer Focus Connect</h1>
            {user && (
              <div className="flex items-center text-sm mt-1 gap-1 text-white/80">
                <MapPin size={14} />
                <span>{user.region || "Central Region"}</span>
              </div>
            )}
          </div>
          <LanguageSelector />
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="text-farm-earth" />
            {t("weatherForecast")}
          </h2>
          <Button variant="ghost" size="sm" className="text-farm-sky" onClick={() => {}}>
            {t("today")}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {weatherData.map((weather, index) => (
            <WeatherCard
              key={index}
              day={weather.day}
              condition={weather.condition}
              temperature={weather.temperature}
              humidity={weather.humidity}
            />
          ))}
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t("marketPrices")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {marketData.map((market, index) => (
              <MarketPriceCard
                key={index}
                crop={market.crop}
                price={market.price}
                unit={market.unit}
                change={market.change}
                region={market.region}
              />
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2"
              onClick={() => navigate('/market')}
            >
              {t("priceUpdates")}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  );
};

export default Index;
