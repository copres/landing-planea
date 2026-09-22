import { writable } from 'svelte/store';
import { getLocaleFromPath, defaultLocale } from '../i18n/utils.js';

const isBrowser = typeof window !== 'undefined';

const getInitialLocale = () => {
  if (!isBrowser) return defaultLocale;
  return getLocaleFromPath(window.location.pathname);
};

export const language = writable(getInitialLocale());

if (isBrowser) {
  // Actualizar el store cuando cambie la ruta
  const updateLocale = () => {
    language.set(getLocaleFromPath(window.location.pathname));
  };
  
  window.addEventListener('popstate', updateLocale);
  
  // También escuchar cambios de navegación de Astro
  document.addEventListener('astro:page-load', updateLocale);
}

