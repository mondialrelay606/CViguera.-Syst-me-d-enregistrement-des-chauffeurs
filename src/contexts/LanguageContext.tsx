import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { translations, Language } from '../locales';

// Helper function to get nested values from an object using a dot-notation string
const getNestedTranslation = (obj: any, path: string): string | undefined => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, values?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check for saved language in localStorage or default to browser language or 'es'
    const savedLanguage = localStorage.getItem('app-language') as Language;
    if (savedLanguage && translations[savedLanguage]) {
      return savedLanguage;
    }
    const browserLang = navigator.language.split('-')[0] as Language;
    return translations[browserLang] ? browserLang : 'es';
  });

  useEffect(() => {
    // Update HTML tag attributes for language and text direction
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('app-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, values?: { [key: string]: string | number }): string => {
    let translation = getNestedTranslation(translations[language], key);
    if (translation === undefined) {
      console.warn(`Translation key "${key}" not found for language "${language}".`);
      // Fallback to English if key not found in current language
      const fallback = getNestedTranslation(translations.en, key);
      translation = fallback || key;
    }
    
    if (values) {
        Object.keys(values).forEach(valueKey => {
            translation = (translation as string).replace(new RegExp(`{{${valueKey}}}`, 'g'), String(values[valueKey]));
        });
    }

    return translation;
  };

  const contextValue = useMemo(() => ({ language, setLanguage, t }), [language, t]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
