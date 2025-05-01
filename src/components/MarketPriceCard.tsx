
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

interface MarketPriceProps {
  crop: string;
  price: number;
  unit: string;
  change: number;
  region: string;
}

const MarketPriceCard: React.FC<MarketPriceProps> = ({
  crop,
  price,
  unit,
  change,
  region
}) => {
  const isPositive = change > 0;
  
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg">{crop}</h3>
            <p className="text-xs text-muted-foreground">{region}</p>
          </div>
          
          <div className="text-right">
            <div className="text-xl font-bold">GH₵{price.toFixed(2)}/{unit}</div>
            
            <div 
              className={`flex items-center gap-1 text-sm ${
                isPositive ? "text-farm-green" : "text-destructive"
              }`}
            >
              {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              <span>{Math.abs(change).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketPriceCard;
