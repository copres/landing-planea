<script>
    import { theme } from '../../stores/theme.js';
    import { slide } from 'svelte/transition';
    import LanguageSelector from '../shared/LanguageSelector.svelte';
    import { onMount } from 'svelte';

    export let links;
    export let translations = {};
    let open = false;
    let homePath = '/';

    onMount(() => {
      if (typeof window !== 'undefined') {
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        const locale = pathSegments[0] && ['es', 'en'].includes(pathSegments[0]) 
          ? pathSegments[0] 
          : 'es';
        homePath = `/${locale}/`;
      }
    });

    function mousedown(event) {
        if (open) {
            event.preventDefault();
        }
    }
    
    function toggleTheme() {
        theme.toggle()
    }
</script>

<header class="bg-primary-50 dark:bg-primary-950 transition">
  <div class="mx-auto max-w-2xl px-4 py-3 sm:px-6 sm:py-4 lg:max-w-7xl lg:px-8">
    <div class="flex items-center justify-between gap-4">
      <!-- Brand logo -->
      <div class="flex-shrink-0">
        <a href={homePath} class="focus-visible:outline-primary-950 dark:group-focus-visible:outline-primary-200 rounded-md focus-visible:outline focus-visible:outline-2">
          <span class="sr-only">metroKUBIKO</span>
          <img
            class="h-12 w-auto sm:h-16 lg:h-20"
            width="156"
            height="96"
            src={$theme ? '/assets/logo.png' : '/assets/Logo m3 H.png'}
            alt="metroKUBIKO"
          />
        </a>
      </div>

      <!-- Navigation menu - horizontal (desktop only) -->
      <nav class="hidden lg:flex flex-1 items-center justify-center gap-3">
        {#each links as link}
          <a 
            href={link.href} 
            data-astro-reload 
            class="menu-link text-primary-950 dark:text-primary-200 whitespace-nowrap text-sm font-medium transition-colors px-2 py-1 rounded-md"
          >
            {link.name}
          </a>
        {/each}
        <!-- Toggle theme mode -->
        <button
          type="button"
          class="menu-link text-primary-950 dark:text-primary-200 inline-flex items-center justify-center px-2 py-1 rounded-md text-sm font-medium transition-colors"
          on:click={toggleTheme}
          aria-label="Cambiar tema"
        >
          {#if $theme}
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"></path>
          </svg>
          {:else}
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 6C10 10.4183 13.5817 14 18 14C19.4386 14 20.7885 13.6203 21.9549 12.9556C21.4738 18.0302 17.2005 22 12 22C6.47715 22 2 17.5228 2 12C2 6.79948 5.9698 2.52616 11.0444 2.04507C10.3797 3.21152 10 4.56142 10 6ZM4 12C4 16.4183 7.58172 20 12 20C14.9654 20 17.5757 18.3788 18.9571 15.9546C18.6407 15.9848 18.3214 16 18 16C12.4772 16 8 11.5228 8 6C8 5.67863 8.01524 5.35933 8.04536 5.04293C5.62119 6.42426 4 9.03458 4 12ZM18.1642 2.29104L19 2.5V3.5L18.1642 3.70896C17.4476 3.8881 16.8881 4.4476 16.709 5.16417L16.5 6H15.5L15.291 5.16417C15.1119 4.4476 14.5524 3.8881 13.8358 3.70896L13 3.5V2.5L13.8358 2.29104C14.5524 2.1119 15.1119 1.5524 15.291 0.835829L15.5 0H16.5L16.709 0.835829C16.8881 1.5524 17.4476 2.1119 18.1642 2.29104ZM23.1642 7.29104L24 7.5V8.5L23.1642 8.70896C22.4476 8.8881 21.8881 9.4476 21.709 10.1642L21.5 11H20.5L20.291 10.1642C20.1119 9.4476 19.5524 8.8881 18.8358 8.70896L18 8.5V7.5L18.8358 7.29104C19.5524 7.1119 20.1119 6.5524 20.291 5.83583L20.5 5H21.5L21.709 5.83583C21.8881 6.5524 22.4476 7.1119 23.1642 7.29104Z"></path>
          </svg>
          {/if}
        </button>
        <!-- Language selector -->
        <LanguageSelector />
      </nav>

      <!-- Actions -->
      <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <!-- Login button -->
        <a
          href="https://plataforma.metrokubiko.com/laura?src=%2Findex.html"
          class="text-primary-950 dark:text-primary-200 hover:bg-primary-500/10 dark:hover:bg-primary-400/10 ring-primary-950 inline-flex h-10 sm:h-12 items-center justify-center rounded-full px-3 sm:px-4 text-xs sm:text-sm font-medium transition focus:outline-none focus-visible:ring-2"
        >
          {translations?.common?.ingresa || 'Ingresa'}
        </a>

        <!-- Register button -->
        <a
          href="https://plataforma.metrokubiko.com/laura?src=%2Fregistro.html"
          class="bg-primary-400 dark:bg-primary-400 hover:bg-primary-500 dark:hover:bg-primary-500 focus-visible:outline-primary-600 dark:focus-visible:outline-primary-400 inline-flex h-10 sm:h-12 items-center justify-center rounded-full border border-transparent px-3 sm:px-4 text-xs sm:text-sm font-medium text-primary-950 dark:text-primary-950 transition focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {translations?.common?.registrate || 'Regístrate'}
        </a>

        <!-- Toggle menu button (mobile only) -->
        <button
          type="button"
          class="lg:hidden text-primary-950 dark:text-primary-200 hover:bg-primary-500/10 dark:hover:bg-primary-400/10 ring-primary-950 inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2"
          on:click={() => open = !open}
          on:mousedown={mousedown}
          aria-controls="website-menu"
          aria-expanded={open.toString()}
        >
          <span class="sr-only">Toggle menu</span>
          {#if open}
          <svg class="h-6 w-6 sm:h-8 sm:w-8" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12.0007 10.5865L16.9504 5.63672L18.3646 7.05093L13.4149 12.0007L18.3646 16.9504L16.9504 18.3646L12.0007 13.4149L7.05093 18.3646L5.63672 16.9504L10.5865 12.0007L5.63672 7.05093L7.05093 5.63672L12.0007 10.5865Z"></path>
          </svg>
          {:else}
          <svg class="h-6 w-6 sm:h-8 sm:w-8" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 8H5V10H19V8ZM19 14H5V16H19V14Z"></path>
          </svg>
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Menu content (mobile only) -->
  {#if open}
  <div
    class="lg:hidden mx-auto max-w-2xl px-4 sm:px-6"
    id="website-menu"
    transition:slide="{{duration: 500}}"
  >
    <nav class="divide-primary-900/10 dark:divide-primary-300/10 flex flex-col gap-1 divide-y pb-6">
      {#each links as link}
      <a href={link.href} data-astro-reload class="text-primary-950 dark:text-primary-200 group inline-flex py-4 text-lg font-medium tracking-tight transition focus-visible:outline-none">
        <div class="group-focus-visible:outline-primary-950 dark:group-focus-visible:outline-primary-200 flex flex-1 items-center justify-between rounded-3xl group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2">
          <div class="flex items-center gap-4">
            <span class="text-xs">{link.ref}</span>
            <span class="group-hover:underline">{link.name}</span>
          </div>
          <svg class="text-primary-600 dark:text-primary-400 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M16.0037 9.41421L7.39712 18.0208L5.98291 16.6066L14.5895 8H7.00373V6H18.0037V17H16.0037V9.41421Z" />
          </svg>
        </div>
      </a>
      {/each}
      <!-- Toggle theme mode (mobile) -->
      <button
        type="button"
        class="text-primary-950 dark:text-primary-200 group inline-flex py-4 text-lg font-medium tracking-tight transition focus-visible:outline-none"
        on:click={toggleTheme}
        aria-label="Cambiar tema"
      >
        <div class="group-focus-visible:outline-primary-950 dark:group-focus-visible:outline-primary-200 flex flex-1 items-center justify-between rounded-3xl group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2">
          <div class="flex items-center gap-4">
            <span class="text-xs">08</span>
            <span class="group-hover:underline">{$theme ? translations.nav.theme_toggle_light : translations.nav.theme_toggle_dark}</span>
          </div>
          {#if $theme}
          <svg class="text-primary-600 dark:text-primary-400 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"></path>
          </svg>
          {:else}
          <svg class="text-primary-600 dark:text-primary-400 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 6C10 10.4183 13.5817 14 18 14C19.4386 14 20.7885 13.6203 21.9549 12.9556C21.4738 18.0302 17.2005 22 12 22C6.47715 22 2 17.5228 2 12C2 6.79948 5.9698 2.52616 11.0444 2.04507C10.3797 3.21152 10 4.56142 10 6ZM4 12C4 16.4183 7.58172 20 12 20C14.9654 20 17.5757 18.3788 18.9571 15.9546C18.6407 15.9848 18.3214 16 18 16C12.4772 16 8 11.5228 8 6C8 5.67863 8.01524 5.35933 8.04536 5.04293C5.62119 6.42426 4 9.03458 4 12ZM18.1642 2.29104L19 2.5V3.5L18.1642 3.70896C17.4476 3.8881 16.8881 4.4476 16.709 5.16417L16.5 6H15.5L15.291 5.16417C15.1119 4.4476 14.5524 3.8881 13.8358 3.70896L13 3.5V2.5L13.8358 2.29104C14.5524 2.1119 15.1119 1.5524 15.291 0.835829L15.5 0H16.5L16.709 0.835829C16.8881 1.5524 17.4476 2.1119 18.1642 2.29104ZM23.1642 7.29104L24 7.5V8.5L23.1642 8.70896C22.4476 8.8881 21.8881 9.4476 21.709 10.1642L21.5 11H20.5L20.291 10.1642C20.1119 9.4476 19.5524 8.8881 18.8358 8.70896L18 8.5V7.5L18.8358 7.29104C19.5524 7.1119 20.1119 6.5524 20.291 5.83583L20.5 5H21.5L21.709 5.83583C21.8881 6.5524 22.4476 7.1119 23.1642 7.29104Z"></path>
          </svg>
          {/if}
        </div>
      </button>
      <!-- Language selector (mobile) -->
      <div class="text-primary-950 dark:text-primary-200 group inline-flex py-4 text-lg font-medium tracking-tight transition focus-visible:outline-none">
        <div class="group-focus-visible:outline-primary-950 dark:group-focus-visible:outline-primary-200 flex flex-1 items-center justify-between rounded-3xl group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2">
          <div class="flex items-center gap-4">
            <span class="text-xs">09</span>
            <LanguageSelector />
          </div>
        </div>
      </div>
    </nav>
  </div>
  {/if}
</header>

<style>
  :global(.menu-link:hover) {
    background-color: #78716C;
    color: white;
  }
  :global(.menu-link:hover svg) {
    color: white;
  }
</style> 