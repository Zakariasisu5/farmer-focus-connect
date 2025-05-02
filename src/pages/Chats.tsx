
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import NavigationBar from "@/components/NavigationBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MessageSquare, User, Search } from "lucide-react";
import ChatListItem from "@/components/chat/ChatListItem";

interface Chat {
  id: string;
  created_at: string;
  last_message?: string;
  last_message_time?: string;
  other_user_id: string;
  other_user_name?: string;
  unread_count: number;
}

const Chats: React.FC = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch user's chats
  const { data: chats, isLoading, refetch } = useQuery({
    queryKey: ["userChats", user?.id],
    queryFn: async () => {
      try {
        if (!user) return [];
        
        // Note: This is a simplified implementation. In a real app, you'd need to create a proper chats table
        // and fetch actual chat data. For now, we'll just fetch users who have crop listings
        const { data, error } = await supabase
          .from("crop_listings")
          .select("user_id")
          .not("user_id", "eq", user.id)
          .limit(10);
          
        if (error) throw error;
        
        // Transform the data into chat-like objects
        const mockChats = data?.map((item, index) => ({
          id: `chat-${index}`,
          created_at: new Date().toISOString(),
          last_message: "Interested in your crops",
          last_message_time: new Date().toISOString(),
          other_user_id: item.user_id,
          other_user_name: `Farmer ${index + 1}`,
          unread_count: Math.floor(Math.random() * 3) // Random unread count for demo
        })) || [];
        
        return mockChats;
      } catch (error) {
        console.error("Error fetching chats:", error);
        toast.error(t("errorFetchingChats"));
        return [];
      }
    },
    enabled: !!isAuthenticated && !!user?.id
  });

  // Filter chats based on search term
  const filteredChats = chats?.filter(chat => 
    chat.other_user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container px-4 py-8 mx-auto">
          <div className="text-center py-10">
            <MessageSquare size={48} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("loginToChat")}</h2>
            <p className="text-muted-foreground mb-6">{t("chatLoginDescription")}</p>
            <Button onClick={() => navigate("/login")}>
              {t("login")}
            </Button>
          </div>
        </div>
        <NavigationBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-farm-green p-4 text-white shadow-md">
        <div className="container px-4 mx-auto">
          <h1 className="text-xl font-bold">{t("chats")}</h1>
          <p className="text-sm mt-1">{t("chatWithSellers")}</p>
        </div>
      </div>

      {/* Search */}
      <div className="container px-4 py-4 mx-auto">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder={t("searchChats")}
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Chat List */}
        {isLoading ? (
          <div className="py-10 text-center text-muted-foreground">{t("loading")}</div>
        ) : filteredChats?.length === 0 ? (
          <div className="py-10 text-center">
            <User size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t("noChatsFound")}</p>
            <Button 
              onClick={() => navigate("/marketplace")} 
              variant="outline" 
              className="mt-4"
            >
              {t("browseMarketplace")}
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {filteredChats?.map((chat) => (
              <ChatListItem 
                key={chat.id} 
                chat={chat} 
                onClick={() => navigate(`/chats/${chat.id}`)} 
              />
            ))}
          </div>
        )}
      </div>

      <NavigationBar />
    </div>
  );
};

export default Chats;
