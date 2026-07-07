/** Rutas CFG → Académico (tabs + ABM + detalle de plan). */

export const ACADEMICO_BASE = '/configuracion/academico';

export const academicoTabPath = (tab) => `${ACADEMICO_BASE}?tab=${tab}`;

export const CARRERAS_LIST_PATH = `${ACADEMICO_BASE}?tab=carreras`;
export const MATERIAS_LIST_PATH = `${ACADEMICO_BASE}?tab=materias`;
export const PLANES_LIST_PATH = `${ACADEMICO_BASE}?tab=planes`;

/** ABM y detalle carrera (páginas completas) */
export const carreraNuevaPath = `${ACADEMICO_BASE}/carrera/nueva`;
export const carreraDetallePath = (carreraId) => `${ACADEMICO_BASE}/carrera/${carreraId}`;
export const carreraEditarPath = (carreraId) => `${ACADEMICO_BASE}/carrera/${carreraId}/editar`;

/** ABM y detalle materia */
export const materiaNuevaPath = `${ACADEMICO_BASE}/materia/nueva`;
export const materiaDetallePath = (materiaId) => `${ACADEMICO_BASE}/materia/${materiaId}`;
export const materiaEditarPath = (materiaId) => `${ACADEMICO_BASE}/materia/${materiaId}/editar`;

/** ABM y detalle paralelo maestro — movido a `configuracion/recursos/config/paths.js`. */
