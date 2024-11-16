
//convert to .js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}"

  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#ffffff', // Light mode background
          dark: '#0a0a0a',    // Dark mode background
        },
        foreground: {
          DEFAULT: '#171717', // Light mode foreground (text)
          dark: '#ededed',    // Dark mode foreground (text)
        },
      },
    },
  },
  darkMode: 'media', // or 'class' if you want manual dark mode
  plugins: [],
};

