import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: ITipoEvaluacionRepository
 *
 * Convención de capas:
 * ITipoEvaluacionRepository → models/tipo_evaluacion.js (`tipos_evaluacion`)
 * → EvaluationType / EvaluationTypeMapper / EvaluationTypeRepository
 *
 * DDL: database/01-schemas/13-evaluaciones.sql
 *
 * Además de los métodos CRUD heredados de IRepository, la implementación
 * (EvaluationTypeRepository) expone `contarPorTipoEvaluacion(tipoEvaluacionId)`:
 * conteo simple de `evaluaciones` por tipo, usado como dato informativo en la
 * ficha del catálogo (sin vista SQL, ver GetTipoEvaluacionByIdUseCase).
 */
export class ITipoEvaluacionRepository extends IRepository {}
