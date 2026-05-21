/**
 * Placeholder temporal mientras se migra el cuaderno y el tablero al backend real.
 */

const pendiente = (nombre) => async () => {
  throw new Error(
    `Calificaciones: ${nombre} aún no está conectado al backend (Fase 2-bis pendiente).`,
  );
};

export const calificacionesPendingApi = {
  obtenerCalificacionesCursos: pendiente('listado de cursos del docente'),
  obtenerCuaderno: pendiente('cuaderno'),
  actualizarNota: pendiente('guardado de notas'),
  obtenerTiposEvaluacion: pendiente('tipos de evaluación'),
  crearEvaluacion: pendiente('crear evaluación'),
  editarEvaluacion: pendiente('editar evaluación'),
  eliminarEvaluacion: pendiente('eliminar evaluación'),
  obtenerAjustesCurso: pendiente('ajustes del curso'),
  guardarAjustesCurso: pendiente('guardar ajustes del curso'),
  obtenerTablero: pendiente('tablero de gestión'),
  validarCierreBimestre: pendiente('validar cierre de bimestre'),
  iniciarBimestre1: pendiente('iniciar bimestre'),
  cerrarBimestre: pendiente('cerrar bimestre'),
  listarDocentesVistaAdmin: pendiente('listado de docentes'),
  activarImpersonacion: pendiente('impersonación'),
  desactivarImpersonacion: async () => null,
  obtenerCursosDocenteAdmin: pendiente('cursos del docente (admin)'),
  obtenerPoliticaInstitucional: pendiente('política institucional'),
  guardarPoliticaInstitucional: pendiente('guardar política'),
};
