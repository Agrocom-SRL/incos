/**
 * Mapper: tipoEvaluacionListMapper
 *
 * Single Responsibility: Transformar datos del backend (tipos_evaluacion) al
 * formato necesario para la lista.
 *
 * NOTA: El backend devuelve entidades EvaluationType en formato de presentación
 * (español, camelCase): codigo, nombre, descripcion, esRecuperatorio, activo.
 * dataFieldName='tiposEvaluacion' (list) / 'tipoEvaluacion' (get/create/update).
 *
 * Ubicación: application/modules/configuracion/recursos/mappers
 */
export const tipoEvaluacionListMapper = (tipoEvaluacionBackend) => {
  if (!tipoEvaluacionBackend) {
    return null;
  }

  return {
    id: tipoEvaluacionBackend.id,
    codigo: tipoEvaluacionBackend.codigo,
    nombre: tipoEvaluacionBackend.nombre,
    descripcion: tipoEvaluacionBackend.descripcion,
    esRecuperatorio: Boolean(tipoEvaluacionBackend.esRecuperatorio),
    activo: tipoEvaluacionBackend.activo,
  };
};

/**
 * Mapea un array de tipos de evaluación del backend al formato de lista
 */
export const mapTiposEvaluacionList = (tiposEvaluacionBackend) => {
  if (!Array.isArray(tiposEvaluacionBackend)) {
    return [];
  }

  return tiposEvaluacionBackend.map(tipoEvaluacionListMapper).filter(Boolean);
};
