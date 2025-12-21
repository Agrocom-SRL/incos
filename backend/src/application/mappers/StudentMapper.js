/**
 * Mapper: StudentMapper
 * Convierte entre nombres en castellano (presentación/API) y nombres en inglés (dominio)
 * 
 * Mapeo:
 * - Castellano (API/Presentación) <-> Inglés (Dominio)
 */
export class StudentMapper {
  /**
   * Convierte datos en castellano (del request) a formato de dominio (inglés)
   * @param {Object} dataCastellano - Datos con nombres en castellano (puede ser el objeto completo del DTO)
   * @returns {Object} - Datos con nombres en inglés para la entidad
   */
  static toDomain(dataCastellano) {
    const result = {};
    
    // Identificación
    // IMPORTANTE: Incluir null también para permitir limpiar campos
    if (dataCastellano.ci !== undefined) result.ci = dataCastellano.ci;
    if (dataCastellano.expedicion !== undefined) result.expedition = dataCastellano.expedicion;
    if (dataCastellano.codigoEstudiante !== undefined) result.codigoEstudiante = dataCastellano.codigoEstudiante;
    
    // Datos personales
    // IMPORTANTE: Incluir null también para permitir limpiar campos
    if (dataCastellano.nombres !== undefined) result.firstName = dataCastellano.nombres;
    if (dataCastellano.apellidoPaterno !== undefined) result.lastName = dataCastellano.apellidoPaterno;
    if (dataCastellano.apellidoMaterno !== undefined) result.motherLastName = dataCastellano.apellidoMaterno;
    if (dataCastellano.fechaNacimiento !== undefined) result.birthDate = dataCastellano.fechaNacimiento;
    if (dataCastellano.genero !== undefined) result.gender = dataCastellano.genero;
    if (dataCastellano.estadoCivilId !== undefined) result.civilStatusId = dataCastellano.estadoCivilId;
    if (dataCastellano.nacionalidad !== undefined) result.nationality = dataCastellano.nacionalidad;
    if (dataCastellano.municipioNacimientoId !== undefined) result.birthMunicipalityId = dataCastellano.municipioNacimientoId;
    if (dataCastellano.ciudadNacimiento !== undefined) result.birthCity = dataCastellano.ciudadNacimiento;
    if (dataCastellano.idiomaNatalId !== undefined) result.nativeLanguageId = dataCastellano.idiomaNatalId;
    if (dataCastellano.tipoSangre !== undefined) result.bloodType = dataCastellano.tipoSangre;
    if (dataCastellano.tieneDiscapacidad !== undefined) result.hasDisability = dataCastellano.tieneDiscapacidad;
    if (dataCastellano.tipoDiscapacidadId !== undefined) result.disabilityTypeId = dataCastellano.tipoDiscapacidadId;
    // TODO: Descomentar cuando se confirme la estructura de la base de datos
    // if (dataCastellano.gradoInvalidez !== undefined) result.disabilityDegree = dataCastellano.gradoInvalidez;
    // if (dataCastellano.detallesDiscapacidad !== undefined) result.disabilityDetails = dataCastellano.detallesDiscapacidad;
    
    // Contacto
    if (dataCastellano.emailPersonal !== undefined) result.personalEmail = dataCastellano.emailPersonal;
    if (dataCastellano.celular !== undefined) result.mobilePhone = dataCastellano.celular;
    if (dataCastellano.telefonoFijo !== undefined) result.landlinePhone = dataCastellano.telefonoFijo;
    if (dataCastellano.direccion !== undefined) result.address = dataCastellano.direccion;
    if (dataCastellano.municipioResidenciaId !== undefined) result.residenceMunicipalityId = dataCastellano.municipioResidenciaId;
    if (dataCastellano.zona !== undefined) result.zone = dataCastellano.zona;
    
    // Observaciones
    if (dataCastellano.observaciones !== undefined) result.observations = dataCastellano.observaciones;
    
    // Otros
    if (dataCastellano.usuarioId !== undefined) result.userId = dataCastellano.usuarioId;
    if (dataCastellano.activo !== undefined) result.activo = dataCastellano.activo;
    
    return result;
  }

  /**
   * Convierte datos en formato de dominio (inglés) a castellano (para response)
   * @param {Object} dataDominio - Datos con nombres en inglés de la entidad
   * @returns {Object} - Datos con nombres en castellano para la API
   */
  static toPresentation(dataDominio) {
    return {
      // Identificación
      id: dataDominio.id,
      codigoEstudiante: dataDominio.studentCode,
      ci: dataDominio.ci,
      expedicion: dataDominio.expedition,
      ciCompleto: dataDominio.ci && dataDominio.expedition 
        ? `${dataDominio.ci}-${dataDominio.expedition}` 
        : null,
      
      // Datos personales
      nombres: dataDominio.firstName,
      apellidoPaterno: dataDominio.lastName,
      apellidoMaterno: dataDominio.motherLastName,
      nombreCompleto: dataDominio.getFullName ? dataDominio.getFullName() : null,
      fechaNacimiento: dataDominio.birthDate,
      genero: dataDominio.gender,
      estadoCivilId: dataDominio.civilStatusId,
      nacionalidad: dataDominio.nationality,
      municipioNacimientoId: dataDominio.birthMunicipalityId,
      ciudadNacimiento: dataDominio.birthCity,
      idiomaNatalId: dataDominio.nativeLanguageId,
      tipoSangre: dataDominio.bloodType,
      tieneDiscapacidad: dataDominio.hasDisability,
      tipoDiscapacidadId: dataDominio.disabilityTypeId,
      // TODO: Descomentar cuando se confirme la estructura de la base de datos
      // gradoInvalidez: dataDominio.disabilityDegree,
      // detallesDiscapacidad: dataDominio.disabilityDetails,
      
      // Contacto
      emailPersonal: dataDominio.personalEmail,
      celular: dataDominio.mobilePhone,
      telefonoFijo: dataDominio.landlinePhone,
      direccion: dataDominio.address,
      municipioResidenciaId: dataDominio.residenceMunicipalityId,
      zona: dataDominio.zone,
      
      // Observaciones
      observaciones: dataDominio.observations,
      
      // Estado y auditoría
      activo: dataDominio.activo,
      createdAt: dataDominio.createdAt,
      updatedAt: dataDominio.updatedAt,
    };
  }

  /**
   * Convierte una entidad Student a formato de presentación
   * @param {Student} student - Entidad Student
   * @returns {Object} - Objeto con nombres en castellano
   */
  static entityToPresentation(student) {
    if (!student) return null;
    
    return {
      id: student.id,
      codigoEstudiante: student.studentCode,
      ci: student.ci,
      expedicion: student.expedition,
      ciCompleto: student.ci && student.expedition 
        ? `${student.ci}-${student.expedition}` 
        : null,
      nombres: student.firstName,
      apellidoPaterno: student.lastName,
      apellidoMaterno: student.motherLastName,
      nombreCompleto: student.getFullName ? student.getFullName() : null,
      fechaNacimiento: student.birthDate,
      genero: student.gender,
      estadoCivilId: student.civilStatusId,
      nacionalidad: student.nationality,
      municipioNacimientoId: student.birthMunicipalityId,
      ciudadNacimiento: student.birthCity,
      idiomaNatalId: student.nativeLanguageId,
      tipoSangre: student.bloodType,
      tieneDiscapacidad: student.hasDisability,
      tipoDiscapacidadId: student.disabilityTypeId,
      // TODO: Descomentar cuando se confirme la estructura de la base de datos
      // gradoInvalidez: student.disabilityDegree,
      // detallesDiscapacidad: student.disabilityDetails,
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
    };
  }

  /**
   * Convierte un array de entidades a formato de presentación
   * @param {Student[]} students - Array de entidades Student
   * @returns {Object[]} - Array de objetos con nombres en castellano
   */
  static entitiesToPresentation(students) {
    if (!Array.isArray(students)) return [];
    return students.map((student) => this.entityToPresentation(student));
  }
}

