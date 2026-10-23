/**
 * Tokens de DI del módulo Capacitación (CAP)
 *
 * Los repositorios del módulo se registran con tokens propios (scoped
 * 'capacitacion.*') dentro de registerCapacitacionModule — diff mínimo en los
 * índices compartidos: solo se toca tokens/index.js, modules/index.js y
 * presentation/routes/index.js.
 */
export const CAPACITACION_TOKENS = {
  // Repositorios (arquetipo A + arquetipo B de vistas)
  participanteRepository: 'capacitacion.participanteRepository',
  cursoCapacitacionRepository: 'capacitacion.cursoCapacitacionRepository',
  inscripcionCapacitacionRepository: 'capacitacion.inscripcionCapacitacionRepository',
  pagoCapacitacionRepository: 'capacitacion.pagoCapacitacionRepository',
  capacitacionCompromisoRepository: 'capacitacion.capacitacionCompromisoRepository',
  cursoCapacitacionFichaViewRepository: 'capacitacion.cursoCapacitacionFichaViewRepository',
  capacitacionRequisitoRepository: 'capacitacion.capacitacionRequisitoRepository',
  grupoCapacitacionRepository: 'capacitacion.grupoCapacitacionRepository',
  grupoCapacitacionListadoViewRepository: 'capacitacion.grupoCapacitacionListadoViewRepository',
  bloqueCapacitacionRepository: 'capacitacion.bloqueCapacitacionRepository',
  capacitacionInscritoRequisitoRepository: 'capacitacion.capacitacionInscritoRequisitoRepository',

  // Use Cases — Cursos de capacitación
  listCursosCapacitacionUseCase: 'capacitacion.listCursosCapacitacionUseCase',
  listHorariosDisponiblesCapacitacionUseCase: 'capacitacion.listHorariosDisponiblesCapacitacionUseCase',
  listGruposCapacitacionUseCase: 'capacitacion.listGruposCapacitacionUseCase',
  listHorariosCapacitacionUseCase: 'capacitacion.listHorariosCapacitacionUseCase',
  createHorarioCapacitacionUseCase: 'capacitacion.createHorarioCapacitacionUseCase',
  getHorarioCapacitacionUseCase: 'capacitacion.getHorarioCapacitacionUseCase',
  updateHorarioCapacitacionUseCase: 'capacitacion.updateHorarioCapacitacionUseCase',
  deleteHorarioCapacitacionUseCase: 'capacitacion.deleteHorarioCapacitacionUseCase',
  getCursoCapacitacionByIdUseCase: 'capacitacion.getCursoCapacitacionByIdUseCase',
  createCursoCapacitacionUseCase: 'capacitacion.createCursoCapacitacionUseCase',
  updateCursoCapacitacionUseCase: 'capacitacion.updateCursoCapacitacionUseCase',
  deleteCursoCapacitacionUseCase: 'capacitacion.deleteCursoCapacitacionUseCase',
  setEstadoCursoCapacitacionUseCase: 'capacitacion.setEstadoCursoCapacitacionUseCase',
  abrirCursoCapacitacionUseCase: 'capacitacion.abrirCursoCapacitacionUseCase',
  cancelarCursoCapacitacionUseCase: 'capacitacion.cancelarCursoCapacitacionUseCase',
  exportListadoInscritosCapacitacionUseCase: 'capacitacion.exportListadoInscritosCapacitacionUseCase',

  // Use Cases — Participantes
  listParticipantesUseCase: 'capacitacion.listParticipantesUseCase',
  getParticipanteByIdUseCase: 'capacitacion.getParticipanteByIdUseCase',
  createParticipanteUseCase: 'capacitacion.createParticipanteUseCase',
  updateParticipanteUseCase: 'capacitacion.updateParticipanteUseCase',
  deleteParticipanteUseCase: 'capacitacion.deleteParticipanteUseCase',

  // Use Cases — Inscripciones y pagos
  listInscripcionesCapacitacionUseCase: 'capacitacion.listInscripcionesCapacitacionUseCase',
  getInscripcionCapacitacionByIdUseCase: 'capacitacion.getInscripcionCapacitacionByIdUseCase',
  createInscripcionCapacitacionUseCase: 'capacitacion.createInscripcionCapacitacionUseCase',
  deleteInscripcionCapacitacionUseCase: 'capacitacion.deleteInscripcionCapacitacionUseCase',
  anularInscripcionCapacitacionUseCase: 'capacitacion.anularInscripcionCapacitacionUseCase',
  registerPagoCapacitacionUseCase: 'capacitacion.registerPagoCapacitacionUseCase',
  updateInscripcionCapacitacionUseCase: 'capacitacion.updateInscripcionCapacitacionUseCase',
  updatePagoCapacitacionUseCase: 'capacitacion.updatePagoCapacitacionUseCase',
  anularPagoCapacitacionUseCase: 'capacitacion.anularPagoCapacitacionUseCase',
  updateRequisitosInscripcionUseCase: 'capacitacion.updateRequisitosInscripcionUseCase',
  adjuntarComprobantePagoCapacitacionUseCase: 'capacitacion.adjuntarComprobantePagoCapacitacionUseCase',
  descargarComprobantePagoCapacitacionUseCase: 'capacitacion.descargarComprobantePagoCapacitacionUseCase',
  exportFormularioInscripcionCapacitacionPdfUseCase:
    'capacitacion.exportFormularioInscripcionCapacitacionPdfUseCase',
  exportReciboPagoCapacitacionPdfUseCase: 'capacitacion.exportReciboPagoCapacitacionPdfUseCase',

  // Controllers — Cursos de capacitación
  listCursosCapacitacionController: 'capacitacion.listCursosCapacitacionController',
  listHorariosDisponiblesCapacitacionController:
    'capacitacion.listHorariosDisponiblesCapacitacionController',
  listGruposCapacitacionController: 'capacitacion.listGruposCapacitacionController',
  listHorariosCapacitacionController: 'capacitacion.listHorariosCapacitacionController',
  createHorarioCapacitacionController: 'capacitacion.createHorarioCapacitacionController',
  getHorarioCapacitacionController: 'capacitacion.getHorarioCapacitacionController',
  updateHorarioCapacitacionController: 'capacitacion.updateHorarioCapacitacionController',
  deleteHorarioCapacitacionController: 'capacitacion.deleteHorarioCapacitacionController',
  getCursoCapacitacionByIdController: 'capacitacion.getCursoCapacitacionByIdController',
  createCursoCapacitacionController: 'capacitacion.createCursoCapacitacionController',
  updateCursoCapacitacionController: 'capacitacion.updateCursoCapacitacionController',
  deleteCursoCapacitacionController: 'capacitacion.deleteCursoCapacitacionController',
  setEstadoCursoCapacitacionController: 'capacitacion.setEstadoCursoCapacitacionController',
  abrirCursoCapacitacionController: 'capacitacion.abrirCursoCapacitacionController',
  cancelarCursoCapacitacionController: 'capacitacion.cancelarCursoCapacitacionController',
  exportListadoInscritosCapacitacionController: 'capacitacion.exportListadoInscritosCapacitacionController',

  // Controllers — Participantes
  listParticipantesController: 'capacitacion.listParticipantesController',
  getParticipanteByIdController: 'capacitacion.getParticipanteByIdController',
  createParticipanteController: 'capacitacion.createParticipanteController',
  updateParticipanteController: 'capacitacion.updateParticipanteController',
  deleteParticipanteController: 'capacitacion.deleteParticipanteController',

  // Controllers — Inscripciones y pagos
  listInscripcionesCapacitacionController: 'capacitacion.listInscripcionesCapacitacionController',
  getInscripcionCapacitacionByIdController: 'capacitacion.getInscripcionCapacitacionByIdController',
  createInscripcionCapacitacionController: 'capacitacion.createInscripcionCapacitacionController',
  deleteInscripcionCapacitacionController: 'capacitacion.deleteInscripcionCapacitacionController',
  anularInscripcionCapacitacionController: 'capacitacion.anularInscripcionCapacitacionController',
  registerPagoCapacitacionController: 'capacitacion.registerPagoCapacitacionController',
  updateInscripcionCapacitacionController: 'capacitacion.updateInscripcionCapacitacionController',
  updatePagoCapacitacionController: 'capacitacion.updatePagoCapacitacionController',
  anularPagoCapacitacionController: 'capacitacion.anularPagoCapacitacionController',
  updateRequisitosInscripcionController: 'capacitacion.updateRequisitosInscripcionController',
  adjuntarComprobantePagoCapacitacionController:
    'capacitacion.adjuntarComprobantePagoCapacitacionController',
  descargarComprobantePagoCapacitacionController:
    'capacitacion.descargarComprobantePagoCapacitacionController',
  exportFormularioInscripcionCapacitacionController:
    'capacitacion.exportFormularioInscripcionCapacitacionController',
  exportReciboPagoCapacitacionController: 'capacitacion.exportReciboPagoCapacitacionController',

  // Routers
  cursosCapacitacionRouter: 'capacitacion.cursosCapacitacionRouter',
  participantesRouter: 'capacitacion.participantesRouter',
  inscripcionesCapacitacionRouter: 'capacitacion.inscripcionesCapacitacionRouter',
};
