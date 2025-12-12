/**
 * Entidad de Dominio: Student
 * Representa un estudiante del sistema
 * Contiene la lógica de negocio pura del estudiante
 * 
 * Single Responsibility: Solo maneja la lógica de negocio del estudiante
 */

export class Student {
  constructor(data = {}) {
    // Datos de identificación
    this.id = data.id || null;
    this.studentCode = data.studentCode || null;
    this.ci = data.ci || null;
    this.expedicion = data.expedicion || null;

    // Datos personales (usando nombres del frontend)
    this.nombres = data.nombres || null;
    this.apellidoPaterno = data.apellidoPaterno || null;
    this.apellidoMaterno = data.apellidoMaterno || null;
    this.fechaNacimiento = data.fechaNacimiento || null;
    this.genero = data.genero || null;
    this.estadoCivilId = data.estadoCivilId || null;
    this.nacionalidad = data.nacionalidad || 'Boliviana';
    this.municipioNacimientoId = data.municipioNacimientoId || null;
    this.ciudadNacimiento = data.ciudadNacimiento || null;
    this.idiomaNatalId = data.idiomaNatalId || null;
    this.tipoSangre = data.tipoSangre || null;
    this.tieneDiscapacidad = data.tieneDiscapacidad !== undefined ? data.tieneDiscapacidad : false;
    this.tipoDiscapacidadId = data.tipoDiscapacidadId || null;

    // Contacto
    this.emailPersonal = data.emailPersonal || null;
    this.celular = data.celular || null;
    this.telefonoFijo = data.telefonoFijo || null;
    this.direccion = data.direccion || null;
    this.municipioResidenciaId = data.municipioResidenciaId || null;
    this.zona = data.zona || null;

    // Datos académicos
    this.carreraId = data.carreraId || null;
    this.gestionIngresoId = data.gestionIngresoId || null;
    this.unidadEducativaProcedencia = data.unidadEducativaProcedencia || null;
    this.anioEgresoSecundaria = data.anioEgresoSecundaria || null;
    this.promedioAnual = data.promedioAnual || null;

    // Becas
    this.becaDescuentoId = data.becaDescuentoId || null;
    this.becaMotivo = data.becaMotivo || null;

    // Observaciones
    this.observaciones = data.observaciones || null;
  }

  /**
   * Obtiene el nombre completo del estudiante
   * @returns {string}
   */
  getFullName() {
    const parts = [this.nombres, this.apellidoPaterno];
    if (this.apellidoMaterno) {
      parts.push(this.apellidoMaterno);
    }
    return parts.filter(Boolean).join(' ');
  }

  /**
   * Calcula la edad del estudiante
   * @returns {number|null}
   */
  getAge() {
    if (!this.fechaNacimiento) return null;
    const today = new Date();
    const birth = new Date(this.fechaNacimiento);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Verifica si el estudiante tiene la edad mínima requerida (17 años)
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
    return /^\d{7,9}$/.test(this.ci);
  }

  /**
   * Valida el formato de la expedición
   * @returns {boolean}
   */
  isValidExpedition() {
    if (!this.expedicion) return false;
    const validExpeditions = ['SC', 'LP', 'CB', 'TJ', 'BN', 'PD', 'OR', 'PT', 'CH'];
    return validExpeditions.includes(this.expedicion);
  }

  /**
   * Valida el formato del género
   * @returns {boolean}
   */
  isValidGender() {
    if (!this.genero) return false;
    const validGenders = ['MASCULINO', 'FEMENINO', 'OTRO'];
    return validGenders.includes(this.genero);
  }

  /**
   * Valida el formato del celular
   * @returns {boolean}
   */
  isValidMobilePhone() {
    if (!this.celular) return false;
    return /^\d{7,8}$/.test(this.celular);
  }

  /**
   * Valida el formato del email
   * @returns {boolean}
   */
  isValidEmail() {
    if (!this.emailPersonal) return true; // Opcional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.emailPersonal);
  }

  /**
   * Valida todos los campos requeridos
   * @returns {{isValid: boolean, errors: string[]}}
   */
  validate() {
    const errors = [];

    if (!this.nombres || this.nombres.trim().length < 2) {
      errors.push('Los nombres son requeridos y deben tener al menos 2 caracteres');
    }

    if (!this.apellidoPaterno || this.apellidoPaterno.trim().length < 2) {
      errors.push('El apellido paterno es requerido y debe tener al menos 2 caracteres');
    }

    if (!this.isValidCI()) {
      errors.push('El CI debe tener entre 7 y 9 dígitos');
    }

    if (!this.isValidExpedition()) {
      errors.push('La expedición es requerida y debe ser válida');
    }

    if (!this.fechaNacimiento) {
      errors.push('La fecha de nacimiento es requerida');
    } else if (!this.hasMinimumAge()) {
      errors.push('El estudiante debe tener al menos 17 años de edad');
    }

    if (!this.isValidGender()) {
      errors.push('El género es requerido y debe ser válido');
    }

    if (!this.isValidMobilePhone()) {
      errors.push('El celular es requerido y debe tener entre 7 y 8 dígitos');
    }

    if (!this.isValidEmail()) {
      errors.push('El email debe tener un formato válido');
    }

    if (this.tieneDiscapacidad && !this.tipoDiscapacidadId) {
      errors.push('El tipo de discapacidad es requerido cuando tiene discapacidad es true');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convierte la entidad a objeto plano para enviar al backend
   * Según RegisterStudentDTO del backend, solo incluye datos básicos (sin académicos ni becas)
   * @param {boolean} includeAcademicData - Si incluir datos académicos (default: false)
   * @returns {Object}
   */
  toPlainObject(includeAcademicData = false) {
    const baseData = {
      // Datos personales básicos (según RegisterStudentDTO)
      nombres: this.nombres,
      apellidoPaterno: this.apellidoPaterno,
      apellidoMaterno: this.apellidoMaterno,
      ci: this.ci,
      expedicion: this.expedicion,
      fechaNacimiento: this.fechaNacimiento,
      genero: this.genero,
      estadoCivilId: this.estadoCivilId,
      nacionalidad: this.nacionalidad,
      municipioNacimientoId: this.municipioNacimientoId,
      ciudadNacimiento: this.ciudadNacimiento,
      idiomaNatalId: this.idiomaNatalId,
      tipoSangre: this.tipoSangre,
      tieneDiscapacidad: this.tieneDiscapacidad,
      tipoDiscapacidadId: this.tipoDiscapacidadId,

      // Contacto
      emailPersonal: this.emailPersonal,
      celular: this.celular,
      telefonoFijo: this.telefonoFijo,
      direccion: this.direccion,
      municipioResidenciaId: this.municipioResidenciaId,
      zona: this.zona,

      // Observaciones
      observaciones: this.observaciones,
    };

    // Solo incluir datos académicos si se solicita explícitamente
    if (includeAcademicData) {
      baseData.carreraId = this.carreraId;
      baseData.gestionIngresoId = this.gestionIngresoId;
      baseData.unidadEducativaProcedencia = this.unidadEducativaProcedencia;
      baseData.anioEgresoSecundaria = this.anioEgresoSecundaria;
      baseData.promedioAnual = this.promedioAnual;
      baseData.becaDescuentoId = this.becaDescuentoId;
      baseData.becaMotivo = this.becaMotivo;
    }

    return baseData;
  }
}

