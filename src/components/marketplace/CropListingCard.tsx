
import React, { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CropListing {
  id: string;
  user_id: string;
  crop_name: string;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  description?: string;
  contact_phone?: string;
  contact_email?: string;
  is_available: boolean;
  created_at: string;
}

interface CropListingCardProps {
  listing: CropListing;
  onUpdate?: () => void;
  onChat?: () => void;
}

const CropListingCard: React.FC<CropListingCardProps> = ({ listing, onUpdate, onChat }) => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);
  
  const isOwner = user?.id === listing.user_id;
  
  const formattedDate = new Date(listing.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
  
  const handleContactClick = () => {
    if (!isAuthenticated) {
      toast.error(t("loginRequired"));
      navigate("/login");
      return;
    }
    setShowContact(true);
    toast.success(t("contactInfoShown"));
  };

  const handleChatClick = () => {
    if (!isAuthenticated) {
      toast.error(t("loginRequired"));
      navigate("/login");
      return;
    }
    
    if (onChat) {
      onChat();
    } else {
      navigate(`/chats/${listing.user_id}`);
    }
    
    toast.success(t("startingChat"));
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-farm-green/10 p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{listing.crop_name}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin size={14} className="mr-1" />
              {listing.location}
            </div>
          </div>
          <div className="font-bold text-farm-green">
            ₵{listing.price} <span className="text-sm font-normal">/ {listing.unit}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {t("quantity")}: <span className="font-medium text-foreground">{listing.quantity} {listing.unit}</span>
          </div>
          
          {listing.description && (
            <div className="text-sm">
              <div className="text-muted-foreground mb-1">{t("description")}:</div>
              <p className="line-clamp-3">{listing.description}</p>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">{t("postedOn")}: {formattedDate}</div>
          
          {showContact && (
            <div className="bg-muted p-3 rounded-md mt-2">
              <h4 className="font-medium mb-2">{t("contactInfo")}</h4>
              {listing.contact_phone && (
                <div className="flex items-center gap-2 text-sm mb-1">
                  <Phone size={14} />
                  <a href={`tel:${listing.contact_phone}`} className="text-primary">{listing.contact_phone}</a>
                </div>
              )}
              {listing.contact_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={14} />
                  <a href={`mailto:${listing.contact_email}`} className="text-primary">{listing.contact_email}</a>
                </div>
              )}
              {!listing.contact_phone && !listing.contact_email && (
                <p className="text-sm text-muted-foreground">{t("noContactInfo")}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-card p-4 pt-0">
        {!isOwner ? (
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button 
              onClick={handleContactClick} 
              variant={showContact ? "outline" : "default"}
              className="w-full"
            >
              {showContact ? t("hideContact") : t("viewContact")}
            </Button>
            <Button 
              onClick={handleChatClick}
              variant="secondary" 
              className="w-full"
            >
              <MessageCircle size={16} className="mr-1" />
              {t("chat")}
            </Button>
          </div>
        ) : (
          <Button variant="secondary" className="w-full" disabled>
            {t("yourListing")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CropListingCard;
