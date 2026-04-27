/**
 * Mapea el cuerpo JSON del API (campos en español / snake del front) al objeto de dominio
 * esperado por TeacherMapper.toModel / toModelForUpdate.
 *
 * @param {Object} body
 * @returns {Object}
 */
export function teacherDomainFromApiBody(body = {}) {
  const exp = body.expedicion != null && String(body.expedicion).trim() !== ''
    ? String(body.expedicion).trim().toUpperCase()
    : 'LP';

  const apPat = body.apellidoPaterno != null && String(body.apellidoPaterno).trim() !== ''
    ? String(body.apellidoPaterno).trim()
    : '-';

  return {
    ci: String(body.ci ?? '').trim(),
    expedition: exp,
    firstName: String(body.nombres ?? '').trim(),
    lastName: apPat,
    motherLastName: body.apellidoMaterno != null && String(body.apellidoMaterno).trim() !== ''
      ? String(body.apellidoMaterno).trim()
      : null,
    birthDate: body.fechaNacimiento ?? null,
    gender: body.genero,
    civilStatusId: body.estadoCivilId ?? null,
    nationality: body.nacionalidad != null && String(body.nacionalidad).trim() !== ''
      ? String(body.nacionalidad).trim()
      : 'Boliviana',
    phone: body.telefono != null && String(body.telefono).trim() !== '' ? String(body.telefono).trim() : null,
    mobilePhone: String(body.celular ?? '').trim(),
    personalEmail: body.emailPersonal != null && String(body.emailPersonal).trim() !== ''
      ? String(body.emailPersonal).trim()
      : null,
    address: body.direccion != null && String(body.direccion).trim() !== '' ? String(body.direccion).trim() : null,
    residenceMunicipalityId: body.municipioResidenciaId ?? null,
    zone: body.zona != null && String(body.zona).trim() !== '' ? String(body.zona).trim() : null,
    professionalTitle: body.tituloProfesional != null && String(body.tituloProfesional).trim() !== ''
      ? String(body.tituloProfesional).trim()
      : null,
    specialty: body.especialidad != null && String(body.especialidad).trim() !== ''
      ? String(body.especialidad).trim()
      : null,
    academicLevel: body.nivelAcademico || 'LICENCIATURA',
    graduationInstitution: body.institucionEgreso != null && String(body.institucionEgreso).trim() !== ''
      ? String(body.institucionEgreso).trim()
      : null,
    graduationYear: body.anioEgreso ?? null,
    yearsOfExperience: body.aniosExperiencia ?? 0,
    hireDate: body.fechaContratacion ?? null,
    retirementDate: body.fechaRetiro ?? null,
    contractType: body.tipoContrato || 'CONTRATO',
    laborState: body.estadoLaboral || 'ACTIVO',
    observations: body.observaciones != null && String(body.observaciones).trim() !== ''
      ? String(body.observaciones).trim()
      : null,
    active: body.activo !== false,
  };
}
