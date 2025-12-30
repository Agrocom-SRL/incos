/**
 * Mapper: estudianteListMapper
 * 
 * Single Responsibility: Transformar datos del backend al formato necesario para la lista
 * 
 * Mapea los datos completos del estudiante a un formato simplificado
 * para la visualización en la lista de estudiantes.
 * 
 * @param {Object} estudianteBackend - Datos del estudiante desde el backend
 * @returns {Object} - Datos mapeados para la lista
 */
export const estudianteListMapper = (estudianteBackend) => {
  if (!estudianteBackend) {
    return null;
  }

  return {
    id: estudianteBackend.id,
    codigoEstudiante: estudianteBackend.codigoEstudiante,
    ciCompleto: estudianteBackend.ciCompleto,
    nombreCompleto: estudianteBackend.nombreCompleto,
    genero: estudianteBackend.genero,
    emailPersonal: estudianteBackend.emailPersonal,
    celular: estudianteBackend.celular,
    createdAt: estudianteBackend.createdAt,
  };
};

/**
 * Mapea un array de estudiantes del backend al formato de lista
 * 
 * @param {Array} estudiantesBackend - Array de estudiantes desde el backend
 * @returns {Array} - Array de estudiantes mapeados para la lista
 */
export const mapEstudiantesList = (estudiantesBackend) => {
  if (!Array.isArray(estudiantesBackend)) {
    return [];
  }

  return estudiantesBackend.map(estudianteListMapper).filter(Boolean);
};

