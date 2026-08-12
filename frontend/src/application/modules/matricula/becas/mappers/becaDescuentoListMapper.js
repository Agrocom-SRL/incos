/**
 * Mapper: becaDescuentoListMapper
 * 
 * Single Responsibility: Transformar datos del backend al formato necesario para la lista
 * 
 * Mapea los datos completos de la beca/descuento a un formato simplificado
 * para la visualización en la lista de becas y descuentos.
 * 
 * Clean Architecture:
 * - Application Layer: Mapper que transforma datos del backend al formato de UI
 * 
 * NOTA: El backend devuelve entidades Scholarship con propiedades en español (camelCase):
 * - nombre, codigo, porcentaje, descripcion, requiereDocumentacion, requiereAprobacionRector, esAutomatica, tipoAutomatica, promedioMinimo
 * 
 * Ubicación: application/modules/matricula/becas/mappers
 * 
 * @param {Object} becaDescuentoBackend - Datos de la beca/descuento desde el backend (en español)
 * @returns {Object} - Datos mapeados para la lista (en español/camelCase)
 */
export const becaDescuentoListMapper = (becaDescuentoBackend) => {
  if (!becaDescuentoBackend) {
    return null;
  }

  return {
    id: becaDescuentoBackend.id,
    nombre: becaDescuentoBackend.nombre,
    codigo: becaDescuentoBackend.codigo,
    porcentaje: becaDescuentoBackend.porcentaje,
    descripcion: becaDescuentoBackend.descripcion,
    requiereDocumentacion: becaDescuentoBackend.requiereDocumentacion,
    requiereAprobacionRector: becaDescuentoBackend.requiereAprobacionRector,
    esAutomatica: becaDescuentoBackend.esAutomatica,
    tipoAutomatica: becaDescuentoBackend.tipoAutomatica,
    promedioMinimo: becaDescuentoBackend.promedioMinimo,
    activo: becaDescuentoBackend.activo,
    createdAt: becaDescuentoBackend.createdAt,
  };
};

/**
 * Mapea un array de becas/descuentos del backend al formato de lista
 * 
 * @param {Array} becasDescuentosBackend - Array de becas/descuentos desde el backend
 * @returns {Array} - Array de becas/descuentos mapeadas para la lista
 */
export const mapBecasDescuentosList = (becasDescuentosBackend) => {
  if (!Array.isArray(becasDescuentosBackend)) {
    return [];
  }

  return becasDescuentosBackend.map(becaDescuentoListMapper).filter(Boolean);
};
