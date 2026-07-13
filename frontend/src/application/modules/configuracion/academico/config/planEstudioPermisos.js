/**
 * Códigos de permiso — plan de estudio (ficha-hub + matriz + prerrequisitos).
 *
 * Un único permiso `configuracion.plan-estudio` gobierna LISTAR/DETALLE/CREAR/
 * EDITAR/ACTIVAR de la ficha (datos generales, publicar vigente, clonar para
 * nueva versión). El CRUD de la matriz y de los prerrequisitos usa permisos
 * dedicados (LISTAR/CREAR/EDITAR/ELIMINAR), alineados 1:1 con
 * `backend/src/presentation/routes/{planes-estudios,periodos,asignaturas-plan,
 * prerrequisitos}.routes.js` — ver `docs/referencia/matriz-permisos-sistema.md`
 * sección plan-estudio.
 */

export const PLAN_ESTUDIO_PERMISO = 'configuracion.plan-estudio';
export const PLAN_PERIODOS_PERMISO = 'configuracion.plan-estudio.periodos';
export const PLAN_ASIGNATURAS_PERMISO = 'configuracion.plan-estudio.asignaturas';
export const PLAN_PRERREQUISITOS_PERMISO = 'configuracion.plan-estudio.prerrequisitos';
