import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IEvaluacionNotaRepository
 *
 * Celdas del cuaderno bimestral (`evaluaciones_notas`).
 * → BimesterEvaluationGrade / BimesterEvaluationGradeMapper / BimesterEvaluationGradeRepository
 *
 * DDL: database/01-schemas/13-evaluaciones.sql
 */
export class IEvaluacionNotaRepository extends IRepository {}
