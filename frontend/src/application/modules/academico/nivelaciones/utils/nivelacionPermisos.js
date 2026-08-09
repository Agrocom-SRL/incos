/**
 * Códigos de permiso del módulo Nivelación (seed 59, dominio ACA).
 *
 * Tres permisos independientes, cada uno con una única acción — asignados
 * SOLO a RECTOR y DIR_ACADEMICO: ABANDONO/RETIRADO y la nivelación misma son
 * SIEMPRE decisión administrativa, nunca del docente.
 */

export const NIVELACION_PERMISOS = {
  /** LISTAR/DETALLE — P1 (paralelos y grilla). */
  ver: 'academico.nivelacion.ver',
  /** CREAR — registrar eventos/programar exámenes (/inscribir). */
  inscribir: 'academico.nivelacion.inscribir',
  /** APROBAR — resultado de examen y decisión administrativa (/aprobar). */
  aprobar: 'academico.nivelacion.aprobar',
};

export default NIVELACION_PERMISOS;
