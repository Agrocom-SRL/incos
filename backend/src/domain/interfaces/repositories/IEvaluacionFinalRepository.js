import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IEvaluacionFinalRepository
 *
 * Columnas de evaluación anual del curso (`evaluaciones_finales`).
 * → FinalEvaluation / FinalEvaluationMapper / FinalEvaluationRepository
 *
 * DDL: database/01-schemas/13-evaluaciones.sql
 */
export class IEvaluacionFinalRepository extends IRepository {}
