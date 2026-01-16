import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { normalizeId, createMap } from '../../../domain/utils/mapUtils.js';
import { TIPOS_DOCUMENTO_SISTEMA } from '../../../domain/constants/index.js';
import { PDFGenerator } from '../../../infrastructure/external/pdf/PDFGenerator.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { serverConfig } from '../../../infrastructure/config/server.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Use Case: GenerateActaCompromisoUseCase
 * Módulo: Estudiantes
 * Genera el ACTA DE COMPROMISO para la entrega de documentos
 * 
 * Responsabilidades:
 * - Validar que el estudiante exista
 * - Validar que tenga documentos registrados
 * - Validar que tenga documentos faltantes (regla de negocio)
 * - Recopilar datos necesarios para el acta
 * - Generar el documento PDF
 * - Retornar la ruta del archivo generado
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Cada método privado tiene una sola responsabilidad
 * - Open/Closed: Abierto para extensión (métodos privados), cerrado para modificación
 * - Dependency Inversion: Depende de abstracciones (repositorios inyectados)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 */

export class GenerateActaCompromisoUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {Object} params.documentacionRepository - Repositorio de documentación
   * @param {Object} params.studentDocumentDeliveryRepository - Repositorio de entregas de documentos
   * @param {Object} params.configuracionSistemaRepository - Repositorio de configuración del sistema
   * @param {Object} params.managementRepository - Repositorio de gestiones
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ 
    studentRepository, 
    documentacionRepository, 
    studentDocumentDeliveryRepository,
    configuracionSistemaRepository,
    managementRepository,
    logger 
  }) {
    this.studentRepository = studentRepository;
    this.documentacionRepository = documentacionRepository;
    this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
    this.configuracionSistemaRepository = configuracionSistemaRepository;
    this.managementRepository = managementRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso
   * @param {number} studentId - ID del estudiante
   * @param {Object} options - Opciones adicionales (por defecto vacío)
   * 
   * NOTA: Opciones como plazoMaximo vienen de configuración del sistema,
   * no del body de la petición. El administrador configura estos valores.
   * 
   * @returns {Promise<{filePath: string, fileName: string, absolutePath: string, estadoDocumentos: Object}>}
   */
  async execute(studentId, options = {}) {
    this.logger.info('[Estudiantes] Iniciando generación de ACTA DE COMPROMISO', {
      studentId,
    });

    try {
      // 1. Validar y obtener estudiante completo
      const student = await this._validateStudent(studentId);

      // 2. Obtener documentos de inscripción (solo campos necesarios: id y nombre)
      const documentosInscripcion = await this._getInscripcionDocuments();

      // 3. Crear mapa de IDs a nombres desde los documentos recuperados
      const documentosMap = createMap(documentosInscripcion, 'id', 'name');

      // 4. Obtener entregas de documentos del estudiante
      const entregas = await this._getStudentDocumentDeliveries(studentId);

      // 5. Validar que tenga al menos un documento registrado
      this._validateHasDeliveryRecords(entregas, studentId);

      // 6. Filtrar solo entregas de documentos de inscripción
      const entregasInscripcion = this._filterInscripcionDeliveries(
        entregas,
        documentosInscripcion.map(doc => doc.id)
      );

      // 7. Separar documentos entregados y faltantes
      const { entregados, faltantes } = this._separateDeliveredAndMissing(entregasInscripcion);

      // 8. Identificar documentos sin entrega registrada
      const documentosSinEntrega = this._findDocumentsWithoutDelivery(
        documentosInscripcion,
        entregasInscripcion
      );

      // 9. Construir estado de documentos
      const estadoDocumentos = this._buildDocumentStatus(
        documentosInscripcion,
        entregados,
        faltantes,
        documentosSinEntrega,
        documentosMap
      );

      // 9.1. Validar que tenga documentos faltantes (regla de negocio)
      this._validateHasMissingDocuments(estadoDocumentos, studentId);

      // 10. Obtener gestión activa
      const management = await this._getCurrentManagement();

      // 11. Generar PDF y retornar respuesta
      return await this._buildResponse(studentId, estadoDocumentos, student, documentosInscripcion, management);

    } catch (error) {
      this.logger.error('[Estudiantes] Error al generar ACTA DE COMPROMISO', {
        studentId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Valida que el estudiante exista y lo retorna
   * @private
   * @param {number} studentId - ID del estudiante
   * @returns {Promise<Student>} Estudiante encontrado
   * @throws {NotFoundError} Si el estudiante no existe
   */
  async _validateStudent(studentId) {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundError(`Estudiante con ID ${studentId}`);
    }

    this.logger.info('[Estudiantes] Estudiante encontrado', {
      studentId,
      studentCode: student.studentCode,
      firstName: student.firstName,
      lastName: student.lastName,
    });

    return student;
  }

  /**
   * Obtiene la gestión actual desde la configuración del sistema
   * @private
   * @returns {Promise<Object>} Entidad Management
   * @throws {NotFoundError} Si no se encuentra la configuración o la gestión
   * @throws {ValidationError} Si la gestión no está vigente
   */
  async _getCurrentManagement() {
    // 1. Obtener la gestión actual desde la configuración del sistema
    const gestionActualConfig = await this.configuracionSistemaRepository.findBy(
      { key: 'gestion_actual' }
    );

    // 2. Validar que se encontró la configuración
    if (!gestionActualConfig) {
      throw new NotFoundError('Configuración de gestión actual');
    }

    // 3. Convertir el año académico a número
    const gestionAnio = parseInt(gestionActualConfig.value, 10);
    if (isNaN(gestionAnio)) {
      throw new ValidationError('La gestión actual configurada no es un año válido');
    }

    // 4. Buscar la gestión vigente por año usando findBy
    const management = await this.managementRepository.findBy(
      { year: gestionAnio, vigente: true }
    );

    // 5. Validar que se encontró la gestión vigente
    if (!management) {
      throw new NotFoundError(`No se encontró una gestión vigente para el año ${gestionAnio}`);
    }

    this.logger.info('[Estudiantes] Gestión activa obtenida', {
      year: management.year,
      vigente: management.vigente,
    });

    return management;
  }

  /**
   * Valida que el estudiante tenga al menos un documento registrado
   * @private
   * @param {Array} deliveries - Array de entregas de documentos
   * @param {number} studentId - ID del estudiante
   * @returns {void}
   * @throws {ValidationError} Si no tiene documentos registrados
   */
  _validateHasDeliveryRecords(deliveries, studentId) {
    if (!deliveries || deliveries.length === 0) {
      throw new ValidationError(
        `El estudiante con ID ${studentId} no tiene documentos registrados en el sistema`
      );
    }
  }

  /**
   * Valida que el estudiante tenga documentos faltantes
   * Regla de negocio: Solo se genera acta si hay documentos pendientes
   * @private
   * @param {Object} estadoDocumentos - Estado de documentos
   * @param {number} studentId - ID del estudiante
   * @returns {void}
   * @throws {ValidationError} Si no tiene documentos faltantes
   */
  _validateHasMissingDocuments(estadoDocumentos, studentId) {
    if (estadoDocumentos.faltantes === 0) {
      throw new ValidationError(
        `El estudiante con ID ${studentId} ya ha entregado todos los documentos requeridos. No se requiere acta de compromiso.`
      );
    }

    this.logger.info('[Estudiantes] Validación de documentos faltantes exitosa', {
      studentId,
      totalFaltantes: estadoDocumentos.faltantes,
      totalEntregados: estadoDocumentos.entregados,
    });
  }

  /**
   * Obtiene documentos de inscripción con solo campos necesarios (id y nombre)
   * @private
   * @returns {Promise<Array>} Array de entidades Documentacion con solo id y name
   */
  async _getInscripcionDocuments() {
    const result = await this.documentacionRepository.findAll({
      tipoDocumento: TIPOS_DOCUMENTO_SISTEMA.INSCRIPCION,
      documentoPadreId: null, // Solo documentos principales (sin padre)
      attributes: ['id', 'nombre'], // Solo campos necesarios para optimización
    });

    const documentos = result.documentaciones || [];

    this.logger.info('[Estudiantes] Documentos de inscripción obtenidos', {
      cantidad: documentos.length,
      documentos: documentos.map(doc => ({
        id: doc.id,
        name: doc.name,
      })),
    });

    return documentos;
  }

  /**
   * Obtiene las entregas de documentos del estudiante
   * @private
   * @param {number} studentId - ID del estudiante
   * @returns {Promise<Array>} Array de entidades StudentDocumentDelivery
   */
  async _getStudentDocumentDeliveries(studentId) {
    const result = await this.studentDocumentDeliveryRepository.findAll({
      estudianteId: studentId,
      attributes: ['id', 'documentacionId', 'entregado', 'enTramite'],
    });

    const entregas = result.studentDocumentDeliveries || [];

    this.logger.info('[Estudiantes] Entregas de documentos obtenidas', {
      studentId,
      cantidadEntregas: entregas.length,
      entregas: entregas.map(entrega => ({
        documentacionId: entrega.documentacionId,
        entregado: entrega.entregado,
        enTramite: entrega.enTramite,
      })),
    });

    return entregas;
  }

  /**
   * Filtra entregas que correspondan a documentos de inscripción
   * @private
   * @param {Array} deliveries - Array de entidades StudentDocumentDelivery
   * @param {Array<number>} documentIds - Array de IDs de documentos de inscripción
   * @returns {Array} Array filtrado de entregas
   */
  _filterInscripcionDeliveries(deliveries, documentIds) {
    const entregasFiltradas = deliveries.filter(entrega => {
      const entregaId = normalizeId(entrega.documentacionId);
      return entregaId !== null && documentIds.includes(entregaId);
    });

    this.logger.info('[Estudiantes] Entregas filtradas', {
      totalEntregas: entregasFiltradas.length,
      entregas: entregasFiltradas.map(e => ({
        documentacionId: e.documentacionId,
        entregado: e.entregado,
      })),
    });

    return entregasFiltradas;
  }

  /**
   * Separa entregas en entregados y faltantes
   * @private
   * @param {Array} deliveries - Array de entidades StudentDocumentDelivery
   * @returns {Object} { entregados: Array, faltantes: Array }
   */
  _separateDeliveredAndMissing(deliveries) {
    const entregados = deliveries.filter(
      entrega => entrega.entregado === true || entrega.entregado === 1
    );

    const faltantes = deliveries.filter(
      entrega => entrega.entregado === false || entrega.entregado === 0 || entrega.entregado === null
    );

    return { entregados, faltantes };
  }

  /**
   * Identifica documentos requeridos que no tienen ninguna entrega registrada
   * @private
   * @param {Array} requiredDocuments - Array de entidades Documentacion
   * @param {Array} deliveries - Array de entidades StudentDocumentDelivery
   * @returns {Array} Array de documentos sin entrega
   */
  _findDocumentsWithoutDelivery(requiredDocuments, deliveries) {
    const entregasDocumentacionIds = deliveries
      .map(e => normalizeId(e.documentacionId))
      .filter(id => id !== null);
    
    return requiredDocuments.filter(
      doc => {
        const docId = normalizeId(doc.id);
        return docId !== null && !entregasDocumentacionIds.includes(docId);
      }
    );
  }

  /**
   * Construye el estado de documentos para la respuesta
   * @private
   * @param {Array} requiredDocuments - Array de entidades Documentacion
   * @param {Array} deliveredList - Array de entregas entregadas
   * @param {Array} missingList - Array de entregas faltantes
   * @param {Array} noDeliveryDocs - Array de documentos sin entrega
   * @param {Object} documentMap - Mapa de IDs a nombres
   * @returns {Object} Estado de documentos formateado
   */
  _buildDocumentStatus(requiredDocuments, deliveredList, missingList, noDeliveryDocs, documentMap) {
    return {
      totalRequeridos: requiredDocuments.length,
      entregados: deliveredList.length,
      faltantes: missingList.length + noDeliveryDocs.length,
      documentosEntregados: deliveredList.map(e => {
        const docId = normalizeId(e.documentacionId);
        return {
          id: e.documentacionId,
          nombre: docId !== null ? (documentMap[docId] || documentMap[String(docId)] || 'Documento no encontrado') : 'Documento no encontrado',
          entregado: true,
        };
      }),
      documentosFaltantes: [
        ...missingList.map(e => {
          const docId = normalizeId(e.documentacionId);
          return {
            id: e.documentacionId,
            nombre: docId !== null ? (documentMap[docId] || documentMap[String(docId)] || 'Documento no encontrado') : 'Documento no encontrado',
            entregado: false,
            tieneRegistroEntrega: true,
          };
        }),
        ...noDeliveryDocs.map(doc => {
          const docPlain = doc.toPlainObject ? doc.toPlainObject() : doc;
          return {
            id: doc.id,
            nombre: docPlain.name || docPlain.nombre || 'Documento no encontrado',
            entregado: false,
            tieneRegistroEntrega: false,
          };
        }),
      ],
    };
  }


  /**
   * Construye la respuesta final del caso de uso y genera el PDF
   * @private
   * @param {number} studentId - ID del estudiante
   * @param {Object} estadoDocumentos - Estado de documentos
   * @param {Object} student - Entidad Student
   * @param {Array} documentosInscripcion - Array de documentos de inscripción
   * @param {Object} management - Entidad Management (gestión activa)
   * @returns {Promise<Object>} Respuesta formateada con ruta del PDF generado
   */
  async _buildResponse(studentId, estadoDocumentos, student, documentosInscripcion, management) {
    // 1. Construir datos para el PDF
    const studentPlain = student.toPlainObject ? student.toPlainObject() : student;
    const nombreCompleto = `${studentPlain.firstName || ''} ${studentPlain.lastName || ''} ${studentPlain.motherLastName || ''}`.trim();
    
    // Fecha actual
    const fechaActual = new Date();
    const dia = fechaActual.getDate();
    const mes = PDFGenerator.getMonthName(fechaActual.getMonth());
    const anio = fechaActual.getFullYear();

    // Obtener lista de documentos faltantes (nombres)
    const nombresDocumentosFaltantes = estadoDocumentos.documentosFaltantes.map(doc => doc.nombre);
    
    // Crear mapa de documentos requeridos para el PDF
    // El PDF necesita saber qué documentos están faltantes (marcados con X)
    const documentosRequeridos = documentosInscripcion.map(doc => {
      const docPlain = doc.toPlainObject ? doc.toPlainObject() : doc;
      return docPlain.name || docPlain.nombre || 'Documento sin nombre';
    });
    const indicesFaltantes = documentosRequeridos
      .map((nombre, index) => nombresDocumentosFaltantes.includes(nombre) ? index : null)
      .filter(index => index !== null);

    // 2. Preparar datos para PDFGenerator
    const pdfData = {
      nombreCompleto,
      ci: studentPlain.ci || '',
      expedicion: studentPlain.expedition || 'S.C.',
      ciudad: 'Santa Cruz de la Sierra',
      dia,
      mes,
      anio,
      anioCarrera: '', // No hay datos académicos aún
      paralelo: '', // No hay datos académicos aún
      carrera: '', // No hay datos académicos aún
      documentosFaltantes: indicesFaltantes,
      documentosRequeridos, // Lista completa de documentos requeridos
      plazoMaximo: 10, // Por defecto 10 días (podría venir de configuración)
      motivos: 'Actualización de carta aval del presente año.',
    };

    // 3. Construir rutas del archivo
    const uploadDir = serverConfig.uploadsPath || 'uploads';
    const relativePath = path.join('documentos', 'estudiantes', String(studentId));
    const fileName = `ACTA_COMPROMISO_${studentId}_${Date.now()}.pdf`;
    
    // Ruta relativa (para acceso HTTP)
    const filePath = path.join('/', uploadDir, relativePath, fileName).replace(/\\/g, '/');
    
    // Ruta absoluta (para guardar en disco)
    const absoluteUploadPath = path.isAbsolute(uploadDir)
      ? path.join(uploadDir, relativePath, fileName)
      : path.resolve(__dirname, '../../..', uploadDir, relativePath, fileName);

    // 4. Generar PDF
    this.logger.info('[Estudiantes] Generando PDF del acta de compromiso', {
      studentId,
      absolutePath: absoluteUploadPath,
      documentosFaltantes: nombresDocumentosFaltantes.length,
    });

    await PDFGenerator.generateCompromisoActa(pdfData, absoluteUploadPath);

    this.logger.info('[Estudiantes] PDF generado exitosamente', {
      studentId,
      filePath,
      fileName,
      absolutePath: absoluteUploadPath,
    });

    // 5. Retornar respuesta
    return {
      filePath,
      fileName,
      absolutePath: absoluteUploadPath,
      estadoDocumentos,
    };
  }
}
