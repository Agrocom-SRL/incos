import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IConfiguracionEvaluacionRepository
 *
 * Convención de capas:
 * IConfiguracionEvaluacionRepository → models/configuracion_evaluacion.js (`configuracion_evaluacion`)
 * → EvaluationConfiguration / EvaluationConfigurationMapper / EvaluationConfigurationRepository
 *
 * DDL: database/01-schemas/13-evaluaciones.sql
 */
export class IConfiguracionEvaluacionRepository extends IRepository {}
