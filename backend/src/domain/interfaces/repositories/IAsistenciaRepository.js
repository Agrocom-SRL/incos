import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IAsistenciaRepository
 *
 * Convención de capas:
 * IAsistenciaRepository → models/asistencia.js (`asistencias`)
 * → Attendance / AttendanceMapper / AttendanceRepository
 *
 * DDL: database/01-schemas/17-asistencias-licencias.sql
 */
export class IAsistenciaRepository extends IRepository {}
