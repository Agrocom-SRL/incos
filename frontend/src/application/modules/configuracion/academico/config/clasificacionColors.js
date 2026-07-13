/**
 * Color de punto (swatch) por clasificación de materia — para el select del
 * builder de periodo (mismo lenguaje que el select de etapas del cronograma,
 * `CronogramaActividadFormSections`). Las clasificaciones no tienen color en
 * BD, así que se asigna de una paleta fija de forma determinística (hash del
 * nombre), estable aunque el catálogo visible cambie.
 */

const PALETA_CLASIFICACION = [
  '#389e0d', // verde
  '#1677ff', // azul
  '#fa8c16', // naranja
  '#722ed1', // morado
  '#eb2f96', // magenta
  '#13c2c2', // cian
  '#d4380d', // rojo ladrillo
  '#7cb305', // lima
];

export const getClasificacionColor = (clasificacion) => {
  if (!clasificacion) return '#8c8c8c';
  let hash = 0;
  for (let i = 0; i < clasificacion.length; i += 1) {
    hash = (hash * 31 + clasificacion.charCodeAt(i)) % 997;
  }
  return PALETA_CLASIFICACION[hash % PALETA_CLASIFICACION.length];
};
