/**
 * Enumera TODAS las rutas registradas en la app Express (recorre el stack de routers).
 * Sin BD: solo lee la estructura. Sirve a las matrices de seguridad (401 sin token, 403 sin permiso).
 */

/** Reconstruye el prefijo de un `router.use('/x', ...)` desde la expresión regular de la capa. */
function prefijoDeCapa(layer) {
  if (layer.regexp?.fast_slash) return '';
  let fuente = layer.regexp.source
    .replace('^\\/', '/')
    .replace('\\/?(?=\\/|$)', '')
    .replace(/\$$/, '');
  const claves = (layer.keys || []).map((k) => `:${k.name}`);
  fuente = fuente.replace(/\(\?:\(\[\^\\\/]\+\?\)\)/g, () => claves.shift() || ':param');
  return fuente.replace(/\\\//g, '/').replace(/\/$/, '');
}

function recorrer(stack, prefijo, salida) {
  for (const layer of stack) {
    if (layer.route) {
      const rutas = Array.isArray(layer.route.path) ? layer.route.path : [layer.route.path];
      for (const ruta of rutas) {
        for (const metodo of Object.keys(layer.route.methods)) {
          if (layer.route.methods[metodo]) {
            salida.push({
              metodo: metodo.toUpperCase(),
              ruta: `${prefijo}${ruta === '/' ? '' : ruta}` || '/',
            });
          }
        }
      }
    } else if (layer.name === 'router' && layer.handle?.stack) {
      recorrer(layer.handle.stack, prefijo + prefijoDeCapa(layer), salida);
    }
  }
  return salida;
}

/** @returns {Array<{metodo: string, ruta: string}>} únicas, ordenadas. */
export function listarRutas(app) {
  const stack = (app._router || app.router).stack;
  const todas = recorrer(stack, '', []);
  const vistas = new Set();
  return todas
    .filter(({ metodo, ruta }) => {
      const clave = `${metodo} ${ruta}`;
      if (vistas.has(clave)) return false;
      vistas.add(clave);
      return true;
    })
    .sort((a, b) => (a.ruta + a.metodo).localeCompare(b.ruta + b.metodo));
}

/** Sustituye `:param` por un valor concreto que pasa validadores de id numérico. */
export function rutaConcreta(ruta, valor = '1') {
  return ruta.replace(/:[A-Za-z0-9_]+(\([^)]*\))?\??/g, valor);
}
