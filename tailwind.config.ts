import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: "#ff6b5e",
        coraldark: "#e8503f",
        sky: "#38bdf8",
        skydark: "#0ea5e9",
        sand: "#fff7ed",
      },
    },
  },
  plugins: [],
};

export default config;
