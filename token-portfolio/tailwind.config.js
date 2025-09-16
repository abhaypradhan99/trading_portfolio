/** @type {import('tailwindcss').Config} */
export default {
  important: true,
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        background: '#1a1a1a',
        card: '#2a2a2a',
        text: '#ffffff',
        accent: '#A9E851',
        pie1: '#ff7f50',
        pie2: '#9370db',
        pie3: '#00ffff',
        pie4: '#32cd32',
        pie5: '#4169e1',
      },
    },
  },
  plugins: [],
};
