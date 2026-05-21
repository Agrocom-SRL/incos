/**
 * Códigos de permiso · Calificaciones (seed 54, IDs 15-24, 106).
 * Un permiso por pantalla en routes.jsx (grupo_ui único en grilla Seguridad).
 */

export const CALIFICACIONES_PERMISOS = {
  /** Menú Académico → Calificaciones */
  ingreso: 'academico.calificacion.ingreso',
  /** Vista general coordinación — lista de docentes */
  coordinacion: 'academico.calificacion.coordinacion',
  /** Mis cursos (docente propio o tras elegir docente) */
  misCursos: 'academico.calificacion.mis_cursos',
  /** Registro acumulado por bimestre (pantalla previa al cuaderno) */
  registro: 'academico.calificacion.registro',
  /** Cuaderno de evaluaciones por bimestre */
  cuaderno: 'academico.calificacion.cuaderno',
  /** Política institucional (Nivel 1) */
  politica: 'academico.calificacion.politica',
  /** Tablero de gestión (Nivel 2) */
  tablero: 'academico.calificacion.tablero',
  registrarParcial: 'academico.calificacion.registrar.parcial',
  registrarPractico: 'academico.calificacion.registrar.practico',
  registrarRecuperatorio: 'academico.calificacion.registrar.recuperatorio',
  modificar: 'academico.calificacion.modificar',
};
