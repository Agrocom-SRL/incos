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

  const { student, guardians, disabilities, origins, documentDeliveries, academicData } = studentDetail;

  // Tipo de admisión y datos académicos (paso 0): usar valor persistido o inferir por gestión de ingreso
  const hasGestionIngreso = academicData?.gestionIngresoId != null && academicData?.gestionIngresoId !== '';
  const tipoAdmisionFromApi = academicData?.tipoAdmision ?? academicData?.admissionType;
  const tipoAdmision = tipoAdmisionFromApi ?? (hasGestionIngreso ? 'ANTIGUO' : 'NUEVO');

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
    municipioResidenciaId: student.residenceMunicipalityId || student.municipioResidenciaId || null,
    zona: student.zona || '',
    trabaja: student.works ?? student.trabaja ?? false,
    empresaInstitucion: student.employerInstitution ?? student.empresaInstitucion ?? '',
    cargo: student.position ?? student.cargo ?? '',
    observaciones: student.observaciones ?? '',
    // Paso 0: tipo admisión y datos académicos (para edición; tipoAdmision persistido en BD)
    tipoAdmision,
    gestionIngresoId: academicData?.gestionIngresoId ?? null,
    carreraId: academicData?.carreraId ?? null,
  };

  // Extraer IDs geográficos de residencia (vienen de vista_estudiante_datos_personales → vista_base_estudiante_residencia)
  // Priorizar IDs que vienen en el student desde la vista; fallback a catálogos si existieran
  const municipioResId = student.municipioResidenciaId ?? student.residenceMunicipalityId ?? student.residence_municipality_id;
  const provinciaResId = student.residenceProvinceId ?? student.provinciaResidenciaId ?? student.residence_province_id;
  const departamentoResId = student.residenceDepartmentId ?? student.departamentoResidenciaId ?? student.residence_department_id;
  formData.municipioResidenciaId = municipioResId != null ? (typeof municipioResId === 'number' ? municipioResId : Number(municipioResId)) : null;
  formData.provinciaResidenciaId = provinciaResId != null ? (typeof provinciaResId === 'number' ? provinciaResId : Number(provinciaResId)) : null;
  formData.departamentoResidenciaId = departamentoResId != null ? (typeof departamentoResId === 'number' ? departamentoResId : Number(departamentoResId)) : null;
  if (studentDetail.catalogs?.residenceMunicipality || studentDetail.catalogs?.residenceProvince || studentDetail.catalogs?.residenceDepartment) {
    const { residenceMunicipality, residenceProvince, residenceDepartment } = studentDetail.catalogs;
    if (residenceMunicipality) formData.municipioResidenciaId = residenceMunicipality.id || formData.municipioResidenciaId;
    if (residenceProvince) formData.provinciaResidenciaId = residenceProvince.id || residenceMunicipality?.provinciaId || formData.provinciaResidenciaId;
    if (residenceDepartment) formData.departamentoResidenciaId = residenceDepartment.id || residenceProvince?.departamentoId || formData.departamentoResidenciaId;
  }

  // Mapear discapacidades
  if (disabilities && disabilities.length > 0) {
    const primeraDiscapacidad = disabilities[0];
    formData.tipoDiscapacidadId = primeraDiscapacidad.disabilityTypeId || null;
    formData.gradoDiscapacidad = primeraDiscapacidad.disabilityDegree || null;
    formData.descripcion = primeraDiscapacidad.description || '';
    formData.causa = primeraDiscapacidad.cause || '';
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
  // MySQL/JSON puede devolver es_principal como 1/0 (number) o "1"/"0" (string)
  const isPrincipal = (o) => Number(o?.esPrincipal) === 1 || Number(o?.isPrincipal) === 1 || o?.esPrincipal === true || o?.isPrincipal === true;
  const isSecundario = (o) => Number(o?.esPrincipal) === 0 || Number(o?.isPrincipal) === 0 || o?.esPrincipal === false || o?.isPrincipal === false;
  const origenPrincipal = origins.find(isPrincipal) || origins[0]; // Si no hay marcado como principal, usar el primero
  const origenSecundario = origins.find(o => isSecundario(o) && o !== origenPrincipal);

  // Determinar primera nacionalidad para doble nacionalidad
  if (tipoOrigen === 'DOBLE_NACIONALIDAD' && origenPrincipal) {
    // Principal boliviano si tiene municipio de nacimiento; si no, extranjero (tiene paisId)
    const principalTieneMunicipio = !!(origenPrincipal.birthMunicipalityId ?? origenPrincipal.municipioNacimientoId);
    primeraNacionalidad = principalTieneMunicipio ? 'BOLIVIANA' : 'EXTRANJERA';
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
    
    // Determinar si el origen principal es boliviano o extranjero
    const origenPrincipalEsBoliviano = !!(origenPrincipal.birthMunicipalityId || origenPrincipal.municipioNacimientoId);
    
    if (origenPrincipalEsBoliviano) {
      // Si es boliviana (tiene municipioNacimientoId o birthMunicipalityId)
      // Priorizar birthMunicipalityId (viene de vista SQL nacimiento_municipio_id)
      const municipioNacimientoId = origenPrincipal.birthMunicipalityId || origenPrincipal.municipioNacimientoId;
      
      // Usar IDs directamente desde el origen (vienen desde vista_estudiante_datos_personales)
      formData.municipioId = municipioNacimientoId;
      // Localidad/Comunidad = ciudad de nacimiento cuando nacionalidad es Boliviana (birthCity/birthCityRaw)
      formData.localidadComunidad = origenPrincipal.birthCityRaw || origenPrincipal.ciudadNacimiento || origenPrincipal.birthCity || '';
      
      // Obtener provinciaId y departamentoId desde el origen (vienen desde vista SQL: nacimiento_provincia_id, nacimiento_departamento_id)
      if (origenPrincipal.birthProvinceId) {
        formData.provinciaId = origenPrincipal.birthProvinceId;
      }
      if (origenPrincipal.birthDepartmentId) {
        formData.departamentoId = origenPrincipal.birthDepartmentId;
      }
      
      // Fallback: intentar obtener desde catálogos si no vienen en el origen
      if (!formData.provinciaId || !formData.departamentoId) {
        if (studentDetail.catalogs) {
          const { originMunicipalities, originProvinces, originDepartments } = studentDetail.catalogs;
          
          if (municipioNacimientoId && originMunicipalities) {
            const municipio = originMunicipalities[municipioNacimientoId];
            if (municipio) {
              if (!formData.provinciaId && municipio.provinciaId) {
                formData.provinciaId = municipio.provinciaId;
              }
              
              if (!formData.departamentoId && formData.provinciaId && originProvinces && originProvinces[formData.provinciaId]) {
                const provincia = originProvinces[formData.provinciaId];
                if (provincia && provincia.departamentoId) {
                  formData.departamentoId = provincia.departamentoId;
                }
              }
            }
          }
        }
      }
    } else {
      // Si es extranjera (no tiene municipio; tiene pais_id en BD)
      // Aceptar camelCase (API) o snake_case (por si llega crudo)
      const paisIdOrigen = origenPrincipal.paisId ?? origenPrincipal.countryId ?? origenPrincipal.pais_id ?? origenPrincipal.pais_id_efectivo;
      if (paisIdOrigen != null && paisIdOrigen !== '') {
        formData.paisId = typeof paisIdOrigen === 'number' ? paisIdOrigen : Number(paisIdOrigen);
      }
      const ciudadRaw = origenPrincipal.birthCityRaw ?? origenPrincipal.ciudadNacimiento ?? origenPrincipal.birthCity ?? origenPrincipal.ciudad_nacimiento_raw ?? origenPrincipal.ciudad ?? '';
      formData.ciudadNacimiento = typeof ciudadRaw === 'string' ? ciudadRaw : String(ciudadRaw ?? '');
    }
  }

  // ============================================
  // MAPEAR CAMPOS DE ORIGEN SECUNDARIO (DOBLE NACIONALIDAD)
  // ============================================
  
  if (origenSecundario && tipoOrigen === 'DOBLE_NACIONALIDAD') {
    // Determinar si la segunda nacionalidad es boliviana o extranjera
    const segundaEsBoliviana = !!(origenSecundario.birthMunicipalityId ?? origenSecundario.municipioNacimientoId);
    
    if (segundaEsBoliviana) {
      // Si la segunda nacionalidad es boliviana (tiene municipio); priorizar nacimiento_municipio_id
      const municipioNacimientoId = origenSecundario.birthMunicipalityId ?? origenSecundario.municipioNacimientoId;
      if (municipioNacimientoId != null) {
        formData.segundaMunicipioId = typeof municipioNacimientoId === 'number' ? municipioNacimientoId : Number(municipioNacimientoId);
      }
      // Localidad/Comunidad = ciudad de nacimiento cuando nacionalidad es Boliviana (birthCity/birthCityRaw, ej. "colomi")
      formData.segundaLocalidadComunidad = origenSecundario.birthCityRaw || origenSecundario.ciudadNacimiento || origenSecundario.birthCity || '';
      
      // Provincia y departamento desde vista (nacimiento_provincia_id, nacimiento_departamento_id)
      if (origenSecundario.birthProvinceId != null) {
        formData.segundaProvinciaId = typeof origenSecundario.birthProvinceId === 'number' ? origenSecundario.birthProvinceId : Number(origenSecundario.birthProvinceId);
      }
      if (origenSecundario.birthDepartmentId != null) {
        formData.segundaDepartamentoId = typeof origenSecundario.birthDepartmentId === 'number' ? origenSecundario.birthDepartmentId : Number(origenSecundario.birthDepartmentId);
      }
      
      // Fallback: intentar obtener desde catálogos si no vienen en el origen
      if (!formData.segundaProvinciaId || !formData.segundaDepartamentoId) {
        if (studentDetail.catalogs) {
          const { originMunicipalities, originProvinces } = studentDetail.catalogs;
          
          if (municipioNacimientoId && originMunicipalities) {
            const municipio = originMunicipalities[municipioNacimientoId];
            if (municipio) {
              if (!formData.segundaProvinciaId && municipio.provinciaId) {
                formData.segundaProvinciaId = municipio.provinciaId;
              }
              
              if (!formData.segundaDepartamentoId && formData.segundaProvinciaId && originProvinces && originProvinces[formData.segundaProvinciaId]) {
                const provincia = originProvinces[formData.segundaProvinciaId];
                if (provincia && provincia.departamentoId) {
                  formData.segundaDepartamentoId = provincia.departamentoId;
                }
              }
            }
          }
        }
      }
    } else {
      // Si la segunda nacionalidad es extranjera (no tiene municipio, pero tiene paisId)
      // Para extranjeros, paisId siempre tiene valor (no es null)
      // countryId (pais_id_efectivo) siempre tiene valor, pero para extranjeros debería ser igual a paisId
      const segundaPaisIdOrigen = origenSecundario.paisId ?? origenSecundario.countryId;
      if (segundaPaisIdOrigen != null) {
        formData.segundaPaisId = typeof segundaPaisIdOrigen === 'number' ? segundaPaisIdOrigen : Number(segundaPaisIdOrigen);
      }
      formData.segundaCiudadNacimiento = origenSecundario.birthCityRaw || origenSecundario.ciudadNacimiento || origenSecundario.birthCity || '';
    }
  }

  // Mapear contactos de emergencia/apoderados (incluir id para que al editar se actualicen en vez de duplicar)
  if (guardians && guardians.length > 0) {
    formData.contactosEmergencia = guardians.map((guardian) => ({
      id: guardian.id ?? null,
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

  // Mapear documentación entregada (una entrada por documentacionId; si hay varias, usar la más reciente)
  if (documentDeliveries && documentDeliveries.length > 0) {
    const byDocId = new Map();
    const sorted = [...documentDeliveries].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    for (const delivery of sorted) {
      const docId = delivery.documentacionId;
      if (docId != null && !byDocId.has(docId)) {
        byDocId.set(docId, {
          entregado: delivery.entregado !== undefined ? delivery.entregado : false,
          en_tramite: delivery.enTramite !== undefined ? delivery.enTramite : false,
          fechaEntrega: delivery.fechaEntrega || null,
          observaciones: delivery.observaciones ?? null,
        });
      }
    }
    const documentacion = {};
    for (const [docId, val] of byDocId) {
      documentacion[`doc_${docId}`] = val;
    }
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

