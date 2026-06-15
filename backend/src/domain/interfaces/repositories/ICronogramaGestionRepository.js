/**
 * Interfaz de Repositorio (solo lectura): ICronogramaGestionRepository
 *
 * Contrato del repositorio que lee el cronograma / calendario académico de la
 * gestión desde la vista delgada vista_base_cronograma_gestion (129) y, para la
 * pantalla de administración, desde las tablas base (forma editable).
 *
 * NO extiende IRepository: es un repositorio de SOLO LECTURA sobre vistas/tablas,
 * no un CRUD de entidad. Declara únicamente sus métodos de consulta. Devuelve
 * filas planas (DTO), no entidades de dominio.
 */
export class ICronogramaGestionRepository {
  /**
   * Filas planas del cronograma (una por actividad) de una gestión.
   * @param {number} gestionId
   * @returns {Promise<Array<Object>>}
   */
  async obtenerActividadesGestion(gestionId) {
    throw new Error('Method obtenerActividadesGestion() must be implemented');
  }

  /**
   * Cronograma de la gestión vigente (contexto + actividades).
   * @returns {Promise<Object|null>}
   */
  async obtenerCronogramaVigente() {
    throw new Error('Method obtenerCronogramaVigente() must be implemented');
  }

  /**
   * Filas editables del cronograma para la pantalla de administración.
   * @param {number} gestionId
   * @returns {Promise<Array<Object>>}
   */
  async obtenerActividadesAdmin(gestionId) {
    throw new Error('Method obtenerActividadesAdmin() must be implemented');
  }

  /**
   * Una actividad del cronograma por id (forma editable, para precargar el formulario).
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async obtenerActividadAdminPorId(id) {
    throw new Error('Method obtenerActividadAdminPorId() must be implemented');
  }

  /**
   * Periodos/etapas de una gestión (todas las divisiones) para el select del formulario.
   * @param {number} gestionId
   * @returns {Promise<Array<Object>>}
   */
  async obtenerPeriodosGestion(gestionId) {
    throw new Error('Method obtenerPeriodosGestion() must be implemented');
  }

  /**
   * Catálogo maestro de actividades (para el select del formulario).
   * @returns {Promise<Array<Object>>}
   */
  async obtenerCatalogoActividades() {
    throw new Error('Method obtenerCatalogoActividades() must be implemented');
  }

  /**
   * Datos completos de la pantalla de administración del cronograma vigente.
   * @returns {Promise<Object|null>}
   */
  async obtenerAdminVigente() {
    throw new Error('Method obtenerAdminVigente() must be implemented');
  }
}
