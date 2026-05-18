import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IClaseNoDictadaRepository
 *
 * Convención de capas:
 * IClaseNoDictadaRepository → models/clase_no_dictada.js (`clases_no_dictadas`)
 * → MissedClass / MissedClassMapper / MissedClassRepository
 *
 * DDL: database/01-schemas/17-asistencias-licencias.sql
 */
export class IClaseNoDictadaRepository extends IRepository {}
