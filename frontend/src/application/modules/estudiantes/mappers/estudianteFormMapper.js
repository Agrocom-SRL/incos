/**
 * Mapper: estudianteFormMapper
 * 
 * Single Responsibility: Transformar datos del detalle de estudiante al formato del formulario
 * 
 * Mapea los datos completos del estudiante (formato de detalle) al formato esperado
 * por el formulario de registro/edición.
 * 
 * Clean Architecture:
 * - Application Layer: Mapper que transforma datos de detalle al formato de formulario
 * 
 * @param {Object} studentDetail - Datos del estudiante en formato de detalle
 * @returns {Object} - Datos mapeados para el formulario
 */

export const estudianteFormMapper = (studentDetail) => {
  if (!studentDetail || !studentDetail.student) {
    return null;
  }

  const { student, guardians, disabilities, origins, documentDeliveries } = studentDetail;

  // Mapear datos personales del estudiante
  const formData = {
    // Datos personales básicos
    ci: student.ci || '',
    expedicionId: student.expedicion || '',
    nombres: student.nombres || '',
    apellidoPaterno: student.apellidoPaterno || '',
    apellidoMaterno: student.apellidoMaterno || '',
    fechaNacimiento: student.fechaNacimiento || null,
    generoId: student.genero || null,
    estadoCivilId: student.estadoCivilId || null,
    tipoSangre: student.tipoSangre || null,
    tieneDiscapacidad: student.tieneDiscapacidad || false,
    emailPersonal: student.emailPersonal || '',
    celular: student.celular || '',
    telefonoFijo: student.telefonoFijo || '',
    direccion: student.direccion || '',
    municipioResidenciaId: student.municipioResidenciaId || null,
    zona: student.zona || '',
    observaciones: student.observaciones || '',
  };
  
  // Extraer IDs geográficos de residencia desde los catálogos
  // Esto es necesario para cargar las provincias y municipios correctamente
  if (studentDetail.catalogs) {
    const { residenceMunicipality, residenceProvince, residenceDepartment } = studentDetail.catalogs;
    
    if (residenceMunicipality) {
      formData.municipioResidenciaId = residenceMunicipality.id || student.municipioResidenciaId || null;
      
      // Obtener provinciaId desde el municipio o desde residenceProvince
      if (residenceProvince) {
        formData.provinciaResidenciaId = residenceProvince.id || residenceMunicipality.provinciaId || null;
      } else if (residenceMunicipality.provinciaId) {
        formData.provinciaResidenciaId = residenceMunicipality.provinciaId;
      }
      
      // Obtener departamentoId desde la provincia o desde residenceDepartment
      if (residenceDepartment) {
        formData.departamentoResidenciaId = residenceDepartment.id || residenceProvince?.departamentoId || null;
      } else if (residenceProvince?.departamentoId) {
        formData.departamentoResidenciaId = residenceProvince.departamentoId;
      }
    }
  }

  // Mapear discapacidades
  if (disabilities && disabilities.length > 0) {
    const primeraDiscapacidad = disabilities[0];
    formData.tipoDiscapacidadId = primeraDiscapacidad.disabilityTypeId || null;
    formData.gradoDiscapacidad = primeraDiscapacidad.disabilityDegree || null;
    formData.descripcion = primeraDiscapacidad.description || '';
  }

  // ============================================
  // PROCESAR ORÍGENES (DATOS GEOGRÁFICOS)
  // ============================================
  
  // Determinar tipo de origen basado en los registros
  let tipoOrigen = 'BOLIVIANA'; // Default
  let primeraNacionalidad = null;
  
  if (!origins || origins.length === 0) {
    tipoOrigen = 'BOLIVIANA'; // Asumir boliviana si no hay datos
  } else if (origins.length === 1) {
    const origen = origins[0];
    tipoOrigen = origen.originType || origen.tipoOrigen || 'BOLIVIANA';
  } else if (origins.length >= 2) {
    // Doble nacionalidad
    tipoOrigen = 'DOBLE_NACIONALIDAD';
  }

  // Separar orígenes según sean principales o secundarios
  // Buscar por esPrincipal o isPrincipal (puede venir en diferentes formatos)
  const origenPrincipal = origins.find(o => 
    o.esPrincipal === true || 
    o.esPrincipal === 1 || 
    o.isPrincipal === true || 
    o.isPrincipal === 1
  ) || origins[0]; // Si no hay marcado como principal, usar el primero
  
  const origenSecundario = origins.find(o => 
    (o.esPrincipal === false || o.esPrincipal === 0 || o.isPrincipal === false || o.isPrincipal === 0) &&
    o !== origenPrincipal
  );

  // Determinar primera nacionalidad para doble nacionalidad
  if (tipoOrigen === 'DOBLE_NACIONALIDAD' && origenPrincipal) {
    // Si tiene municipioNacimientoId, es boliviana; si no, es extranjera
    primeraNacionalidad = origenPrincipal.birthMunicipalityId || origenPrincipal.municipioNacimientoId
      ? 'BOLIVIANA'
      : 'EXTRANJERA';
    formData.primeraNacionalidad = primeraNacionalidad;
  }

  formData.tipoOrigen = tipoOrigen;

  // ============================================
  // MAPEAR CAMPOS DE ORIGEN PRINCIPAL
  // ============================================
  
  if (origenPrincipal) {
    // Idiomas (del origen principal)
    formData.idiomaMaternoId = origenPrincipal.motherTongueId || origenPrincipal.idiomaMaternoId || null;
    formData.idiomaSecundarioId = origenPrincipal.secondaryLanguageId || origenPrincipal.idiomaSecundarioId || null;
    
    // Si es boliviana (tiene municipioNacimientoId)
    if (origenPrincipal.birthMunicipalityId || origenPrincipal.municipioNacimientoId) {
      const municipioNacimientoId = origenPrincipal.birthMunicipalityId || origenPrincipal.municipioNacimientoId;
      
      // Extraer jerarquía geográfica desde catálogos
      if (studentDetail.catalogs) {
        const { originMunicipalities, originProvinces, originDepartments } = studentDetail.catalogs;
        
        if (municipioNacimientoId && originMunicipalities) {
          const municipio = originMunicipalities[municipioNacimientoId];
          if (municipio) {
            formData.municipioId = municipioNacimientoId;
            formData.localidadComunidad = origenPrincipal.birthCity || origenPrincipal.ciudadNacimiento || '';
            
            if (municipio.provinciaId) {
              formData.provinciaId = municipio.provinciaId;
              
              // Obtener departamentoId desde la provincia
              if (originProvinces && originProvinces[municipio.provinciaId]) {
                const provincia = originProvinces[municipio.provinciaId];
                if (provincia && provincia.departamentoId) {
                  formData.departamentoId = provincia.departamentoId;
                }
              }
            }
          }
        }
      }
    }
    // Si es extranjera (tiene paisId)
    else if (origenPrincipal.countryId || origenPrincipal.paisId) {
      formData.paisId = origenPrincipal.countryId || origenPrincipal.paisId;
      formData.ciudadNacimiento = origenPrincipal.birthCity || origenPrincipal.ciudadNacimiento || '';
    }
  }

  // ============================================
  // MAPEAR CAMPOS DE ORIGEN SECUNDARIO (DOBLE NACIONALIDAD)
  // ============================================
  
  if (origenSecundario && tipoOrigen === 'DOBLE_NACIONALIDAD') {
    // Si la segunda nacionalidad es boliviana (tiene municipioNacimientoId)
    if (origenSecundario.birthMunicipalityId || origenSecundario.municipioNacimientoId) {
      const municipioNacimientoId = origenSecundario.birthMunicipalityId || origenSecundario.municipioNacimientoId;
      
      // Extraer jerarquía geográfica desde catálogos
      if (studentDetail.catalogs) {
        const { originMunicipalities, originProvinces } = studentDetail.catalogs;
        
        if (municipioNacimientoId && originMunicipalities) {
          const municipio = originMunicipalities[municipioNacimientoId];
          if (municipio) {
            formData.segundaMunicipioId = municipioNacimientoId;
            formData.segundaLocalidadComunidad = origenSecundario.birthCity || origenSecundario.ciudadNacimiento || '';
            
            if (municipio.provinciaId) {
              formData.segundaProvinciaId = municipio.provinciaId;
              
              // Obtener departamentoId desde la provincia
              if (originProvinces && originProvinces[municipio.provinciaId]) {
                const provincia = originProvinces[municipio.provinciaId];
                if (provincia && provincia.departamentoId) {
                  formData.segundaDepartamentoId = provincia.departamentoId;
                }
              }
            }
          }
        }
      }
    }
    // Si la segunda nacionalidad es extranjera (tiene paisId)
    else if (origenSecundario.countryId || origenSecundario.paisId) {
      formData.segundaPaisId = origenSecundario.countryId || origenSecundario.paisId;
      formData.segundaCiudadNacimiento = origenSecundario.birthCity || origenSecundario.ciudadNacimiento || '';
    }
  }

  // Mapear contactos de emergencia/apoderados
  if (guardians && guardians.length > 0) {
    formData.contactosEmergencia = guardians.map((guardian) => ({
      tipoParentescoId: guardian.relationshipTypeId || null,
      nombres: guardian.firstName || '',
      apellidos: guardian.lastName || '',
      celular1: guardian.cellphone1 || '',
      celular2: guardian.cellphone2 || '',
      viveConEstudiante: guardian.livesWithStudent !== undefined ? guardian.livesWithStudent : false,
    }));
  } else {
    formData.contactosEmergencia = [];
  }

  // Mapear documentación entregada
  if (documentDeliveries && documentDeliveries.length > 0) {
    const documentacion = {};
    documentDeliveries.forEach((delivery) => {
      const docKey = `doc_${delivery.documentacionId}`;
      documentacion[docKey] = {
        entregado: delivery.entregado !== undefined ? delivery.entregado : false,
        en_tramite: delivery.enTramite !== undefined ? delivery.enTramite : false,
        fechaEntrega: delivery.fechaEntrega || null,
        observaciones: delivery.observaciones || null,
      };
    });
    formData.documentacion = documentacion;
  } else {
    formData.documentacion = {};
  }

  return formData;
};

/**
 * Mapea los datos del estudiante del formato de detalle al formato de formulario
 * 
 * @param {Object} studentDetail - Datos del estudiante desde el detalle (con student, guardians, etc.)
 * @returns {Object|null} - Datos mapeados para el formulario o null si no hay datos
 */
export const mapEstudianteToForm = (studentDetail) => {
  if (!studentDetail) {
    return null;
  }

  return estudianteFormMapper(studentDetail);
};

