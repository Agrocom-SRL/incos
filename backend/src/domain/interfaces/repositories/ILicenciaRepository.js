import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: ILicenciaRepository
 *
 * Convención de capas:
 * ILicenciaRepository → models/licencia.js (`licencias`)
 * → License / LicenseMapper / LicenseRepository
 *
 * DDL: database/01-schemas/17-asistencias-licencias.sql
 */
export class ILicenciaRepository extends IRepository {}
