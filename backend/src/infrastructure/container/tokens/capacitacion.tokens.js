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
  cursoCapacitacionFichaViewRepository: 'capacitacion.cursoCapacitacionFichaViewRepository',

  // Use Cases — Cursos de capacitación
  listCursosCapacitacionUseCase: 'capacitacion.listCursosCapacitacionUseCase',
  getCursoCapacitacionByIdUseCase: 'capacitacion.getCursoCapacitacionByIdUseCase',
  createCursoCapacitacionUseCase: 'capacitacion.createCursoCapacitacionUseCase',
  updateCursoCapacitacionUseCase: 'capacitacion.updateCursoCapacitacionUseCase',
  deleteCursoCapacitacionUseCase: 'capacitacion.deleteCursoCapacitacionUseCase',
  setEstadoCursoCapacitacionUseCase: 'capacitacion.setEstadoCursoCapacitacionUseCase',

  // Use Cases — Participantes
  listParticipantesUseCase: 'capacitacion.listParticipantesUseCase',
  getParticipanteByIdUseCase: 'capacitacion.getParticipanteByIdUseCase',
  createParticipanteUseCase: 'capacitacion.createParticipanteUseCase',
  updateParticipanteUseCase: 'capacitacion.updateParticipanteUseCase',

  // Use Cases — Inscripciones y pagos
  listInscripcionesCapacitacionUseCase: 'capacitacion.listInscripcionesCapacitacionUseCase',
  getInscripcionCapacitacionByIdUseCase: 'capacitacion.getInscripcionCapacitacionByIdUseCase',
  createInscripcionCapacitacionUseCase: 'capacitacion.createInscripcionCapacitacionUseCase',
  deleteInscripcionCapacitacionUseCase: 'capacitacion.deleteInscripcionCapacitacionUseCase',
  registerPagoCapacitacionUseCase: 'capacitacion.registerPagoCapacitacionUseCase',

  // Controllers — Cursos de capacitación
  listCursosCapacitacionController: 'capacitacion.listCursosCapacitacionController',
  getCursoCapacitacionByIdController: 'capacitacion.getCursoCapacitacionByIdController',
  createCursoCapacitacionController: 'capacitacion.createCursoCapacitacionController',
  updateCursoCapacitacionController: 'capacitacion.updateCursoCapacitacionController',
  deleteCursoCapacitacionController: 'capacitacion.deleteCursoCapacitacionController',
  setEstadoCursoCapacitacionController: 'capacitacion.setEstadoCursoCapacitacionController',

  // Controllers — Participantes
  listParticipantesController: 'capacitacion.listParticipantesController',
  getParticipanteByIdController: 'capacitacion.getParticipanteByIdController',
  createParticipanteController: 'capacitacion.createParticipanteController',
  updateParticipanteController: 'capacitacion.updateParticipanteController',

  // Controllers — Inscripciones y pagos
  listInscripcionesCapacitacionController: 'capacitacion.listInscripcionesCapacitacionController',
  getInscripcionCapacitacionByIdController: 'capacitacion.getInscripcionCapacitacionByIdController',
  createInscripcionCapacitacionController: 'capacitacion.createInscripcionCapacitacionController',
  deleteInscripcionCapacitacionController: 'capacitacion.deleteInscripcionCapacitacionController',
  registerPagoCapacitacionController: 'capacitacion.registerPagoCapacitacionController',

  // Routers
  cursosCapacitacionRouter: 'capacitacion.cursosCapacitacionRouter',
  participantesRouter: 'capacitacion.participantesRouter',
  inscripcionesCapacitacionRouter: 'capacitacion.inscripcionesCapacitacionRouter',
};
