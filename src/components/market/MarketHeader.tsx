
import React from "react";
import { useMarket, ghanaRegions } from "@/contexts/MarketContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";

const MarketHeader: React.FC = () => {
  const { t } = useLanguage();
  const { region } = useMarket();
  
  // Get the display name for the region (showing "All Regions" if "all" is selected)
  const displayRegion = region === "all" ? t("allRegions") : region;
  
  return (
    <div className="bg-farm-green p-4 text-white shadow-md">
      <div className="container px-4 mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{t("marketPrices")}</h1>
            <div className="flex items-center text-sm mt-1 gap-1 text-white/80">
              <MapPin size={14} />
              <span>{displayRegion}</span>
            </div>
          </div>
          <LanguageSelector />
        </div>
      </div>
    </div>
  );
};

export default MarketHeader;
