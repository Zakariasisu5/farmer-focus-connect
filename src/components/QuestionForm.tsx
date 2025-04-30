
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";

const QuestionForm: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Question submitted",
        description: "An expert will respond to your question soon.",
      });
      
      setQuestion("");
    } catch (error) {
      console.error("Error submitting question:", error);
      toast({
        title: "Error",
        description: "Failed to submit your question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="What farming questions can we help with?"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={4}
        className="resize-none"
      />
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!question.trim() || isSubmitting}
      >
        {isSubmitting ? "Submitting..." : t("askQuestion")}
      </Button>
    </form>
  );
};

export default QuestionForm;
