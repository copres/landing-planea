<script>
  import { getLocalizedPath, getLocaleFromPath, supportedLocales } from '../../i18n/utils.js';
  import { onMount } from 'svelte';
  
  const languages = [
    { code: 'es', name: 'Español', initials: 'ES' },
    { code: 'en', name: 'English', initials: 'EN' },
    { code: 'pt', name: 'Português', initials: 'PT' },
    { code: 'fr', name: 'Français', initials: 'FR' },
  ];
  
  let currentLocale = 'es';
  let isOpen = false;
  
  onMount(() => {
    if (typeof window !== 'undefined') {
      const detectedLocale = getLocaleFromPath(window.location.pathname);
      currentLocale = detectedLocale;
    }
  });
  
  function switchLanguage(locale) {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const pathSegments = currentPath.split('/').filter(Boolean);
      
      // Mapeo de rutas por clave (independiente del idioma)
      const routeKeys = {
        '': 'home',
        'nosotros': 'nosotros',
        'about': 'nosotros',
        'sobre-nos': 'nosotros',
        'a-propos': 'nosotros',
        'utilidades': 'utilidades',
        'utilities': 'utilidades',
        'utilites': 'utilidades',
        'precios': 'precios',
        'pricing': 'precios',
        'precos': 'precios',
        'tarifs': 'precios',
        'contacto': 'contacto',
        'contact': 'contacto',
        'contato': 'contacto',
        'blog': 'blog'
      };
      
      // Mapeo de rutas por idioma
      const routeMap = {
        es: {
          'home': '',
          'nosotros': 'nosotros',
          'utilidades': 'utilidades',
          'precios': 'precios',
          'contacto': 'contacto',
          'blog': 'blog'
        },
        en: {
          'home': '',
          'nosotros': 'about',
          'utilidades': 'utilities',
          'precios': 'pricing',
          'contacto': 'contact',
          'blog': 'blog'
        },
        pt: {
          'home': '',
          'nosotros': 'sobre-nos',
          'utilidades': 'utilidades',
          'precios': 'precos',
          'contacto': 'contato',
          'blog': 'blog'
        },
        fr: {
          'home': '',
          'nosotros': 'a-propos',
          'utilidades': 'utilites',
          'precios': 'tarifs',
          'contacto': 'contact',
          'blog': 'blog'
        }
      };

      // --- Rutas de listado de blog ---
      // Soportar:
      // - /blog              -> listado por defecto (es)
      // - /es/blog, /en/blog, /pt/blog, /fr/blog
      if (pathSegments[0] === 'blog' && pathSegments.length === 1) {
        // /blog -> ir al listado del idioma seleccionado
        const newPath = `/${locale}/blog` + (window.location.search || '');
        window.location.href = newPath;
        return;
      }

      if (
        ['es', 'en', 'pt', 'fr'].includes(pathSegments[0]) &&
        pathSegments[1] === 'blog' &&
        pathSegments.length === 2
      ) {
        // /es/blog, /en/blog, /pt/blog, /fr/blog -> cambiar solo el prefijo de idioma
        const newPath = `/${locale}/blog` + (window.location.search || '');
        window.location.href = newPath;
        return;
      }
      
      // Detectar si estamos en un post individual del blog
      // Patrones soportados:
      // - /blog/slug            (español)
      // - /blog/en/slug         (inglés)
      // - /blog/pt/slug         (portugués)
      // - /blog/fr/slug         (francés)
      let isBlogPost = false;
      let blogPostSlug = '';
      let currentRoute = '';

      if (pathSegments[0] === 'blog') {
        isBlogPost = pathSegments.length > 1;
        const maybeLocale = pathSegments[1];

        if (isBlogPost) {
          if (['es', 'en', 'pt', 'fr'].includes(maybeLocale)) {
            // /blog/en/slug -> slug = lo que viene después del locale
            blogPostSlug = pathSegments.slice(2).join('/');
          } else {
            // /blog/slug -> idioma por defecto (es), slug = todo lo que viene después de 'blog'
            blogPostSlug = pathSegments.slice(1).join('/');
          }
        }
      } else {
        // Rutas normales (home, nosotros, etc.)
        currentRoute = pathSegments.length > 0 ? pathSegments[0] : '';
      }

      // Si estamos en un post individual del blog, mantener el mismo slug y solo cambiar el idioma
      if (isBlogPost && blogPostSlug) {
        // Para español no se incluye el código de idioma en la URL del post
        let newPath = '/blog';
        if (locale !== 'es') {
          newPath += `/${locale}`;
        }
        newPath += `/${blogPostSlug}`;
        newPath += (window.location.search || '');
        window.location.href = newPath;
        return;
      }

      // Obtener la clave de ruta (independiente del idioma) para páginas normales
      const routeKey = routeKeys[currentRoute] || 'home';
      
      // Obtener la ruta equivalente en el nuevo idioma
      const newRoute = routeMap[locale] && routeMap[locale][routeKey] ? routeMap[locale][routeKey] : '';
      
      // Construir la nueva ruta
      let newPath = `/${locale}`;
      if (newRoute) {
        newPath += `/${newRoute}`;
      } else {
        newPath += '/';
      }
      
      newPath += (window.location.search || '');
      window.location.href = newPath;
    }
  }
  
  function toggleDropdown() {
    isOpen = !isOpen;
  }
  
  // Cerrar el dropdown cuando se hace clic fuera
  function handleClickOutside(event) {
    if (isOpen && !event.target.closest('.language-selector')) {
      isOpen = false;
    }
  }
  
  onMount(() => {
    if (typeof window !== 'undefined') {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  });
</script>

<div class="relative language-selector">
  <button
    type="button"
    class="menu-link text-primary-950 dark:text-primary-200 whitespace-nowrap text-sm font-medium transition-colors px-2 py-1 rounded-md inline-flex items-center gap-1"
    on:click={toggleDropdown}
    aria-label="Seleccionar idioma"
  >
    {#each languages as lang}
      {#if lang.code === currentLocale}
        {#if lang.code === 'es'}
          <!-- Bandera de España -->
          <svg class="w-4 h-3" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="16" fill="#AA151B"/>
            <rect y="5.33" width="24" height="5.33" fill="#F1BF00"/>
            <rect y="10.67" width="24" height="5.33" fill="#AA151B"/>
          </svg>
        {:else if lang.code === 'en'}
          <!-- Bandera de Estados Unidos -->
          <svg class="w-4 h-3" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="16" fill="#B22234"/>
            <rect y="2.29" width="24" height="1.14" fill="#FFFFFF"/>
            <rect y="4.57" width="24" height="1.14" fill="#FFFFFF"/>
            <rect y="6.86" width="24" height="1.14" fill="#FFFFFF"/>
            <rect y="9.14" width="24" height="1.14" fill="#FFFFFF"/>
            <rect y="11.43" width="24" height="1.14" fill="#FFFFFF"/>
            <rect y="13.71" width="24" height="1.14" fill="#FFFFFF"/>
            <rect width="9.6" height="8" fill="#3C3B6E"/>
            <polygon points="4.8,2 5.2,3.5 6.6,3.5 5.4,4.5 5.8,6 4.8,5 3.8,6 4.2,4.5 3,3.5 4.4,3.5" fill="#FFFFFF"/>
          </svg>
        {:else if lang.code === 'pt'}
          <!-- Bandera de Portugal -->
          <svg class="w-4 h-3" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg">
            <rect width="10" height="16" fill="#006600"/>
            <rect x="10" width="14" height="16" fill="#FF0000"/>
            <circle cx="7" cy="8" r="2.5" fill="#FFD700" stroke="#006600" stroke-width="0.3"/>
            <circle cx="7" cy="8" r="1.5" fill="#006600"/>
            <rect x="6.5" y="3" width="1" height="10" fill="#FFD700"/>
            <rect x="4" y="7.5" width="6" height="1" fill="#FFD700"/>
          </svg>
        {:else if lang.code === 'fr'}
          <!-- Bandera de Francia -->
          <svg class="w-4 h-3" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg">
            <rect width="8" height="16" fill="#002654"/>
            <rect x="8" width="8" height="16" fill="#FFFFFF"/>
            <rect x="16" width="8" height="16" fill="#ED2939"/>
          </svg>
        {/if}
        <span class="uppercase font-semibold">{lang.initials}</span>
      {/if}
    {/each}
    <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>
  
  {#if isOpen}
    <div class="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
      {#each languages as lang}
        <button
          type="button"
          class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 {lang.code === currentLocale ? 'bg-gray-100 dark:bg-gray-700' : ''}"
          on:click={() => { switchLanguage(lang.code); isOpen = false; }}
        >
          {#if lang.code === 'es'}
            <!-- Bandera de España -->
            <svg class="w-4 h-3" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="16" fill="#AA151B"/>
              <rect y="5.33" width="24" height="5.33" fill="#F1BF00"/>
              <rect y="10.67" width="24" height="5.33" fill="#AA151B"/>
            </svg>
          {:else if lang.code === 'en'}
            <!-- Bandera de Estados Unidos -->
            <svg class="w-4 h-3" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="16" fill="#B22234"/>
              <rect y="2.29" width="24" height="1.14" fill="#FFFFFF"/>
              <rect y="4.57" width="24" height="1.14" fill="#FFFFFF"/>
              <rect y="6.86" width="24" height="1.14" fill="#FFFFFF"/>
              <rect y="9.14" width="24" height="1.14" fill="#FFFFFF"/>
              <rect y="11.43" width="24" height="1.14" fill="#FFFFFF"/>
              <rect y="13.71" width="24" height="1.14" fill="#FFFFFF"/>
              <rect width="9.6" height="8" fill="#3C3B6E"/>
              <polygon points="4.8,2 5.2,3.5 6.6,3.5 5.4,4.5 5.8,6 4.8,5 3.8,6 4.2,4.5 3,3.5 4.4,3.5" fill="#FFFFFF"/>
            </svg>
          {:else if lang.code === 'pt'}
            <!-- Bandera de Portugal -->
            <svg class="w-4 h-3" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg">
              <rect width="10" height="16" fill="#006600"/>
              <rect x="10" width="14" height="16" fill="#FF0000"/>
              <circle cx="7" cy="8" r="2.5" fill="#FFD700" stroke="#006600" stroke-width="0.3"/>
              <circle cx="7" cy="8" r="1.5" fill="#006600"/>
              <rect x="6.5" y="3" width="1" height="10" fill="#FFD700"/>
              <rect x="4" y="7.5" width="6" height="1" fill="#FFD700"/>
            </svg>
          {:else if lang.code === 'fr'}
            <!-- Bandera de Francia -->
            <svg class="w-4 h-3" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg">
              <rect width="8" height="16" fill="#002654"/>
              <rect x="8" width="8" height="16" fill="#FFFFFF"/>
              <rect x="16" width="8" height="16" fill="#ED2939"/>
            </svg>
          {/if}
          <span class="uppercase font-semibold">{lang.initials}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  :global(.menu-link:hover) {
    background-color: #78716C;
    color: white;
  }
</style>

