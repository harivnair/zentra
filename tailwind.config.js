/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  // keep daisyUI from auto-applying a full theme that may conflict with your design tokens
  daisyui: {
    themes: false,
  },
}
