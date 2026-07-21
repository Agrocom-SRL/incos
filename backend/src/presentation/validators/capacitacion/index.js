/**
 * Validators del módulo Capacitación (CAP)
 */

export {
  listCursosCapacitacionValidator,
  listHorariosDisponiblesCapacitacionValidator,
  createCursoCapacitacionValidator,
  updateCursoCapacitacionValidator,
} from './cursos-capacitacion.validator.js';

export {
  listParticipantesValidator,
  createParticipanteValidator,
  updateParticipanteValidator,
  buildParticipanteFieldValidators,
} from './participantes.validator.js';

export {
  listInscripcionesCapacitacionValidator,
  createInscripcionCapacitacionValidator,
  registerPagoCapacitacionValidator,
} from './inscripciones-capacitacion.validator.js';

export { setEstadoCatalogoValidator } from './set-estado.validator.js';
