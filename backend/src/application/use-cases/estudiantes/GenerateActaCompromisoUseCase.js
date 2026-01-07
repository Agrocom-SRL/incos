/**
 * Use Case: GenerateActaCompromisoUseCase
 * Módulo: Estudiantes
 * Genera el ACTA DE COMPROMISO para la entrega de documentos
 * 
 * Responsabilidades:
 * - Validar que el estudiante exista
 * - Recopilar datos necesarios para el acta
 * - Generar el documento PDF
 * - Retornar la ruta del archivo generado
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la generación del acta de compromiso
 * - Dependency Inversion: Depende de abstracciones (repositorios inyectados)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 * 
 * TODO: Agregar repositorios según se vayan necesitando
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
   * @returns {Promise<{filePath: string, fileName: string, absolutePath: string}>}
   */
  async execute(studentId, options = {}) {
    this.logger.info('[Estudiantes] Iniciando generación de ACTA DE COMPROMISO', {
      studentId,
    });

    try {
      // 1. Validar que el estudiante exista
      const student = await this.studentRepository.findById(studentId);
      if (!student) {
        throw new Error(`Estudiante con ID ${studentId} no encontrado`);
      }

      this.logger.info('[Estudiantes] Estudiante encontrado', {
        studentId,
        studentCode: student.studentCode,
        ci: student.ci,
        nombres: student.nombres,
      });

      // 2. Obtener documentos requeridos de tipo INSCRIPCION
      // Usar findAll() con filtros según el patrón BaseRepository
      const documentosRequeridosResult = await this.documentacionRepository.findAll({
        tipoDocumento: 'INSCRIPCION',
      });

      // findAll() retorna { [collectionName]: [...], total: ... }
      // getCollectionName() retorna 'documentaciones'
      const documentosRequeridos = documentosRequeridosResult.documentaciones || [];

      this.logger.info('[Estudiantes] Documentos requeridos obtenidos', {
        studentId,
        cantidadRequeridos: documentosRequeridos.length,
        documentos: documentosRequeridos.map(doc => ({
          id: doc.id,
          nombre: doc.nombre,
        })),
      });

      // 3. Obtener documentos entregados del estudiante
      const documentosEntregados = await this.studentDocumentDeliveryRepository.findAll({
        studentId,
      });

      this.logger.info('[Estudiantes] Entregas de documentos obtenidas', {
        studentId,
        cantidadEntregas: documentosEntregados.studentDocumentDeliveries?.length || 0,
        entregas: documentosEntregados.studentDocumentDeliveries?.map(entrega => ({
          documentacionId: entrega.documentacionId,
          entregado: entrega.entregado,
          enTramite: entrega.enTramite,
        })) || [],
      });

      // 4. Filtrar solo entregas de documentos de tipo INSCRIPCION
      // Obtener IDs de documentos requeridos de tipo INSCRIPCION
      const documentosRequeridosIds = documentosRequeridos.map(doc => doc.id);

      // Filtrar entregas que correspondan a documentos de tipo INSCRIPCION
      const entregasInscripcion = (documentosEntregados.studentDocumentDeliveries || [])
        .filter(entrega => documentosRequeridosIds.includes(entrega.documentacionId));

      // 5. Separar documentos entregados (entregado = true/1) de documentos faltantes (entregado = false/0)
      const documentosEntregadosList = entregasInscripcion.filter(
        entrega => entrega.entregado === true || entrega.entregado === 1
      );
      
      const documentosFaltantesList = entregasInscripcion.filter(
        entrega => entrega.entregado === false || entrega.entregado === 0 || entrega.entregado === null
      );

      // 6. Identificar documentos requeridos que NO tienen ninguna entrega registrada
      const entregasDocumentacionIds = entregasInscripcion.map(e => e.documentacionId);
      const documentosSinEntrega = documentosRequeridos.filter(
        doc => !entregasDocumentacionIds.includes(doc.id)
      );

      // Combinar documentos faltantes (con entrega = false) con documentos sin entrega
      const todosLosDocumentosFaltantes = [
        ...documentosFaltantesList.map(e => {
          const doc = documentosRequeridos.find(d => d.id === e.documentacionId);
          return {
            id: e.documentacionId,
            nombre: doc?.nombre || 'Documento no encontrado',
            entregado: false,
            tieneRegistroEntrega: true,
          };
        }),
        ...documentosSinEntrega.map(doc => ({
          id: doc.id,
          nombre: doc.nombre,
          entregado: false,
          tieneRegistroEntrega: false,
        })),
      ];

      // 7. Loggear el estado de los documentos
      this.logger.info('[Estudiantes] Estado de documentos del estudiante', {
        studentId,
        resumen: {
          totalDocumentosRequeridos: documentosRequeridos.length,
          documentosEntregados: documentosEntregadosList.length,
          documentosFaltantes: todosLosDocumentosFaltantes.length,
        },
        documentosEntregados: documentosEntregadosList.map(e => {
          const doc = documentosRequeridos.find(d => d.id === e.documentacionId);
          return {
            id: e.documentacionId,
            nombre: doc?.nombre || 'Documento no encontrado',
            entregado: e.entregado,
            enTramite: e.enTramite,
          };
        }),
        documentosFaltantes: todosLosDocumentosFaltantes,
      });

      // Por ahora retornamos un resultado con el estado de los documentos
      // En la siguiente etapa generaremos el PDF
      const result = {
        filePath: `/uploads/documentos/estudiantes/${studentId}/ACTA_COMPROMISO_placeholder.pdf`,
        fileName: `ACTA_COMPROMISO_placeholder.pdf`,
        absolutePath: `/tmp/ACTA_COMPROMISO_placeholder.pdf`,
        message: 'Verificación de documentos completada (PDF pendiente de implementación)',
        estadoDocumentos: {
          totalRequeridos: documentosRequeridos.length,
          entregados: documentosEntregadosList.length,
          faltantes: todosLosDocumentosFaltantes.length,
          documentosEntregados: documentosEntregadosList.map(e => {
            const doc = documentosRequeridos.find(d => d.id === e.documentacionId);
            return {
              id: e.documentacionId,
              nombre: doc?.nombre || 'Documento no encontrado',
              entregado: true,
            };
          }),
          documentosFaltantes: todosLosDocumentosFaltantes,
        },
      };

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
}

