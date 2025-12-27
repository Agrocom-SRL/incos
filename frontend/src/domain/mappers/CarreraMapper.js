/**
 * Mapper: CarreraMapper
 * Convierte entre formato del backend (API) y formato de dominio (entidad Career)
 * 
 * Clean Architecture:
 * - Domain Layer: Transformación de datos entre capas
 * 
 * El backend retorna:
 * {
 *   id: number,
 *   codigo: string,
 *   nombre: string
 * }
 * 
 * La entidad Career espera más campos, este mapper normaliza los datos.
 */

export class CarreraMapper {
  /**
   * Convierte datos del backend (API response) a formato de dominio (para crear entidad Career)
   * @param {Object} dataBackend - Datos que vienen del backend
   * @returns {Object} - Datos normalizados para crear entidad Career
   */
  static toDomain(dataBackend) {
    if (!dataBackend) return null;

    return {
      id: dataBackend.id || null,
      codigo: dataBackend.codigo || null,
      nombre: dataBackend.nombre || null,
      // Campos que pueden venir del backend pero no siempre
      descripcion: dataBackend.descripcion || null,
      activa: dataBackend.activa !== undefined ? dataBackend.activa : true,
      duracionAnios: dataBackend.duracionAnios || dataBackend.duracion_anios || null,
      tituloOtorgado: dataBackend.tituloOtorgado || dataBackend.titulo_otorgado || null,
      resolucionMinisterial: dataBackend.resolucionMinisterial || dataBackend.resolucion_ministerial || null,
      fechaVigencia: dataBackend.fechaVigencia || dataBackend.fecha_vigencia || null,
      cargaHorariaTotal: dataBackend.cargaHorariaTotal || dataBackend.carga_horaria_total || null,
      colorHex: dataBackend.colorHex || dataBackend.color_hex || null,
      gestionId: dataBackend.gestionId || null,
      turnoId: dataBackend.turnoId || null,
      // Campos para UI (se agregan en el mapper, no vienen del backend)
      label: dataBackend.nombre || null,
      image: dataBackend.image || dataBackend.imagen || null,
    };
  }

  /**
   * Convierte un array de datos del backend a formato de dominio
   * @param {Array} dataBackendArray - Array de datos del backend
   * @returns {Array} - Array de datos normalizados
   */
  static arrayToDomain(dataBackendArray) {
    if (!Array.isArray(dataBackendArray)) return [];
    return dataBackendArray.map(data => this.toDomain(data)).filter(Boolean);
  }

  /**
   * Convierte datos del backend a formato simple para UI (sin entidad completa)
   * Útil para listas simples donde solo se necesita mostrar datos básicos
   * @param {Object} dataBackend - Datos que vienen del backend
   * @returns {Object} - Datos simples para UI
   */
  static toSimpleUI(dataBackend) {
    if (!dataBackend) return null;

    return {
      id: dataBackend.id || null,
      codigo: dataBackend.codigo || null,
      nombre: dataBackend.nombre || null,
      label: dataBackend.nombre || null, // Para UI
      // Solo campos necesarios para mostrar en tarjetas/listas
      image: dataBackend.image || dataBackend.imagen || null,
      activa: dataBackend.activa !== undefined ? dataBackend.activa : true,
    };
  }

  /**
   * Convierte un array de datos del backend a formato simple para UI
   * @param {Array} dataBackendArray - Array de datos del backend
   * @returns {Array} - Array de datos simples para UI
   */
  static arrayToSimpleUI(dataBackendArray) {
    if (!Array.isArray(dataBackendArray)) return [];
    return dataBackendArray.map(data => this.toSimpleUI(data)).filter(Boolean);
  }

  /**
   * Convierte una entidad Career a formato para enviar al backend (POST/PUT)
   * @param {Career} career - Entidad Career
   * @returns {Object} - Datos en formato del backend
   */
  static toBackend(career) {
    if (!career) return null;

    return {
      id: career.id,
      codigo: career.codigo,
      nombre: career.nombre,
      descripcion: career.descripcion,
      activa: career.activa,
      duracionAnios: career.duracionAnios,
      tituloOtorgado: career.tituloOtorgado,
      resolucionMinisterial: career.resolucionMinisterial,
      fechaVigencia: career.fechaVigencia,
      cargaHorariaTotal: career.cargaHorariaTotal,
      colorHex: career.colorHex,
      gestionId: career.gestionId,
      turnoId: career.turnoId,
    };
  }
}

