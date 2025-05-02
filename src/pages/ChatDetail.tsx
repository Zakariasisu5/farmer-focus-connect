
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Send, User } from "lucide-react";
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
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

const ChatDetail: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mock chat data for demo
  const chatInfo = {
    id: chatId,
    other_user_id: "user-2",
    other_user_name: "Farmer John"
  };
  
  // Fetch messages for this chat
  const { data: messages, isLoading, refetch } = useQuery({
    queryKey: ["chatMessages", chatId],
    queryFn: async () => {
      // In a real app, you'd fetch real messages from your database
      // For now, we'll return some mock messages
      const mockMessages: Message[] = [
        {
          id: "msg1",
          sender_id: "user-2",
          content: "Hello, I'm interested in your maize. Is it still available?",
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          is_read: true
        },
        {
          id: "msg2",
          sender_id: user?.id || "",
          content: "Yes, it's still available. How much would you like?",
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          is_read: true
        },
        {
          id: "msg3",
          sender_id: "user-2",
          content: "I need about 50kg. What's your best price?",
          created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          is_read: true
        }
      ];
      
      return mockMessages;
    }
  });
  
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
    
    // In a real app, you'd insert the message into your database
    // For now we'll just simulate adding it to our local state
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender_id: user.id,
      content: messageToSend,
      created_at: new Date().toISOString(),
      is_read: false
    };
    
    // Optimistically update UI
    refetch();
    
    toast.success(t("messageSent"));
  };
  
  if (!isAuthenticated) {
    navigate("/login");
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
        
        <Avatar className="h-8 w-8 mr-2">
          <AvatarFallback className="bg-primary/30 text-white text-sm">
            {chatInfo.other_user_name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h1 className="text-base font-medium">
            {chatInfo.other_user_name || "User"}
          </h1>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="py-10 text-center text-muted-foreground">{t("loading")}</div>
        ) : messages?.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-muted-foreground">{t("noMessages")}</p>
          </div>
        ) : (
          messages?.map((message) => {
            const isCurrentUser = message.sender_id === user?.id;
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
        />
        <Button 
          type="submit"
          disabled={!newMessage.trim()}
          size="icon"
          className="shrink-0"
        >
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
};

export default ChatDetail;
