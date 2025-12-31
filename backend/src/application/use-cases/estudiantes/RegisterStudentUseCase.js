import { Student } from '../../../domain/entities/Student.js';
import { ValidationError } from '../../../shared/AppError.js';
import { StudentValidator } from '../../validators/StudentValidator.js';
import { StudentCodeGenerator } from '../../../domain/services/StudentCodeGenerator.js';

/**
 * Use Case: RegisterStudentUseCase
 * Módulo: Estudiantes
 * Implementa el caso de uso básico: Registrar Estudiante Nuevo
 * 
 * Solo registra los datos básicos del estudiante (sin datos académicos, becas, etc.)
 */
export class RegisterStudentUseCase {
  constructor({
    studentRepository,
    studentAcademicDataRepository,
    studentDocumentRepository,
    studentDocumentDeliveryRepository,
    studentDisabilityRepository,
    studentOriginRepository,
    studentGuardianRepository,
    documentacionRepository,
    configuracionSistemaRepository,
    managementRepository,
    generateCompromisoActaUseCase,
    logger,
  }) {
    this.studentRepository = studentRepository;
    this.studentAcademicDataRepository = studentAcademicDataRepository;
    this.studentDocumentRepository = studentDocumentRepository;
    this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
    this.studentDisabilityRepository = studentDisabilityRepository;
    this.studentOriginRepository = studentOriginRepository;
    this.studentGuardianRepository = studentGuardianRepository;
    this.documentacionRepository = documentacionRepository;
    this.configuracionSistemaRepository = configuracionSistemaRepository;
    this.managementRepository = managementRepository;
    this.generateCompromisoActaUseCase = generateCompromisoActaUseCase;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso
   * @param {RegisterStudentDTO} dto - DTO con datos en castellano
   * @param {number} userId - ID del usuario que realiza la operación
   * @returns {Promise<Student>}
   */
  async execute(dto, userId) {
    this.logger.info('[Estudiantes] Iniciando registro de estudiante', { 
      ci: dto.ci, 
      expedicion: dto.expedicion 
    });

    // 1. Validar reglas de negocio (CI único, email único)
    await StudentValidator.validateBusinessRules(dto, this.studentRepository);

    // 2. Convertir DTO a datos de entidad
    const studentData = dto.toEntityData();

    // 3. Crear entidad de dominio
    const student = new Student(studentData);

    // 4. Validar edad mínima (17 años)
    if (!student.hasMinimumAge()) {
      throw new ValidationError('El estudiante debe tener al menos 17 años de edad');
    }

    // 5. Validar formato de CI
    if (!student.isValidCI()) {
      throw new ValidationError('El CI debe tener entre 7 y 9 dígitos');
    }

    // 6. Validar formato de expedición
    if (!student.isValidExpedition()) {
      throw new ValidationError('La expedición del CI es inválida');
    }

    // 7. Validar formato de email si se proporciona
    if (dto.emailPersonal && !student.isValidEmail()) {
      throw new ValidationError('El formato del email es inválido');
    }

    // 8. Generar código único de estudiante usando año de gestión + correlativo
    let anioGestion = null;
    
    // Prioridad 1: Si hay gestión de ingreso, obtener el año de esa gestión
    if (dto.gestionIngresoId) {
      try {
        const gestion = await this.managementRepository.findById(dto.gestionIngresoId);
        if (gestion && gestion.year) {
          anioGestion = gestion.year;
          this.logger.info('[Estudiantes] Gestión encontrada para código de estudiante', {
            gestionId: dto.gestionIngresoId,
            anio: gestion.year,
          });
        }
      } catch (error) {
        this.logger.warn('[Estudiantes] No se pudo obtener la gestión', {
          gestionId: dto.gestionIngresoId,
          error: error.message,
        });
      }
    }
    
    // Prioridad 2: Si no hay gestión de ingreso, usar la gestión activa de configuración
    if (!anioGestion) {
      try {
        const gestionActiva = await this.configuracionSistemaRepository.findByClave(
          'codigo_estudiante_gestion_activa',
          { includeInactive: false }
        );
        if (gestionActiva && gestionActiva.valor) {
          anioGestion = parseInt(gestionActiva.valor, 10);
          this.logger.info('[Estudiantes] Usando gestión activa de configuración', {
            anio: anioGestion,
          });
        }
      } catch (error) {
        this.logger.warn('[Estudiantes] No se pudo obtener gestión activa de configuración', {
          error: error.message,
        });
      }
    }
    
    // Prioridad 3: Fallback al año actual
    if (!anioGestion) {
      anioGestion = new Date().getFullYear();
      this.logger.info('[Estudiantes] Usando año actual como fallback', {
        anio: anioGestion,
      });
    }

    // Obtener o crear configuración de correlativo para esta gestión
    const claveCorrelativo = `codigo_estudiante_correlativo_${anioGestion}`;
    let configCorrelativo = await this.configuracionSistemaRepository.findByClave(claveCorrelativo, { includeInactive: true });
    
    if (!configCorrelativo) {
      // Crear configuración inicial con correlativo 0
      configCorrelativo = await this.configuracionSistemaRepository.findOrCreate(
        claveCorrelativo,
        '0',
        'NUMBER',
        `Último número correlativo usado para códigos de estudiantes en la gestión ${anioGestion}`,
        'CODIGOS_ESTUDIANTE',
        userId
      );
      this.logger.info('[Estudiantes] Configuración de correlativo creada', {
        clave: claveCorrelativo,
        anio: anioGestion,
      });
    }

    // Incrementar correlativo
    const nuevoCorrelativo = await this.configuracionSistemaRepository.incrementValue(claveCorrelativo, 1, userId);
    const correlativo = parseInt(nuevoCorrelativo.valor, 10);

    // Generar código de estudiante
    student.studentCode = StudentCodeGenerator.generate(anioGestion, correlativo);
    
    this.logger.info('[Estudiantes] Código de estudiante generado', {
      codigo: student.studentCode,
      anio: anioGestion,
      correlativo,
    });

    // 9. Persistir estudiante
    const savedStudent = await this.studentRepository.create(student, userId);

    // 10. Crear discapacidades si se proporcionan
    if (dto.discapacidades && dto.discapacidades.length > 0) {
      await this.studentDisabilityRepository.createMultiple(
        savedStudent.id,
        dto.discapacidades,
        userId
      );
      
      this.logger.info('[Estudiantes] Discapacidades registradas', {
        estudianteId: savedStudent.id,
        totalDiscapacidades: dto.discapacidades.length,
        discapacidades: dto.discapacidades.map(d => ({
          tipoDiscapacidadId: d.tipoDiscapacidadId,
          tieneDescripcion: !!d.descripcion,
        })),
      });
    }

    // 10.5. Crear orígenes si se proporcionan
    if (dto.origenes && dto.origenes.length > 0) {
      await this.studentOriginRepository.createMultiple(
        savedStudent.id,
        dto.origenes,
        userId
      );
      
      this.logger.info('[Estudiantes] Orígenes registrados', {
        estudianteId: savedStudent.id,
        totalOrigenes: dto.origenes.length,
        origenes: dto.origenes.map(o => ({
          tipoOrigen: o.tipoOrigen,
          esPrincipal: o.esPrincipal,
          tienePais: !!o.paisId,
          tieneMunicipio: !!o.municipioNacimientoId,
        })),
      });
    }

    // 11. Crear contactos de emergencia si se proporcionan
    if (dto.contactosEmergencia && dto.contactosEmergencia.length > 0) {
      const contactosData = dto.contactosEmergencia.map(contacto => ({
        studentId: savedStudent.id,
        relationshipTypeId: contacto.tipoParentescoId,
        firstName: contacto.nombres,
        lastName: contacto.apellidos,
        ci: contacto.ci,
        phone: contacto.telefono,
        mobilePhone: contacto.celular,
        email: contacto.email,
        address: contacto.direccion,
        occupation: contacto.ocupacion,
        workplace: contacto.lugarTrabajo,
        isEmergencyContact: contacto.esContactoEmergencia,
        isLegalGuardian: contacto.esApoderadoLegal,
        livesWithStudent: contacto.viveConEstudiante,
        observations: contacto.observaciones,
      }));

      // Crear cada contacto usando el repositorio
      for (const contactoData of contactosData) {
        await this.studentGuardianRepository.create(contactoData, userId);
      }
      
      this.logger.info('[Estudiantes] Contactos de emergencia registrados', {
        estudianteId: savedStudent.id,
        totalContactos: dto.contactosEmergencia.length,
        contactos: dto.contactosEmergencia.map(c => ({
          tipoParentescoId: c.tipoParentescoId,
          nombres: c.nombres,
          esContactoEmergencia: c.esContactoEmergencia,
          esApoderadoLegal: c.esApoderadoLegal,
        })),
      });
    }

    // 11. Validar documentos usando la tabla documentacion
    // Obtener documentos requeridos de tipo INSCRIPCION
    const documentosRequeridos = await this.documentacionRepository.findRequeridos({
      tipoDocumento: 'INSCRIPCION',
      includeInactive: false,
    });

    this.logger.info('[Estudiantes] Documentos requeridos encontrados', {
      total: documentosRequeridos.length,
      documentos: documentosRequeridos.map(doc => ({
        id: doc.id,
        name: doc.name,
        activo: doc.activo,
        requerido: doc.required,
      })),
    });

    // Validar que los documentos requeridos estén presentes
    // Solo validar si NO es un guardado parcial (skipDocumentValidation = false)
    const documentosEntregados = dto.documentosEntregados || [];
    
    // Normalizar IDs a números para comparación (siempre necesario, incluso en guardado parcial)
    const documentosEntregadosNormalizados = documentosEntregados.map(id => 
      typeof id === 'string' ? parseInt(id, 10) : id
    ).filter(id => !isNaN(id));
    
    this.logger.info('[Estudiantes] Documentos entregados recibidos', {
      documentosEntregados,
      documentosEntregadosNormalizados,
      total: documentosEntregados.length,
      skipDocumentValidation: dto.skipDocumentValidation,
    });
    
    // Si es un guardado parcial, saltar la validación de documentos requeridos
    if (!dto.skipDocumentValidation) {
      const documentosRequeridosIds = documentosRequeridos.map(doc => doc.id);
      
      this.logger.info('[Estudiantes] Comparando documentos requeridos vs entregados', {
        documentosRequeridosIds,
        documentosEntregados,
        documentosEntregadosNormalizados,
        tiposRequeridos: documentosRequeridosIds.map(id => typeof id),
        tiposEntregados: documentosEntregados.map(id => typeof id),
      });
      
      const documentosFaltantes = documentosRequeridosIds.filter(
        docId => !documentosEntregadosNormalizados.includes(docId)
      );

      if (documentosFaltantes.length > 0) {
        // En lugar de lanzar error, generar acta de compromiso
        this.logger.info('[Estudiantes] Documentos faltantes detectados, generando acta de compromiso', {
          estudianteId: savedStudent.id,
          documentosFaltantes,
          totalFaltantes: documentosFaltantes.length,
        });

        // Generar acta de compromiso
        let actaCompromiso = null;
        try {
          const actaResult = await this.generateCompromisoActaUseCase.execute(savedStudent.id, {});
          
          // Leer el archivo PDF y convertirlo a base64
          const fs = await import('fs');
          const pdfBuffer = fs.readFileSync(actaResult.absolutePath);
          const pdfBase64 = pdfBuffer.toString('base64');
          
          actaCompromiso = {
            fileName: actaResult.fileName,
            filePath: actaResult.filePath,
            pdfBase64: pdfBase64,
            documentosFaltantes: documentosRequeridos
              .filter(doc => documentosFaltantes.includes(doc.id))
              .map(doc => doc.name),
          };
          
          this.logger.info('[Estudiantes] Acta de compromiso generada exitosamente', {
            estudianteId: savedStudent.id,
            fileName: actaResult.fileName,
          });
        } catch (actaError) {
          this.logger.error('[Estudiantes] Error al generar acta de compromiso', {
            error: actaError.message,
            stack: actaError.stack,
            estudianteId: savedStudent.id,
          });
          // Continuar con el registro aunque falle la generación del acta
        }

        // Guardar información del acta para retornarla junto con el estudiante
        // No lanzamos error, solo retornamos el estudiante con el acta
        savedStudent.actaCompromiso = actaCompromiso;
      }
    } else {
      this.logger.info('[Estudiantes] Guardado parcial detectado - saltando validación de documentos requeridos');
    }

    // 12. Crear registros de entrega de documentos marcados como entregados
    // IMPORTANTE: Ahora se registra en estudiantes_documentos_entrega (entrega física)
    // Los archivos digitales se suben posteriormente en documentos_estudiante
    const entregasCreadas = [];
    
    this.logger.info('[Estudiantes] Procesando documentos entregados físicamente', {
      documentosEntregados,
      documentosEntregadosNormalizados,
      totalDocumentos: documentosEntregadosNormalizados.length,
    });
    
    // Obtener información de todos los documentos marcados como entregados
    for (const docId of documentosEntregadosNormalizados) {
      const docIdNum = typeof docId === 'string' ? parseInt(docId, 10) : docId;
      
      if (isNaN(docIdNum)) {
        this.logger.warn(`[Estudiantes] ID de documento inválido: ${docId}, saltando`);
        continue;
      }
      
      const documentacion = await this.documentacionRepository.findById(docIdNum);
      
      if (!documentacion) {
        this.logger.warn(`Documentación con ID ${docIdNum} no encontrada o inactiva, saltando`);
        continue;
      }
      
      // Crear registro de entrega física del documento
      const entregaData = {
        studentId: savedStudent.id,
        documentacionId: documentacion.id,
        entregado: true,
        enTramite: false,
        esOriginal: false, // Se actualizará cuando se suba el archivo digital
        fechaEntrega: new Date().toISOString().split('T')[0], // Fecha actual
        observaciones: `Documento marcado como entregado en registro inicial`,
      };
      
      const entrega = await this.studentDocumentDeliveryRepository.create(entregaData, userId);
      entregasCreadas.push(entrega);
      
      this.logger.info(`[Estudiantes] Entrega de documento registrada`, {
        entregaId: entrega.id,
        documentacionId: documentacion.id,
        documentacionNombre: documentacion.name,
      });
    }

    // 13. Calcular estado de registro basado en entregas de documentos
    // Estados: BORRADOR, PENDIENTE, ADMITIDO
    let estadoRegistro = 'BORRADOR'; // Por defecto
    
    // Si tiene todos los documentos requeridos marcados como entregados, es PENDIENTE
    if (entregasCreadas.length >= documentosRequeridos.length) {
      estadoRegistro = 'PENDIENTE';
    }
    
    // TODO: Implementar lógica completa para ADMITIDO
    // Requiere: todos los documentos originales subidos y verificados en documentos_estudiante
    // Por ahora solo se marca como PENDIENTE si tiene todos los documentos requeridos entregados físicamente

    this.logger.info('[Estudiantes] Estudiante registrado exitosamente', {
      id: savedStudent.id,
      codigoEstudiante: savedStudent.studentCode,
      estadoRegistro,
      entregasCreadas: entregasCreadas.length,
    });

    return savedStudent;
  }
}

