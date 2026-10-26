/**
 * Recorre un `express.Router` (Express 4) y devuelve una fila por método+ruta con la cadena
 * de handlers (incluye los `router.use(...)` previos del mismo router y de los padres).
 */
const etiquetaMontaje = (layer) => {
  if (layer.regexp?.fast_slash) return '';
  const fuente = layer.regexp?.source ?? '';
  const m = fuente.replace('^\\/', '/').replace('\\/?(?=\\/|$)', '').replace(/\\\//g, '/');
  return m.replace(/\(\?:\(\[\^\/\]\+\?\)\)/g, ':param').replace(/\$$/, '');
};

export const aplanarRutas = (router, prefijo = '', heredados = []) => {
  const filas = [];
  const previos = [...heredados];
  for (const layer of router.stack) {
    if (layer.route) {
      const handlers = [...previos, ...layer.route.stack.map((l) => l.handle)];
      for (const metodo of Object.keys(layer.route.methods)) {
        filas.push({ metodo: metodo.toUpperCase(), ruta: `${prefijo}${layer.route.path}`, handlers });
      }
    } else if (layer.handle?.stack) {
      filas.push(...aplanarRutas(layer.handle, `${prefijo}${etiquetaMontaje(layer)}`, previos));
    } else if (typeof layer.handle === 'function') {
      previos.push(layer.handle);
    }
  }
  return filas;
};
