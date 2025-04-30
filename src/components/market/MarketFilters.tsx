
import React from "react";
import { Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMarket, ghanaRegions } from "@/contexts/MarketContext";

const MarketFilters: React.FC = () => {
  const { t } = useLanguage();
  const { 
    searchTerm, 
    setSearchTerm, 
    region, 
    handleRegionChange, 
    refreshPrices, 
    isLoading,
    lastUpdated,
    filteredData
  } = useMarket();

  return (
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
  );
};

export default MarketFilters;
