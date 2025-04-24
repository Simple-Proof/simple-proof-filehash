/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',    // Original indigo-400
          500: '#6366f1',    // Original indigo-500
          600: '#4f46e5',    // Original indigo-600
          700: '#4338ca',    // Original indigo-700
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',    // Original red-100
          200: '#fecaca',
          300: '#fca5a5',    // Original red-300
          400: '#f87171',    // Original red-400
          500: '#ef4444',
          600: '#dc2626',    // Original red-600
          700: '#b91c1c',
          800: '#991b1b',    // Original red-800
          900: '#7f1d1d',    // Original red-900
          950: '#450a0a',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
