import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';

// English ships at launch; additional languages plug in here as new
// resource files without any architecture change (see CLAUDE.md §1, §7).
const resources = {
  en: { translation: en },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
