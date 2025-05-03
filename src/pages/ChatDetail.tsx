
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { toast } from "sonner";

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface Participant {
  user_id: string;
}

const ChatDetail: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  // Fetch conversation participants to get the other user's info
  const { data: chatInfo, isLoading: loadingParticipants } = useQuery({
    queryKey: ["chatParticipants", chatId],
    queryFn: async () => {
      try {
        if (!user || !chatId) throw new Error("Missing user or chat ID");
        
        // Since we're using string IDs instead of UUIDs in the mock auth,
        // we need to adapt our query approach
        const { data: participants, error } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', chatId);
          
        if (error) {
          console.error("Error fetching participants:", error);
          throw error;
        }
        
        // Find the other participant (not the current user)
        const otherParticipant = participants?.find(p => p.user_id !== user.id);
        
        if (!otherParticipant) {
          throw new Error("Could not find chat participant");
        }
        
        // For now, we'll skip the mark as read function since it may be causing issues
        // with the UUID format
        
        return {
          id: chatId,
          other_user_id: otherParticipant.user_id,
          other_user_name: `User ${otherParticipant.user_id.slice(0, 5)}` // Default name
        };
      } catch (error) {
        console.error("Error fetching chat info:", error);
        toast.error(t("errorLoadingChat"));
        return null;
      }
    },
    enabled: !!user && !!chatId && !!isAuthenticated
  });
  
  // Fetch messages for this chat
  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ["chatMessages", chatId],
    queryFn: async () => {
      try {
        if (!chatId) return [];
        
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', chatId)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error(t("errorLoadingMessages"));
        return [];
      }
    },
    enabled: !!chatId && !!chatInfo
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageContent: string) => {
      if (!user || !chatId) throw new Error("Missing user or chat ID");
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: chatId,
          user_id: user.id,
          content: messageContent
        })
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch messages
      queryClient.invalidateQueries({ queryKey: ["chatMessages", chatId] });
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      toast.error(t("errorSendingMessage"));
    }
  });
  
  // Set up realtime subscription for new messages
  useEffect(() => {
    if (!chatId) return;
    
    const channel = supabase
      .channel('chat-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${chatId}`
      }, (payload) => {
        // Refetch messages when a new one is inserted
        queryClient.invalidateQueries({ queryKey: ["chatMessages", chatId] });
        
        // Mark as read if from another user
        if (payload.new.user_id !== user?.id) {
          try {
            // Using a direct update instead of the function to avoid UUID issues
            supabase
              .from('messages')
              .update({ read: true })
              .eq('conversation_id', chatId)
              .neq('user_id', user?.id)
              .eq('read', false);
          } catch (error) {
            console.error("Error marking messages as read:", error);
          }
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, queryClient, user?.id]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;
    
    const messageToSend = newMessage;
    setNewMessage("");
    
    try {
      await sendMessageMutation.mutateAsync(messageToSend);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };
  
  const isLoading = loadingParticipants || loadingMessages;
  
  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }
  
  if (!chatId || !user) {
    navigate("/chats");
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-farm-green text-white p-4 flex items-center shadow-md">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/chats")}
          className="text-white hover:bg-farm-green/80 mr-2"
        >
          <ArrowLeft size={20} />
        </Button>
        
        {isLoading ? (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/30 flex items-center justify-center animate-pulse"></div>
            <div className="w-24 h-5 bg-primary/30 animate-pulse ml-2 rounded"></div>
          </div>
        ) : (
          <>
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback className="bg-primary/30 text-white text-sm">
                {chatInfo?.other_user_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-base font-medium">
                {chatInfo?.other_user_name || t("user")}
              </h1>
            </div>
          </>
        )}
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="py-10 text-center flex flex-col items-center">
            <Loader2 size={32} className="animate-spin text-farm-green mb-2" />
            <p className="text-muted-foreground">{t("loadingMessages")}</p>
          </div>
        ) : messages?.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-muted-foreground">{t("noMessages")}</p>
            <p className="text-sm mt-2">{t("sendFirstMessage")}</p>
          </div>
        ) : (
          messages?.map((message) => {
            const isCurrentUser = message.user_id === user?.id;
            const messageDate = new Date(message.created_at);
            const formattedTime = format(messageDate, "HH:mm");
            
            return (
              <div 
                key={message.id}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isCurrentUser 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs block text-right mt-1 opacity-70">
                    {formattedTime}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <form 
        onSubmit={handleSendMessage}
        className="p-3 border-t border-border flex gap-2"
      >
        <Input
          placeholder={t("typeMessage")}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1"
          disabled={sendMessageMutation.isPending}
        />
        <Button 
          type="submit"
          disabled={!newMessage.trim() || sendMessageMutation.isPending}
          size="icon"
          className="shrink-0"
        >
          {sendMessageMutation.isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </Button>
      </form>
    </div>
  );
};

export default ChatDetail;
