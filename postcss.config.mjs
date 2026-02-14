// frontend/postcss.config.mjs
/** @type {import('postcss').AcceptedPlugin[]} */
const config = {
  plugins: {
    // Tailwind doit toujours être en premier
    'tailwindcss': {},
    'autoprefixer': {},
    // Ajoutez ici d'autres plugins PostCSS si nécessaire
  },
}
export default config;