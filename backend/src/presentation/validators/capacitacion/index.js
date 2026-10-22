/**
 * Validators del módulo Capacitación (CAP)
 */

export {
  listCursosCapacitacionValidator,
  listHorariosDisponiblesCapacitacionValidator,
  listGruposCapacitacionValidator,
  listHorariosCapacitacionValidator,
  createHorarioCapacitacionValidator,
  updateHorarioCapacitacionValidator,
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
  anularInscripcionCapacitacionValidator,
  updateRequisitosInscripcionValidator,
  updateInscripcionCapacitacionValidator,
  updatePagoCapacitacionValidator,
  anularPagoCapacitacionValidator,
  pagoIdValidator,
} from './inscripciones-capacitacion.validator.js';

export { setEstadoCatalogoValidator } from './set-estado.validator.js';
