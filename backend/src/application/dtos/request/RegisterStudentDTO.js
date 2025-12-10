/**
 * DTO: RegisterStudentDTO
 * Data Transfer Object para el registro de un nuevo estudiante
 */
export class RegisterStudentDTO {
  constructor(data) {
    // Datos personales básicos
    this.nombres = data.nombres;
    this.apellidoPaterno = data.apellidoPaterno;
    this.apellidoMaterno = data.apellidoMaterno;
    this.ci = data.ci;
    this.expedicion = data.expedicion;
    this.fechaNacimiento = data.fechaNacimiento;
    this.genero = data.genero;
    this.estadoCivilId = data.estadoCivilId;
    this.nacionalidad = data.nacionalidad || 'Boliviana';
    this.municipioNacimientoId = data.municipioNacimientoId;
    this.ciudadNacimiento = data.ciudadNacimiento;
    this.idiomaNatalId = data.idiomaNatalId;
    this.tipoSangre = data.tipoSangre;
    this.tieneDiscapacidad = data.tieneDiscapacidad || false;
    this.tipoDiscapacidadId = data.tipoDiscapacidadId;

    // Contacto
    this.emailPersonal = data.emailPersonal;
    this.celular = data.celular;
    this.telefonoFijo = data.telefonoFijo;
    this.direccion = data.direccion;
    this.municipioResidenciaId = data.municipioResidenciaId;
    this.zona = data.zona;

    // Datos académicos
    this.carreraId = data.carreraId;
    this.gestionIngresoId = data.gestionIngresoId;
    this.unidadEducativaProcedencia = data.unidadEducativaProcedencia;
    this.anioEgresoSecundaria = data.anioEgresoSecundaria;
    this.promedioAnual = data.promedioAnual;

    // Becas
    this.becaDescuentoId = data.becaDescuentoId;
    this.becaMotivo = data.becaMotivo;

    // Observaciones
    this.observaciones = data.observaciones;
  }

  /**
   * Crea un DTO desde el request HTTP
   * @param {Object} req - Express request
   * @returns {RegisterStudentDTO}
   */
  static fromRequest(req) {
    return new RegisterStudentDTO(req.body);
  }

  /**
   * Convierte el DTO a objeto plano para persistencia
   * @returns {Object}
   */
  toPlainObject() {
    return {
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
      emailPersonal: this.emailPersonal,
      celular: this.celular,
      telefonoFijo: this.telefonoFijo,
      direccion: this.direccion,
      municipioResidenciaId: this.municipioResidenciaId,
      zona: this.zona,
      observaciones: this.observaciones,
    };
  }
}
