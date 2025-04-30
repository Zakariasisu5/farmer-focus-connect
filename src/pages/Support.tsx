
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LanguageSelector from "../components/LanguageSelector";
import NavigationBar from "../components/NavigationBar";
import QuestionForm from "../components/QuestionForm";
import { useLanguage } from "../contexts/LanguageContext";

const Support: React.FC = () => {
  const { t } = useLanguage();

  // Sample FAQ data
  const faqData = [
    {
      question: "When is the best time to plant maize?",
      answer: "The best time to plant maize is at the beginning of the rainy season when soil temperatures reach around 18°C (65°F) for optimal germination.",
    },
    {
      question: "How do I identify tomato blight?",
      answer: "Tomato blight appears as dark brown spots on leaves that quickly enlarge and turn black. Infected stems develop dark, elongated lesions, and fruits show dark, leathery patches.",
    },
    {
      question: "What are natural methods to control aphids?",
      answer: "Natural aphid control includes introducing beneficial insects like ladybugs, spraying with neem oil or soap solutions, and planting companion plants such as marigolds or nasturtiums.",
    },
    {
      question: "How often should I rotate crops?",
      answer: "Crop rotation should ideally occur every growing season, but at minimum practice a 3-4 year rotation cycle to prevent soil-borne diseases and pest buildup.",
    },
  ];

  return (
    <div className="pb-20 min-h-screen bg-background">
      {/* Header */}
      <div className="bg-farm-green p-4 text-white shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">{t("support")}</h1>
          <LanguageSelector />
        </div>
      </div>

      {/* Support Content */}
      <div className="container px-4 py-6">
        <Tabs defaultValue="ask">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="ask">{t("askQuestion")}</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="ask" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ask Our Experts</CardTitle>
              </CardHeader>
              <CardContent>
                <QuestionForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq">
            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <Card key={index}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base font-medium">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  );
};

export default Support;
