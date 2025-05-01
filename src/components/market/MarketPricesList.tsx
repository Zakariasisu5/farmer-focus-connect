
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import MarketPriceCard from "@/components/MarketPriceCard";
import { useMarket } from "@/contexts/MarketContext";
import { useLanguage } from "@/contexts/LanguageContext";

const MarketPricesList: React.FC = () => {
  const { filteredData, region } = useMarket();
  const { t } = useLanguage();

  const isRegionSpecific = region !== "all";

  // Use card view for mobile screens and table view for larger screens
  return (
    <div className="container px-4 py-2 pb-20">
      {/* For mobile: Stack of cards */}
      <div className="md:hidden">
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

      {/* For desktop: Table view */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("crop")}</TableHead>
                  <TableHead>{t("price")}</TableHead>
                  {!isRegionSpecific && <TableHead>{t("region")}</TableHead>}
                  <TableHead className="text-right">{t("change")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.crop}</TableCell>
                      <TableCell>GH₵{item.price.toFixed(2)}/{item.unit}</TableCell>
                      {!isRegionSpecific && <TableCell>{item.region}</TableCell>}
                      <TableCell className={`text-right ${item.change > 0 ? 'text-farm-green' : 'text-destructive'}`}>
                        {item.change > 0 ? '+' : ''}{item.change?.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isRegionSpecific ? 3 : 4} className="text-center py-6 text-muted-foreground">
                      {t("noCropsFound")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketPricesList;
