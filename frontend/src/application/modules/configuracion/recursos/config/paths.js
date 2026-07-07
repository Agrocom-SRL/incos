/** Rutas CFG → Recursos académicos (tabs + ABM + detalle por entidad). */

import { TAB_PARALELOS } from './tabs';

export const RECURSOS_BASE = '/configuracion/recursos';

export const recursoTabPath = (tab) => `${RECURSOS_BASE}?tab=${tab}`;

export const PARALELOS_LIST_PATH = recursoTabPath(TAB_PARALELOS);

/** ABM y detalle paralelo maestro */
export const PARALELO_BASE = `${RECURSOS_BASE}/paralelo`;
export const paraleloNuevaPath = `${PARALELO_BASE}/nueva`;
export const paraleloDetallePath = (paraleloId) => `${PARALELO_BASE}/${paraleloId}`;
export const paraleloEditarPath = (paraleloId) => `${PARALELO_BASE}/${paraleloId}/editar`;
