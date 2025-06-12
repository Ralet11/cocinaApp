// clientApp/src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from "expo-localization"

import en from './locales/en/translation.json';
import es from './locales/es/translation.json';

// Detecta el idioma del dispositivo
const locales = RNLocalize.getLocales();
const deviceLang = locales && locales.length ? locales[0].languageCode : 'en';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',      // si usas RN ≥0.65
    lng: deviceLang,             // idioma inicial
    fallbackLng: 'en',           // si no hay traducción
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    interpolation: {
      escapeValue: false,        // React ya escapa por defecto
    },
    react: {
      useSuspense: false,        // si no quieres Suspense
    },
  });

export default i18n;
