/**
 * Mapper: estudianteDetailMapper
 * 
 * Single Responsibility: Transformar datos del backend al formato necesario para el detalle
 * 
 * Mapea los datos completos del estudiante con todos sus datos relacionados
 * (guardians, disabilities, origins, documentDeliveries) a un formato estructurado
 * para la visualización en el detalle del estudiante.
 * 
 * Clean Architecture:
 * - Application Layer: Mapper que transforma datos del backend al formato de UI
 * - Usa utilidades compartidas (personFormatters) para construir campos compuestos
 * 
 * @param {Object} dataBackend - Datos del estudiante desde el backend
 * @returns {Object} - Datos mapeados para el detalle
 */
import { buildPersonDisplayData } from '@application/utils/formatters';

export const estudianteDetailMapper = (dataBackend) => {
  // El backend puede retornar { data: { student, guardians, ... } } o directamente { student, guardians, ... }
  // Normalizamos para manejar ambos casos
  const normalizedData = dataBackend?.data || dataBackend;
  
  if (!normalizedData || !normalizedData.student) {
    return null;
  }

  const { student, guardians, disabilities, origins, documentDeliveries } = normalizedData;

  // Construir CI completo y nombre completo usando utilidades compartidas
  // El backend retorna nombres en inglés, los convertimos para el formatter
  const { ciCompleto, nombreCompleto } = buildPersonDisplayData({
    ci: student.ci,
    expedicion: student.expedition,
    nombres: student.firstName,
    apellidoPaterno: student.lastName,
    apellidoMaterno: student.motherLastName,
  });

  return {
    // Datos principales del estudiante
    student: {
      id: student.id,
      codigoEstudiante: student.studentCode,
      ciCompleto,
      nombreCompleto,
      ci: student.ci,
      expedicion: student.expedition,
      nombres: student.firstName,
      apellidoPaterno: student.lastName,
      apellidoMaterno: student.motherLastName,
      fechaNacimiento: student.birthDate,
      genero: student.gender,
      estadoCivilId: student.civilStatusId,
      tipoSangre: student.bloodType,
      tieneDiscapacidad: student.hasDisability,
      emailPersonal: student.personalEmail,
      celular: student.mobilePhone,
      telefonoFijo: student.landlinePhone,
      direccion: student.address,
      municipioResidenciaId: student.residenceMunicipalityId,
      zona: student.zone,
      observaciones: student.observations,
      activo: student.activo,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    },
    // Datos relacionados
    guardians: Array.isArray(guardians) ? guardians : [],
    disabilities: Array.isArray(disabilities) ? disabilities : [],
    origins: Array.isArray(origins) ? origins : [],
    documentDeliveries: Array.isArray(documentDeliveries) ? documentDeliveries : [],
  };
};

/**
 * Mapea los datos del estudiante completo del backend al formato de detalle
 * 
 * @param {Object} dataBackend - Datos del estudiante desde el backend (con student, guardians, etc.)
 * @returns {Object|null} - Datos mapeados para el detalle o null si no hay datos
 */
export const mapEstudianteDetail = (dataBackend) => {
  if (!dataBackend) {
    return null;
  }

  return estudianteDetailMapper(dataBackend);
};

