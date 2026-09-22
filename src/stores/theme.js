import { writable } from 'svelte/store';

const createThemeStore = () => {
    const isBrowser = typeof window !== 'undefined';

    const initialTheme = isBrowser ? (localStorage.getItem('theme') === 'dark') : false;

    const { subscribe, set, update } = writable(initialTheme);

    if (isBrowser) {
        let initialValue = localStorage.getItem('theme') ? localStorage.getItem('theme') === 'dark' : false;
        set(initialValue);

        subscribe(isDark => {
            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }
    
    return {
        subscribe,
        toggle: () => update(isDark => !isDark),
    };
};

export const theme = createThemeStore(); 