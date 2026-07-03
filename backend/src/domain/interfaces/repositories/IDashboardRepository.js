/**
 * Interfaz de Repositorio (solo lectura): IDashboardRepository
 *
 * Lecturas agregadas del dashboard desde vistas SQL (41–49) y tablas base.
 * NO extiende IRepository: repositorio de SOLO LECTURA.
 */
export class IDashboardRepository {
  /** @param {number} [_limit] @returns {Promise<Array<Object>>} */
  async findActividadesRecientes(_limit) {
    throw new Error('Method findActividadesRecientes() must be implemented');
  }

  /** @returns {Promise<Object>} */
  async countEstudiantesRegistradosHoyYMes() {
    throw new Error('Method countEstudiantesRegistradosHoyYMes() must be implemented');
  }

  /** @param {number} [_limit] @returns {Promise<Array<Object>>} */
  async findDocentesRecientes(_limit) {
    throw new Error('Method findDocentesRecientes() must be implemented');
  }

  /** @param {number} [_limit] @returns {Promise<Array<Object>>} */
  async findCarrerasDestacadas(_limit) {
    throw new Error('Method findCarrerasDestacadas() must be implemented');
  }

  /** @param {number} [_limit] @returns {Promise<Array<Object>>} */
  async findEstudiantesRecientes(_limit) {
    throw new Error('Method findEstudiantesRecientes() must be implemented');
  }

  // --- Portal del estudiante (GET /dashboard/mi-resumen) ---

  /** @param {number} _estudianteId @returns {Promise<{nombre: string, codigo: string}>} */
  async findEstudianteResumen(_estudianteId) {
    throw new Error('Method findEstudianteResumen() must be implemented');
  }

  /** @param {number} _estudianteId @returns {Promise<Object|null>} */
  async findCarreraDeEstudiante(_estudianteId) {
    throw new Error('Method findCarreraDeEstudiante() must be implemented');
  }

  /** @param {number} _estudianteId @param {number} [_limit] @returns {Promise<Array<Object>>} */
  async findDocentesDeEstudiante(_estudianteId, _limit) {
    throw new Error('Method findDocentesDeEstudiante() must be implemented');
  }

  /** @param {number} _estudianteId @param {number} [_limit] @returns {Promise<Array<Object>>} */
  async findActividadesDeEstudiante(_estudianteId, _limit) {
    throw new Error('Method findActividadesDeEstudiante() must be implemented');
  }

  /** @param {number} _usuarioId @returns {Promise<{hoy: number, mes: number}>} */
  async countSesionesUsuarioHoyYMes(_usuarioId) {
    throw new Error('Method countSesionesUsuarioHoyYMes() must be implemented');
  }

  /** @param {number} _estudianteId @returns {Promise<number>} */
  async findSaldoPendienteEstudiante(_estudianteId) {
    throw new Error('Method findSaldoPendienteEstudiante() must be implemented');
  }

  // --- Portal del rol docente (GET /dashboard/mi-resumen-docente) ---

  /** @param {number} _docenteId @param {number} _gestionAnio @returns {Promise<{total_asignaciones: number, horas_semanales: number}>} */
  async findCargaDocenteGestion(_docenteId, _gestionAnio) {
    throw new Error('Method findCargaDocenteGestion() must be implemented');
  }

  /** @param {number} _docenteId @param {number} _gestionId @returns {Promise<Array<Object>>} */
  async findHorarioBloquesDocenteGestion(_docenteId, _gestionId) {
    throw new Error('Method findHorarioBloquesDocenteGestion() must be implemented');
  }
}
