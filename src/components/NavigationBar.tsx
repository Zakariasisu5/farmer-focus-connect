
import React from "react";
import { Home, Calendar, MessageCircle, Settings, ShoppingCart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { Badge } from "./ui/badge";

const NavigationBar: React.FC = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: <Home size={22} />, label: t("home"), path: "/" },
    { icon: <ShoppingCart size={22} />, label: t("marketplace"), path: "/marketplace" },
    { 
      icon: <MessageCircle size={22} />, 
      label: t("chats"), 
      path: "/chats",
      badge: isAuthenticated ? true : false
    },
    { icon: <Settings size={22} />, label: t("settings"), path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around py-3 px-2 shadow-sm">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`flex flex-col items-center p-2 rounded-lg relative ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1 font-medium">{item.label}</span>
            {item.badge && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                •
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default NavigationBar;
