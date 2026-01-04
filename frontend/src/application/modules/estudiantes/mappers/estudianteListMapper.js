/**
 * Mapper: estudianteListMapper
 * 
 * Single Responsibility: Transformar datos del backend al formato necesario para la lista
 * 
 * Mapea los datos completos del estudiante a un formato simplificado
 * para la visualización en la lista de estudiantes.
 * 
 * Clean Architecture:
 * - Application Layer: Mapper que transforma datos del backend al formato de UI
 * - Usa utilidades compartidas (personFormatters) para construir campos compuestos
 * 
 * @param {Object} estudianteBackend - Datos del estudiante desde el backend
 * @returns {Object} - Datos mapeados para la lista
 */
import { buildPersonDisplayData } from '@application/utils/formatters';

export const estudianteListMapper = (estudianteBackend) => {
  if (!estudianteBackend) {
    return null;
  }

  // Construir CI completo y nombre completo usando utilidades compartidas
  const { ciCompleto, nombreCompleto } = buildPersonDisplayData({
    ci: estudianteBackend.ci,
    expedicion: estudianteBackend.expedicion,
    nombres: estudianteBackend.nombres,
    apellidoPaterno: estudianteBackend.apellidoPaterno,
    apellidoMaterno: estudianteBackend.apellidoMaterno,
  });

  return {
    id: estudianteBackend.id,
    codigoEstudiante: estudianteBackend.codigoEstudiante,
    ciCompleto,
    nombreCompleto,
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

