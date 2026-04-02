import { createContext, useContext, useEffect, useState } from 'react';
import {
    DEFAULT_LANGUAGE,
    getLocale,
    LANGUAGE_STORAGE_KEY,
    resolveLanguage,
    translate,
} from '../lib/i18n';

const LanguageContext = createContext(null);

function getInitialLanguage() {
    if (typeof window === 'undefined') {
        return DEFAULT_LANGUAGE;
    }

    return resolveLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
}

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(getInitialLanguage);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
        }

        document.documentElement.lang = language;
    }, [language]);

    function setLanguage(nextLanguage) {
        setLanguageState(resolveLanguage(nextLanguage));
    }

    function t(key, params = {}) {
        return translate(language, key, params);
    }

    return (
        <LanguageContext.Provider value={{
            language,
            locale: getLocale(language),
            setLanguage,
            t,
        }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider.');
    }

    return context;
}
