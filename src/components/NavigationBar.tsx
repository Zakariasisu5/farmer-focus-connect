
import React from "react";
import { Home, Calendar, MessageCircle, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

const NavigationBar: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { icon: <Home size={24} />, label: t("home"), path: "/" },
    { icon: <Calendar size={24} />, label: t("market"), path: "/market" },
    { icon: <MessageCircle size={24} />, label: t("support"), path: "/support" },
    { icon: <Settings size={24} />, label: t("settings"), path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around py-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`flex flex-col items-center p-2 rounded-lg ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default NavigationBar;
