/**
 * Entidad de Dominio: Student
 * Contiene la lógica de negocio pura del estudiante
 */
export class Student {
  constructor({
    id,
    codigoEstudiante,
    ci,
    expedicion,
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    fechaNacimiento,
    genero,
    estadoCivilId,
    nacionalidad,
    municipioNacimientoId,
    ciudadNacimiento,
    idiomaNatalId,
    tipoSangre,
    tieneDiscapacidad,
    tipoDiscapacidadId,
    emailPersonal,
    celular,
    telefonoFijo,
    direccion,
    municipioResidenciaId,
    zona,
    observaciones,
    activo = true,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.codigoEstudiante = codigoEstudiante;
    this.ci = ci;
    this.expedicion = expedicion;
    this.nombres = nombres;
    this.apellidoPaterno = apellidoPaterno;
    this.apellidoMaterno = apellidoMaterno;
    this.fechaNacimiento = fechaNacimiento;
    this.genero = genero;
    this.estadoCivilId = estadoCivilId;
    this.nacionalidad = nacionalidad || 'Boliviana';
    this.municipioNacimientoId = municipioNacimientoId;
    this.ciudadNacimiento = ciudadNacimiento;
    this.idiomaNatalId = idiomaNatalId;
    this.tipoSangre = tipoSangre;
    this.tieneDiscapacidad = tieneDiscapacidad || false;
    this.tipoDiscapacidadId = tipoDiscapacidadId;
    this.emailPersonal = emailPersonal;
    this.celular = celular;
    this.telefonoFijo = telefonoFijo;
    this.direccion = direccion;
    this.municipioResidenciaId = municipioResidenciaId;
    this.zona = zona;
    this.observaciones = observaciones;
    this.activo = activo;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Obtiene el nombre completo del estudiante
   * @returns {string}
   */
  get fullName() {
    const apellidos = [this.apellidoPaterno, this.apellidoMaterno]
      .filter((a) => a)
      .join(' ');
    return `${this.nombres} ${apellidos}`.trim();
  }

  /**
   * Obtiene el CI completo (CI-EXPEDICION)
   * @returns {string}
   */
  get ciCompleto() {
    return `${this.ci}-${this.expedicion}`;
  }

  /**
   * Calcula la edad del estudiante
   * @returns {number}
   */
  getAge() {
    if (!this.fechaNacimiento) return null;
    const today = new Date();
    const birthDate = new Date(this.fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Valida si el estudiante tiene la edad mínima requerida (17 años)
   * Regla de negocio: RN-EST-002
   * @returns {boolean}
   */
  hasMinimumAge() {
    const age = this.getAge();
    return age !== null && age >= 17;
  }

  /**
   * Valida el formato del CI
   * @returns {boolean}
   */
  isValidCI() {
    if (!this.ci) return false;
    // CI debe tener entre 7 y 9 dígitos
    return /^\d{7,9}$/.test(this.ci);
  }

  /**
   * Valida el formato de la expedición
   * @returns {boolean}
   */
  isValidExpedicion() {
    if (!this.expedicion) return false;
    const expedicionesValidas = ['SC', 'LP', 'CB', 'TJ', 'BN', 'PD', 'OR', 'PT', 'CH'];
    return expedicionesValidas.includes(this.expedicion.toUpperCase());
  }
}
