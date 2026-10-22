import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: ICapacitacionInscritoRequisitoRepository
 *
 * Checklist de requisitos entregados por inscripción (tabla
 * `capacitacion_inscrito_requisitos`, módulo CAP).
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository.
 */
export class ICapacitacionInscritoRequisitoRepository extends IRepository {
  /**
   * Fila de entrega de un requisito en una inscripción, o null.
   *
   * @param {number} capacitacionInscritoId
   * @param {number} capacitacionRequisitoId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<Object|null>}
   */
  async findByInscripcionAndRequisito(_inscritoId, _requisitoId, _options = {}) {
    throw new Error('Method findByInscripcionAndRequisito() must be implemented');
  }

  /**
   * Cantidad de requisitos obligatorios del curso aún no entregados por la inscripción.
   *
   * @param {number} capacitacionInscritoId
   * @param {number} capacitacionId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<number>}
   */
  async contarObligatoriosPendientes(_inscritoId, _capacitacionId, _options = {}) {
    throw new Error('Method contarObligatoriosPendientes() must be implemented');
  }

  /**
   * Checklist completo (requisitos del curso + estado de entrega), filas snake_case.
   *
   * @param {number} capacitacionInscritoId
   * @param {number} capacitacionId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<Array<Object>>}
   */
  async findChecklistByInscripcionId(_inscritoId, _capacitacionId, _options = {}) {
    throw new Error('Method findChecklistByInscripcionId() must be implemented');
  }

  /**
   * Estado del costo del curso externo de una inscripción: si el curso tiene
   * entidad certificadora (el costo se deposita a ella, no se registra como
   * pago), cuál es su requisito que acredita el depósito y si ya fue entregado.
   *
   * @param {number} capacitacionInscritoId
   * @param {number} capacitacionId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<{pagoCursoExterno: boolean, requisitoId: number|null,
   *   requisitoDescripcion: string|null, acreditado: boolean}>}
   */
  async resolverPagoCursoExterno(_inscritoId, _capacitacionId, _options = {}) {
    throw new Error('Method resolverPagoCursoExterno() must be implemented');
  }
}
