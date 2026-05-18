import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IHistorialPrevioRepository
 *
 * Convención de capas:
 * IHistorialPrevioRepository → models/historial_previo.js (`historial_previo`)
 * → PriorEnrollmentHistory / PriorEnrollmentHistoryMapper / PriorEnrollmentHistoryRepository
 *
 * DDL: database/01-schemas/12-inscripciones.sql
 */
export class IHistorialPrevioRepository extends IRepository {}
