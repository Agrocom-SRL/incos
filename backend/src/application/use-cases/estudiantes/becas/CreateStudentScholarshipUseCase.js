/**
 * Use Case: CreateStudentScholarshipUseCase
 * Módulo: Estudiantes
 * Crea una nueva asignación de beca para un estudiante
 *
 * Responsabilidades:
 * - Obtener la gestión actual desde la configuración del sistema
 * - Validar que no exista una asignación duplicada (mismo estudiante + misma beca + misma gestión)
 * - Crear la asignación de beca con valores por defecto según el schema
 * - Actualizar pago_aporte con estudiante_beca_id, descuento_beca y monto_obligatorio recalculados
 * - Si la beca es 100%, registrar una cuota con monto 0 en pago_cuotas y marcar pago_aporte como CANCELADO
 * - Retornar la asignación creada mapeada a formato de presentación
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la creación de asignaciones de becas y su impacto en aportes
 * - Dependency Inversion: Depende de abstracciones (repositorios)
 *
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 * - Usa Mapper (Application) para conversión Domain → Presentation
 */

import { ESTADOS_BECAS } from '../../../../domain/constants/index.js';
import { ESTADOS_PAGO_APORTE } from '../../../../domain/constants/pagos.constants.js';
import { ValidationError, NotFoundError } from '../../../../domain/errors/AppError.js';
import { StudentScholarship } from '../../../../domain/entities/StudentScholarship.js';
import { StudentScholarshipMapper } from '../../../mappers/estudiantes/StudentScholarshipMapper.js';

export class CreateStudentScholarshipUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.studentScholarshipRepository - Repositorio de asignaciones de becas
   * @param {Object} params.configuracionSistemaRepository - Repositorio de configuración del sistema
   * @param {Object} params.managementRepository - Repositorio de gestiones
   * @param {Object} params.scholarshipRepository - Repositorio de becas/descuentos (porcentaje)
   * @param {Object} params.contributionConfigurationRepository - Repositorio de configuración de aportes (monto base)
   * @param {Object} params.contributionPaymentRepository - Repositorio de cabecera pago_aporte
   * @param {Object} params.contributionPaymentInstallmentRepository - Repositorio de cuotas pago_cuotas
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({
    studentScholarshipRepository,
    configuracionSistemaRepository,
    managementRepository,
    scholarshipRepository,
    contributionConfigurationRepository,
    contributionPaymentRepository,
    contributionPaymentInstallmentRepository,
    logger,
  }) {
    this.studentScholarshipRepository = studentScholarshipRepository;
    this.configuracionSistemaRepository = configuracionSistemaRepository;
    this.managementRepository = managementRepository;
    this.scholarshipRepository = scholarshipRepository;
    this.contributionConfigurationRepository = contributionConfigurationRepository;
    this.contributionPaymentRepository = contributionPaymentRepository;
    this.contributionPaymentInstallmentRepository = contributionPaymentInstallmentRepository;
    this.logger = logger;
  }

  /**
   * Método interno para verificar que no exista una asignación duplicada
   * Valida que no exista una asignación con el mismo estudiante, beca y gestión
   *
   * @private
   * @param {number} studentId - ID del estudiante
   * @param {number} scholarshipId - ID de la beca/descuento
   * @param {number} managementId - ID de la gestión
   * @returns {Promise<void>}
   * @throws {ValidationError} Si ya existe una asignación duplicada
   */
  async _validateNoDuplicateAssignment(studentId, scholarshipId, managementId) {
    const existingAssignment = await this.studentScholarshipRepository.findBy({
      studentId,
      scholarshipId,
      managementId,
    });

    if (existingAssignment) {
      throw new ValidationError(
        `Ya existe una asignación de esta beca para el estudiante en la gestión actual`
      );
    }
  }

  /**
   * Obtiene la gestión actual desde la configuración del sistema
   * La configuración almacena el año académico, no el ID de la gestión
   *
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
    // Filtrar directamente por año y vigente: true en la consulta
    const management = await this.managementRepository.findBy(
      { year: gestionAnio, vigente: true }
    );

    // 5. Validar que se encontró la gestión vigente
    if (!management) {
      throw new NotFoundError(`No se encontró una gestión vigente para el año ${gestionAnio}`);
    }

    return management;
  }

  /**
   * Método interno para preparar los datos de la asignación
   * Solo incluye campos que NO tienen valores por defecto en el schema
   *
   * Campos sin DEFAULT (SÍ se envían):
   * - estudiante_id: NOT NULL (requerido)
   * - beca_descuento_id: NOT NULL (requerido)
   * - gestion_id: NOT NULL (requerido)
   * - fecha_solicitud: NOT NULL sin DEFAULT (requerido)
   * - observaciones: NULL por defecto, solo si tiene valor
   *
   * @private
   * @param {Object} data - Datos de entrada
   * @param {number} data.studentId - ID del estudiante
   * @param {number} data.scholarshipId - ID de la beca/descuento
   * @param {number} managementId - ID de la gestión obtenida de la configuración
   * @param {string} [data.observations] - Observaciones (opcional)
   * @returns {Object} Datos preparados para crear la asignación
   */
  _prepareAssignmentData(data, managementId) {
    const assignmentData = {
      studentId: data.studentId,
      scholarshipId: data.scholarshipId,
      managementId,
      requestDate: new Date().toISOString().split('T')[0], // fecha_solicitud: NOT NULL sin DEFAULT
      state: ESTADOS_BECAS.ACTIVA,
    };

    // Solo agregar observations si se proporciona (es opcional, NULL por defecto)
    if (data.observations) {
      assignmentData.observations = data.observations;
    }

    return assignmentData;
  }

  /**
   * Obtiene la configuración de aporte activa para una gestión (monto base).
   * @private
   * @param {number} managementId - ID de la gestión
   * @returns {Promise<number>} Monto base del aporte (default 400)
   */
  async _getMontoBaseAporte(managementId) {
    try {
      const result = await this.contributionConfigurationRepository.findAll(
        { managementId, contributionActive: true },
        null,
        { limit: 1 }
      );
      const list = result?.contributionConfigurations ?? result?.configuracionesAportes ?? [];
      const config = list[0] ?? null;
      const monto = config?.montoBase ?? config?.baseAmount ?? 400;
      return Number(monto) || 400;
    } catch (err) {
      this.logger.warn('[Estudiantes] No se pudo obtener configuración de aporte', {
        managementId,
        error: err?.message,
      });
      return 400;
    }
  }

  /**
   * Actualiza pago_aporte con la beca asignada: estudiante_beca_id, descuento_beca y monto_obligatorio.
   * Si la beca es 100%, registra una cuota con monto 0 y marca el aporte como CANCELADO.
   *
   * @private
   * @param {Object} createdAssignment - Asignación de beca recién creada (estudiantes_becas)
   * @param {Object} data - Datos de entrada (studentId, scholarshipId)
   * @param {Object} currentManagement - Gestión vigente
   * @returns {Promise<{pagoAporteId?: number, esBeca100?: boolean}>}
   */
  async _actualizarPagoAportePorBeca(createdAssignment, data, currentManagement) {
    const studentId = data.studentId;
    const managementId = currentManagement.id ?? currentManagement.toPlainObject?.()?.id;
    const scholarshipId = data.scholarshipId ?? createdAssignment.scholarshipId;

    const scholarship = await this.scholarshipRepository.findById(scholarshipId);
    if (!scholarship) {
      this.logger.warn('[Estudiantes] Tipo de beca no encontrado, no se actualiza pago_aporte', {
        studentId,
        scholarshipId,
      });
      return {};
    }

    const percentage = Number(scholarship.percentage ?? scholarship.porcentaje ?? 0);
    const baseAmount = await this._getMontoBaseAporte(managementId);
    const scholarshipDiscount = parseFloat(
      (baseAmount * (percentage / 100)).toFixed(2)
    );
    const mandatoryAmount = Math.max(0, parseFloat((baseAmount - scholarshipDiscount).toFixed(2)));

    let cabecera = await this.contributionPaymentRepository.findBy({
      studentId,
      managementId,
    });

    if (cabecera) {
      await this.contributionPaymentRepository.update(cabecera.id, {
        studentScholarshipId: createdAssignment.id,
        scholarshipDiscount,
        mandatoryAmount,
      });
      this.logger.info('[Estudiantes] pago_aporte actualizado con beca', {
        cabeceraId: cabecera.id,
        studentId,
        managementId,
        studentScholarshipId: createdAssignment.id,
        scholarshipDiscount,
        mandatoryAmount,
      });
    } else {
      const cabeceraData = {
        studentId,
        managementId,
        studentScholarshipId: createdAssignment.id,
        baseAmount,
        scholarshipDiscount,
        mandatoryAmount,
        state: ESTADOS_PAGO_APORTE.PENDIENTE,
      };
      cabecera = await this.contributionPaymentRepository.create(cabeceraData);
      this.logger.info('[Estudiantes] pago_aporte creado con beca', {
        cabeceraId: cabecera.id,
        studentId,
        managementId,
      });
    }

    const cabeceraId = cabecera.id ?? cabecera.toPlainObject?.()?.id;
    const esBeca100 = percentage >= 99.99;

    if (esBeca100 && cabeceraId) {
      const hoy = new Date().toISOString().split('T')[0];
      const observacion = data.observations != null ? String(data.observations).trim() : '';
      let descripcionCuota;
      if (observacion !== '') {
        descripcionCuota = observacion;
      } else {
        const scholarshipPlain = scholarship.toPlainObject ? scholarship.toPlainObject() : scholarship;
        const nombreTipoBeca = scholarshipPlain.name ?? scholarshipPlain.nombre ?? scholarshipPlain.code ?? 'Beca 100%';
        const fechaRaw = createdAssignment.requestDate ?? createdAssignment.request_date ?? hoy;
        const fechaStr = typeof fechaRaw === 'string' && fechaRaw.length >= 10
          ? fechaRaw.slice(0, 10)
          : hoy;
        const [y, m, d] = fechaStr.split('-');
        const fechaAsignacion = [d, m, y].join('/');
        descripcionCuota = `Beca ${nombreTipoBeca} - ${fechaAsignacion}`;
      }
      const cuotaData = {
        contributionPaymentId: cabeceraId,
        receiptNumber: `TEMP-${cabeceraId}-${Date.now()}`,
        paymentDate: hoy,
        amount: 0,
        paymentMethodId: 1,
        paymentAccountId: null,
        transactionNumber: null,
        comprobanteCode: null,
        description: descripcionCuota,
      };
      const cuota = await this.contributionPaymentInstallmentRepository.create(cuotaData);
      const numeroRecibo = String(cuota.id).padStart(6, '0');
      await this.contributionPaymentInstallmentRepository.update(cuota.id, {
        receiptNumber: numeroRecibo,
      });
      await this.contributionPaymentRepository.update(cabeceraId, {
        state: ESTADOS_PAGO_APORTE.CANCELADO,
      });
      this.logger.info('[Estudiantes] Beca 100%: cuota 0 registrada y pago_aporte CANCELADO', {
        cabeceraId: cabeceraId,
        cuotaId: cuota.id,
        numeroRecibo,
      });
    }

    return { pagoAporteId: cabeceraId ?? null, esBeca100 };
  }

  /**
   * Ejecuta el caso de uso de crear una asignación de beca
   *
   * Sigue el patrón de GetEnrollmentByIdUseCase:
   * - Logging inicial
   * - Try-catch para manejo de errores
   * - Logging de éxito/error
   * - Métodos internos para separar responsabilidades
   * - Mapeo a formato de presentación
   *
   * @param {Object} data - Datos de la asignación de beca a crear
   * @param {number} data.studentId - ID del estudiante (requerido)
   * @param {number} data.scholarshipId - ID de la beca/descuento (requerido)
   * @param {string} [data.observations] - Observaciones (opcional)
   * @returns {Promise<Object>} Asignación de beca creada en formato de presentación
   *
   * NOTA: userId no se pasa porque actualmente no hay autenticación
   * Los repositorios tienen userId = null como default para los campos de auditoría
   */
  async execute(data) {
    this.logger.info('[Estudiantes] Iniciando creación de asignación de beca', {
      studentId: data.studentId,
      scholarshipId: data.scholarshipId,
    });

    try {
      // 1. Obtener la gestión actual desde la configuración del sistema
      const currentManagement = await this._getCurrentManagement();

      // 2. Validar que no exista una asignación duplicada
      // No se puede registrar una solicitud si ya tiene una en proceso (mismo estudiante + beca + gestión)
      await this._validateNoDuplicateAssignment(
        data.studentId,
        data.scholarshipId,
        currentManagement.id
      );

      // 3. Preparar datos para crear la asignación
      // Solo incluir campos que no tienen valores por defecto en el schema
      const assignmentData = this._prepareAssignmentData(data, currentManagement.id);

      // 4. Crear la entidad StudentScholarship
      const studentScholarship = new StudentScholarship(assignmentData);

      // 5. Crear la asignación en el repositorio
      // NOTA: userId no se pasa porque actualmente no hay autenticación
      // El repositorio tiene userId = null como default
      const createdAssignment = await this.studentScholarshipRepository.create(
        studentScholarship
      );

      this.logger.info('[Estudiantes] Asignación de beca creada exitosamente', {
        assignmentId: createdAssignment.id,
        studentId: createdAssignment.studentId,
        scholarshipId: createdAssignment.scholarshipId,
        managementId: createdAssignment.managementId,
        state: createdAssignment.state,
      });

      // 5.1 Actualizar pago_aporte con beca: descuento y monto obligatorio; si beca 100%, cuota 0 y estado CANCELADO
      let pagoAporteId = null;
      let esBeca100 = false;
      try {
        const pagoResult = await this._actualizarPagoAportePorBeca(createdAssignment, data, currentManagement);
        pagoAporteId = pagoResult?.pagoAporteId ?? null;
        esBeca100 = pagoResult?.esBeca100 === true;
      } catch (errPago) {
        this.logger.error('[Estudiantes] Error al actualizar pago_aporte por beca (asignación ya creada)', {
          error: errPago?.message,
          studentId: data.studentId,
          assignmentId: createdAssignment.id,
        });
        throw errPago;
      }

      // 6. Convertir entidad de dominio a formato de presentación usando mapper
      const studentScholarshipPresentation = StudentScholarshipMapper.entityToPresentation(
        createdAssignment
      );

      // 7. Retornar la asignación creada y datos para redirección (pago_aporte id y si es beca 100%)
      return {
        studentScholarship: studentScholarshipPresentation,
        pagoAporteId,
        esBeca100,
      };
    } catch (error) {
      this.logger.error('[Estudiantes] Error al crear asignación de beca', {
        error: error.message,
        stack: error.stack,
        studentId: data.studentId,
        scholarshipId: data.scholarshipId,
      });

      // Re-lanzar el error para que el controlador/middleware lo maneje
      throw error;
    }
  }
}
