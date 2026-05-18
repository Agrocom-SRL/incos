import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: ITipoEvaluacionRepository
 *
 * Convención de capas:
 * ITipoEvaluacionRepository → models/tipo_evaluacion.js (`tipos_evaluacion`)
 * → EvaluationType / EvaluationTypeMapper / EvaluationTypeRepository
 *
 * DDL: database/01-schemas/13-evaluaciones.sql
 */
export class ITipoEvaluacionRepository extends IRepository {}
