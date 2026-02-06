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

  const { student, guardians, disabilities, origins, documentDeliveries, scholarships, catalogs = {}, tieneDocumentosFaltantes, actaCompromiso, inscripcion, academicData } = normalizedData;

  // Construir CI completo y nombre completo usando utilidades compartidas
  // El backend retorna nombres en inglés, los convertimos para el formatter
  const { ciCompleto, nombreCompleto } = buildPersonDisplayData({
    ci: student.ci,
    expedicion: student.expedition,
    nombres: student.firstName,
    apellidoPaterno: student.lastName,
    apellidoMaterno: student.motherLastName,
  });

  // Dirección de residencia: ya vienen en student desde la vista
  const residenceAddressParts = [
    student.residenceMunicipalityName,
    student.residenceProvinceName,
    student.residenceDepartmentName,
  ].filter(Boolean);
  const residenceAddressComplete = residenceAddressParts.length > 0
    ? residenceAddressParts.join(', ')
    : null;

  // Apoderados y orígenes/documentDeliveries ya traen nombres desde la vista; solo pasamos
  const enrichedGuardians = Array.isArray(guardians) ? guardians : [];
  const enrichedDisabilities = Array.isArray(disabilities) ? disabilities : [];

  // Orígenes: ya traen countryName, motherTongueName, birthMunicipalityName, etc. desde la vista
  const enrichedOrigins = (Array.isArray(origins) ? origins : []).map((origin) => {
    const originAddressParts = [
      origin.birthCity,
      origin.birthMunicipalityName,
      origin.birthProvinceName,
      origin.birthDepartmentName,
    ].filter(Boolean);
    const originAddressComplete = originAddressParts.length > 0
      ? originAddressParts.join(', ')
      : null;
    return { ...origin, originAddressComplete };
  });

  // Entregas de documentos ya traen documentacionName desde la vista
  const enrichedDocumentDeliveries = Array.isArray(documentDeliveries) ? documentDeliveries : [];

  // Enriquecer asignaciones de becas con información de tipo de beca y gestión
  const enrichedScholarships = (Array.isArray(scholarships) ? scholarships : []).map((scholarship) => {
    const scholarshipType = scholarship.scholarshipId 
      ? catalogs.scholarships?.[scholarship.scholarshipId] 
      : null;
    const management = scholarship.managementId 
      ? catalogs.managements?.[scholarship.managementId] 
      : null;
    
    return {
      ...scholarship,
      scholarshipName: scholarshipType?.name || null,
      scholarshipCode: scholarshipType?.code || null,
      scholarshipPercentage: scholarshipType?.percentage || null,
      managementCode: management?.code || null,
      managementYear: management?.year || null,
    };
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
      estadoCivilName: student.estadoCivilNombre || null,
      tipoSangre: student.bloodType,
      tieneDiscapacidad: student.hasDisability,
      emailPersonal: student.personalEmail,
      celular: student.mobilePhone,
      telefonoFijo: student.landlinePhone,
      direccion: student.address,
      municipioResidenciaId: student.residenceMunicipalityId,
      residenceMunicipalityId: student.residenceMunicipalityId,
      residenceProvinceId: student.residenceProvinceId,
      residenceDepartmentId: student.residenceDepartmentId,
      municipioResidenciaName: student.residenceMunicipalityName || null,
      provinciaResidenciaName: student.residenceProvinceName || null,
      departamentoResidenciaName: student.residenceDepartmentName || null,
      residenceAddressComplete,
      zona: student.zone,
      trabaja: student.works ?? false,
      empresaInstitucion: student.employerInstitution ?? '',
      cargo: student.position ?? '',
      observaciones: student.observations ?? '',
      activo: student.activo,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    },
    // Datos relacionados enriquecidos
    guardians: enrichedGuardians,
    disabilities: enrichedDisabilities,
    origins: enrichedOrigins,
    documentDeliveries: enrichedDocumentDeliveries,
    scholarships: enrichedScholarships,
    // Campo para indicar si faltan documentos (para mostrar botón de acta de compromiso)
    tieneDocumentosFaltantes: tieneDocumentosFaltantes === true,
    // Acta de compromiso si existe
    actaCompromiso: actaCompromiso || null,
    // Inscripción más reciente si existe
    inscripcion: inscripcion || null,
    // Datos académicos (tipoAdmision, gestionIngresoId, carreraId) para formulario de edición / paso 1
    academicData: academicData || null,
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

