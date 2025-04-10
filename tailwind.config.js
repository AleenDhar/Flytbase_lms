module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    // Add other paths if necessary
  ],
  theme: {
    extend: {
      boxShadow: {
        "custom-dark": "0 4px 30px rgba(0, 0, 0, 0.7)", // Darker and spread shadow
      },
      fontFamily: {
        sans: ["var(--font-atlassian-sans)", "system-ui", "sans-serif"],
      },
    },
  },
};
