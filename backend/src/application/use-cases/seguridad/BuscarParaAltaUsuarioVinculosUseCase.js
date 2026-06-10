export class BuscarParaAltaUsuarioVinculosUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/views/SeguridadAltaUsuarioLookupRepository.js').SeguridadAltaUsuarioLookupRepository} deps.seguridadAltaUsuarioLookupRepository
   */
  constructor({ seguridadAltaUsuarioLookupRepository }) {
    this.seguridadAltaUsuarioLookupRepository = seguridadAltaUsuarioLookupRepository;
  }

  /**
   * @param {'estudiantes'|'docentes'} tipo
   * @param {string} searchTerm
   * @param {number} [limit=20]
   * @returns {Promise<Object[]>}
   */
  async execute(tipo, searchTerm, limit = 20) {
    const normalizedType = String(tipo || '').trim().toLowerCase();
    if (normalizedType === 'estudiantes') {
      return this.seguridadAltaUsuarioLookupRepository.buscarEstudiantesSinCuenta(searchTerm, limit);
    }
    if (normalizedType === 'docentes') {
      return this.seguridadAltaUsuarioLookupRepository.buscarDocentesSinCuenta(searchTerm, limit);
    }
    return [];
  }
}
