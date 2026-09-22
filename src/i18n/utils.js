import es from './locales/es.json';
import en from './locales/en.json';

const translations = {
  es,
  en,
};

const defaultLocale = 'es';
const supportedLocales = ['es', 'en' ];

export function getLocaleFromPath(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (supportedLocales.includes(firstSegment)) {
    return firstSegment;
  }

  // Soportar rutas de blog sin prefijo de idioma, por ejemplo:
  // /blog/en/slug -> locale 'en'
  if (firstSegment === 'blog' && segments[1] && supportedLocales.includes(segments[1])) {
    return segments[1];
  }
  
  return defaultLocale;
}

export function getTranslations(locale = defaultLocale) {
  return translations[locale] || translations[defaultLocale];
}

export function getLocalizedPath(pathname, targetLocale) {
  const currentLocale = getLocaleFromPath(pathname);
  const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';
  
  if (targetLocale === defaultLocale) {
    return pathWithoutLocale === '/' ? '/' : pathWithoutLocale;
  }
  
  return `/${targetLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
}

// Mapa centralizado de todas las rutas del sitio por idioma
const routeMap = {
  es: {
    home: '/es/',
    nosotros: '/es/nosotros',
    software: '/es/#software',
    utilidades: '/es/utilidades',
    precios: '/es/precios',
    contacto: '/es/contacto',
    blog: '/es/blog',
    // Páginas adicionales
    apus: '/apus',
    'analisis-de-precios-unitarios': '/analisis-de-precios-unitarios',
    'presupuestos-de-obras': '/presupuestos-de-obras',
    'programacion-de-obras': '/programacion-de-obras',
    'crear-presupuestos-de-obra-con-ia-de-forma-gratuita': '/crear-presupuestos-de-obra-con-ia-de-forma-gratuita',
    'plataformas-de-construccion': '/plataformas-de-construccion',
    planes: '/planes',
    privacy: '/privacy',
  },
  en: {
    home: '/en/',
    nosotros: '/en/about',
    software: '/en/#software',
    utilidades: '/en/utilities',
    precios: '/en/pricing',
    contacto: '/en/contact',
    blog: '/en/blog',
    // Páginas adicionales (usar slugs en inglés cuando existan)
    apus: '/en/apus',
    'analisis-de-precios-unitarios': '/en/unit-price-analysis',
    'presupuestos-de-obras': '/en/work-budgets',
    'programacion-de-obras': '/en/work-scheduling',
    'crear-presupuestos-de-obra-con-ia-de-forma-gratuita': '/en/create-work-budgets-with-ai-for-free',
    'plataformas-de-construccion': '/en/construction-platforms',
    planes: '/en/plans',
    privacy: '/en/privacy',
  },
};

/**
 * Obtiene la ruta localizada para una página específica
 * @param {string} routeKey - Clave de la ruta (ej: 'home', 'nosotros', 'blog')
 * @param {string} locale - Idioma objetivo (ej: 'es', 'en', 'pt', 'fr')
 * @returns {string} Ruta localizada completa
 */
export function getLocalizedRoute(routeKey, locale = defaultLocale) {
  const routes = routeMap[locale] || routeMap[defaultLocale];
  return routes[routeKey] || routes.home || '/es/';
}

/**
 * Obtiene todas las rutas localizadas para un idioma específico
 * @param {string} locale - Idioma objetivo
 * @returns {Record<string, string>} Objeto con todas las rutas del idioma
 */
export function getLocalizedRoutes(locale = defaultLocale) {
  return routeMap[locale] || routeMap[defaultLocale];
}

/**
 * Construye la ruta localizada para un post del blog
 * @param {string} slug - Slug del post del blog
 * @param {string} locale - Idioma objetivo
 * @returns {string} Ruta localizada del post (ej: '/blog/en/slug' o '/blog/slug' para español)
 */
export function getLocalizedBlogPostRoute(slug, locale = defaultLocale) {
  if (locale === defaultLocale) {
    return `/blog/${slug}`;
  }
  return `/blog/${locale}/${slug}`;
}

export { defaultLocale, supportedLocales };

