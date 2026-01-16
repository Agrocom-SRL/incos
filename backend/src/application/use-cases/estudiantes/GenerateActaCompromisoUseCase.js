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
      // Debug: Verificar qué contiene documentosInscripcion antes de crear el mapa
      this.logger.info(`[Estudiantes] Antes de crear mapa - cantidad documentosInscripcion: ${documentosInscripcion.length}`);
      if (documentosInscripcion.length > 0) {
        const primerDoc = documentosInscripcion[0];
        const primerDocPlain = primerDoc.toPlainObject ? primerDoc.toPlainObject() : primerDoc;
        this.logger.info(`[Estudiantes] Primer documento - id=${primerDocPlain.id}, name=${primerDocPlain.name || primerDocPlain.nombre}, keys=${Object.keys(primerDocPlain).join(', ')}`);
      }
      
      // Crear mapa de IDs a nombres usando toPlainObject() para acceder a propiedades de la entidad
      const documentosMap = createMap(
        documentosInscripcion.map(doc => {
          const docPlain = doc.toPlainObject ? doc.toPlainObject() : doc;
          return { id: docPlain.id, name: docPlain.name };
        }),
        'id',
        'name'
      );
      
      // Extraer IDs de documentos de inscripción (la entidad Documentation tiene 'id' en inglés)
      const idsDocumentosInscripcion = documentosInscripcion.map(doc => {
        const docPlain = doc.toPlainObject ? doc.toPlainObject() : doc;
        return docPlain.id;
      }).filter(id => id !== undefined && id !== null);
      
      this.logger.info(`[Estudiantes] IDs documentos inscripcion para filtrar: [${idsDocumentosInscripcion.join(', ')}]`);

      // 4. Obtener entregas de documentos del estudiante
      const entregas = await this._getStudentDocumentDeliveries(studentId);

      // 5. Validar que tenga al menos un documento registrado
      this._validateHasDeliveryRecords(entregas, studentId);

      // 6. Filtrar solo entregas de documentos de inscripción
      const entregasInscripcion = this._filterInscripcionDeliveries(
        entregas,
        idsDocumentosInscripcion
      );

      // 7. Separar documentos entregados y faltantes
      const { entregados, faltantes } = this._separateDeliveredAndMissing(entregasInscripcion);

      // Debug: Log de la separación de entregados y faltantes
      this.logger.info(`[Estudiantes] Separación - totalEntregasInscripcion: ${entregasInscripcion.length}, entregados: ${entregados.length}, faltantes: ${faltantes.length}`);
      entregados.forEach((e, index) => {
        const ePlain = e.toPlainObject ? e.toPlainObject() : e;
        this.logger.info(`[Estudiantes] Entregado ${index + 1}: id=${ePlain.id}, documentacionId=${ePlain.documentacionId}, entregado=${ePlain.entregado} (tipo: ${typeof ePlain.entregado})`);
      });
      faltantes.forEach((e, index) => {
        const ePlain = e.toPlainObject ? e.toPlainObject() : e;
        this.logger.info(`[Estudiantes] Faltante ${index + 1}: id=${ePlain.id}, documentacionId=${ePlain.documentacionId}, entregado=${ePlain.entregado} (tipo: ${typeof ePlain.entregado})`);
      });

      // 8. Identificar documentos sin entrega registrada
      const documentosSinEntrega = this._findDocumentsWithoutDelivery(
        documentosInscripcion,
        entregasInscripcion
      );

      // Debug: Log de documentos sin entrega
      this.logger.info(`[Estudiantes] Documentos sin entrega: ${documentosSinEntrega.length}`);
      this.logger.info(`[Estudiantes] IDs documentos inscripcion: ${documentosInscripcion.map(doc => doc.id).join(', ')}`);
      this.logger.info(`[Estudiantes] IDs entregas inscripcion: ${entregasInscripcion.map(e => (e.toPlainObject ? e.toPlainObject() : e).documentacionId).join(', ')}`);
      documentosSinEntrega.forEach((doc, index) => {
        const docPlain = doc.toPlainObject ? doc.toPlainObject() : doc;
        this.logger.info(`[Estudiantes] Sin entrega ${index + 1}: id=${docPlain.id}, name=${docPlain.name || docPlain.nombre || 'N/A'}`);
      });

      // 9. Construir estado de documentos
      const estadoDocumentos = this._buildDocumentStatus(
        documentosInscripcion,
        entregados,
        faltantes,
        documentosSinEntrega,
        documentosMap
      );

      // Debug: Log del estado de documentos antes de validar
      this.logger.info(`[Estudiantes] Estado final - totalRequeridos: ${estadoDocumentos.totalRequeridos}, entregados: ${estadoDocumentos.entregados}, faltantes: ${estadoDocumentos.faltantes}`);
      estadoDocumentos.documentosEntregados.forEach((d, index) => {
        this.logger.info(`[Estudiantes] Entregado ${index + 1}: id=${d.id}, nombre=${d.nombre}`);
      });
      estadoDocumentos.documentosFaltantes.forEach((d, index) => {
        this.logger.info(`[Estudiantes] Faltante ${index + 1}: id=${d.id}, nombre=${d.nombre}, tieneRegistroEntrega=${d.tieneRegistroEntrega || false}`);
      });

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
      documentType: TIPOS_DOCUMENTO_SISTEMA.INSCRIPCION, // Campo en inglés para el repositorio
      parentDocumentId: null, // Solo documentos principales (sin padre) - campo en inglés para el repositorio
      attributes: ['id', 'nombre'], // Solo campos necesarios para optimización
    });

    // El repositorio devuelve entidades Documentation con la clave 'documentations' (inglés)
    // Ver DocumentacionRepository.getCollectionName() que retorna 'documentations'
    const documentos = result.documentations || [];

    this.logger.info(`[Estudiantes] Documentos de inscripción obtenidos - cantidad: ${documentos.length}`);
    this.logger.info(`[Estudiantes] Result del repositorio - documentations: ${result.documentations ? result.documentations.length : 'undefined'}, keys: ${Object.keys(result).join(', ')}`);
    
    documentos.forEach((doc, index) => {
      const docPlain = doc.toPlainObject ? doc.toPlainObject() : doc;
      this.logger.info(`[Estudiantes] Documento ${index + 1}: id=${docPlain.id}, name=${docPlain.name || docPlain.nombre || 'N/A'}, tipo=${typeof docPlain.id}`);
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
      studentId: studentId, // Campo en inglés para el repositorio (mapea a estudianteId en BD)
      attributes: ['id', 'documentacionId', 'entregado', 'enTramite'],
    });

    const entregas = result.studentDocumentDeliveries || [];

    // Debug: Log detallado de las entregas obtenidas
    this.logger.info(`[Estudiantes] Entregas de documentos obtenidas - studentId: ${studentId}, cantidad: ${entregas.length}`);
    entregas.forEach((entrega, index) => {
      const entregaPlain = entrega.toPlainObject ? entrega.toPlainObject() : entrega;
      this.logger.info(`[Estudiantes] Entrega ${index + 1}: id=${entregaPlain.id}, documentacionId=${entregaPlain.documentacionId}, entregado=${entregaPlain.entregado}, enTramite=${entregaPlain.enTramite}`);
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
    this.logger.info(`[Estudiantes] Filtrando entregas - totalEntregas: ${deliveries.length}, idsDocumentosInscripcion: [${documentIds.join(', ')}]`);
    
    const entregasFiltradas = deliveries.filter(entrega => {
      const entregaPlain = entrega.toPlainObject ? entrega.toPlainObject() : entrega;
      const entregaId = normalizeId(entregaPlain.documentacionId);
      const estaIncluido = entregaId !== null && documentIds.includes(entregaId);
      this.logger.info(`[Estudiantes] Entrega id=${entregaPlain.id}, documentacionId=${entregaPlain.documentacionId}, normalized=${entregaId}, incluido=${estaIncluido}`);
      return estaIncluido;
    });

    this.logger.info(`[Estudiantes] Entregas filtradas - total: ${entregasFiltradas.length}`);

    return entregasFiltradas;
  }

  /**
   * Separa entregas en entregados y faltantes
   * @private
   * @param {Array} deliveries - Array de entidades StudentDocumentDelivery
   * @returns {Object} { entregados: Array, faltantes: Array }
   */
  _separateDeliveredAndMissing(deliveries) {
    // Usar toPlainObject() para acceder a propiedades de la entidad StudentDocumentDelivery
    // La entidad mantiene propiedades en español (entregado, documentacionId, enTramite)
    const entregados = deliveries.filter(entrega => {
      const entregaPlain = entrega.toPlainObject ? entrega.toPlainObject() : entrega;
      return entregaPlain.entregado === true || entregaPlain.entregado === 1;
    });

    const faltantes = deliveries.filter(entrega => {
      const entregaPlain = entrega.toPlainObject ? entrega.toPlainObject() : entrega;
      return entregaPlain.entregado === false || entregaPlain.entregado === 0 || entregaPlain.entregado === null;
    });

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
    // Usar toPlainObject() para acceder a propiedades de las entidades
    const entregasDocumentacionIds = deliveries
      .map(e => {
        const ePlain = e.toPlainObject ? e.toPlainObject() : e;
        return normalizeId(ePlain.documentacionId);
      })
      .filter(id => id !== null);
    
    return requiredDocuments.filter(
      doc => {
        const docPlain = doc.toPlainObject ? doc.toPlainObject() : doc;
        const docId = normalizeId(docPlain.id);
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
        const ePlain = e.toPlainObject ? e.toPlainObject() : e;
        const docId = normalizeId(ePlain.documentacionId);
        return {
          id: ePlain.documentacionId,
          nombre: docId !== null ? (documentMap[docId] || documentMap[String(docId)] || 'Documento no encontrado') : 'Documento no encontrado',
          entregado: true,
        };
      }),
      documentosFaltantes: [
        ...missingList.map(e => {
          const ePlain = e.toPlainObject ? e.toPlainObject() : e;
          const docId = normalizeId(ePlain.documentacionId);
          return {
            id: ePlain.documentacionId,
            nombre: docId !== null ? (documentMap[docId] || documentMap[String(docId)] || 'Documento no encontrado') : 'Documento no encontrado',
            entregado: false,
            tieneRegistroEntrega: true,
          };
        }),
        ...noDeliveryDocs.map(doc => {
          const docPlain = doc.toPlainObject ? doc.toPlainObject() : doc;
          return {
            id: docPlain.id,
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

    // Obtener listas de documentos entregados y faltantes (nombres)
    const nombresDocumentosEntregados = estadoDocumentos.documentosEntregados.map(doc => doc.nombre);
    const nombresDocumentosFaltantes = estadoDocumentos.documentosFaltantes.map(doc => doc.nombre);
    
    // Crear mapa de documentos requeridos para el PDF
    // Las entidades Documentation tienen propiedades en inglés (name)
    const documentosRequeridos = documentosInscripcion.map(doc => {
      const docPlain = doc.toPlainObject ? doc.toPlainObject() : doc;
      return docPlain.name || 'Documento sin nombre';
    });
    
    // Calcular índices de documentos ENTREGADOS (para marcar con X)
    // NOTA: Se marcan los entregados porque la interpretación común es que X = entregado
    const indicesEntregados = documentosRequeridos
      .map((nombre, index) => nombresDocumentosEntregados.includes(nombre) ? index : null)
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
      documentosEntregados: indicesEntregados, // Índices de documentos entregados (se marcan con X)
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
    // Desde backend/src/application/use-cases/estudiantes necesitamos subir 4 niveles para llegar a backend/
    const absoluteUploadPath = path.isAbsolute(uploadDir)
      ? path.join(uploadDir, relativePath, fileName)
      : path.resolve(__dirname, '../../../..', uploadDir, relativePath, fileName);

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
