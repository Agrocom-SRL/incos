/**
 * Validators del módulo Académico
 */

export { listParalelosValidator } from './list-paralelos.validator.js';
export { putParaleloScheduleValidator } from './put-paralelo-schedule.validator.js';
export { listMateriasValidator } from './list-materias.validator.js';
export { searchCoordinacionDocentesValidator } from './search-coordinacion-docentes.validator.js';
export { getCentralizadorParaleloValidator } from './get-centralizador-paralelo.validator.js';
export { savePoliticaInstitucionalValidator } from './save-politica-institucional.validator.js';
export { listTiposEvaluacionValidator } from './list-tipos-evaluacion.validator.js';
export {
  getCuadernoBimestreValidator,
  createEvaluacionCuadernoValidator,
  updateEvaluacionCuadernoValidator,
  deleteEvaluacionCuadernoValidator,
  upsertNotaCuadernoValidator,
  guardarNotasCuadernoBimestreValidator,
  getBimestreConsolidadoValidator,
} from './cuaderno-evaluacion.validator.js';
export {
  createActividadCronogramaValidator,
  updateActividadCronogramaValidator,
  cronogramaIdValidator,
} from './cronograma.validator.js';
export {
  putPeriodoFechasValidator,
  postPeriodoEtapaValidator,
  periodoIdValidator,
} from './periodos-gestion.validator.js';
