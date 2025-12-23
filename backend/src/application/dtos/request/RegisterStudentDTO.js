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
    this.tipoSangre = data.tipoSangre;
    
    // Discapacidades: soporta nuevo formato (array) y formato antiguo (campos individuales)
    // Formato nuevo: discapacidades = [{ tipoDiscapacidadId: 1, descripcion: "..." }, ...]
    // Formato antiguo: tieneDiscapacidad = true, tipoDiscapacidadId = 1, detallesDiscapacidad = "..."
    this.discapacidades = [];
    
    if (data.discapacidades && Array.isArray(data.discapacidades)) {
      // Formato nuevo: array de discapacidades
      this.discapacidades = data.discapacidades
        .filter(d => d && d.tipoDiscapacidadId)
        .map(d => ({
          tipoDiscapacidadId: typeof d.tipoDiscapacidadId === 'string' 
            ? parseInt(d.tipoDiscapacidadId, 10) 
            : d.tipoDiscapacidadId,
          descripcion: d.descripcion || d.detallesDiscapacidad || null,
          gradoDiscapacidad: d.gradoDiscapacidad || d.gradoInvalidez || null,
          causa: d.causa || null,
        }))
        .filter(d => !isNaN(d.tipoDiscapacidadId) && d.tipoDiscapacidadId > 0);
    } else if (data.tieneDiscapacidad && data.tipoDiscapacidadId) {
      // Formato antiguo: convertir a formato nuevo
      const tipoDiscapacidadId = typeof data.tipoDiscapacidadId === 'string' 
        ? parseInt(data.tipoDiscapacidadId, 10) 
        : data.tipoDiscapacidadId;
      
      if (!isNaN(tipoDiscapacidadId) && tipoDiscapacidadId > 0) {
        this.discapacidades = [{
          tipoDiscapacidadId,
          descripcion: data.detallesDiscapacidad || data.descripcion || null,
          gradoDiscapacidad: data.gradoInvalidez || data.gradoDiscapacidad || null,
          causa: data.causa || null,
        }];
      }
    }
    
    // Mantener compatibilidad con formato antiguo
    this.tieneDiscapacidad = this.discapacidades.length > 0;

    // Orígenes: procesar datos de origen geográfico y nacionalidad
    // Formato: origenes = [{ tipoNacionalidad: 'BOLIVIANA'|'EXTRANJERA', paisId?, municipioNacimientoId?, ciudadNacimiento?, idiomaMaternoId?, idiomaSecundarioId? }]
    this.origenes = [];
    
    if (data.origenes && Array.isArray(data.origenes)) {
      // Formato nuevo: array de orígenes
      this.origenes = data.origenes
        .filter(o => o && (o.tipoNacionalidad || o.paisId || o.municipioNacimientoId))
        .map(o => ({
          paisId: o.paisId ? (typeof o.paisId === 'string' ? parseInt(o.paisId, 10) : o.paisId) : null,
          municipioNacimientoId: o.municipioNacimientoId ? (typeof o.municipioNacimientoId === 'string' ? parseInt(o.municipioNacimientoId, 10) : o.municipioNacimientoId) : null,
          ciudadNacimiento: o.ciudadNacimiento || o.ciudadNacimientoExtranjero || null,
          idiomaMaternoId: o.idiomaMaternoId || o.idiomaNatalId ? (typeof (o.idiomaMaternoId || o.idiomaNatalId) === 'string' ? parseInt(o.idiomaMaternoId || o.idiomaNatalId, 10) : (o.idiomaMaternoId || o.idiomaNatalId)) : null,
          idiomaSecundarioId: o.idiomaSecundarioId ? (typeof o.idiomaSecundarioId === 'string' ? parseInt(o.idiomaSecundarioId, 10) : o.idiomaSecundarioId) : null,
          tipoOrigen: o.tipoOrigen || 'NACIONALIDAD_PRINCIPAL',
          esPrincipal: o.esPrincipal !== undefined ? o.esPrincipal : true,
        }))
        .filter(o => !isNaN(o.paisId || 0) && (o.paisId || o.municipioNacimientoId));
    } else if (data.tipoNacionalidad) {
      // Formato del frontend: tipoNacionalidad = 'BOLIVIANA', 'EXTRANJERA' o 'DOBLE_NACIONALIDAD'
      
      if (data.tipoNacionalidad === 'BOLIVIANA') {
        // Nacionalidad boliviana simple
        const origen = {
          tipoOrigen: 'NACIONALIDAD_PRINCIPAL',
          esPrincipal: true,
          municipioNacimientoId: data.municipioNacimientoId 
            ? (typeof data.municipioNacimientoId === 'string' ? parseInt(data.municipioNacimientoId, 10) : data.municipioNacimientoId)
            : null,
          ciudadNacimiento: data.ciudadNacimiento || null,
          paisId: null,
          idiomaMaternoId: data.idiomaPrincipalId 
            ? (typeof data.idiomaPrincipalId === 'string' ? parseInt(data.idiomaPrincipalId, 10) : data.idiomaPrincipalId)
            : null,
          idiomaSecundarioId: data.idiomaSecundarioId 
            ? (typeof data.idiomaSecundarioId === 'string' ? parseInt(data.idiomaSecundarioId, 10) : data.idiomaSecundarioId)
            : null,
        };
        if (origen.municipioNacimientoId) {
          this.origenes = [origen];
        }
      } else if (data.tipoNacionalidad === 'EXTRANJERA') {
        // Nacionalidad extranjera simple
        const origen = {
          tipoOrigen: 'NACIONALIDAD_PRINCIPAL',
          esPrincipal: true,
          paisId: data.paisNacimientoId 
            ? (typeof data.paisNacimientoId === 'string' ? parseInt(data.paisNacimientoId, 10) : data.paisNacimientoId)
            : null,
          ciudadNacimiento: data.ciudadNacimientoExtranjero || data.ciudadNacimiento || null,
          municipioNacimientoId: null,
          idiomaMaternoId: data.idiomaPrincipalId 
            ? (typeof data.idiomaPrincipalId === 'string' ? parseInt(data.idiomaPrincipalId, 10) : data.idiomaPrincipalId)
            : null,
          idiomaSecundarioId: data.idiomaSecundarioId 
            ? (typeof data.idiomaSecundarioId === 'string' ? parseInt(data.idiomaSecundarioId, 10) : data.idiomaSecundarioId)
            : null,
        };
        if (origen.paisId) {
          this.origenes = [origen];
        }
      } else if (data.tipoNacionalidad === 'DOBLE_NACIONALIDAD') {
        // Doble nacionalidad: crear dos orígenes
        
        // Primera nacionalidad
        const primeraOrigen = {
          tipoOrigen: 'NACIONALIDAD_PRINCIPAL',
          esPrincipal: true,
          idiomaMaternoId: data.idiomaPrincipalId 
            ? (typeof data.idiomaPrincipalId === 'string' ? parseInt(data.idiomaPrincipalId, 10) : data.idiomaPrincipalId)
            : null,
          idiomaSecundarioId: data.idiomaSecundarioId 
            ? (typeof data.idiomaSecundarioId === 'string' ? parseInt(data.idiomaSecundarioId, 10) : data.idiomaSecundarioId)
            : null,
        };
        
        if (data.primeraNacionalidadTipo === 'BOLIVIANA') {
          primeraOrigen.municipioNacimientoId = data.primeraNacionalidadMunicipioId 
            ? (typeof data.primeraNacionalidadMunicipioId === 'string' ? parseInt(data.primeraNacionalidadMunicipioId, 10) : data.primeraNacionalidadMunicipioId)
            : null;
          primeraOrigen.ciudadNacimiento = data.primeraNacionalidadLocalidad || null;
          primeraOrigen.paisId = null;
        } else if (data.primeraNacionalidadTipo === 'EXTRANJERA') {
          primeraOrigen.paisId = data.primeraNacionalidadPaisId 
            ? (typeof data.primeraNacionalidadPaisId === 'string' ? parseInt(data.primeraNacionalidadPaisId, 10) : data.primeraNacionalidadPaisId)
            : null;
          primeraOrigen.ciudadNacimiento = data.primeraNacionalidadCiudad || null;
          primeraOrigen.municipioNacimientoId = null;
        }
        
        if (primeraOrigen.paisId || primeraOrigen.municipioNacimientoId) {
          this.origenes.push(primeraOrigen);
        }
        
        // Segunda nacionalidad
        const segundaOrigen = {
          tipoOrigen: 'NACIONALIDAD_SECUNDARIA',
          esPrincipal: false,
          // Los idiomas se asocian con la primera nacionalidad (principal)
          idiomaMaternoId: null,
          idiomaSecundarioId: null,
        };
        
        if (data.segundaNacionalidadTipo === 'BOLIVIANA') {
          segundaOrigen.municipioNacimientoId = data.segundaNacionalidadMunicipioId 
            ? (typeof data.segundaNacionalidadMunicipioId === 'string' ? parseInt(data.segundaNacionalidadMunicipioId, 10) : data.segundaNacionalidadMunicipioId)
            : null;
          segundaOrigen.ciudadNacimiento = data.segundaNacionalidadLocalidad || null;
          segundaOrigen.paisId = null;
        } else if (data.segundaNacionalidadTipo === 'EXTRANJERA') {
          segundaOrigen.paisId = data.segundaNacionalidadPaisId 
            ? (typeof data.segundaNacionalidadPaisId === 'string' ? parseInt(data.segundaNacionalidadPaisId, 10) : data.segundaNacionalidadPaisId)
            : null;
          segundaOrigen.ciudadNacimiento = data.segundaNacionalidadCiudad || null;
          segundaOrigen.municipioNacimientoId = null;
        }
        
        if (segundaOrigen.paisId || segundaOrigen.municipioNacimientoId) {
          this.origenes.push(segundaOrigen);
        }
      }
    }

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
