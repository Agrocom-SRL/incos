/**
 * Interfaz de Repositorio (solo lectura): IComplementariosUsosViewRepository
 *
 * Contrato del repositorio que lee los conteos de uso de los catálogos
 * complementarios de referencia (tipos de discapacidad, tipos de parentesco,
 * idiomas, estados civiles) desde la vista delgada
 * vista_catalogos_complementarios_usos (151).
 *
 * NO extiende IRepository: es un repositorio de SOLO LECTURA sobre vistas,
 * no un CRUD de entidad. Declara únicamente sus métodos de consulta. Devuelve
 * un mapa plano item_id -> conteos (DTO), no entidades de dominio.
 */
export class IComplementariosUsosViewRepository {
  /**
   * Conteos de uso de los ítems de un catálogo complementario.
   *
   * @param {'DISCAPACIDAD'|'PARENTESCO'|'IDIOMA'|'ESTADO_CIVIL'} catalogo
   * @returns {Promise<Map<number, {cantidadEstudiantes: number, cantidadDocentes: number, cantidadPersonal: number}>>}
   *          Mapa item_id -> conteos. Los ítems sin uso NO aparecen en el mapa
   *          (el consumidor debe asumir 0 por defecto).
   */
  async getUsosByCatalogo(_catalogo) {
    throw new Error('Method getUsosByCatalogo() must be implemented');
  }
}
