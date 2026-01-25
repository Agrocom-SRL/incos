import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IEstudianteDocumentoEntregaRepository
 * Define el contrato que debe cumplir el repositorio de entregas de documentos de estudiantes
 * 
 * Métodos heredados de IRepository:
 * - findById(id)
 * - findBy(criteria, options)
 * - findAll(filters, page, limit)
 * - create(data, userId)
 * - update(id, data, userId)
 * - delete(id, userId)
 * - search(searchTerm, options)
 * - count(filters)
 * 
 * Métodos específicos:
 * - obtenerEntregasConDetalle(filters) - Obtiene entregas de documentos con detalles del documento
 */
export class IEstudianteDocumentoEntregaRepository extends IRepository {
  /**
   * Obtiene entregas de documentos con detalles del documento
   * Retorna datos que incluyen tanto la información de la entrega como los detalles del documento
   * 
   * @param {Object} filters - Filtros opcionales
   *   - estudiante_id: ID del estudiante
   *   - documentacion_id: ID de la documentación
   *   - tipo_documento: Tipo de documento ('INSCRIPCION', 'LICENCIA', 'PASANTIA', etc.)
   *   - documento_padre_id: ID del documento padre (null para documentos sin padre, número para padre específico)
   * @returns {Promise<Array>} Array de objetos planos con datos enriquecidos
   *   Campos retornados (según vista_base_estudiante_documentos_entrega):
   *   - entrega_id: ID del registro de entrega
   *   - estudiante_id: ID del estudiante
   *   - documentacion_id: ID de la documentación
   *   - entregado: Si fue entregado
   *   - en_tramite: Si está en trámite
   *   - fecha_entrega: Fecha de entrega
   *   - observaciones_entrega: Observaciones
   *   - nombre_documento: Nombre del documento
   *   - tipo_documento: Tipo de documento
   *   - documento_padre_id: ID del documento padre
   *   - es_documento_sistema: Si es documento del sistema
   */
  async obtenerEntregasConDetalle(filters = {}) {
    throw new Error('Method obtenerEntregasConDetalle must be implemented by subclass');
  }
}

