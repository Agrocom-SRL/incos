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

    // Datos académicos (para estudiantes_datos_academicos)
    this.carreraId = data.carreraId;
    this.gestionIngresoId = data.gestionIngresoId;

    // Flag para indicar si es un guardado parcial (no validar documentos requeridos)
    // Útil cuando el usuario guarda progreso sin completar todos los pasos
    this.skipDocumentValidation = data.skipDocumentValidation === true || data.skipDocumentValidation === 'true';

    // Documentos: array de IDs de documentacion que fueron marcados como entregados
    // El frontend envía campos como documento_{id}_entregado: true
    // Extraemos estos IDs para crear el array
    this.documentosEntregados = [];
    Object.keys(data).forEach(key => {
      if (key.startsWith('documento_') && key.endsWith('_entregado') && data[key] === true) {
        const docIdStr = key.replace('documento_', '').replace('_entregado', '');
        const docId = parseInt(docIdStr, 10);
        // Validar que sea un número válido y positivo
        if (!isNaN(docId) && docId > 0) {
          this.documentosEntregados.push(docId);
        } else {
          console.warn(`[RegisterStudentDTO] No se pudo parsear el ID del documento de la clave: ${key}, valor extraído: ${docIdStr}, docId parseado: ${docId}`);
        }
      }
    });
    
    // También aceptar formato array directo si viene del frontend
    if (data.documentosEntregados && Array.isArray(data.documentosEntregados)) {
      // Normalizar y validar IDs del array directo
      const idsNormalizados = data.documentosEntregados
        .map(id => typeof id === 'string' ? parseInt(id, 10) : id)
        .filter(id => !isNaN(id) && id > 0);
      this.documentosEntregados = [...new Set([...this.documentosEntregados, ...idsNormalizados])];
    }
    
    // Eliminar duplicados y ordenar
    this.documentosEntregados = [...new Set(this.documentosEntregados)].sort((a, b) => a - b);
    
    // Log para debugging
    if (this.documentosEntregados.length > 0) {
      console.log('[RegisterStudentDTO] Documentos entregados extraídos:', {
        documentosEntregados: this.documentosEntregados,
        total: this.documentosEntregados.length,
        camposEncontrados: Object.keys(data).filter(key => 
          key.startsWith('documento_') && key.endsWith('_entregado')
        ),
      });
    }
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
