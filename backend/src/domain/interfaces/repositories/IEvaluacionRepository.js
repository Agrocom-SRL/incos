import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IEvaluacionRepository
 *
 * Convención de capas:
 * IEvaluacionRepository → models/evaluacion.js (`evaluaciones`)
 * → BimesterEvaluation / BimesterEvaluationMapper / BimesterEvaluationRepository
 *
 * DDL: database/01-schemas/13-evaluaciones.sql
 */
export class IEvaluacionRepository extends IRepository {}
