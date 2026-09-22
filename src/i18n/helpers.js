/**
 * Helper functions para facilitar el uso de traducciones en páginas Astro
 */

import { getLocaleFromPath, getTranslations, getLocalizedPath } from './utils.js';

/**
 * Obtiene el locale y las traducciones para una página
 * @param {URL} url - URL de la página actual
 * @returns {Object} - { locale, t, getLocalizedUrl }
 */
export function useI18n(url) {
  const locale = getLocaleFromPath(url.pathname);
  const t = getTranslations(locale);

  /**
   * Genera una URL localizada para una ruta
   * @param {string} path - Ruta a localizar (ej: '/precios')
   * @returns {string} - URL localizada
   */
  const getLocalizedUrl = (path) => {
    return getLocalizedPath(path, locale);
  };

  return {
    locale,
    t,
    getLocalizedUrl,
  };
}

