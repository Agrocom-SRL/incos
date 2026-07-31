/**
 * Interfaz de Repositorio (solo lectura): ILibroRegistroViewRepository
 *
 * Contrato de las lecturas del módulo Libros de registro (schema 25) sobre las
 * vistas 175/176/177 (+ contexto de paralelos vía vista 127):
 * - 175 vista_libros_registro_listado          → grano libro (+agregados de folios)
 * - 176 vista_base_libro_folio_fila            → grano folio (+contexto vista 127)
 * - 177 vista_base_libro_paralelo_estudiante   → nómina estudiante × paralelo_gestion
 *
 * NO extiende IRepository: repositorio de SOLO LECTURA sobre vistas, no CRUD.
 * Devuelve filas de vista (DTO plano snake_case); el mapeo a DTO de
 * presentación lo hace LibroRegistroPresentationMapper en la capa de aplicación.
 *
 * Nota (limitación 135): las notas por materia del folio NO tienen vista propia —
 * se leen de la vista 135 vía ICalificacionCentralizadorRepository (asignación
 * vigente; ver cabecera de la vista 176).
 */
export class ILibroRegistroViewRepository {
  /**
   * Libros de registro (vista 175), filtrables por carrera/gestión.
   * @param {Object} [filtros] - { carreraId?, gestionId? }
   * @returns {Promise<Array<Object>>}
   */
  // eslint-disable-next-line no-unused-vars
  async listarLibros(filtros = {}) {
    throw new Error('Method listarLibros() must be implemented');
  }

  /**
   * Un libro por id (vista 175) o null.
   * @param {number} libroId
   * @returns {Promise<Object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async obtenerLibroPorId(libroId) {
    throw new Error('Method obtenerLibroPorId() must be implemented');
  }

  /**
   * Folios de un libro (vista 176), opcionalmente de un solo paralelo.
   * @param {number} libroId
   * @param {Object} [opts] - { paraleloGestionId? }
   * @returns {Promise<Array<Object>>}
   */
  // eslint-disable-next-line no-unused-vars
  async listarFoliosPorLibro(libroId, opts = {}) {
    throw new Error('Method listarFoliosPorLibro() must be implemented');
  }

  /**
   * Un folio por id (vista 176) o null.
   * @param {number} folioId
   * @returns {Promise<Object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async obtenerFolioPorId(folioId) {
    throw new Error('Method obtenerFolioPorId() must be implemented');
  }

  /**
   * Nómina de un paralelo en gestión (vista 177), en orden institucional
   * APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES.
   * @param {number} paraleloGestionId
   * @returns {Promise<Array<Object>>}
   */
  // eslint-disable-next-line no-unused-vars
  async listarNominaPorParaleloGestion(paraleloGestionId) {
    throw new Error('Method listarNominaPorParaleloGestion() must be implemented');
  }

  /**
   * Paralelos de la carrera+gestión de un libro (vista 127 + conteos de nómina
   * 177 y de folios vigentes) — apoyo del generador de folios.
   * @param {Object} params - { carreraId, gestionId, libroId }
   * @returns {Promise<Array<Object>>}
   */
  // eslint-disable-next-line no-unused-vars
  async listarParalelosParaLibro({ carreraId, gestionId, libroId }) {
    throw new Error('Method listarParalelosParaLibro() must be implemented');
  }

  /**
   * TODOS los paralelos de una gestión (todas las carreras; vista 127), en el
   * orden canónico del documento oficial (ver `ordenCarreraLibro` del dominio)
   * → periodo → paralelo alfabético — apoyo del generador MASIVO de folios de
   * la gestión (POST /libros/gestiones/:gestionId/folios).
   * @param {number} gestionId
   * @returns {Promise<Array<Object>>}
   */
  // eslint-disable-next-line no-unused-vars
  async listarParalelosPorGestion(gestionId) {
    throw new Error('Method listarParalelosPorGestion() must be implemented');
  }

  /**
   * Folios VIGENTES (estado <> ANULADO) de UN paralelo (vista 176), ordenados
   * por numero_folio — consumidor: Centralizador (badge LIBRO/FOLIO real) y
   * export "Centralizador anual" (Bloque D).
   * @param {number} paraleloGestionId
   * @returns {Promise<Array<Object>>}
   */
  // eslint-disable-next-line no-unused-vars
  async listarFoliosPorParaleloGestion(paraleloGestionId) {
    throw new Error('Method listarFoliosPorParaleloGestion() must be implemented');
  }

  /**
   * Ubicación (folio/orden/estado académico) de cada estudiante del paralelo
   * dentro del libro — JOIN folio_estudiantes × vista 176, filtrado a folios
   * VIGENTES. Consumidor: Centralizador (columna FOLIO N° por estudiante).
   * @param {number} paraleloGestionId
   * @returns {Promise<Array<Object>>} filas: estudiante_id, numero_folio,
   *   numero_orden, estado_academico.
   */
  // eslint-disable-next-line no-unused-vars
  async listarUbicacionEstudiantesPorParaleloGestion(paraleloGestionId) {
    throw new Error('Method listarUbicacionEstudiantesPorParaleloGestion() must be implemented');
  }
}

export default ILibroRegistroViewRepository;
