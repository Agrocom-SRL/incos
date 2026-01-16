import { NotFoundError } from '../../../domain/errors/AppError.js';

/**
 * Use Case: UpdateStudentUseCase
 * Módulo: Estudiantes
 * Actualiza un estudiante existente con todos sus datos relacionados
 * 
 * Responsabilidades:
 * - Validar que el estudiante exista
 * - Validar que no exista otro estudiante con el mismo CI (si se actualiza CI)
 * - Actualizar datos básicos del estudiante (actualización parcial)
 * - Actualizar apoderados (reemplazo completo)
 * - Actualizar discapacidades (reemplazo completo)
 * - Actualizar orígenes (reemplazo completo)
 * - Actualizar entregas de documentos (reemplazo completo)
 * - Retornar el estudiante actualizado con todos sus datos relacionados
 * 
 * NOTA: Los datos académicos se manejan en otro módulo, no se incluyen aquí
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo maneja la actualización completa de estudiantes
 * - Dependency Inversion: Depende de abstracciones (repositorios inyectados)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 */

export class UpdateStudentUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {Object} params.studentGuardianRepository - Repositorio de apoderados
   * @param {Object} params.studentDisabilityRepository - Repositorio de discapacidades
   * @param {Object} params.studentOriginRepository - Repositorio de orígenes
   * @param {Object} params.studentDocumentDeliveryRepository - Repositorio de entregas de documentos
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ 
    studentRepository,
    studentGuardianRepository,
    studentDisabilityRepository,
    studentOriginRepository,
    studentDocumentDeliveryRepository,
    logger 
  }) {
    this.studentRepository = studentRepository;
    this.studentGuardianRepository = studentGuardianRepository;
    this.studentDisabilityRepository = studentDisabilityRepository;
    this.studentOriginRepository = studentOriginRepository;
    this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso de actualización de estudiante
   * 
   * @param {number} studentId - ID del estudiante a actualizar
   * @param {Object} data - Datos a actualizar
   * @param {Object} data.student - Datos básicos del estudiante (opcional, actualización parcial)
   * @param {Array} data.guardians - Array de apoderados (opcional, reemplazo completo)
   * @param {Array} data.disabilities - Array de discapacidades (opcional, reemplazo completo)
   * @param {Array} data.origins - Array de orígenes (opcional, reemplazo completo)
   * @param {Object} data.documentation - Objeto con entregas de documentos (opcional, reemplazo completo)
   * @returns {Promise<Object>} Estudiante actualizado con todos sus datos relacionados
   * 
   * NOTA: Los datos académicos se manejan en otro módulo, no se incluyen aquí
   * NOTA: userId no se pasa porque actualmente no hay autenticación
   * Los repositorios tienen userId = null como default para los campos de auditoría
   * 
   * ESTRATEGIA DE ACTUALIZACIÓN:
   * - Datos básicos del estudiante: actualización parcial (solo campos proporcionados)
   * - Relaciones (guardians, disabilities, origins, documentDeliveries): reemplazo completo
   *   Si se proporcionan, se eliminan todas las existentes y se crean las nuevas.
   *   Si no se proporcionan, no se modifican las existentes.
   */
  async execute(studentId, data) {
    this.logger.info('[Estudiantes] Iniciando actualización de estudiante', {
      studentId,
      tieneStudentData: !!data.student,
      tieneGuardians: !!data.guardians,
      tieneDisabilities: !!data.disabilities,
      tieneOrigins: !!data.origins,
      tieneDocumentation: !!data.documentation,
    });

    try {
      // 1. Validar que el estudiante exista
      const existingStudent = await this.studentRepository.findById(studentId);
      if (!existingStudent) {
        throw new NotFoundError(`Estudiante con ID ${studentId}`);
      }

      this.logger.info('[Estudiantes] Estudiante encontrado', {
        studentId: existingStudent.id,
        studentCode: existingStudent.studentCode,
      });

      // 2. Actualizar datos básicos del estudiante (si se proporcionan)
      let updatedStudent = existingStudent;
      if (data.student && Object.keys(data.student).length > 0) {
        // 2.1. Validar que no exista otro estudiante con el mismo CI si se actualiza CI
        const studentData = data.student;
        if (studentData.ci || studentData.expedition) {
          const ciToCheck = studentData.ci || existingStudent.ci;
          const expedicionToCheck = studentData.expedition || existingStudent.expedition;
          
          const studentWithSameCI = await this.studentRepository.findBy({
            ci: ciToCheck,
            expedicion: expedicionToCheck,
          });

          // Si existe otro estudiante con el mismo CI y expedición, y no es el mismo estudiante
          if (studentWithSameCI && studentWithSameCI.id !== studentId) {
            throw new Error(
              `Ya existe otro estudiante con CI ${ciToCheck} ${expedicionToCheck}`
            );
          }
        }

        // 2.2. Actualizar el estudiante (solo campos proporcionados)
        // NOTA: userId no se pasa porque actualmente no hay autenticación
        updatedStudent = await this.studentRepository.update(studentId, studentData);
        this.logger.info('[Estudiantes] Datos básicos del estudiante actualizados', {
          studentId: updatedStudent.id,
          camposActualizados: Object.keys(studentData),
        });
      }

      // 3. Actualizar apoderados (reemplazo completo si se proporcionan)
      let guardians = [];
      if (data.guardians !== undefined) {
        // 3.1. Eliminar apoderados existentes
        const existingGuardians = await this.studentGuardianRepository.findAll(
          { studentId },
          null,
          null
        );
        for (const guardian of existingGuardians.data || []) {
          await this.studentGuardianRepository.delete(guardian.id);
        }
        this.logger.info('[Estudiantes] Apoderados existentes eliminados', {
          studentId,
          count: (existingGuardians.data || []).length,
        });

        // 3.2. Crear nuevos apoderados si se proporcionan
        if (Array.isArray(data.guardians) && data.guardians.length > 0) {
          for (const guardianData of data.guardians) {
            const guardianToCreate = {
              ...guardianData,
              studentId: studentId,
            };
            // NOTA: userId no se pasa porque actualmente no hay autenticación
            const guardian = await this.studentGuardianRepository.create(guardianToCreate);
            guardians.push(guardian);
          }
          this.logger.info('[Estudiantes] Nuevos apoderados creados', {
            studentId,
            count: guardians.length,
          });
        }
      }

      // 4. Actualizar discapacidades (reemplazo completo si se proporcionan)
      let disabilities = [];
      if (data.disabilities !== undefined) {
        // 4.1. Eliminar discapacidades existentes
        const existingDisabilities = await this.studentDisabilityRepository.findAll(
          { studentId },
          null,
          null
        );
        for (const disability of existingDisabilities.data || []) {
          await this.studentDisabilityRepository.delete(disability.id);
        }
        this.logger.info('[Estudiantes] Discapacidades existentes eliminadas', {
          studentId,
          count: (existingDisabilities.data || []).length,
        });

        // 4.2. Crear nuevas discapacidades si se proporcionan
        if (Array.isArray(data.disabilities) && data.disabilities.length > 0) {
          for (const disabilityData of data.disabilities) {
            const disabilityToCreate = {
              ...disabilityData,
              studentId: studentId,
            };
            // NOTA: userId no se pasa porque actualmente no hay autenticación
            const disability = await this.studentDisabilityRepository.create(disabilityToCreate);
            disabilities.push(disability);
          }
          this.logger.info('[Estudiantes] Nuevas discapacidades creadas', {
            studentId,
            count: disabilities.length,
          });
        }
      }

      // 5. Actualizar orígenes (reemplazo completo si se proporcionan)
      let origins = [];
      if (data.origins !== undefined) {
        // 5.1. Eliminar orígenes existentes
        const existingOrigins = await this.studentOriginRepository.findAll(
          { studentId },
          null,
          null
        );
        for (const origin of existingOrigins.data || []) {
          await this.studentOriginRepository.delete(origin.id);
        }
        this.logger.info('[Estudiantes] Orígenes existentes eliminados', {
          studentId,
          count: (existingOrigins.data || []).length,
        });

        // 5.2. Crear nuevos orígenes si se proporcionan
        if (Array.isArray(data.origins) && data.origins.length > 0) {
          for (const originData of data.origins) {
            const originToCreate = {
              ...originData,
              studentId: studentId,
            };
            // NOTA: userId no se pasa porque actualmente no hay autenticación
            const origin = await this.studentOriginRepository.create(originToCreate);
            origins.push(origin);
          }
          this.logger.info('[Estudiantes] Nuevos orígenes creados', {
            studentId,
            count: origins.length,
          });
        }
      }

      // 6. Actualizar entregas de documentos (reemplazo completo si se proporcionan)
      let documentDeliveries = [];
      if (data.documentation !== undefined) {
        // 6.1. Eliminar entregas de documentos existentes
        const existingDeliveries = await this.studentDocumentDeliveryRepository.findAll(
          { studentId },
          null,
          null
        );
        for (const delivery of existingDeliveries.data || []) {
          await this.studentDocumentDeliveryRepository.delete(delivery.id);
        }
        this.logger.info('[Estudiantes] Entregas de documentos existentes eliminadas', {
          studentId,
          count: (existingDeliveries.data || []).length,
        });

        // 6.2. Crear nuevas entregas de documentos si se proporcionan
        if (data.documentation && typeof data.documentation === 'object') {
          // data.documentation es un objeto con keys como 'doc_1', 'doc_2', etc.
          for (const [docKey, docData] of Object.entries(data.documentation)) {
            // Extraer el ID del documento de la key (ej: 'doc_1' -> 1)
            const documentacionId = parseInt(docKey.replace('doc_', ''), 10);
            
            if (!isNaN(documentacionId) && docData) {
              const deliveryToCreate = {
                studentId: studentId,
                documentacionId,
                entregado: docData.entregado !== undefined ? docData.entregado : false,
                enTramite: docData.enTramite !== undefined ? docData.enTramite : false,
                esOriginal: docData.esOriginal !== undefined ? docData.esOriginal : false,
                fechaEntrega: docData.fechaEntrega || null,
                fechaVencimientoTramite: docData.fechaVencimientoTramite || null,
                observaciones: docData.observaciones || null,
              };
              
              // NOTA: userId no se pasa porque actualmente no hay autenticación
              const delivery = await this.studentDocumentDeliveryRepository.create(deliveryToCreate);
              documentDeliveries.push(delivery);
            }
          }
          this.logger.info('[Estudiantes] Nuevas entregas de documentos creadas', {
            studentId,
            count: documentDeliveries.length,
          });
        }
      }

      // 7. Obtener el estudiante actualizado con todas sus relaciones
      // Si no se actualizaron relaciones, obtenerlas de la base de datos
      if (guardians.length === 0 && data.guardians === undefined) {
        const existingGuardians = await this.studentGuardianRepository.findAll(
          { studentId },
          null,
          null
        );
        guardians = existingGuardians.data || [];
      }
      if (disabilities.length === 0 && data.disabilities === undefined) {
        const existingDisabilities = await this.studentDisabilityRepository.findAll(
          { studentId },
          null,
          null
        );
        disabilities = existingDisabilities.data || [];
      }
      if (origins.length === 0 && data.origins === undefined) {
        const existingOrigins = await this.studentOriginRepository.findAll(
          { studentId },
          null,
          null
        );
        origins = existingOrigins.data || [];
      }
      if (documentDeliveries.length === 0 && data.documentation === undefined) {
        const existingDeliveries = await this.studentDocumentDeliveryRepository.findAll(
          { studentId },
          null,
          null
        );
        documentDeliveries = existingDeliveries.data || [];
      }

      // 8. Retornar el estudiante actualizado con todos sus datos relacionados
      const result = {
        student: updatedStudent.toPlainObject ? updatedStudent.toPlainObject() : updatedStudent,
        guardians: guardians.map((g) =>
          g.toPlainObject ? g.toPlainObject() : g
        ),
        disabilities: disabilities.map((d) =>
          d.toPlainObject ? d.toPlainObject() : d
        ),
        origins: origins.map((o) => (o.toPlainObject ? o.toPlainObject() : o)),
        documentDeliveries: documentDeliveries.map((d) =>
          d.toPlainObject ? d.toPlainObject() : d
        ),
      };

      this.logger.info('[Estudiantes] Estudiante actualizado exitosamente', {
        studentId: updatedStudent.id,
        guardiansCount: guardians.length,
        disabilitiesCount: disabilities.length,
        originsCount: origins.length,
        documentDeliveriesCount: documentDeliveries.length,
      });

      return result;
    } catch (error) {
      this.logger.error('[Estudiantes] Error al actualizar estudiante', {
        studentId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
