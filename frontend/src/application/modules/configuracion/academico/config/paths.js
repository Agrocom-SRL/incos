/** Rutas CFG → Académico (tabs + ABM + detalle de plan). */

export const ACADEMICO_BASE = '/configuracion/academico';

/** @deprecated alias */
export const PLAN_ESTUDIO_BASE = ACADEMICO_BASE;

export const academicoTabPath = (tab) => `${ACADEMICO_BASE}?tab=${tab}`;

export const CARRERAS_LIST_PATH = `${ACADEMICO_BASE}?tab=carreras`;
export const MATERIAS_LIST_PATH = `${ACADEMICO_BASE}?tab=materias`;
export const PLANES_LIST_PATH = `${ACADEMICO_BASE}?tab=planes`;
export const PARALELOS_LIST_PATH = `${ACADEMICO_BASE}?tab=paralelos`;

/** ABM y detalle carrera (páginas completas) */
export const carreraNuevaPath = `${ACADEMICO_BASE}/carrera/nueva`;
export const carreraDetallePath = (carreraId) => `${ACADEMICO_BASE}/carrera/${carreraId}`;
export const carreraEditarPath = (carreraId) => `${ACADEMICO_BASE}/carrera/${carreraId}/editar`;

/** ABM y detalle materia */
export const materiaNuevaPath = `${ACADEMICO_BASE}/materia/nueva`;
export const materiaDetallePath = (materiaId) => `${ACADEMICO_BASE}/materia/${materiaId}`;
export const materiaEditarPath = (materiaId) => `${ACADEMICO_BASE}/materia/${materiaId}/editar`;

/** ABM y detalle paralelo maestro */
export const paraleloNuevaPath = `${ACADEMICO_BASE}/paralelo/nueva`;
export const paraleloDetallePath = (paraleloId) => `${ACADEMICO_BASE}/paralelo/${paraleloId}`;
export const paraleloEditarPath = (paraleloId) => `${ACADEMICO_BASE}/paralelo/${paraleloId}/editar`;

/** @deprecated usar carreraNuevaPath */
export const CARRERAS_REGISTRAR_PATH = carreraNuevaPath;
/** @deprecated usar materiaNuevaPath */
export const MATERIAS_REGISTRAR_PATH = materiaNuevaPath;
