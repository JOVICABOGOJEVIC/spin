/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
    darkMode: "class", // Omogućava "dark" mod pomoću klase
    theme: {
      extend: {
        colors: {
          // Base theme colors
          primary: "var(--color-primary)",
          secondary: "var(--color-secondary)",
          accent: "var(--color-accent)",
          background: "var(--color-background)",
          text: "var(--color-text)",
          border: "var(--color-border)",
          input: "var(--color-input)",
          error: "var(--color-error)",
          success: "var(--color-success)",
          warning: "var(--color-warning)",
          
          // Theme specific colors will be handled through CSS variables
          // These are just the variable names that will be used
        },
      },
    },
    extend: {
      
    },
  plugins: [],
}

