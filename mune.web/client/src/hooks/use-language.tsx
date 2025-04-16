import { createContext, useContext, useEffect, useState } from "react";

export type LanguageCode = "en" | "hi" | "bn" | "te" | "ta" | "mr" | "kn" | "gu";

type LanguageProviderProps = {
  children: React.ReactNode;
  defaultLanguage?: LanguageCode;
};

type LanguageProviderState = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
};

const initialState: LanguageProviderState = {
  language: "en",
  setLanguage: () => null,
};

const LanguageProviderContext = createContext<LanguageProviderState>(initialState);

export function LanguageProvider({
  children,
  defaultLanguage = "en",
}: LanguageProviderProps) {
  const [language, setLanguage] = useState<LanguageCode>(
    () => (localStorage.getItem("language") as LanguageCode) || defaultLanguage
  );

  useEffect(() => {
    // Here you could add integration with Google Translate API
    // This is a simple implementation just to set the language preference
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    language,
    setLanguage: (language: LanguageCode) => {
      localStorage.setItem("language", language);
      setLanguage(language);
    },
  };

  return (
    <LanguageProviderContext.Provider value={value}>
      {children}
    </LanguageProviderContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageProviderContext);
  
  if (context === undefined)
    throw new Error("useLanguage must be used within a LanguageProvider");
  
  return context;
};