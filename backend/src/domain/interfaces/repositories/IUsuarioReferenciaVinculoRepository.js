/**
 * Interfaz de Repositorio (solo lectura): IUsuarioReferenciaVinculoRepository
 *
 * Resuelve el perfil vinculado (estudiante/docente/personal) de un usuario por
 * su referencia. NO extiende IRepository: repositorio de SOLO LECTURA.
 */
export class IUsuarioReferenciaVinculoRepository {
  /**
   * @param {string} tipoReferencia
   * @param {number} referenciaId
   * @returns {Promise<Object|null>}
   */
  async findPerfilVinculado(tipoReferencia, referenciaId) {
    throw new Error('Method findPerfilVinculado() must be implemented');
  }
}
