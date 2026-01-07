import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { normalizeId, createMap } from '../../../domain/utils/mapUtils.js';

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
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ 
    studentRepository, 
    documentacionRepository, 
    studentDocumentDeliveryRepository,
    logger 
  }) {
    this.studentRepository = studentRepository;
    this.documentacionRepository = documentacionRepository;
    this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
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
      // 1. Validar estudiante (solo verifica existencia, no usamos el objeto)
      await this._validateStudent(studentId);

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

      // 10. Construir y retornar respuesta
      return this._buildResponse(studentId, estadoDocumentos);

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
   * Valida que el estudiante exista
   * @private
   * @param {number} studentId - ID del estudiante
   * @returns {Promise<void>}
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
      nombres: student.nombres,
      apellidoPaterno: student.apellidoPaterno,
    });
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
      tipoDocumento: 'INSCRIPCION',
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
        ...noDeliveryDocs.map(doc => ({
          id: doc.id,
          nombre: doc.name,
          entregado: false,
          tieneRegistroEntrega: false,
        })),
      ],
    };
  }


  /**
   * Construye la respuesta final del caso de uso
   * @private
   * @param {number} studentId - ID del estudiante
   * @param {Object} estadoDocumentos - Estado de documentos
   * @returns {Object} Respuesta formateada
   */
  _buildResponse(studentId, estadoDocumentos) {
    // Por ahora retornamos un placeholder para el PDF
    // En la siguiente etapa generaremos el PDF real
    return {
      filePath: `/uploads/documentos/estudiantes/${studentId}/ACTA_COMPROMISO_placeholder.pdf`,
      fileName: `ACTA_COMPROMISO_placeholder.pdf`,
      absolutePath: `/tmp/ACTA_COMPROMISO_placeholder.pdf`,
      estadoDocumentos,
    };
  }
}
