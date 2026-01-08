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

  // Mapear discapacidades
  if (disabilities && disabilities.length > 0) {
    const primeraDiscapacidad = disabilities[0];
    formData.tipoDiscapacidadId = primeraDiscapacidad.disabilityTypeId || null;
    formData.gradoDiscapacidad = primeraDiscapacidad.disabilityDegree || null;
    formData.descripcion = primeraDiscapacidad.description || '';
  }

  // Mapear orígenes (tomar el primero si hay múltiples)
  if (origins && origins.length > 0) {
    const primerOrigen = origins[0];
    formData.paisId = primerOrigen.countryId || null;
    formData.ciudadNacimiento = primerOrigen.birthCity || '';
    formData.municipioNacimientoId = primerOrigen.birthMunicipalityId || null;
    formData.idiomaMaternoId = primerOrigen.motherTongueId || null;
    formData.idiomaSecundarioId = primerOrigen.secondaryLanguageId || null;
    formData.tipoOrigen = primerOrigen.originType || null;
  }

  // Mapear contactos de emergencia/apoderados
  if (guardians && guardians.length > 0) {
    formData.contactosEmergencia = guardians.map((guardian) => ({
      tipoParentescoId: guardian.relationshipTypeId || null,
      nombres: guardian.firstName || '',
      apellidos: guardian.lastName || '',
      ci: guardian.ci || '',
      telefono: guardian.phone || '',
      email: guardian.email || '',
      ocupacion: guardian.occupation || '',
      lugarTrabajo: guardian.workplace || '',
      direccion: guardian.address || '',
      esContactoEmergencia: guardian.isEmergencyContact !== undefined ? guardian.isEmergencyContact : true,
      viveConEstudiante: guardian.livesWithStudent !== undefined ? guardian.livesWithStudent : false,
      observaciones: guardian.observations || '',
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
        es_original: delivery.esOriginal !== undefined ? delivery.esOriginal : false,
        fechaEntrega: delivery.fechaEntrega || null,
        fechaVencimientoTramite: delivery.fechaVencimientoTramite || null,
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

