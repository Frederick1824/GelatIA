/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#050816",
          900: "#0b1120",
          850: "#10182b",
          800: "#14203a",
          700: "#1d2a4a"
        },
        accent: {
          red: "#ef4444",
          blue: "#38bdf8",
          ice: "#e0f2fe"
        }
      },
      boxShadow: {
        panel: "0 24px 60px rgba(2, 6, 23, 0.45)"
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(239,68,68,0.18), transparent 32%), radial-gradient(circle at top right, rgba(56,189,248,0.16), transparent 28%), linear-gradient(160deg, rgba(15,23,42,0.92), rgba(2,6,23,0.98))"
      }
    }
  },
  plugins: []
};
