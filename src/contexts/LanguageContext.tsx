
import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "es" | "fr" | "sw";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    home: "Home",
    market: "Market Prices",
    weather: "Weather",
    support: "Support",
    settings: "Settings",
    login: "Login",
    register: "Register",
    welcomeMessage: "Welcome to Farmer Focus Connect",
    marketPrices: "Market Prices",
    weatherForecast: "Weather Forecast",
    logout: "Logout",
    askQuestion: "Ask a Question",
    priceUpdates: "Price Updates",
    today: "Today",
    tomorrow: "Tomorrow",
    username: "Username",
    password: "Password",
    email: "Email",
    phone: "Phone Number",
    region: "Region",
    submit: "Submit",
    cancel: "Cancel",
  },
  es: {
    home: "Inicio",
    market: "Precios del Mercado",
    weather: "Clima",
    support: "Soporte",
    settings: "Configuración",
    login: "Iniciar Sesión",
    register: "Registrarse",
    welcomeMessage: "Bienvenido a Farmer Focus Connect",
    marketPrices: "Precios del Mercado",
    weatherForecast: "Pronóstico del Tiempo",
    logout: "Cerrar Sesión",
    askQuestion: "Hacer una Pregunta",
    priceUpdates: "Actualizaciones de Precios",
    today: "Hoy",
    tomorrow: "Mañana",
    username: "Nombre de Usuario",
    password: "Contraseña",
    email: "Correo Electrónico",
    phone: "Número de Teléfono",
    region: "Región",
    submit: "Enviar",
    cancel: "Cancelar",
  },
  fr: {
    home: "Accueil",
    market: "Prix du Marché",
    weather: "Météo",
    support: "Support",
    settings: "Paramètres",
    login: "Connexion",
    register: "S'inscrire",
    welcomeMessage: "Bienvenue sur Farmer Focus Connect",
    marketPrices: "Prix du Marché",
    weatherForecast: "Prévisions Météo",
    logout: "Déconnexion",
    askQuestion: "Poser une Question",
    priceUpdates: "Mises à jour des Prix",
    today: "Aujourd'hui",
    tomorrow: "Demain",
    username: "Nom d'Utilisateur",
    password: "Mot de Passe",
    email: "E-mail",
    phone: "Numéro de Téléphone",
    region: "Région",
    submit: "Soumettre",
    cancel: "Annuler",
  },
  sw: {
    home: "Nyumbani",
    market: "Bei za Soko",
    weather: "Hali ya Hewa",
    support: "Msaada",
    settings: "Mipangilio",
    login: "Ingia",
    register: "Jiandikishe",
    welcomeMessage: "Karibu kwenye Farmer Focus Connect",
    marketPrices: "Bei za Soko",
    weatherForecast: "Utabiri wa Hali ya Hewa",
    logout: "Toka",
    askQuestion: "Uliza Swali",
    priceUpdates: "Masasisho ya Bei",
    today: "Leo",
    tomorrow: "Kesho",
    username: "Jina la Mtumiaji",
    password: "Neno la Siri",
    email: "Barua Pepe",
    phone: "Nambari ya Simu",
    region: "Mkoa",
    submit: "Wasilisha",
    cancel: "Ghairi",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const storedLanguage = localStorage.getItem("farmer-language") as Language;
    if (storedLanguage && Object.keys(translations).includes(storedLanguage)) {
      setLanguage(storedLanguage);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("farmer-language", lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
