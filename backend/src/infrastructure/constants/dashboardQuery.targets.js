/**
 * Nombres de vistas/tablas usados por DashboardRepository (evita strings mágicos dispersos).
 */
export const DASHBOARD_QUERY_TARGETS = {
  vistaActividadesRecientes: 'vista_dashboard_actividades_recientes',
  vistaDocentePanel: 'vista_base_dashboard_docente_panel',
  vistaEstudiantePanel: 'vista_base_dashboard_estudiante_panel',
  tablaEstudiantes: 'estudiantes',
  // Portal del estudiante (GET /dashboard/mi-resumen)
  vistaEstudianteCarreraReciente: 'vista_base_estudiante_carrera_reciente',
  vistaEstudianteAporteSaldoResumen: 'vista_base_estudiante_aporte_saldo_resumen',
  vistaCalificacionEstudianteMatriculaCurso: 'vista_base_calificacion_estudiante_matricula_curso',
  vistaAsignacionDocenteDetalle: 'vista_base_asignacion_docente_detalle',
  tablaCarreras: 'carreras',
  tablaSesiones: 'sesiones',
  // Portal del rol docente (GET /dashboard/mi-resumen-docente y /docentes/mis-estudiantes)
  vistaDocenteCargaPorGestion: 'vista_docente_carga_por_gestion',
  vistaDocenteCursoBloquesHorario: 'vista_base_docente_curso_bloques_horario',
  vistaDocenteCursoEstudiantes: 'vista_docente_curso_estudiantes',
};
