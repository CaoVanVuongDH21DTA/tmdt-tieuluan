/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1e40af", // xanh dương đậm
          light: "#afcdff",   // xanh nhạt
          dark: "#1e3a8a",    // xanh đậm hơn
        },
        secondary: {
          DEFAULT: "#f59e0b", // vàng amber chính
          light: "#fbbf24",   // vàng sáng
          dark: "#d97706",    // vàng cam đậm
        },
      },
    },
  },
  plugins: [],
}
