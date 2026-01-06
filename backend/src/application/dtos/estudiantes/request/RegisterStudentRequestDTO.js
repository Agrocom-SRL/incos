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
 *   documentacion: { doc_1: { ... }, doc_2: { ... } },
 *   careerId, managementId, academicState, registrationState, ...
 * }
 * 
 * Use Case espera (estructura anidada):
 * {
 *   student: { ... },
 *   academicData: { ... },
 *   guardians: [ ... ],
 *   disabilities: [ ... ],
 *   origins: [ ... ],
 *   documentation: { ... }
 * }
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
      departamentoResidenciaId,
      provinciaResidenciaId,
      zona,
      observaciones,
      // Datos de discapacidad
      tipoDiscapacidadId,
      gradoDiscapacidad,
      descripcion,
      // Datos de origen
      paisId,
      ciudadNacimiento,
      idiomaMaternoId,
      idiomaSecundarioId,
      tipoOrigen,
      // Arrays y objetos
      contactosEmergencia,
      documentacion,
      // Datos académicos
      careerId,
      managementId,
      academicState,
      registrationState,
      previousSchool,
      highSchoolGraduationYear,
      annualAverage,
      graduationDate,
      withdrawalDate,
      withdrawalReason,
      photoUrl,
    } = body;

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
      bloodType: tipoSangre,
      hasDisability: tieneDiscapacidad,
      personalEmail: emailPersonal,
      mobilePhone: celular,
      landlinePhone: telefonoFijo,
      address: direccion,
      residenceMunicipalityId: municipioResidenciaId,
      zone: zona,
      observations: observaciones,
    };

    // 2. Datos académicos (opcional)
    const academicData =
      careerId ||
      managementId ||
      academicState ||
      registrationState ||
      previousSchool ||
      highSchoolGraduationYear ||
      annualAverage ||
      graduationDate ||
      withdrawalDate ||
      withdrawalReason ||
      photoUrl
        ? {
            careerId,
            managementId,
            academicState,
            registrationState,
            previousSchool,
            highSchoolGraduationYear,
            annualAverage,
            graduationDate,
            withdrawalDate,
            withdrawalReason,
            photoUrl,
          }
        : null;

    // 3. Discapacidades (array, opcional)
    const disabilities =
      tieneDiscapacidad && tipoDiscapacidadId
        ? [
            {
              disabilityTypeId: tipoDiscapacidadId,
              description: descripcion,
              disabilityDegree: gradoDiscapacidad,
            },
          ]
        : [];

    // 4. Orígenes (array, opcional)
    // IMPORTANTE: tipoOrigen puede ser 0 (BOLIVIANA), que es falsy, por lo que debemos verificar explícitamente !== undefined
    const hasOriginData = paisId || ciudadNacimiento || idiomaMaternoId || idiomaSecundarioId || (tipoOrigen !== undefined && tipoOrigen !== null);
    const origins = hasOriginData
        ? [
            {
              countryId: paisId,
              birthMunicipalityId: municipioResidenciaId, // Se usa el mismo que residencia si no hay uno específico
              birthCity: ciudadNacimiento,
              motherTongueId: idiomaMaternoId,
              secondaryLanguageId: idiomaSecundarioId,
              originType: tipoOrigen, // Puede ser 0, 1, 2 o string del ENUM
              isPrincipal: true, // Asumimos que el primer origen es principal
            },
          ]
        : [];

    // 5. Apoderados/Contactos de emergencia (array, opcional)
    // El frontend ya envía contactosEmergencia como array, pero necesitamos transformar
    // los nombres de campos del frontend a los que espera el use case
    const guardians = Array.isArray(contactosEmergencia)
      ? contactosEmergencia.map((contacto) => ({
          relationshipTypeId: contacto.tipoParentescoId,
          firstName: contacto.nombres,
          lastName: contacto.apellidos,
          ci: contacto.ci,
          phone: contacto.telefono,
          mobilePhone: contacto.celular,
          email: contacto.email,
          occupation: contacto.ocupacion,
          workplace: contacto.lugarTrabajo,
          address: contacto.direccion,
          isEmergencyContact: contacto.esContactoEmergencia ?? true,
          isLegalGuardian: contacto.esApoderadoLegal ?? false,
          livesWithStudent: contacto.viveConEstudiante ?? false,
          observations: contacto.observaciones,
        }))
      : [];

    // 6. Documentación (objeto, opcional)
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
            esOriginal: docData.es_original ?? false, // Frontend envía snake_case, use case espera camelCase
            fechaEntrega: docData.fechaEntrega || null,
            fechaVencimientoTramite: docData.fechaVencimientoTramite || null,
            observaciones: docData.observaciones || null,
          };
        }
      }
    }

    return {
      student,
      academicData,
      guardians,
      disabilities,
      origins,
      documentation,
    };
  }
}

