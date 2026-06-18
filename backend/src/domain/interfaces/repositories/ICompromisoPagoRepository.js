import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: ICompromisoPagoRepository
 *
 * Compromisos de pago (tabla `compromisos_pago`). Cada registro es un compromiso
 * del estudiante de cancelar el saldo del aporte en una fecha dada.
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository (findById/create/update/delete/...).
 * Añade lecturas específicas del grano de negocio (compromiso VIGENTE por cabecera).
 */
export class ICompromisoPagoRepository extends IRepository {
  /**
   * Devuelve el compromiso VIGENTE y activo de una cabecera de aporte, o null.
   *
   * @param {number} pagoAporteId
   * @returns {Promise<Object|null>} compromiso (objeto de dominio) o null
   */
  async findVigenteByPagoAporteId(_pagoAporteId) {
    throw new Error('Method findVigenteByPagoAporteId() must be implemented');
  }

  /**
   * Devuelve los compromisos VIGENTES y activos para un conjunto de cabeceras.
   * Optimización para reportes (evita N+1).
   *
   * @param {number[]} pagoAporteIds
   * @returns {Promise<Array<Object>>} compromisos VIGENTES (objetos de dominio)
   */
  async findVigentesByPagoAporteIds(_pagoAporteIds) {
    throw new Error('Method findVigentesByPagoAporteIds() must be implemented');
  }
}
