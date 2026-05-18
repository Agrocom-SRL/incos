import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IPagoCuotasRepository
 * Define el contrato para el repositorio de cuotas de aporte (pago_cuotas).
 *
 * Métodos heredados de IRepository:
 * - findById(id, options)
 * - findBy(criteria, options)
 * - findAll(filters, page, limit)
 * - create(data, userId)
 * - update(id, data, userId)
 * - delete(id, userId)
 * - search(searchTerm, options)
 * - count(filters)
 */
export class IPagoCuotasRepository extends IRepository {}
