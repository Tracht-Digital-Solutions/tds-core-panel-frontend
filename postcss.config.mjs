// Astro 6 ships Vite 7 with rolldown, incompatible with the @tailwindcss/vite
// plugin's resolver shape (withastro/astro#16542). Run Tailwind through PostCSS.
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
