/**
 * Validators del módulo Académico
 */

export { listParalelosValidator } from './list-paralelos.validator.js';
export { listMateriasValidator } from './list-materias.validator.js';
export { putParaleloScheduleValidator } from './put-paralelo-schedule.validator.js';
export { postParaleloCursoValidator } from './post-paralelo-curso.validator.js';
export { patchCursoOfertaValidator } from './patch-curso-oferta.validator.js';
export { searchCoordinacionDocentesValidator } from './search-coordinacion-docentes.validator.js';
export { savePoliticaInstitucionalValidator } from './save-politica-institucional.validator.js';
export { listTiposEvaluacionValidator } from './list-tipos-evaluacion.validator.js';
export {
  getCuadernoBimestreValidator,
  createEvaluacionCuadernoValidator,
  updateEvaluacionCuadernoValidator,
  deleteEvaluacionCuadernoValidator,
  upsertNotaCuadernoValidator,
  guardarNotasCuadernoBimestreValidator,
} from './cuaderno-evaluacion.validator.js';
