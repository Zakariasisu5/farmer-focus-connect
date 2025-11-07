
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, PenSquare, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import NavigationBar from "@/components/NavigationBar";
import ChatListItem from "@/components/chat/ChatListItem";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch user's chats
  const { 
    data: chats, 
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["chats", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // Get all conversations the user participates in
        const { data: userConversations, error: convsError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user.id);

        if (convsError) {
          console.error("Error fetching conversations:", convsError);
          throw convsError;
        }

        console.log("User conversations:", userConversations);
        if (!userConversations || userConversations.length === 0) {
          return [];
        }

        // Extract conversation IDs
        const conversationIds = userConversations.map(c => c.conversation_id);
        console.log("Conversation IDs:", conversationIds);

        // For each conversation, find the other participant
        const chatPromises = conversationIds.map(async (convId) => {
          // Get other participants
          const { data: participants, error: participantsError } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', convId)
            .neq('user_id', user.id);

          if (participantsError) {
            console.error("Error fetching participants:", participantsError);
            throw participantsError;
          }

          if (!participants || participants.length === 0) {
            console.log("No other participants found for conversation:", convId);
            return null;
          }

          const otherUserId = participants[0].user_id;
          console.log("Other user ID:", otherUserId);
          
          // Get other user's profile
          const { data: otherUserProfile, error: profileError } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', otherUserId)
            .single();
          
          if (profileError) {
            console.error("Error fetching profile:", profileError);
          }
          
          // Get conversation details
          const { data: conversation, error: conversationError } = await supabase
            .from('conversations')
            .select('created_at')
            .eq('id', convId)
            .single();

          if (conversationError) {
            console.error("Error fetching conversation:", conversationError);
            throw conversationError;
          }

          // Get latest message
          const { data: latestMessage, error: messageError } = await supabase
            .from('messages')
            .select('content, created_at, user_id')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Count unread messages - simplified for now
          let unreadMessages = 0;

          return {
            id: convId,
            created_at: conversation.created_at,
            last_message: latestMessage?.content || null,
            last_message_time: latestMessage?.created_at || conversation.created_at,
            other_user_id: otherUserId,
            other_user_name: otherUserProfile?.name || "Unknown User",
            unread_count: unreadMessages
          };
        });

        // Execute all promises and filter out null results
        const results = await Promise.all(chatPromises);
        const validChats = results.filter(chat => chat !== null) as Chat[];
        
        // Sort by latest message time
        return validChats.sort((a, b) => {
          const timeA = a.last_message_time || a.created_at;
          const timeB = b.last_message_time || b.created_at;
          return new Date(timeB).getTime() - new Date(timeA).getTime();
        });
      } catch (error) {
        console.error("Error fetching chats:", error);
        toast.error(t("errorFetchingChats"));
        return [];
      }
    },
    enabled: !!user
  });

  // Listen for new messages using Supabase realtime
  useEffect(() => {
    if (!user) return;
    
    // Subscribe to message events for all conversations
    const channel = supabase
      .channel('chats-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as { user_id: string; conversation_id: string; content: string };
          
          // Only show notification if message is not from current user
          if (newMessage.user_id !== user.id) {
            // Get sender's name
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', newMessage.user_id)
              .single();
            
            const senderName = senderProfile?.name || "Someone";
            toast.message(`${senderName}`, {
              description: newMessage.content,
              action: {
                label: t("viewContact"),
                onClick: () => navigate(`/chats/${newMessage.conversation_id}`)
              }
            });
          }
          
          // Refetch chats to update the UI
          refetch();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch, navigate, t]);

  // Filter chats based on search
  const filteredChats = searchTerm.trim() === "" 
    ? chats 
    : chats?.filter(chat => 
        chat.other_user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="pb-20 min-h-screen bg-background">
      {/* Header */}
      <div className="bg-farm-green p-4 text-white shadow-md">
        <div className="container px-4 mx-auto">
          <h1 className="text-xl font-bold">{t("chats")}</h1>
          <p className="text-sm mt-1">{t("connectWithFarmersAndBuyers")}</p>
        </div>
      </div>
      
      {/* Search */}
      <div className="container mx-auto px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            className="pl-10"
            placeholder={t("searchChats")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* No chats state */}
      {!isLoading && (!chats || chats.length === 0) && (
        <div className="flex flex-col items-center justify-center p-8 mt-8 text-center">
          <MessageSquare size={64} className="text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">{t("noChatsYet")}</h2>
          <p className="text-muted-foreground mb-6 max-w-xs">
            {t("noChatsDescription")}
          </p>
          <Button onClick={() => navigate('/marketplace')}>
            <PenSquare size={16} className="mr-2" />
            {t("browseMarketplace")}
          </Button>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="container mx-auto px-4 divide-y">
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-4 flex items-center">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="ml-3 space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Chat list */}
      {!isLoading && filteredChats && filteredChats.length > 0 && (
        <div className="container mx-auto px-4 divide-y">
          {filteredChats.map(chat => (
            <ChatListItem 
              key={chat.id}
              chat={chat}
              onClick={() => navigate(`/chats/${chat.id}`)}
            />
          ))}
        </div>
      )}
      
      {/* Navigation bar */}
      <NavigationBar />
    </div>
  );
};

export default Chats;
