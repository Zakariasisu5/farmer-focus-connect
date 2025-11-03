
import React, { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface CropListing {
  id: string;
  user_id: string;
  crop_name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
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

const CropListingCard: React.FC<CropListingCardProps> = ({ listing, onUpdate }) => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  
  const isOwner = user?.id === listing.user_id;
  
  const formattedDate = new Date(listing.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  // Function to generate a UUID v4 from a string ID for Supabase compatibility
  const generateUuidFromString = (str: string): string => {
    // This creates a deterministic UUID v4-like string based on the input string
    const hashCode = (s: string) => {
      let h = 0;
      for (let i = 0; i < s.length; i++) {
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
      }
      return h >>> 0;
    };
    
    const hash = hashCode(str);
    const parts = [
      hash.toString(16).padStart(8, '0'),
      (hash >>> 8).toString(16).padStart(4, '0'),
      ((hash >>> 16) & 0x0fff | 0x4000).toString(16),
      ((hash >>> 24) & 0x3fff | 0x8000).toString(16),
      (hashCode(str + 'salt')).toString(16).padStart(12, '0')
    ];
    
    return parts.join('-');
  };
  
  const handleContactClick = () => {
    if (!isAuthenticated) {
      toast.error(t("loginRequired"));
      navigate("/login");
      return;
    }
    setShowContact(prev => !prev);
    if (!showContact) {
      toast.success(t("contactInfoShown"));
    }
  };

  const handleChatClick = async () => {
    if (!isAuthenticated) {
      toast.error(t("loginRequired"));
      navigate("/login");
      return;
    }
    
    if (isOwner) {
      toast.error(t("cannotChatWithYourself"));
      return;
    }
    
    try {
      setIsStartingChat(true);
      
      // Convert string IDs to UUID format
      const currentUserUuid = generateUuidFromString(user!.id);
      const listingOwnerUuid = generateUuidFromString(listing.user_id);
      
      console.log("Starting chat between:", {
        currentUser: user!.id,
        currentUserUuid,
        listingOwner: listing.user_id,
        listingOwnerUuid
      });
      
      // Check if there's an existing conversation between these users first
      const { data: existingConversations, error: fetchError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id')
        .eq('user_id', currentUserUuid);
      
      if (fetchError) {
        console.error("Error fetching conversations:", fetchError);
        throw fetchError;
      }
      
      let conversationId = null;
      
      if (existingConversations && existingConversations.length > 0) {
        console.log("Found existing conversations:", existingConversations);
        
        // For each conversation the current user is in, check if the listing owner is also in it
        for (const conv of existingConversations) {
          const { data: otherParticipant, error: participantError } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.conversation_id)
            .eq('user_id', listingOwnerUuid)
            .single();
          
          if (participantError) {
            console.log("Error or no match when checking participant:", participantError);
            continue;
          }
          
          if (otherParticipant) {
            console.log("Found existing conversation with both users:", conv.conversation_id);
            // Found a conversation with both users
            conversationId = conv.conversation_id;
            break;
          }
        }
      }
      
      // If no existing conversation, create a new one
      if (!conversationId) {
        console.log("Creating new conversation between users");
        
        // Create new conversation
        const { data: newConversation, error: conversationError } = await supabase
          .from('conversations')
          .insert({})
          .select();
          
        if (conversationError) {
          console.error("Error creating conversation:", conversationError);
          throw conversationError;
        }
        
        if (!newConversation || newConversation.length === 0) {
          throw new Error("Failed to create conversation");
        }
        
        conversationId = newConversation[0].id;
        console.log("Created new conversation:", conversationId);
        
        // Add both users as participants
        const participantsToAdd = [
          { conversation_id: conversationId, user_id: currentUserUuid },
          { conversation_id: conversationId, user_id: listingOwnerUuid }
        ];
        
        console.log("Adding participants:", participantsToAdd);
        
        const { error: participantError } = await supabase
          .from('conversation_participants')
          .insert(participantsToAdd);
          
        if (participantError) {
          console.error("Error adding participants:", participantError);
          throw participantError;
        }
      }
      
      setIsStartingChat(false);
      toast.success(t("startingChat"));
      navigate(`/chats/${conversationId}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error(t("errorStartingChat"));
      setIsStartingChat(false);
    }
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
            ₵{listing.price_per_unit} <span className="text-sm font-normal">/ {listing.unit}</span>
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
              disabled={isStartingChat}
            >
              <MessageCircle size={16} className="mr-1" />
              {isStartingChat ? t("connecting") : t("chat")}
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
