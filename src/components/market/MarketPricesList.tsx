
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import MarketPriceCard from "@/components/MarketPriceCard";
import { useMarket } from "@/contexts/MarketContext";
import { useLanguage } from "@/contexts/LanguageContext";

const MarketPricesList: React.FC = () => {
  const { filteredData } = useMarket();
  const { t } = useLanguage();

  return (
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
  );
};

export default MarketPricesList;
