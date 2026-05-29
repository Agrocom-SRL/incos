/**
 * URL absoluta para imagen de carrera (ruta relativa del API o URL externa).
 */
export const buildCarreraImageUrl = (ruta) => {
  if (!ruta) return null;
  if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  const serverBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
  const path = ruta.startsWith('/') ? ruta : `/${ruta}`;
  return `${serverBaseUrl}${path}`;
};
