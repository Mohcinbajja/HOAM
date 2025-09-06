

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Language } from '../types';
import { translations, TranslationKey } from '../lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  // FIX: Update 't' function signature to support interpolation.
  t: (key: TranslationKey, replacements?: { [key: string]: string | number | undefined }) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('hoa-language') as Language;
    return saved || Language.EN;
  });

  useEffect(() => {
    localStorage.setItem('hoa-language', language);
  }, [language]);

  const t = (key: TranslationKey, replacements?: { [key: string]: string | number | undefined }): string => {
    let translation = translations[language][key] || key;
    if (replacements) {
      Object.keys(replacements).forEach(rKey => {
        const value = replacements[rKey];
        if (value !== undefined) {
          translation = translation.replace(new RegExp(`\\{${rKey}\\}`, 'g'), String(value));
        }
      });
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};