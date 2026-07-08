/** Rutas CFG → Recursos académicos (tabs + ABM + detalle por entidad). */

import { TAB_PARALELOS, TAB_AULAS, TAB_TIPOS_EVALUACION } from './tabs';

export const RECURSOS_BASE = '/configuracion/recursos';

export const recursoTabPath = (tab) => `${RECURSOS_BASE}?tab=${tab}`;

export const PARALELOS_LIST_PATH = recursoTabPath(TAB_PARALELOS);
export const AULAS_LIST_PATH = recursoTabPath(TAB_AULAS);
export const TIPOS_EVALUACION_LIST_PATH = recursoTabPath(TAB_TIPOS_EVALUACION);

/** ABM y detalle paralelo maestro */
export const PARALELO_BASE = `${RECURSOS_BASE}/paralelo`;
export const paraleloNuevaPath = `${PARALELO_BASE}/nueva`;
export const paraleloDetallePath = (paraleloId) => `${PARALELO_BASE}/${paraleloId}`;
export const paraleloEditarPath = (paraleloId) => `${PARALELO_BASE}/${paraleloId}/editar`;

/** ABM y detalle aula */
export const AULA_BASE = `${RECURSOS_BASE}/aula`;
export const aulaNuevaPath = `${AULA_BASE}/nueva`;
export const aulaDetallePath = (aulaId) => `${AULA_BASE}/${aulaId}`;
export const aulaEditarPath = (aulaId) => `${AULA_BASE}/${aulaId}/editar`;

/** ABM y detalle tipo de evaluación */
export const TIPO_EVALUACION_BASE = `${RECURSOS_BASE}/tipo-evaluacion`;
export const tipoEvaluacionNuevaPath = `${TIPO_EVALUACION_BASE}/nueva`;
export const tipoEvaluacionDetallePath = (tipoEvaluacionId) => `${TIPO_EVALUACION_BASE}/${tipoEvaluacionId}`;
export const tipoEvaluacionEditarPath = (tipoEvaluacionId) =>
  `${TIPO_EVALUACION_BASE}/${tipoEvaluacionId}/editar`;
