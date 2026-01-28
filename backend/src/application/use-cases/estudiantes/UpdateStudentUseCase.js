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
          // Normalizar: string vacío y null se tratan igual para la búsqueda
          const rawExpedicion = studentData.expedition ?? existingStudent.expedition;
          const expedicionToCheck = (rawExpedicion !== undefined && rawExpedicion !== null && String(rawExpedicion).trim() !== '')
            ? String(rawExpedicion).trim()
            : null;

          const studentWithSameCI = await this.studentRepository.findBy({
            ci: ciToCheck,
            expedicion: expedicionToCheck,
          });

          // Si existe otro estudiante con el mismo CI y expedición, y no es el mismo (comparar IDs como número para evitar "3" !== 3)
          const sameStudent = studentWithSameCI && Number(studentWithSameCI.id) === Number(studentId);
          if (studentWithSameCI && !sameStudent) {
            const expedicionLabel = expedicionToCheck ?? 'sin expedición';
            throw new Error(
              `Ya existe otro estudiante con CI ${ciToCheck} ${expedicionLabel}`
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
        const existingGuardiansResult = await this.studentGuardianRepository.findAll(
          { studentId },
          null,
          null
        );
        const existingGuardians = existingGuardiansResult.studentGuardians || [];
        for (const guardian of existingGuardians) {
          const g = guardian.toPlainObject ? guardian.toPlainObject() : guardian;
          await this.studentGuardianRepository.delete(g.id);
        }
        this.logger.info('[Estudiantes] Apoderados existentes eliminados', {
          studentId,
          count: existingGuardians.length,
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
        const existingDisabilitiesResult = await this.studentDisabilityRepository.findAll(
          { studentId },
          null,
          null
        );
        const existingDisabilities = existingDisabilitiesResult.studentDisabilities || [];
        for (const disability of existingDisabilities) {
          const d = disability.toPlainObject ? disability.toPlainObject() : disability;
          await this.studentDisabilityRepository.delete(d.id);
        }
        this.logger.info('[Estudiantes] Discapacidades existentes eliminadas', {
          studentId,
          count: existingDisabilities.length,
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
        const existingOriginsResult = await this.studentOriginRepository.findAll(
          { studentId },
          null,
          null
        );
        const existingOrigins = existingOriginsResult.studentOrigins || [];
        for (const origin of existingOrigins) {
          const o = origin.toPlainObject ? origin.toPlainObject() : origin;
          await this.studentOriginRepository.delete(o.id);
        }
        this.logger.info('[Estudiantes] Orígenes existentes eliminados', {
          studentId,
          count: existingOrigins.length,
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

      // 6. Actualizar entregas de documentos (actualización inteligente: update o create según corresponda)
      let documentDeliveries = [];
      if (data.documentation !== undefined) {
        // 6.1. Obtener entregas de documentos existentes y crear un mapa por documentacionId
        const existingDeliveriesResult = await this.studentDocumentDeliveryRepository.findAll(
          { studentId },
          null,
          null
        );
        const existingDeliveries = existingDeliveriesResult.studentDocumentDeliveries || [];
        
        // Crear mapa de entregas existentes por documentacionId
        // NOTA: Un estudiante puede tener múltiples entregas para el mismo documento (historial)
        // Pero para actualización, tomamos la última entrega activa por documentacionId
        const deliveryMapByDocumentacionId = new Map();
        for (const delivery of existingDeliveries) {
          const deliveryPlain = delivery.toPlainObject ? delivery.toPlainObject() : delivery;
          const docId = deliveryPlain.documentacionId;
          // Si ya existe una entrega para este documentacionId, mantener la más reciente (mayor ID)
          if (!deliveryMapByDocumentacionId.has(docId) || 
              deliveryPlain.id > deliveryMapByDocumentacionId.get(docId).id) {
            deliveryMapByDocumentacionId.set(docId, deliveryPlain);
          }
        }

        this.logger.info('[Estudiantes] Entregas existentes encontradas', {
          studentId,
          count: existingDeliveries.length,
          unicasPorDocumento: deliveryMapByDocumentacionId.size,
        });

        // 6.2. Procesar entregas de documentos del request
        if (data.documentation && typeof data.documentation === 'object') {
          // data.documentation es un objeto con keys como 'doc_1', 'doc_2', etc.
          const processedDocumentacionIds = new Set();
          
          for (const [docKey, docData] of Object.entries(data.documentation)) {
            // Extraer el ID del documento de la key (ej: 'doc_1' -> 1)
            const documentacionId = parseInt(docKey.replace('doc_', ''), 10);
            
            if (!isNaN(documentacionId) && docData) {
              // Verificar si ya procesamos este documentacionId (evitar duplicados en el mismo request)
              if (processedDocumentacionIds.has(documentacionId)) {
                this.logger.warn('[Estudiantes] Documento duplicado en request, ignorando', {
                  studentId,
                  documentacionId,
                  docKey,
                });
                continue;
              }
              processedDocumentacionIds.add(documentacionId);

              // Preparar datos de la entrega
              const entregado = docData.entregado !== undefined ? docData.entregado : false;
              const deliveryData = {
                entregado,
                enTramite: docData.enTramite !== undefined ? docData.enTramite : false,
                fechaEntrega: docData.fechaEntrega || null,
                // Si se marca como entregado, observaciones debe quedar null (no conservar motivo de no entrega)
                observaciones: entregado ? null : (docData.observaciones || null),
              };

              // Verificar si ya existe una entrega para este documentacionId
              const existingDelivery = deliveryMapByDocumentacionId.get(documentacionId);
              
              if (existingDelivery) {
                // 6.2.1. Actualizar entrega existente
                // NOTA: userId no se pasa porque actualmente no hay autenticación
                const updatedDelivery = await this.studentDocumentDeliveryRepository.update(
                  existingDelivery.id,
                  deliveryData
                );
                documentDeliveries.push(updatedDelivery);
                this.logger.info('[Estudiantes] Entrega de documento actualizada', {
                  studentId,
                  deliveryId: existingDelivery.id,
                  documentacionId,
                });
              } else {
                // 6.2.2. Crear nueva entrega
                const deliveryToCreate = {
                  ...deliveryData,
                  studentId: studentId,
                  documentacionId,
                };
                // NOTA: userId no se pasa porque actualmente no hay autenticación
                const newDelivery = await this.studentDocumentDeliveryRepository.create(deliveryToCreate);
                documentDeliveries.push(newDelivery);
                this.logger.info('[Estudiantes] Nueva entrega de documento creada', {
                  studentId,
                  documentacionId,
                });
              }
            }
          }

          // 6.3. Eliminar entregas que no están en el request (opcional: solo si se quiere limpiar)
          // NOTA: Por ahora NO eliminamos entregas que no están en el request para mantener historial
          // Si se quiere eliminar entregas no mencionadas, descomentar el siguiente bloque:
          /*
          const documentacionIdsInRequest = Array.from(processedDocumentacionIds);
          for (const [docId, existingDelivery] of deliveryMapByDocumentacionId.entries()) {
            if (!documentacionIdsInRequest.includes(docId)) {
              await this.studentDocumentDeliveryRepository.delete(existingDelivery.id);
              this.logger.info('[Estudiantes] Entrega de documento eliminada (no está en request)', {
                studentId,
                deliveryId: existingDelivery.id,
                documentacionId: docId,
              });
            }
          }
          */

          this.logger.info('[Estudiantes] Entregas de documentos procesadas', {
            studentId,
            actualizadas: documentDeliveries.filter(d => {
              const plain = d.toPlainObject ? d.toPlainObject() : d;
              return deliveryMapByDocumentacionId.has(plain.documentacionId);
            }).length,
            creadas: documentDeliveries.filter(d => {
              const plain = d.toPlainObject ? d.toPlainObject() : d;
              return !deliveryMapByDocumentacionId.has(plain.documentacionId);
            }).length,
            total: documentDeliveries.length,
          });
        }
      }

      // 7. Obtener el estudiante actualizado con todas sus relaciones
      // Si no se actualizaron relaciones, obtenerlas de la base de datos
      if (guardians.length === 0 && data.guardians === undefined) {
        const res = await this.studentGuardianRepository.findAll(
          { studentId },
          null,
          null
        );
        guardians = res.studentGuardians || [];
      }
      if (disabilities.length === 0 && data.disabilities === undefined) {
        const res = await this.studentDisabilityRepository.findAll(
          { studentId },
          null,
          null
        );
        disabilities = res.studentDisabilities || [];
      }
      if (origins.length === 0 && data.origins === undefined) {
        const res = await this.studentOriginRepository.findAll(
          { studentId },
          null,
          null
        );
        origins = res.studentOrigins || [];
      }
      if (documentDeliveries.length === 0 && data.documentation === undefined) {
        const res = await this.studentDocumentDeliveryRepository.findAll(
          { studentId },
          null,
          null
        );
        documentDeliveries = res.studentDocumentDeliveries || [];
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
