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

  const { student, guardians, disabilities, origins, documentDeliveries, scholarships, catalogs = {}, tieneDocumentosFaltantes, actaCompromiso, inscripcion } = normalizedData;

  // Construir CI completo y nombre completo usando utilidades compartidas
  // El backend retorna nombres en inglés, los convertimos para el formatter
  const { ciCompleto, nombreCompleto } = buildPersonDisplayData({
    ci: student.ci,
    expedicion: student.expedition,
    nombres: student.firstName,
    apellidoPaterno: student.lastName,
    apellidoMaterno: student.motherLastName,
  });

  // Construir dirección completa de residencia
  const residenceAddressParts = [];
  if (catalogs.residenceMunicipality?.name) {
    residenceAddressParts.push(catalogs.residenceMunicipality.name);
  }
  if (catalogs.residenceProvince?.name) {
    residenceAddressParts.push(catalogs.residenceProvince.name);
  }
  if (catalogs.residenceDepartment?.name) {
    residenceAddressParts.push(catalogs.residenceDepartment.name);
  }
  const residenceAddressComplete = residenceAddressParts.length > 0 
    ? residenceAddressParts.join(', ') 
    : null;

  // Enriquecer apoderados con tipo de parentesco
  const enrichedGuardians = (Array.isArray(guardians) ? guardians : []).map((guardian) => {
    const relationshipType = guardian.relationshipTypeId 
      ? catalogs.relationshipTypes?.[guardian.relationshipTypeId] 
      : null;
    
    return {
      ...guardian,
      relationshipTypeName: relationshipType?.name || null,
    };
  });

  // Enriquecer discapacidades con tipo de discapacidad
  const enrichedDisabilities = (Array.isArray(disabilities) ? disabilities : []).map((disability) => {
    const disabilityType = disability.disabilityTypeId 
      ? catalogs.disabilityTypes?.[disability.disabilityTypeId] 
      : null;
    
    return {
      ...disability,
      disabilityTypeName: disabilityType?.name || null,
    };
  });

  // Enriquecer orígenes con datos de catálogos
  const enrichedOrigins = (Array.isArray(origins) ? origins : []).map((origin) => {
    const country = origin.countryId 
      ? catalogs.originCountries?.[origin.countryId] 
      : null;
    const motherTongue = origin.motherTongueId 
      ? catalogs.originLanguages?.[origin.motherTongueId] 
      : null;
    const secondaryLanguage = origin.secondaryLanguageId 
      ? catalogs.originLanguages?.[origin.secondaryLanguageId] 
      : null;
    
    // Construir dirección completa de origen
    const originAddressParts = [];
    if (origin.birthCity) {
      originAddressParts.push(origin.birthCity);
    }
    if (origin.birthMunicipalityId) {
      const municipality = catalogs.originMunicipalities?.[origin.birthMunicipalityId];
      if (municipality?.name) {
        originAddressParts.push(municipality.name);
      }
      if (municipality?.provinceId) {
        const province = catalogs.originProvinces?.[municipality.provinceId];
        if (province?.name) {
          originAddressParts.push(province.name);
        }
        if (province?.departmentId) {
          const department = catalogs.originDepartments?.[province.departmentId];
          if (department?.name) {
            originAddressParts.push(department.name);
          }
        }
      }
    }
    const originAddressComplete = originAddressParts.length > 0 
      ? originAddressParts.join(', ') 
      : null;
    
    return {
      ...origin,
      countryName: country?.name || null,
      motherTongueName: motherTongue?.name || null,
      secondaryLanguageName: secondaryLanguage?.name || null,
      originAddressComplete,
    };
  });

  // Enriquecer entregas de documentos con información de documentación
  const enrichedDocumentDeliveries = (Array.isArray(documentDeliveries) ? documentDeliveries : []).map((delivery) => {
    const documentacion = delivery.documentacionId 
      ? catalogs.documentaciones?.[delivery.documentacionId] 
      : null;
    
    return {
      ...delivery,
      documentacionName: documentacion?.name || null,
    };
  });

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
      estadoCivilName: catalogs.civilStatus?.name || null,
      tipoSangre: student.bloodType,
      tieneDiscapacidad: student.hasDisability,
      emailPersonal: student.personalEmail,
      celular: student.mobilePhone,
      telefonoFijo: student.landlinePhone,
      direccion: student.address,
      municipioResidenciaId: student.residenceMunicipalityId,
      municipioResidenciaName: catalogs.residenceMunicipality?.name || null,
      provinciaResidenciaName: catalogs.residenceProvince?.name || null,
      departamentoResidenciaName: catalogs.residenceDepartment?.name || null,
      residenceAddressComplete,
      zona: student.zone,
      observaciones: student.observations,
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

