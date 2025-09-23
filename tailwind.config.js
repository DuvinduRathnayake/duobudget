/** @type {import('tailwindcss').Config} */
module.exports = {
  // Include every file that can contain className
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  // NativeWind v4 preset
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#1E1B4B', // Deep Indigo
        accent: '#2ECC71', // Emerald
        background: '#F9FAFB', // Soft Gray
        text: '#111827', // Dark Slate
        danger: '#DC2626', // Crimson
      },
    },
  },
  plugins: [],
};
