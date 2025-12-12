import { StudentMapper } from '../../mappers/StudentMapper.js';

/**
 * DTO: RegisterStudentDTO
 * Data Transfer Object para el registro de un nuevo estudiante
 * Recibe datos en castellano del request y los convierte a formato de dominio (inglés)
 * Solo incluye datos básicos del estudiante (sin datos académicos, becas, etc.)
 */
export class RegisterStudentDTO {
  constructor(data) {
    // El DTO recibe datos en castellano del request
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
    this.tieneDiscapacidad = data.tieneDiscapacidad !== undefined ? data.tieneDiscapacidad : false;
    this.tipoDiscapacidadId = data.tipoDiscapacidadId;

    // Contacto
    this.emailPersonal = data.emailPersonal;
    this.celular = data.celular;
    this.telefonoFijo = data.telefonoFijo;
    this.direccion = data.direccion;
    this.municipioResidenciaId = data.municipioResidenciaId;
    this.zona = data.zona;

    // Observaciones
    this.observaciones = data.observaciones;
  }

  /**
   * Crea un DTO desde el request HTTP (datos en castellano)
   * @param {Object} req - Express request
   * @returns {RegisterStudentDTO}
   */
  static fromRequest(req) {
    return new RegisterStudentDTO(req.body);
  }

  /**
   * Convierte el DTO (castellano) a formato de entidad Student (inglés)
   * @returns {Object}
   */
  toEntityData() {
    // Pasa el objeto completo, el mapper se encarga de mapear solo los campos que existen
    return StudentMapper.toDomain(this);
  }
}
