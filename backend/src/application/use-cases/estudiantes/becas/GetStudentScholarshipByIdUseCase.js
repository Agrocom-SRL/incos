/**
 * Use Case: GetStudentScholarshipByIdUseCase
 * Obtiene una asignación de beca (estudiantes_becas) por ID con datos enriquecidos
 * y, si existe, la cabecera de pago de aporte (pago_aporte) vinculada por estudiante_beca_id.
 */

import { StudentMapper } from '../../../mappers/estudiantes/index.js';
import { BecaDescuentoMapper } from '../../../mappers/estudiantes/index.js';
import { ManagementMapper } from '../../../mappers/academico/index.js';

export class GetStudentScholarshipByIdUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.studentScholarshipRepository
   * @param {Object} params.studentRepository
   * @param {Object} params.scholarshipRepository
   * @param {Object} params.managementRepository
   * @param {Object} params.contributionPaymentRepository
   * @param {Object} params.logger
   */
  constructor({
    studentScholarshipRepository,
    studentRepository,
    scholarshipRepository,
    managementRepository,
    contributionPaymentRepository,
    logger,
  }) {
    this.studentScholarshipRepository = studentScholarshipRepository;
    this.studentRepository = studentRepository;
    this.scholarshipRepository = scholarshipRepository;
    this.managementRepository = managementRepository;
    this.contributionPaymentRepository = contributionPaymentRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID de estudiantes_becas
   * @returns {Promise<Object|null>} Objeto enriquecido o null si no existe
   */
  async execute(id) {
    this.logger.info('[Estudiantes] Obtener asignación de beca por ID', { id });

    const scholarship = await this.studentScholarshipRepository.findById(id);
    if (!scholarship) {
      return null;
    }

    const scholarshipPlain = scholarship.toPlainObject ? scholarship.toPlainObject() : scholarship;

    let student = null;
    if (scholarshipPlain.studentId) {
      try {
        const s = await this.studentRepository.findById(scholarshipPlain.studentId);
        if (s) {
          student = StudentMapper.entityToPresentation(s);
        }
      } catch (err) {
        this.logger.warn('[Estudiantes] Error al obtener estudiante (detalle beca)', {
          studentId: scholarshipPlain.studentId,
          error: err.message,
        });
      }
    }

    let scholarshipType = null;
    if (scholarshipPlain.scholarshipId) {
      try {
        const sc = await this.scholarshipRepository.findById(scholarshipPlain.scholarshipId);
        if (sc) {
          scholarshipType = BecaDescuentoMapper.entityToPresentation(sc);
        }
      } catch (err) {
        this.logger.warn('[Estudiantes] Error al obtener tipo de beca (detalle beca)', {
          scholarshipId: scholarshipPlain.scholarshipId,
          error: err.message,
        });
      }
    }

    let management = null;
    if (scholarshipPlain.managementId) {
      try {
        const m = await this.managementRepository.findById(scholarshipPlain.managementId);
        if (m) {
          management = ManagementMapper.entityToPresentation(m);
        }
      } catch (err) {
        this.logger.warn('[Estudiantes] Error al obtener gestión (detalle beca)', {
          managementId: scholarshipPlain.managementId,
          error: err.message,
        });
      }
    }

    const nombres = student?.nombres || '';
    const apellidoPaterno = student?.apellidoPaterno || '';
    const apellidoMaterno = student?.apellidoMaterno || '';
    const nombreCompleto = student
      ? `${nombres} ${apellidoPaterno} ${apellidoMaterno}`.trim()
      : null;

    let payment = null;
    try {
      const paymentEntity = await this.contributionPaymentRepository.findBy({
        studentScholarshipId: id,
      });
      if (paymentEntity) {
        const p = paymentEntity.toPlainObject ? paymentEntity.toPlainObject() : paymentEntity;
        payment = {
          id: p.id,
          state: p.state,
          studentId: p.studentId,
          managementId: p.managementId,
        };
      }
    } catch (err) {
      this.logger.warn('[Estudiantes] Error al buscar pago vinculado a beca', {
        studentScholarshipId: id,
        error: err.message,
      });
    }

    return {
      id: scholarshipPlain.id,
      studentId: scholarshipPlain.studentId,
      scholarshipId: scholarshipPlain.scholarshipId,
      managementId: scholarshipPlain.managementId,
      requestDate: scholarshipPlain.requestDate || scholarshipPlain.fechaSolicitud,
      state: scholarshipPlain.state || scholarshipPlain.estado,
      documentsComplete: scholarshipPlain.documentsComplete || scholarshipPlain.documentosCompletos,
      documentDeliveryStartDate:
        scholarshipPlain.documentDeliveryStartDate || scholarshipPlain.fechaInicioEntregaDocumentos,
      documentDeliveryEndDate:
        scholarshipPlain.documentDeliveryEndDate || scholarshipPlain.fechaFinEntregaDocumentos,
      observations: scholarshipPlain.observations,
      createdAt: scholarshipPlain.createdAt,
      updatedAt: scholarshipPlain.updatedAt,
      student: student
        ? {
            id: student.id,
            codigoEstudiante: student.codigoEstudiante,
            nombreCompleto,
            ci: student.ci,
            expedicion: student.expedicion,
          }
        : null,
      scholarship: scholarshipType
        ? {
            id: scholarshipType.id,
            nombre: scholarshipType.nombre,
            codigo: scholarshipType.codigo,
            porcentaje: scholarshipType.porcentaje,
            descripcion: scholarshipType.descripcion,
            requiereDocumentacion: scholarshipType.requiereDocumentacion,
            requiereAprobacionRector: scholarshipType.requiereAprobacionRector,
            esAutomatica: scholarshipType.esAutomatica,
            tipoAutomatica: scholarshipType.tipoAutomatica,
            promedioMinimo: scholarshipType.promedioMinimo,
          }
        : null,
      management: management
        ? {
            id: management.id,
            codigo: management.codigo,
            nombre: management.nombre,
            anio: management.anio,
          }
        : null,
      payment,
    };
  }
}
