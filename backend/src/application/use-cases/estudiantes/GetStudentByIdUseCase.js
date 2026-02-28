/**
 * Use Case: GetStudentByIdUseCase
 * Módulo: Estudiantes
 * Obtiene un estudiante por ID con todos sus datos relacionados
 * 
 * Responsabilidades:
 * - Validar que el estudiante exista
 * - Obtener el estudiante principal
 * - Obtener apoderados (múltiples)
 * - Obtener discapacidades (múltiples)
 * - Obtener orígenes (múltiples)
 * - Obtener entregas de documentos (múltiples)
 * - Obtener asignaciones de becas (múltiples)
 * - Calcular si faltan documentos de inscripción
 * - Retornar el estudiante con todos sus datos relacionados
 * 
 * NOTA: Los datos académicos se manejan en otro módulo, no se incluyen aquí
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la obtención completa de estudiantes
 * - Dependency Inversion: Depende de abstracciones (repositorios)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 */

import { serverConfig } from '../../../infrastructure/config/server.config.js';
import { StudentPersonalDataMapper, StudentDocumentDeliveryViewMapper } from '../../mappers/estudiantes/index.js';

export class GetStudentByIdUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {Object} params.studentGuardianRepository - Repositorio de apoderados
   * @param {Object} params.studentDisabilityRepository - Repositorio de discapacidades
   * @param {Object} params.studentOriginRepository - Repositorio de orígenes
   * @param {Object} params.studentDocumentDeliveryRepository - Repositorio de entregas de documentos
   * @param {Object} params.countryRepository - Repositorio de países
   * @param {Object} params.departmentRepository - Repositorio de departamentos
   * @param {Object} params.provinceRepository - Repositorio de provincias
   * @param {Object} params.municipalityRepository - Repositorio de municipios
   * @param {Object} params.languageRepository - Repositorio de idiomas
   * @param {Object} params.civilStatusRepository - Repositorio de estados civiles
 * @param {Object} params.disabilityTypeRepository - Repositorio de tipos de discapacidad
 * @param {Object} params.relationshipTypeRepository - Repositorio de tipos de parentesco
 * @param {Object} params.documentacionRepository - Repositorio de documentación
 * @param {Object} params.studentScholarshipRepository - Repositorio de asignaciones de becas
 * @param {Object} params.scholarshipRepository - Repositorio de becas/descuentos
 * @param {Object} params.managementRepository - Repositorio de gestiones
 * @param {Object} params.studentAcademicDataRepository - Repositorio de datos académicos del estudiante
 * @param {Object} params.enrollmentRepository - Repositorio de inscripciones
 * @param {Object} params.getEnrollmentByIdUseCase - Use case para obtener detalle de inscripción
 * @param {Object} params.institutionRepository - Repositorio de instituciones (origen UETHP/CEA/ITT)
 * @param {Object} params.transitabilityRepository - Repositorio de transitabilidades
 * @param {Object} params.transferRepository - Repositorio de traspasos
 * @param {ILogger} params.logger - Logger para registro de eventos
 */
  constructor({
    studentRepository,
    studentGuardianRepository,
    studentDisabilityRepository,
    studentOriginRepository,
    studentDocumentDeliveryRepository,
    countryRepository,
    departmentRepository,
    provinceRepository,
    municipalityRepository,
    languageRepository,
    civilStatusRepository,
    disabilityTypeRepository,
    relationshipTypeRepository,
    documentacionRepository,
    studentScholarshipRepository,
    scholarshipRepository,
    managementRepository,
    studentDocumentRepository,
    studentAcademicDataRepository,
    enrollmentRepository,
    getEnrollmentByIdUseCase,
    institutionRepository,
    transitabilityRepository,
    transferRepository,
    logger,
  }) {
    this.studentRepository = studentRepository;
    this.studentGuardianRepository = studentGuardianRepository;
    this.studentDisabilityRepository = studentDisabilityRepository;
    this.studentOriginRepository = studentOriginRepository;
    this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
    this.countryRepository = countryRepository;
    this.departmentRepository = departmentRepository;
    this.provinceRepository = provinceRepository;
    this.municipalityRepository = municipalityRepository;
    this.languageRepository = languageRepository;
    this.civilStatusRepository = civilStatusRepository;
    this.disabilityTypeRepository = disabilityTypeRepository;
    this.relationshipTypeRepository = relationshipTypeRepository;
    this.documentacionRepository = documentacionRepository;
    this.studentScholarshipRepository = studentScholarshipRepository;
    this.scholarshipRepository = scholarshipRepository;
    this.managementRepository = managementRepository;
    this.studentDocumentRepository = studentDocumentRepository;
    this.studentAcademicDataRepository = studentAcademicDataRepository;
    this.enrollmentRepository = enrollmentRepository;
    this.getEnrollmentByIdUseCase = getEnrollmentByIdUseCase;
    this.institutionRepository = institutionRepository;
    this.transitabilityRepository = transitabilityRepository;
    this.transferRepository = transferRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso de obtención de estudiante por ID
   * 
   * @param {number} studentId - ID del estudiante a obtener
   * @returns {Promise<Object>} Estudiante con todos sus datos relacionados
   */
  async execute(studentId) {
    this.logger.info('[Estudiantes] Iniciando obtención de estudiante por ID', {
      studentId,
    });

    try {
      // 1–4. Datos personales desde vista (estudiante + apoderados + discapacidades + orígenes)
      const rows = await this.studentRepository.obtenerDatosPersonales({ id: studentId });

      if (!rows || rows.length === 0) {
        throw new Error(`No se encontró un estudiante con ID ${studentId}`);
      }

      const { student, guardians, disabilities, origins } =
        StudentPersonalDataMapper.entityToPresentation(rows[0]);

      this.logger.info('[Estudiantes] Estudiante encontrado (vista)', {
        studentId: student?.id,
        studentCode: student?.studentCode,
        guardiansCount: guardians?.length ?? 0,
        disabilitiesCount: disabilities?.length ?? 0,
        originsCount: origins?.length ?? 0,
      });

      // 5. Obtener entregas de documentos desde vista (todas, sin filtrar por entregado)
      const entregasRows = await this.studentDocumentDeliveryRepository.obtenerEntregasConDetalle({
        estudiante_id: student.id,
      });
      const documentDeliveries = StudentDocumentDeliveryViewMapper.entitiesToPresentation(entregasRows || []);

      this.logger.info('[Estudiantes] Entregas de documentos encontradas (vista)', {
        studentId: student.id,
        count: documentDeliveries.length,
      });

      // 6. Obtener asignaciones de becas (múltiples)
      const scholarshipsResult = await this.studentScholarshipRepository.findAll(
        { studentId: student.id },
        null,
        null
      );
      const scholarships = scholarshipsResult.studentScholarships || [];

      this.logger.info('[Estudiantes] Asignaciones de becas encontradas', {
        studentId: student.id,
        count: scholarships.length,
      });

      // 7. Catálogos: solo becas y gestiones (student, guardians, origins, documentDeliveries ya traen nombres desde las vistas)
      // No cargamos: civilStatus, residence*, originCountries, relationshipTypes, documentaciones, disabilityTypes (redundantes)
      const scholarshipIds = new Set();
      const managementIds = new Set();
      scholarships.forEach((scholarship) => {
        if (scholarship.scholarshipId) scholarshipIds.add(scholarship.scholarshipId);
        if (scholarship.managementId) managementIds.add(scholarship.managementId);
      });

      const scholarshipsCatalog = {};
      for (const scholarshipId of scholarshipIds) {
        try {
          const scholarship = await this.scholarshipRepository.findById(scholarshipId);
          if (scholarship) {
            scholarshipsCatalog[scholarshipId] = scholarship.toPlainObject ? scholarship.toPlainObject() : scholarship;
          }
        } catch (err) {
          this.logger.warn('[Estudiantes] Error al obtener tipo de beca', {
            studentId: student.id,
            scholarshipId,
            error: err.message,
          });
        }
      }

      const managements = {};
      for (const managementId of managementIds) {
        try {
          const management = await this.managementRepository.findById(managementId);
          if (management) {
            managements[managementId] = management.toPlainObject ? management.toPlainObject() : management;
          }
        } catch (err) {
          this.logger.warn('[Estudiantes] Error al obtener gestión de beca', {
            studentId: student.id,
            managementId,
            error: err.message,
          });
        }
      }

      // 7. Faltan documentos de inscripción: si alguna entrega (tipo INSCRIPCION, raíz) tiene entregado false/0
      const tieneDocumentosFaltantes = documentDeliveries.some(
        (d) =>
          d.tipoDocumento === 'INSCRIPCION' &&
          (d.documentoPadreId == null || d.documentoPadreId === null) &&
          (d.entregado === false || d.entregado === 0)
      );

      // 7.1. Buscar acta de compromiso existente
      let actaCompromiso = null;
      if (this.studentDocumentRepository) {
        try {
          const documentosResult = await this.studentDocumentRepository.findAll(
            {
              studentId: student.id,
              tipoDocumento: 'ACTA_COMPROMISO',
            },
            null,
            null
          );

          const documentos = documentosResult.studentDocuments || [];
          
          // Buscar el más reciente que contenga ACTA_COMPROMISO en el nombre
          const actaDoc = documentos.find(doc => {
            const docPlain = doc.toPlainObject ? doc.toPlainObject() : doc;
            return docPlain.fileName?.includes('ACTA_COMPROMISO') || 
                   docPlain.tipoDocumento === 'ACTA_COMPROMISO';
          });

          if (actaDoc) {
            const docPlain = actaDoc.toPlainObject ? actaDoc.toPlainObject() : actaDoc;
            const uploadDir = serverConfig.uploadsPath || 'uploads';
            const filePath = docPlain.filePath?.startsWith('/') 
              ? docPlain.filePath 
              : `/${uploadDir}/${docPlain.filePath}`.replace(/\\/g, '/');
            actaCompromiso = {
              filePath: filePath,
              fileName: docPlain.fileName || 'acta_compromiso.pdf',
            };
          }
        } catch (err) {
          this.logger.warn('[Estudiantes] Error al buscar acta de compromiso', {
            studentId: student.id,
            error: err.message,
          });
        }
      }

      // 7.2. Datos académicos del estudiante (para edición: tipo admisión, gestión de ingreso, carrera) e inscripción más reciente
      let academicData = null;
      let inscripcion = null;
      let transitability = null;
      let transfer = null;
      if (this.studentAcademicDataRepository && this.enrollmentRepository && this.getEnrollmentByIdUseCase) {
        try {
          // Obtener datos académicos del estudiante
          const academicDataResult = await this.studentAcademicDataRepository.findAll(
            { studentId: student.id },
            null,
            null
          );
          const academicDataList = academicDataResult.studentAcademicData || [];

          if (academicDataList.length > 0) {
            // Exponer el primer registro de datos académicos (gestionIngresoId, carreraId) para el formulario de edición
            const first = academicDataList[0];
            academicData = first.toPlainObject ? first.toPlainObject() : first;
            // Buscar inscripciones para cada dato académico
            let latestEnrollment = null;
            let latestEnrollmentDate = null;

            for (const academicData of academicDataList) {
              const academicDataPlain = academicData.toPlainObject ? academicData.toPlainObject() : academicData;
              
              if (academicDataPlain.id) {
                try {
                  const enrollmentsResult = await this.enrollmentRepository.findAll(
                    { studentAcademicDataId: academicDataPlain.id },
                    null,
                    null
                  );
                  const enrollments = enrollmentsResult.enrollments || [];

                  // Buscar la inscripción más reciente
                  for (const enrollment of enrollments) {
                    const enrollmentPlain = enrollment.toPlainObject ? enrollment.toPlainObject() : enrollment;
                    const enrollmentDate = enrollmentPlain.createdAt || enrollmentPlain.fechaInscripcion;
                    
                    if (enrollmentDate && (!latestEnrollmentDate || new Date(enrollmentDate) > new Date(latestEnrollmentDate))) {
                      latestEnrollment = enrollmentPlain;
                      latestEnrollmentDate = enrollmentDate;
                    }
                  }
                } catch (err) {
                  this.logger.warn('[Estudiantes] Error al buscar inscripciones para datos académicos', {
                    studentId: student.id,
                    academicDataId: academicDataPlain.id,
                    error: err.message,
                  });
                }
              }
            }

            // Si se encontró una inscripción, obtener su detalle completo
            if (latestEnrollment && latestEnrollment.id) {
              try {
                inscripcion = await this.getEnrollmentByIdUseCase.execute(latestEnrollment.id);
                this.logger.info('[Estudiantes] Inscripción más reciente obtenida', {
                  studentId: student.id,
                  enrollmentId: latestEnrollment.id,
                });
              } catch (err) {
                this.logger.warn('[Estudiantes] Error al obtener detalle de inscripción', {
                  studentId: student.id,
                  enrollmentId: latestEnrollment.id,
                  error: err.message,
                });
              }
            }
          }
        } catch (err) {
          this.logger.warn('[Estudiantes] Error al buscar inscripción del estudiante', {
            studentId: student.id,
            error: err.message,
          });
        }
      }

      // 8.1. Obtener datos específicos de Transitabilidad / Traspaso (para formularios)
      if (this.institutionRepository && this.transitabilityRepository) {
        try {
          const transit = await this.transitabilityRepository.findBy({
            studentId: student.id,
          });
          if (transit) {
            const tPlain = transit.toPlainObject ? transit.toPlainObject() : transit;
            let institution = null;
            if (tPlain.institucionOrigenId) {
              try {
                const inst = await this.institutionRepository.findById(
                  tPlain.institucionOrigenId
                );
                if (inst) {
                  institution = inst.toPlainObject ? inst.toPlainObject() : inst;
                }
              } catch (err) {
                this.logger.warn('[Estudiantes] Error al obtener institución de transitabilidad', {
                  studentId: student.id,
                  institucionOrigenId: tPlain.institucionOrigenId,
                  error: err.message,
                });
              }
            }

            transitability = {
              institucionNombre: institution?.nombre || null,
              codigoSie: institution?.codigoSie || null,
              tipoInstitucion: institution?.tipo || null,
              dependencia: institution?.dependencia || null,
              departamentoId: institution?.departamentoId || null,
              distritoEducativo: institution?.distritoEducativo || null,
              carreraOrigen: tPlain.carreraOrigen || null,
              anioConclusion: tPlain.anioConclusion || null,
              regimenEstudios: tPlain.regimenEstudios || null,
              estado: tPlain.estado || null,
              motivoNoProcedente: tPlain.motivoNoProcedente || null,
            };
          }
        } catch (err) {
          this.logger.warn('[Estudiantes] Error al obtener transitabilidad del estudiante', {
            studentId: student.id,
            error: err.message,
          });
        }
      }

      if (this.institutionRepository && this.transferRepository) {
        try {
          const tr = await this.transferRepository.findBy({
            studentId: student.id,
          });
          if (tr) {
            const tPlain = tr.toPlainObject ? tr.toPlainObject() : tr;
            let institution = null;
            if (tPlain.institucionOrigenId) {
              try {
                const inst = await this.institutionRepository.findById(
                  tPlain.institucionOrigenId
                );
                if (inst) {
                  institution = inst.toPlainObject ? inst.toPlainObject() : inst;
                }
              } catch (err) {
                this.logger.warn('[Estudiantes] Error al obtener institución de traspaso', {
                  studentId: student.id,
                  institucionOrigenId: tPlain.institucionOrigenId,
                  error: err.message,
                });
              }
            }

            transfer = {
              institucionNombre: institution?.nombre || null,
              dependencia: institution?.dependencia || null,
              departamentoId: institution?.departamentoId || null,
              distritoEducativo: institution?.distritoEducativo || null,
              carreraOrigen: tPlain.carreraOrigen || null,
              anioCursado: tPlain.anioCursado || null,
              regimenOrigen: tPlain.regimenOrigen || null,
              estado: tPlain.estado || null,
              motivoNoProcedente: tPlain.motivoNoProcedente || null,
            };
          }
        } catch (err) {
          this.logger.warn('[Estudiantes] Error al obtener traspaso del estudiante', {
            studentId: student.id,
            error: err.message,
          });
        }
      }

      // 9. Retornar el estudiante con todos sus datos relacionados
      const result = {
        student: student,
        guardians,
        disabilities,
        origins,
        documentDeliveries,
        scholarships: scholarships.map((s) =>
          s.toPlainObject ? s.toPlainObject() : s
        ),
        catalogs: {
          scholarships: scholarshipsCatalog,
          managements,
        },
        // Campo para indicar si faltan documentos (para mostrar botón de acta de compromiso)
        tieneDocumentosFaltantes,
        // Acta de compromiso si existe
        actaCompromiso,
        // Inscripción más reciente si existe
        inscripcion,
        // Datos académicos (tipoAdmision, gestionIngresoId, carreraId) para formulario de edición / paso 1
        academicData,
        // Datos específicos de Transitabilidad / Traspaso para formularios de edición
        transitability,
        transfer,
      };

      this.logger.info('[Estudiantes] Estudiante obtenido exitosamente', {
        studentId: student.id,
        guardiansCount: guardians.length,
        disabilitiesCount: disabilities.length,
        originsCount: origins.length,
        documentDeliveriesCount: documentDeliveries.length,
        scholarshipsCount: scholarships.length,
        hasTransitability: !!transitability,
        hasTransfer: !!transfer,
        tieneDocumentosFaltantes: result.tieneDocumentosFaltantes,
        tipoTieneDocumentosFaltantes: typeof result.tieneDocumentosFaltantes,
        resultKeys: Object.keys(result),
        catalogsCount: {
          scholarships: Object.keys(result.catalogs.scholarships).length,
          managements: Object.keys(result.catalogs.managements).length,
        },
      });

      return result;
    } catch (error) {
      this.logger.error('[Estudiantes] Error al obtener estudiante por ID', {
        error: error.message,
        stack: error.stack,
        studentId,
      });
      throw error;
    }
  }
}

