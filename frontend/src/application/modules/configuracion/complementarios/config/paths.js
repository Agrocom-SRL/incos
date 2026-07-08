/** Rutas CFG → Complementarios (tabs + ABM + detalle por entidad). */

import {
  TAB_APODERADOS,
  TAB_DISCAPACIDAD,
  TAB_ESTADOS_CIVILES,
  TAB_IDIOMAS,
} from './tabs';

export const COMPLEMENTARIOS_BASE = '/configuracion/complementarios';

export const complementarioTabPath = (tab) => `${COMPLEMENTARIOS_BASE}?tab=${tab}`;

export const DISCAPACIDAD_LIST_PATH = complementarioTabPath(TAB_DISCAPACIDAD);
export const APODERADOS_LIST_PATH = complementarioTabPath(TAB_APODERADOS);
export const IDIOMAS_LIST_PATH = complementarioTabPath(TAB_IDIOMAS);
export const ESTADOS_CIVILES_LIST_PATH = complementarioTabPath(TAB_ESTADOS_CIVILES);

/** ABM y detalle: tipo de discapacidad */
export const DISCAPACIDAD_BASE = `${COMPLEMENTARIOS_BASE}/discapacidad`;
export const discapacidadNuevaPath = `${DISCAPACIDAD_BASE}/nueva`;
export const discapacidadDetallePath = (id) => `${DISCAPACIDAD_BASE}/${id}`;
export const discapacidadEditarPath = (id) => `${DISCAPACIDAD_BASE}/${id}/editar`;

/** ABM y detalle: apoderado (tipo de parentesco) */
export const APODERADO_BASE = `${COMPLEMENTARIOS_BASE}/apoderado`;
export const apoderadoNuevaPath = `${APODERADO_BASE}/nueva`;
export const apoderadoDetallePath = (id) => `${APODERADO_BASE}/${id}`;
export const apoderadoEditarPath = (id) => `${APODERADO_BASE}/${id}/editar`;

/** ABM y detalle: idioma */
export const IDIOMA_BASE = `${COMPLEMENTARIOS_BASE}/idioma`;
export const idiomaNuevaPath = `${IDIOMA_BASE}/nueva`;
export const idiomaDetallePath = (id) => `${IDIOMA_BASE}/${id}`;
export const idiomaEditarPath = (id) => `${IDIOMA_BASE}/${id}/editar`;

/** ABM y detalle: estado civil */
export const ESTADO_CIVIL_BASE = `${COMPLEMENTARIOS_BASE}/estado-civil`;
export const estadoCivilNuevaPath = `${ESTADO_CIVIL_BASE}/nueva`;
export const estadoCivilDetallePath = (id) => `${ESTADO_CIVIL_BASE}/${id}`;
export const estadoCivilEditarPath = (id) => `${ESTADO_CIVIL_BASE}/${id}/editar`;
