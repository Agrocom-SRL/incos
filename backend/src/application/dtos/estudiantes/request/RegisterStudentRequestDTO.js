/**
 * Request DTO: RegisterStudentRequestDTO
 * Módulo: Estudiantes
 *
 * Transforma la estructura plana del frontend a la estructura anidada que espera el use case.
 *
 * Frontend envía (estructura plana):
 * {
 *   ci, expedicionId, nombres, apellidoPaterno, apellidoMaterno, fechaNacimiento,
 *   generoId, estadoCivilId, tipoSangre, tieneDiscapacidad, emailPersonal, celular,
 *   telefonoFijo, direccion, municipioResidenciaId, zona, observaciones,
 *   tipoDiscapacidadId, gradoDiscapacidad, descripcion,
 *   paisId, ciudadNacimiento, idiomaMaternoId, idiomaSecundarioId, tipoOrigen,
 *   contactosEmergencia: [ ... ],
 *   documentacion: { doc_1: { ... }, doc_2: { ... } }
 * }
 *
 * Use Case espera (estructura anidada):
 * {
 *   student: { ... },
 *   guardians: [ ... ],
 *   disabilities: [ ... ],
 *   origins: [ ... ],
 *   documentation: { ... }
 * }
 *
 *
 * Clean Architecture:
 * - Application Layer: Transforma datos de Presentation → Application
 * - Depende solo de estructuras de datos, no de entidades de dominio
 *
 * Principios SOLID:
 * - Single Responsibility: Solo transforma estructura de datos del request
 * - Open/Closed: Extensible para agregar nuevas transformaciones sin modificar el use case
 */
export class RegisterStudentRequestDTO {
  /**
   * Transforma el body del request del frontend a la estructura que espera el use case
   *
   * @param {Object} body - Body del request HTTP (estructura plana del frontend)
   * @returns {Object} Estructura anidada para el use case
   */
  static fromRequest(body) {
    const {
      // Datos personales
      ci,
      expedicionId,
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      fechaNacimiento,
      generoId,
      estadoCivilId,
      tipoSangre,
      tieneDiscapacidad,
      emailPersonal,
      celular,
      telefonoFijo,
      direccion,
      municipioResidenciaId,
      zona,
      trabaja,
      empresaInstitucion,
      cargo,
      observaciones,
      // Datos de discapacidad
      tipoDiscapacidadId,
      gradoDiscapacidad,
      descripcion,
      causa,
      // Datos de origen
      paisId,
      ciudadNacimiento,
      municipioId,
      localidadComunidad,
      idiomaMaternoId,
      idiomaSecundarioId,
      tipoOrigen,
      primeraNacionalidad,
      // Campos para segunda nacionalidad (doble nacionalidad)
      segundaPaisId,
      segundaCiudadNacimiento,
      segundaMunicipioId,
      segundaLocalidadComunidad,
      // Tipo de admisión y datos académicos iniciales (para estudiantes antiguos)
      tipoAdmision,
      gestionIngresoId, // Gestión de ingreso (requerido si tipoAdmision === 'ANTIGUO')
      carreraId, // Carrera de ingreso (requerido si tipoAdmision === 'ANTIGUO')
      // Campos específicos de Transitabilidad (formulario de transitabilidad)
      transitabilidad_institucion_nombre,
      transitabilidad_codigo_sie,
      transitabilidad_tipo,
      transitabilidad_dependencia,
      transitabilidad_departamento_id,
      transitabilidad_distrito_educativo,
      transitabilidad_carrera_origen,
      transitabilidad_anio_conclusion,
      transitabilidad_regimen_estudios,
      transitabilidad_estado,
      transitabilidad_motivo_no_procedente,
      // Campos específicos de Traspaso (formulario de traspaso)
      traspaso_institucion_origen_nombre,
      traspaso_codigo_rude,
      traspaso_dependencia,
      traspaso_departamento_id,
      traspaso_distrito_educativo,
      traspaso_carrera_origen,
      traspaso_anio_cursado,
      traspaso_regimen_origen,
      traspaso_estado,
      traspaso_motivo_no_procedente,
      // Arrays y objetos
      contactosEmergencia,
      documentacion,
      // NOTA: Para estudiantes ANTIGUOS, carreraId y gestionIngresoId se usan para crear estudiantes_datos_academicos
    } = body;

    // tipoSangre: solo valores actuales; legacy ya reemplazado por null en validador
    const bloodType = tipoSangre ?? null;

    // 1. Datos del estudiante principal
    const student = {
      ci,
      expedition: expedicionId, // Frontend envía expedicionId, use case espera expedition
      firstName: nombres,
      lastName: apellidoPaterno,
      motherLastName: apellidoMaterno,
      birthDate: fechaNacimiento,
      gender: generoId,
      civilStatusId: estadoCivilId,
      bloodType,
      hasDisability: tieneDiscapacidad,
      personalEmail: emailPersonal,
      mobilePhone: celular,
      landlinePhone: telefonoFijo,
      address: direccion,
      residenceMunicipalityId: municipioResidenciaId,
      zone: zona,
      works: trabaja ?? false,
      employerInstitution: empresaInstitucion ?? null,
      position: cargo ?? null,
      observations: observaciones,
    };

    // 2. Discapacidades (array, opcional)
    const disabilities =
      tieneDiscapacidad && tipoDiscapacidadId
        ? [
            {
              disabilityTypeId: tipoDiscapacidadId,
              description: descripcion,
              disabilityDegree: gradoDiscapacidad,
              cause: causa ?? null,
            },
          ]
        : [];

    // 3. Orígenes (array, opcional)
    // IMPORTANTE: tipoOrigen puede ser 0 (BOLIVIANA), que es falsy, por lo que debemos verificar explícitamente !== undefined
    const hasOriginData = paisId || ciudadNacimiento || municipioId || localidadComunidad || idiomaMaternoId
      || idiomaSecundarioId || (tipoOrigen !== undefined && tipoOrigen !== null);
    const origins = [];

    if (hasOriginData) {
      // Normalizar tipoOrigen a string
      const tipoOrigenNormalizado = tipoOrigen === 0 || tipoOrigen === '0' ? 'BOLIVIANA'
        : tipoOrigen === 1 || tipoOrigen === '1' ? 'EXTRANJERA'
        : tipoOrigen === 2 || tipoOrigen === '2' ? 'DOBLE_NACIONALIDAD'
        : tipoOrigen;

      if (tipoOrigenNormalizado === 'DOBLE_NACIONALIDAD' && primeraNacionalidad) {
        // Doble nacionalidad: crear 2 orígenes
        const primeraEsBoliviana = primeraNacionalidad === 'BOLIVIANA' || primeraNacionalidad === '0';

        // Primera nacionalidad (principal)
        origins.push({
          countryId: primeraEsBoliviana ? null : (paisId || null),
          birthMunicipalityId: primeraEsBoliviana ? (municipioId || null) : null,
          birthCity: primeraEsBoliviana ? (localidadComunidad || null) : (ciudadNacimiento || null),
          motherTongueId: idiomaMaternoId || null,
          secondaryLanguageId: idiomaSecundarioId || null,
          originType: primeraEsBoliviana ? 'BOLIVIANA' : 'EXTRANJERA',
          isPrincipal: true,
        });

        // Segunda nacionalidad (secundaria)
        const segundaEsBoliviana = !primeraEsBoliviana;
        origins.push({
          countryId: segundaEsBoliviana ? null : (segundaPaisId || null),
          birthMunicipalityId: segundaEsBoliviana ? (segundaMunicipioId || null) : null,
          birthCity: segundaEsBoliviana ? (segundaLocalidadComunidad || null) : (segundaCiudadNacimiento || null),
          motherTongueId: null, // Los idiomas van solo en el principal
          secondaryLanguageId: null,
          originType: segundaEsBoliviana ? 'BOLIVIANA' : 'EXTRANJERA',
          isPrincipal: false,
        });
      } else {
        // Nacionalidad simple (BOLIVIANA o EXTRANJERA)
        const esBoliviana = tipoOrigenNormalizado === 'BOLIVIANA';
        origins.push({
          countryId: esBoliviana ? null : (paisId || null),
          birthMunicipalityId: esBoliviana ? (municipioId || null) : null,
          birthCity: esBoliviana ? (localidadComunidad || null) : (ciudadNacimiento || null),
          motherTongueId: idiomaMaternoId || null,
          secondaryLanguageId: idiomaSecundarioId || null,
          originType: tipoOrigenNormalizado,
          isPrincipal: true,
        });
      }
    }

    // 4. Apoderados/Contactos de emergencia (array, opcional)
    // El frontend ya envía contactosEmergencia como array, pero necesitamos transformar
    // los nombres de campos del frontend a los que espera el use case
    const guardians = Array.isArray(contactosEmergencia)
      ? contactosEmergencia.map((contacto) => ({
          relationshipTypeId: contacto.tipoParentescoId,
          firstName: contacto.nombres,
          lastName: contacto.apellidos,
          cellphone1: contacto.celular1,
          cellphone2: contacto.celular2,
          livesWithStudent: contacto.viveConEstudiante ?? false,
        }))
      : [];

    // 5. Documentación (objeto, opcional)
    // El frontend envía documentacion como objeto con keys doc_1, doc_2, etc.
    // El use case espera las mismas keys (doc_1, doc_2, etc.) pero con campos en camelCase
    const documentation = {};
    if (documentacion && typeof documentacion === 'object') {
      for (const docKey in documentacion) {
        if (Object.hasOwnProperty.call(documentacion, docKey)) {
          // Mantener la key original (doc_1, doc_2, etc.) ya que el use case las procesa así
          const docData = documentacion[docKey];
          documentation[docKey] = {
            entregado: docData.entregado ?? false,
            enTramite: docData.en_tramite ?? false, // Frontend envía snake_case, use case espera camelCase
            fechaEntrega: docData.fechaEntrega || null,
            observaciones: docData.observaciones || null,
          };
        }
      }
    }

    // 6. Datos específicos de Transitabilidad
    let transitability = null;
    if (tipoAdmision === 'TRANSITABILIDAD') {
      const deptId =
        transitabilidad_departamento_id != null && transitabilidad_departamento_id !== ''
          ? parseInt(transitabilidad_departamento_id, 10)
          : null;

      transitability = {
        institucionNombre: transitabilidad_institucion_nombre || null,
        codigoSie: transitabilidad_codigo_sie || null,
        tipoInstitucion: transitabilidad_tipo || null, // UETHP / CEA
        dependencia: transitabilidad_dependencia || null,
        departamentoId: !Number.isNaN(deptId) ? deptId : null,
        distritoEducativo: transitabilidad_distrito_educativo || null,
        carreraOrigen: transitabilidad_carrera_origen || null,
        anioConclusion: transitabilidad_anio_conclusion || null,
        regimenEstudios: transitabilidad_regimen_estudios || null,
        estado: transitabilidad_estado || 'SOLICITADO',
        motivoNoProcedente: transitabilidad_motivo_no_procedente || null,
      };
    }

    // 7. Datos específicos de Traspaso
    let transfer = null;
    if (tipoAdmision === 'TRASPASO') {
      const deptId =
        traspaso_departamento_id != null && traspaso_departamento_id !== ''
          ? parseInt(traspaso_departamento_id, 10)
          : null;

      transfer = {
        institucionNombre: traspaso_institucion_origen_nombre || null,
        codigoRude: traspaso_codigo_rude || null,
        dependencia: traspaso_dependencia || null,
        departamentoId: !Number.isNaN(deptId) ? deptId : null,
        distritoEducativo: traspaso_distrito_educativo || null,
        carreraOrigen: traspaso_carrera_origen || null,
        anioCursado: traspaso_anio_cursado || null, // PRIMERO / SEGUNDO
        regimenOrigen: traspaso_regimen_origen || null, // SEMESTRAL / ANUAL
        estado: traspaso_estado || 'SOLICITADO',
        motivoNoProcedente: traspaso_motivo_no_procedente || null,
      };
    }

    return {
      student,
      guardians,
      disabilities,
      origins,
      documentation,
      tipoAdmision, // Tipo de admisión (NUEVO, ANTIGUO, TRANSITABILIDAD, TRASPASO)
      gestionIngresoId, // Gestión de ingreso (requerido si tipoAdmision === 'ANTIGUO')
      carreraId, // Carrera de ingreso (requerido si tipoAdmision === 'ANTIGUO')
      transitability,
      transfer,
    };
  }
}
