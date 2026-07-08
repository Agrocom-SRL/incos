/**
 * Mapper: estadoCivilListMapper
 *
 * Single Responsibility: Transformar datos del backend (estados civiles) al
 * formato necesario para la lista.
 *
 * NOTA: El backend devuelve entidades CivilStatus en español (camelCase):
 * nombre, abreviatura, activo. dataFieldName='estadosCiviles'.
 *
 * Ubicación: application/modules/configuracion/complementarios/mappers
 */
export const estadoCivilListMapper = (estadoCivilBackend) => {
  if (!estadoCivilBackend) {
    return null;
  }

  return {
    id: estadoCivilBackend.id,
    nombre: estadoCivilBackend.nombre,
    abreviatura: estadoCivilBackend.abreviatura,
    activo: estadoCivilBackend.activo,
    // Conteos de uso del catálogo (columna "Usos"), 0 por defecto
    cantidadEstudiantes: estadoCivilBackend.cantidadEstudiantes ?? 0,
    cantidadDocentes: estadoCivilBackend.cantidadDocentes ?? 0,
    cantidadPersonal: estadoCivilBackend.cantidadPersonal ?? 0,
  };
};

/**
 * Mapea un array de estados civiles del backend al formato de lista
 */
export const mapEstadosCivilesList = (estadosCivilesBackend) => {
  if (!Array.isArray(estadosCivilesBackend)) {
    return [];
  }

  return estadosCivilesBackend.map(estadoCivilListMapper).filter(Boolean);
};
