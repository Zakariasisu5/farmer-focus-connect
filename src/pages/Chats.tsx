
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import NavigationBar from "@/components/NavigationBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MessageSquare, User, Search, Loader2 } from "lucide-react";
import ChatListItem from "@/components/chat/ChatListItem";

interface Conversation {
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

  // Fetch user's conversations
  const { data: conversations, isLoading, refetch } = useQuery({
    queryKey: ["userConversations", user?.id],
    queryFn: async () => {
      try {
        if (!user) return [];
        
        console.log("Fetching conversations for user:", user.id);
        
        // Get conversations where the user is a participant
        const { data: participantsData, error: participantsError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user.id);
          
        if (participantsError) {
          console.error("Error fetching participants:", participantsError);
          throw participantsError;
        }
        
        if (!participantsData || !participantsData.length) {
          console.log("No conversations found for user");
          return [];
        }
        
        const conversationIds = participantsData.map(p => p.conversation_id);
        console.log("Found conversations:", conversationIds);
        
        // Get all conversation participants for these conversations
        const { data: allParticipants, error: allParticipantsError } = await supabase
          .from('conversation_participants')
          .select('conversation_id, user_id')
          .in('conversation_id', conversationIds);
          
        if (allParticipantsError) {
          console.error("Error fetching all participants:", allParticipantsError);
          throw allParticipantsError;
        }
        
        // For each conversation, count unread messages directly
        const unreadCounts = [];
        for (const convId of conversationIds) {
          const { data, error } = await supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('conversation_id', convId)
            .neq('user_id', user.id)
            .eq('read', false);
            
          if (!error) {
            unreadCounts.push({ 
              conversation_id: convId, 
              count: data?.length || 0 
            });
          }
        }
        
        // Get the last message for each conversation
        const { data: lastMessages, error: lastMessagesError } = await supabase
          .from('messages')
          .select('conversation_id, content, created_at, user_id')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false });
          
        if (lastMessagesError) {
          console.error("Error fetching last messages:", lastMessagesError);
          throw lastMessagesError;
        }
        
        // Build conversation objects
        const conversationsMap = new Map();
        
        allParticipants?.forEach(participant => {
          if (participant.user_id !== user.id) {
            if (!conversationsMap.has(participant.conversation_id)) {
              conversationsMap.set(participant.conversation_id, {
                id: participant.conversation_id,
                other_user_id: participant.user_id,
                created_at: new Date().toISOString(),
                other_user_name: `User ${participant.user_id.slice(0, 5)}`, // Default name
                unread_count: 0
              });
            }
          }
        });
        
        // Add unread counts
        unreadCounts?.forEach(item => {
          const conversation = conversationsMap.get(item.conversation_id);
          if (conversation) {
            conversation.unread_count = Number(item.count);
          }
        });
        
        // Add last messages
        lastMessages?.forEach(msg => {
          const conversation = conversationsMap.get(msg.conversation_id);
          if (conversation && (!conversation.last_message_time || new Date(msg.created_at) > new Date(conversation.last_message_time))) {
            conversation.last_message = msg.content;
            conversation.last_message_time = msg.created_at;
          }
        });
        
        console.log("Processed conversations:", Array.from(conversationsMap.values()));
        return Array.from(conversationsMap.values());
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast.error(t("errorFetchingChats"));
        return [];
      }
    },
    enabled: !!isAuthenticated && !!user?.id
  });

  // Filter conversations based on search term
  const filteredConversations = conversations?.filter(conversation => 
    conversation.other_user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Set up realtime subscription for new messages
  useEffect(() => {
    if (!user?.id) return;
    
    const channel = supabase
      .channel('chat-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, () => {
        // Refetch conversations when a new message is inserted
        refetch();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, user?.id]);

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
          <div className="py-10 text-center flex flex-col items-center">
            <Loader2 size={32} className="animate-spin text-farm-green mb-2" />
            <p className="text-muted-foreground">{t("loadingChats")}</p>
          </div>
        ) : filteredConversations?.length === 0 ? (
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
            {filteredConversations?.map((conversation) => (
              <ChatListItem 
                key={conversation.id} 
                chat={conversation} 
                onClick={() => navigate(`/chats/${conversation.id}`)} 
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
