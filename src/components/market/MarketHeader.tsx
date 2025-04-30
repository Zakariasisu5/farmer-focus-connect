
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

const MarketHeader: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-farm-green p-4 text-white shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">{t("marketPrices")}</h1>
        <LanguageSelector />
      </div>
    </div>
  );
};

export default MarketHeader;
