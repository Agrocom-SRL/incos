import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IEvaluacionFinalRepository
 *
 * Convención de capas:
 * IEvaluacionFinalRepository → models/evaluacion_final.js (`evaluaciones_finales`)
 * → FinalEvaluation / FinalEvaluationMapper / FinalEvaluationRepository
 *
 * DDL: database/01-schemas/13-evaluaciones.sql
 */
export class IEvaluacionFinalRepository extends IRepository {}
