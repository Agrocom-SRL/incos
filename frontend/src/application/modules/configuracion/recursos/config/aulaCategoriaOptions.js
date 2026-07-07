/**
 * Categorías del catálogo Aulas (ENUM `categoria` en `aulas`, backend
 * `CATEGORIAS_AULA_VALUES` en `cursos.constants.js`). Único origen de las
 * etiquetas/opciones consumidas por el formulario y la tabla.
 */
export const AULA_CATEGORIA_OPTIONS = [
  { value: 'LABORATORIO', label: 'Laboratorio' },
  { value: 'AULA', label: 'Aula' },
  { value: 'TALLER', label: 'Taller' },
  { value: 'AUDITORIO', label: 'Auditorio' },
];

const AULA_CATEGORIA_LABELS = AULA_CATEGORIA_OPTIONS.reduce((acc, opt) => {
  acc[opt.value] = opt.label;
  return acc;
}, {});

export const getAulaCategoriaLabel = (categoria) => AULA_CATEGORIA_LABELS[categoria] || categoria || '—';
