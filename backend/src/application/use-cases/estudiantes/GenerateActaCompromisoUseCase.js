import { NotFoundError } from '../../../domain/errors/AppError.js';
import { TIPOS_DOCUMENTO_SISTEMA } from '../../../domain/constants/index.js';

/**
 * Use Case: GenerateActaCompromisoUseCase
 * Módulo: Estudiantes
 * Genera el ACTA DE COMPROMISO para la entrega de documentos.
 *
 * Flujo: PDF directo desde plantilla (Plantilla.pdf) → guardar PDF en uploads →
 * retornar rutas del PDF generado.
 *
 * Tecnología: Usa IPDFGenerator (inyectado vía DI) que internamente usa ActaCompromisoPdfGenerator
 * con pdf-lib para editar la plantilla PDF.
 * NOTA: Ya no se usa Word. El flujo anterior (Word → DOCX → PDF con LibreOffice) fue eliminado.
 *
 * Responsabilidades:
 * - Validar que el estudiante exista
 * - Obtener entregas de documentos de inscripción con detalle (vista)
 * - Generar PDF vía IPDFGenerator (inyectado vía DI, implementado por PDFGenerator)
 * - Guardar PDF en uploads vía IUploadsStorage
 * - Retornar filePath, fileName, absolutePath del PDF generado
 *
 * Por ahora se usa plantilla vacía (Plantilla.pdf). La construcción con datos se añadirá después.
 *
 * Principios SOLID:
 * - Single Responsibility: Orquesta validación, datos y delegación a servicios
 * - Dependency Inversion: Repositorios y servicios inyectados (abstracciones)
 *
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories y servicios (Infrastructure) vía inyección
 * - No importa infraestructura; consume interfaces inyectadas
 */

export class GenerateActaCompromisoUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {Object} params.studentDocumentDeliveryRepository - Repositorio de entregas de documentos
   * @param {IPDFGenerator} params.pdfGenerator - Servicio de generación PDF (DI, implementa IPDFGenerator)
   * @param {IUploadsStorage} params.uploadsStorage - Servicio de almacenamiento en uploads (DI)
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({
    studentRepository,
    studentDocumentDeliveryRepository,
    pdfGenerator,
    uploadsStorage,
    logger,
  }) {
    this.studentRepository = studentRepository;
    this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
    this.pdfGenerator = pdfGenerator;
    this.uploadsStorage = uploadsStorage;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso.
   * Genera PDF directamente desde plantilla, guarda en uploads y retorna sus rutas.
   *
   * @param {number} studentId - ID del estudiante
   * @param {Object} options - Opciones adicionales (por defecto vacío)
   * @returns {Promise<{filePath: string, fileName: string, absolutePath: string}>} Rutas del PDF generado
   * @throws {Error} Si falla la generación del PDF
   */
  async execute(studentId, options = {}) {
    this.logger.info('[Estudiantes] Iniciando generación de ACTA DE COMPROMISO', {
      studentId,
    });

    try {
      // 1. Validar y obtener estudiante
      await this._validateStudent(studentId);

      // 2. Obtener entregas de documentos de inscripción con detalles (vista)
      const entregasConDetalle = await this.studentDocumentDeliveryRepository.obtenerEntregasConDetalleDocumento({
        estudiante_id: studentId,
        tipo_documento: TIPOS_DOCUMENTO_SISTEMA.INSCRIPCION,
        documento_padre_id: null,
      });

      this.logger.info('[Estudiantes] Entregas con detalle obtenidas', {
        studentId,
        cantidad: entregasConDetalle.length,
      });

      // 3. Generar PDF (plantilla) vía fachada PDFGenerator
      const pdfBuffer = await this.pdfGenerator.generateActaCompromiso();

      // 4. Guardar PDF en uploads
      const relativeScope = `documentos/estudiantes/${studentId}`;
      const pdfFileName = `ACTA_COMPROMISO_${studentId}.pdf`;
      const result = this.uploadsStorage.saveToUploads(relativeScope, pdfFileName, pdfBuffer);

      this.logger.info('[Estudiantes] Acta PDF generada correctamente', {
        studentId,
        filePath: result.filePath,
        absolutePath: result.absolutePath,
      });

      return result;
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
   * Valida que el estudiante exista y lo retorna.
   *
   * @private
   * @param {number} studentId - ID del estudiante
   * @returns {Promise<Object>} Estudiante encontrado
   * @throws {NotFoundError} Si el estudiante no existe
   */
  async _validateStudent(studentId) {
    const student = await this.studentRepository.findById(studentId, {
      attributes: ['id', 'codigoEstudiante', 'ci', 'expedicion', 'nombres', 'apellidoPaterno', 'apellidoMaterno'],
    });

    if (!student) {
      throw new NotFoundError(`Estudiante con ID ${studentId}`);
    }

    return student;
  }
}
