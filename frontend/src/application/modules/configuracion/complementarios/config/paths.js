/** Rutas CFG → Complementarios (tabs + formularios). */

export const COMPLEMENTARIOS_BASE = '/configuracion/complementarios';

/** @deprecated */
export const DATOS_COMPLEMENTARIOS_BASE = COMPLEMENTARIOS_BASE;

export const complementarioTabPath = (tab) => `${COMPLEMENTARIOS_BASE}?tab=${tab}`;

export const DISCAPACIDAD_BASE = `${COMPLEMENTARIOS_BASE}/discapacidad`;
export const DISCAPACIDAD_REGISTRAR_PATH = `${DISCAPACIDAD_BASE}/registrar`;

export const discapacidadEditarPath = (discapacidadId, { view = false } = {}) => {
  const params = new URLSearchParams({ discapacidadId: String(discapacidadId) });
  if (view) params.set('view', 'true');
  return `${DISCAPACIDAD_BASE}/editar?${params.toString()}`;
};
