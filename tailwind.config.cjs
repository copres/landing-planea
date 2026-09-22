/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      animation: {
        'infinite-scroll': 'infinite-scroll 25s linear infinite',
        'scale-in': 'scale-in 0.5s ease-out forwards',
        'scale-out': 'scale-out 0.5s ease-out forwards',
      },
      keyframes: {
        'infinite-scroll': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        },
        'scale-in': {
          from: { transform: 'scale(1)', opacity: '0.7' },
          to: { transform: 'scale(1.1)', opacity: '1' },
        },
        'scale-out': {
          from: { transform: 'scale(1.1)', opacity: '1' },
          to: { transform: 'scale(1)', opacity: '0.7' },
        },
      },
      colors: {
        'metroKUBIKO-secundary-azul': '#025A79',
        'metroKUBIKO-naranja': '#EC6714',
        'metroKUBIKO-principal-azul': '#024057',
        'metroKUBIKO-azul-claro': '#5E7486',
      },
    },
    colors: {
      ...colors,
      current: 'currentColor',
      transparent: 'transparent',
      white: '#ffffff',
      primary: colors.stone,
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
    fontSize: {
      xs: ['0.75rem', '1rem'],
      sm: ['0.875rem', '1.25rem'],
      base: ['1rem', '1.75rem'],
      lg: ['1.125rem', '2rem'],
      xl: ['1.25rem', '2.125rem'],
      '2xl': ['1.5rem', '2rem'],
      '3xl': ['1.875rem', '2.375rem'],
      '4xl': ['2.25rem', '2.75rem'],
      '5xl': ['3rem', '3.5rem'],
      '6xl': ['3.75rem', '4.25rem'],
    },
  },
};
