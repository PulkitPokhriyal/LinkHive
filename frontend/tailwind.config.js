/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0d0e",
        primary: "#aac4d0",
        secondary: "#326278",
        accent: "#3d9bc5",
        text: "#eceded",
        card: "#344145",
      },
    },
  },
  plugins: [],
};
