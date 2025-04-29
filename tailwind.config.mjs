/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'ibm': ['IBM-Regular', 'sans-serif'],
        'ibm-thin': ['IBM-Thin', 'sans-serif'],
        'ibm-light': ['IBM-Light', 'sans-serif'],
        'ibm-medium': ['IBM-Medium', 'sans-serif'],
        'ibm-semibold': ['IBM-SemiBold', 'sans-serif'],
        'ibm-bold': ['IBM-Bold', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#001a72',
          shade: '#00134d',
          50: '#e6eaf0',
          100: '#c0c6d9',
          200: '#96a0c0',
          300: '#6c7aa7',
          400: '#4c5e95',
          500: '#2c4283',
          600: '#26397b',
          700: '#1f3071',
          800: '#182768',
          900: '#001a72',
        },
        tertiary: {
          DEFAULT: '#f7931e',
          shade: '#D67C29',
          50: '#fff6e6',
          100: '#feead1',
          200: '#fcd9a6',
          300: '#fac87b',
          400: '#f9b85b',
          500: '#f7931e',
          600: '#e58518',
          700: '#d67c29',
          800: '#b5610f',
          900: '#964d00',
        },
        danger: {
          DEFAULT: '#fe6d73',
          50: '#fee8e9',
          100: '#fdc7c9',
          200: '#fca5a9',
          300: '#fb8388',
          400: '#fe6d73',
          500: '#f64e55',
          600: '#e54148',
          700: '#d4353b',
          800: '#c32930',
          900: '#b21d24',
        },
        text: {
          DEFAULT: '#4f5053',
          secondary: '#717277',
          dark: '#333333',
          light: '#666666',
          lighter: '#999999',
        },
        background: {
          DEFAULT: '#f2f4f8',
          light: '#f8f9fa',
        },
        border: {
          light: '#eeeeee',
          medium: '#e0e0e0',
        }
      },
      boxShadow: {
        'card': '0 10px 40px rgba(0, 0, 0, 0.08)',
        'light': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'auth': 'rgba(0, 26, 114, 0.15) 0px 5px 15px 0px',
      },
      spacing: {
        'content-padding-mobile': '4px',
      },
      minWidth: {
        'button-mobile': '80px',
      },
      screens: {
        'xs': '360px',
        'sm': '576px',
        'md': '768px',
        'lg': '992px',
        'xl': '1200px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
