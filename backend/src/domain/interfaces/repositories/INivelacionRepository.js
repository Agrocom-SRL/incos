import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: INivelacionRepository
 *
 * Convención de capas:
 * INivelacionRepository → models/nivelacion.js (`nivelaciones`)
 * → Leveling / LevelingMapper / LevelingRepository
 *
 * DDL: database/01-schemas/16-nivelaciones.sql
 */
export class INivelacionRepository extends IRepository {}
