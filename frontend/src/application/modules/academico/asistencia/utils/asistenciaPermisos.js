/**
 * Códigos de permiso · Asistencia (ítem de Académico · ACA-ASI). Seeds 54/56/55.
 * @see docs/plan/MODULO-ASISTENCIA.md §7 · docs/referencia/matriz-permisos-sistema.md
 *
 * Asistencia es gemela de Calificaciones: un único ítem de menú bajo Académico con
 * varias páginas (registro diario, clases no dictadas, consolidado, licencias).
 * Visibilidad de sidebar = acción LISTAR del permiso de entrada (`registro.ver`).
 *
 * La distinción coordinación/propio del Registro NO es un permiso aparte (a diferencia
 * de Calificaciones): se resuelve por rol sobre el mismo `registro.ver` (seed 55 §7.4).
 * Se afina en la fase del Registro funcional.
 */

export const ASISTENCIA_PERMISOS = {
  /** Registro diario — entrada "mis cursos" (LISTAR/DETALLE); gobierna el ítem de menú */
  registroVer: 'academico.asistencia.registro.ver',
  /** Planilla diaria del curso — toma/edición (LISTAR/EDITAR) */
  registroCuaderno: 'academico.asistencia.registro.cuaderno',
  /** Clases no dictadas (LISTAR/CREAR/EDITAR) */
  claseNoDictadaVer: 'academico.asistencia.clase_no_dictada.ver',
  /** Consolidado % por estudiante/curso (LISTAR/EXPORTAR) */
  consolidadoVer: 'academico.asistencia.consolidado.ver',
  /** Licencias estudiantiles — página dentro de Asistencia (renombrado desde academico.licencia.*) */
  licenciaVer: 'academico.asistencia.licencia.ver',
  licenciaCrear: 'academico.asistencia.licencia.crear',
  licenciaAprobar: 'academico.asistencia.licencia.aprobar',
};
