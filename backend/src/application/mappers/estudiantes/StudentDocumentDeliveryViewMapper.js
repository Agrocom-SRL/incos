/**
 * Mapper de aplicación: entregas de documentos desde vista
 * Convierte una fila de vista_base_estudiante_documentos_entrega a formato de presentación (API)
 *
 * Clean Architecture:
 * - Application Layer: Convierte fila de vista → Presentation Format
 * - Usado por GetStudentByIdUseCase cuando las entregas vienen de la vista
 * - Mismo enfoque que StudentPersonalDataMapper y ContributionPaymentMapper
 *
 * Responsabilidades:
 * - Mapear fila de vista (snake_case) a objeto plano compatible con API (camelCase)
 * - Formato compatible con StudentDocumentDelivery.toPlainObject() + campos de la vista (nombreDocumento, etc.)
 */

import { BaseMapper } from '../base/index.js';
import { mapRows } from '../../../domain/utils/mapUtils.js';

/**
 * Convierte una fila de vista_base_estudiante_documentos_entrega a formato de presentación.
 * Retorna un objeto plano con el mismo formato que la API (documentDeliveries).
 * Misma convención que StudentPersonalDataMapper y ContributionPaymentMapper (entityToPresentation).
 *
 * @param {Object} row - Fila de la vista (snake_case)
 * @returns {Object|null} Objeto plano en formato API (id, studentId, documentacionId, entregado, etc.)
 */
export function entityToPresentation(row) {
  if (!row) {
    return null;
  }

  const out = {};
  BaseMapper.mapFieldIfExists(row, 'entrega_id', 'id', out);
  BaseMapper.mapFieldIfExists(row, 'estudiante_id', 'studentId', out);
  BaseMapper.mapFieldIfExists(row, 'documentacion_id', 'documentacionId', out);
  BaseMapper.mapFieldIfExists(row, 'entregado', 'entregado', out);
  BaseMapper.mapFieldIfExists(row, 'en_tramite', 'enTramite', out);
  BaseMapper.mapFieldIfExists(row, 'fecha_entrega', 'fechaEntrega', out);
  BaseMapper.mapFieldIfExists(row, 'observaciones_entrega', 'observaciones', out);
  BaseMapper.mapFieldIfExists(row, 'nombre_documento', 'documentacionName', out);
  BaseMapper.mapFieldIfExists(row, 'tipo_documento', 'tipoDocumento', out);
  BaseMapper.mapFieldIfExists(row, 'documento_padre_id', 'documentoPadreId', out);
  BaseMapper.mapFieldIfExists(row, 'es_documento_sistema', 'esDocumentoSistema', out);

  return out;
}

/**
 * Convierte un array de filas de la vista a array de objetos en formato API.
 * Usa mapRows de domain/utils. Misma convención que ContributionPaymentMapper (entitiesToPresentation).
 *
 * @param {Array} rows - Filas de la vista
 * @returns {Array} Array de objetos planos en formato API
 */
export function entitiesToPresentation(rows) {
  return mapRows(rows, entityToPresentation);
}

/**
 * Clase mapper (exportada por compatibilidad)
 */
export class StudentDocumentDeliveryViewMapper {
  static entityToPresentation(row) {
    return entityToPresentation(row);
  }

  static entitiesToPresentation(rows) {
    return entitiesToPresentation(rows);
  }
}
