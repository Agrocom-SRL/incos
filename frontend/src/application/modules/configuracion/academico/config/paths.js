/** Rutas CFG → Académico (tabs + formularios + detalle de plan). */

export const ACADEMICO_BASE = '/configuracion/academico';

/** @deprecated alias */
export const PLAN_ESTUDIO_BASE = ACADEMICO_BASE;

export const academicoTabPath = (tab) => `${ACADEMICO_BASE}?tab=${tab}`;

export const planDetallePath = (planId) => `${ACADEMICO_BASE}/plan/${planId}`;

export const CARRERAS_BASE = `${ACADEMICO_BASE}/carreras`;
export const CARRERAS_REGISTRAR_PATH = `${CARRERAS_BASE}/registrar`;

export const carreraEditarPath = (carreraId, { view = false } = {}) => {
  const params = new URLSearchParams({ carreraId: String(carreraId) });
  if (view) params.set('view', 'true');
  return `${CARRERAS_BASE}/editar?${params.toString()}`;
};

export const MATERIAS_BASE = `${ACADEMICO_BASE}/materias`;
export const MATERIAS_REGISTRAR_PATH = `${MATERIAS_BASE}/registrar`;

export const materiaEditarPath = (materiaId, { view = false } = {}) => {
  const params = new URLSearchParams({ materiaId: String(materiaId) });
  if (view) params.set('view', 'true');
  return `${MATERIAS_BASE}/editar?${params.toString()}`;
};
