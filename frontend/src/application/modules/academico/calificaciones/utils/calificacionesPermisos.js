/**
 * Códigos de permiso · Calificaciones (seed 54, IDs 15-24).
 * Aterrizaje del menú: menu.landingStack en routes ACA-CAL (patrón global ModuleEntryConnector).
 *
 * Rol DOCENTE (7): 15, 17–18, 21–23 (sin 16 coordinación ni 20 gestión bimestres) — ver seed 55.
 * Vista coordinación (sessionStorage docenteId) solo si tiene permiso 16; si no, GET mis-cursos.
 */

export const CALIFICACIONES_PERMISOS = {
  /** Menú Académico → Calificaciones */
  ingreso: 'academico.calificacion.ingreso',
  /** Vista general coordinación — lista de docentes */
  coordinacion: 'academico.calificacion.coordinacion',
  /** Mis cursos (docente propio o tras elegir docente) */
  misCursos: 'academico.calificacion.mis_cursos',
  /** Cuaderno de evaluaciones por bimestre */
  cuaderno: 'academico.calificacion.cuaderno',
  /** Política institucional (Nivel 1) */
  politica: 'academico.calificacion.politica',
  /** Gestión de bimestres (coordinación, Nivel 2) */
  gestionBimestres: 'academico.calificacion.gestion_bimestres',
  /** Crear/editar/eliminar evaluaciones (columnas) del cuaderno */
  cuadernoEvaluaciones: 'academico.calificacion.cuaderno.evaluaciones',
  /** Registrar/modificar notas (celdas) del cuaderno */
  cuadernoNotas: 'academico.calificacion.cuaderno.notas',
  /** Guardar bimestre: persiste y recalcula componentes del bimestre */
  cuadernoGuardar: 'academico.calificacion.cuaderno.guardar',
  /** Bimestre cerrado: ajuste administrativo (habilitación / sobrescritura) */
  bimestreAjusteAdmin: 'academico.calificacion.bimestre.ajuste_admin',
};
