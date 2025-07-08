import type { Config } from "tailwindcss";
import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', ...fontFamily.sans],
      },
      colors: {
        primary: {
          DEFAULT: '#4F8CFF', // Calming blue
          dark: '#2B5FC7',
          light: '#A3C8FF',
        },
        accent: {
          DEFAULT: '#A259FF', // Energetic purple
          light: '#D1B3FF',
        },
        premium: {
          DEFAULT: '#FFD700', // Gold
          dark: '#BFA100',
        },
        success: '#4ADE80', // Green
        background: {
          DEFAULT: '#F7FAFC',
          dark: '#181A20',
          glass: 'rgba(255,255,255,0.7)',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#23272F',
          glass: 'rgba(255,255,255,0.5)',
        },
        border: {
          DEFAULT: '#E5E7EB',
          dark: '#2D2F36',
        },
      },
      borderRadius: {
        lg: '1.5rem',
        xl: '2rem',
        full: '9999px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        card: '0 2px 16px 0 rgba(80, 112, 255, 0.08)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-glass': 'linear-gradient(135deg, rgba(79,140,255,0.12) 0%, rgba(162,89,255,0.10) 100%)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
