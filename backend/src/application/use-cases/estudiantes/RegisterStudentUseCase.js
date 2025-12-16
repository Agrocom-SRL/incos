import { Student } from '../../../domain/entities/Student.js';
import { ValidationError } from '../../../shared/AppError.js';
import { StudentValidator } from '../../validators/StudentValidator.js';
import { StudentCodeUtils } from '../../utils/StudentCodeUtils.js';

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
    documentacionRepository,
    logger,
  }) {
    this.studentRepository = studentRepository;
    this.studentAcademicDataRepository = studentAcademicDataRepository;
    this.studentDocumentRepository = studentDocumentRepository;
    this.documentacionRepository = documentacionRepository;
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

    // 8. Generar código único de estudiante (temporal, se generará después con gestión)
    // TODO: Implementar generación de código con gestión cuando se agregue esa funcionalidad
    student.studentCode = StudentCodeUtils.generateTemporaryCode(dto.ci);

    // 9. Persistir estudiante
    const savedStudent = await this.studentRepository.create(student, userId);

    // 10. Crear datos académicos si se proporcionan
    if (dto.carreraId || dto.gestionIngresoId) {
      const academicData = {
        studentId: savedStudent.id,
        careerId: dto.carreraId,
        managementId: dto.gestionIngresoId,
        academicState: 'REGULAR',
      };
      await this.studentAcademicDataRepository.create(academicData, userId);
      
      this.logger.info('[Estudiantes] Datos académicos registrados', {
        estudianteId: savedStudent.id,
        carreraId: dto.carreraId,
        gestionIngresoId: dto.gestionIngresoId,
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
        const nombresFaltantes = documentosRequeridos
          .filter(doc => documentosFaltantes.includes(doc.id))
          .map(doc => doc.name)
          .join(', ');
        throw new ValidationError(
          `Los siguientes documentos son requeridos y no fueron marcados como entregados: ${nombresFaltantes}`
        );
      }
    } else {
      this.logger.info('[Estudiantes] Guardado parcial detectado - saltando validación de documentos requeridos');
    }

    // 12. Crear registros de documentos marcados como entregados
    const documentosCreados = [];
    
    this.logger.info('[Estudiantes] Procesando documentos entregados', {
      documentosEntregados,
      documentosEntregadosNormalizados,
      totalDocumentos: documentosEntregadosNormalizados.length,
      documentosEntregadosDetalle: documentosEntregadosNormalizados.map(id => ({
        id,
        tipo: typeof id,
        esNumero: typeof id === 'number',
      })),
    });
    
    // Obtener información de todos los documentos marcados
    for (const docId of documentosEntregadosNormalizados) {
      // Asegurar que el ID sea un número
      const docIdNum = typeof docId === 'string' ? parseInt(docId, 10) : docId;
      
      this.logger.info(`[Estudiantes] Buscando documentación con ID ${docIdNum}`, {
        docIdOriginal: docId,
        docIdNum,
        docIdType: typeof docId,
        docIdNumType: typeof docIdNum,
        esNaN: isNaN(docIdNum),
      });
      
      if (isNaN(docIdNum)) {
        this.logger.warn(`[Estudiantes] ID de documento inválido: ${docId}, saltando`);
        continue;
      }
      
      const documentacion = await this.documentacionRepository.findById(docIdNum);
      
      this.logger.info(`[Estudiantes] Resultado de búsqueda documentación ID ${docIdNum}`, {
        encontrada: !!documentacion,
        activa: documentacion?.activo,
        activoTipo: typeof documentacion?.activo,
        activoValue: documentacion?.activo,
        nombre: documentacion?.name,
        id: documentacion?.id,
        // Log completo del objeto para debugging
        documentacionObj: documentacion ? JSON.stringify(documentacion) : null,
      });
      
      // IMPORTANTE: El repositorio findById ya filtra por activo=true en la consulta SQL
      // Si encuentra un documento, significa que está activo. No necesitamos verificar nuevamente.
      // Si el documento no existe o está inactivo, findById retornará null
      if (!documentacion) {
        this.logger.warn(`Documentación con ID ${docIdNum} no encontrada o inactiva (el repositorio ya filtra por activo=true), saltando`, {
          docIdNum,
          docIdOriginal: docId,
          docIdType: typeof docId,
        });
        continue;
      }
      
      // El documento existe y está activo (el repositorio ya lo verificó)
      // No necesitamos verificar nuevamente documentacion.activo

      const documentData = {
        studentId: savedStudent.id,
        documentacionId: documentacion.id,
        // documentType no existe en la tabla documentos_estudiante, se obtiene de documentacion a través de documentacion_id
        documentReason: documentacion.name,
        referenceType: 'inscripciones',
        description: `${documentacion.name} - Marcado como entregado en registro inicial (pendiente subida de archivo)`,
        fileName: `pendiente_${documentacion.name.replace(/\s+/g, '_')}_${savedStudent.id}.tmp`,
        filePath: `/uploads/documentos/estudiantes/${savedStudent.id}/`,
        extension: 'tmp', // Temporal hasta que se suba el archivo
        sizeKb: 0,
        verified: false,
        state: 'PENDIENTE', // Pendiente hasta que se suba el archivo
        esOriginal: false, // Por defecto, se marcará cuando se suba el archivo
      };
      
      const documento = await this.studentDocumentRepository.create(documentData, userId);
      documentosCreados.push(documento);
    }

    // 13. Calcular estado de registro basado en documentos
    // NOTA: Esta lógica calcula el estado pero NO lo guarda en BD aún
    // TODO: Agregar campo estado_registro en estudiantes_datos_academicos
    // Estados: BORRADOR, PENDIENTE, ADMITIDO
    let estadoRegistro = 'BORRADOR'; // Por defecto
    
    // Si tiene todos los documentos requeridos marcados, es PENDIENTE
    if (documentosCreados.length >= documentosRequeridos.length) {
      estadoRegistro = 'PENDIENTE';
    }
    
    // TODO: Implementar lógica completa para ADMITIDO
    // Requiere: todos los documentos originales subidos y verificados
    // Por ahora solo se marca como PENDIENTE si tiene todos los documentos requeridos

    this.logger.info('[Estudiantes] Estudiante registrado exitosamente', {
      id: savedStudent.id,
      codigoEstudiante: savedStudent.studentCode,
      estadoRegistro,
      documentosCreados: documentosCreados.length,
    });

    return savedStudent;
  }
}

