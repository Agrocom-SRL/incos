import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: ICapacitacionCompromisoRepository
 *
 * Compromisos de pago del módulo Capacitación (tabla `capacitacion_compromisos`).
 * Cada registro es la fecha acordada para cancelar el saldo pendiente de una
 * inscripción con pago parcial (`capacitacion_inscritos`).
 *
 * Uso administrativo/informativo — NUNCA dispara cambios automáticos en
 * `capacitacion_inscritos` (ni bloquea, ni anula): un pago atrasado se acepta
 * con total normalidad.
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository (findById/create/update/delete/...).
 * Añade lecturas específicas del grano de negocio (compromiso VIGENTE por
 * inscripción, marcado perezoso de vencidos).
 */
export class ICapacitacionCompromisoRepository extends IRepository {
  /**
   * Devuelve el compromiso VIGENTE (aún no CUMPLIDO ni marcado INCUMPLIDO) de
   * una inscripción, o null.
   *
   * @param {number} capacitacionInscritoId
   * @param {Object} [options] - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<Object|null>} compromiso (objeto de dominio) o null
   */
  async findVigenteByInscripcionId(_capacitacionInscritoId, _options) {
    throw new Error('Method findVigenteByInscripcionId() must be implemented');
  }

  /**
   * Marca como INCUMPLIDO (UPDATE perezoso) los compromisos VIGENTE cuya
   * `fecha_compromiso` ya pasó. Se ejecuta en cada lectura de listado/ficha
   * de inscripciones de capacitación — puramente informativo para reportes
   * administrativos, NO dispara ningún cambio en `capacitacion_inscritos`.
   *
   * @returns {Promise<number>} Cantidad de filas actualizadas
   */
  async marcarVencidosComoIncumplidos() {
    throw new Error('Method marcarVencidosComoIncumplidos() must be implemented');
  }
}
