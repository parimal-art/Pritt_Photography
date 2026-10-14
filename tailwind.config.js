/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      // All colours come from CSS variables (see app/globals.css) so every
      // component follows the dark / light theme automatically.
      colors: {
        ink: token("bg"), // main background
        char: token("bg2"), // secondary background
        coal: token("surface"), // elevated surfaces
        line: token("border"), // borders
        bone: token("text"), // primary text
        ash: token("muted"), // secondary text
        mute: token("muted"),
        sand: token("accent"), // champagne accent (borders, dots, fills)
        gilt: token("accent-text"), // champagne accent for TEXT (AA contrast in both themes)
        danger: token("danger"),
      },
      fontFamily: {
        serif: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        caps: "0.2em",
      },
    },
  },
  plugins: [],
};
