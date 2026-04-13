import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [isGujarati, setIsGujarati] = useState(false);
  const toggleLanguage = () => setIsGujarati(prev => !prev);

  return (
    <LanguageContext.Provider value={{ isGujarati, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) return { isGujarati: false, toggleLanguage: () => {} };
  return ctx;
};
