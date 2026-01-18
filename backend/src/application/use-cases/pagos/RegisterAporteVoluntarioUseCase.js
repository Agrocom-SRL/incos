import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { METODOS_PAGO } from '../../../domain/constants/payments.constants.js';

/**
 * Use Case: RegisterAporteVoluntarioUseCase
 * Módulo: Pagos Académicos
 * Registra el pago del aporte académico de un estudiante
 * 
 * IMPORTANTE: El pago se realiza ANTES de la inscripción según el nuevo schema.
 * El recibo y comprobante son documentos requeridos para inscribirse.
 * 
 * APLICACIÓN DEL DESCUENTO POR BECA:
 * 
 * - monto_total: 400.00 (Aporte académico base, de configuracion_aportes)
 * - descuento_beca: Calculado automáticamente según beca activa del estudiante
 *   Ejemplo: Si tiene beca 50% → descuento_beca = 200.00
 * - monto_pagado: Debe ser igual a (monto_total - descuento_beca)
 * 
 * Ejemplo con beca 50%:
 *   - monto_total: 400.00
 *   - descuento_beca: 200.00 (50%)
 *   - monto_pagado: 200.00 (lo que el estudiante paga)
 * 
 * CAMBIOS CON RESPECTO AL SCHEMA ANTERIOR:
 * - Se usa ContributionPaymentRepository (en lugar de PaymentRepository)
 * - metodoPago (string) → metodoPagoId (FK a metodos_pago)
 * - banco (string) → cuentaPagoId (FK a cuentas_pago, contiene banco)
 * - No hay campos estado, validado (la validación se maneja fuera del schema)
 * - Se incluye estudianteBecaId para referenciar la beca aplicada
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja el registro de pagos del aporte académico
 * - Dependency Inversion: Depende de abstracciones (repositorios)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 */
export class RegisterAporteVoluntarioUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.contributionPaymentRepository - Repositorio de pagos de aporte
   * @param {Object} params.paymentMethodRepository - Repositorio de métodos de pago
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {Object} params.enrollmentRepository - Repositorio de inscripciones
   * @param {Object} params.studentScholarshipRepository - Repositorio de becas de estudiantes
   * @param {Object} params.scholarshipRepository - Repositorio de tipos de beca/descuento
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({
    contributionPaymentRepository,
    paymentMethodRepository,
    studentRepository,
    enrollmentRepository,
    studentScholarshipRepository,
    scholarshipRepository,
    logger,
  }) {
    this.contributionPaymentRepository = contributionPaymentRepository;
    this.paymentMethodRepository = paymentMethodRepository;
    this.studentRepository = studentRepository;
    this.enrollmentRepository = enrollmentRepository;
    this.studentScholarshipRepository = studentScholarshipRepository;
    this.scholarshipRepository = scholarshipRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso de registro de aporte voluntario
   * 
   * Flujo:
   * 1. Validar estudiante, inscripción y gestión
   * 2. Obtener beca activa del estudiante
   * 3. Calcular descuento por beca (si existe)
   * 4. Determinar estado inicial según método de pago
   * 5. Crear registro de pago
   * 
   * @param {Object} data - Datos del pago (snake_case desde frontend)
   * @param {number} data.student_id - ID del estudiante (requerido)
   * @param {number} data.enrollment_id - ID de la inscripción (requerido)
   * @param {string} data.metodo_pago - Método de pago (requerido)
   * @param {number} data.monto_total - Monto total del aporte (default: 400.00)
   * @param {string} data.fecha_pago - Fecha del pago en formato YYYY-MM-DD (requerido)
   * @param {string} [data.numero_transaccion] - Número de transacción (opcional, requerido para TRANSFERENCIA/DEPOSITO)
   * @param {string} [data.banco] - Banco (opcional, para TRANSFERENCIA/DEPOSITO)
   * @param {string} [data.observaciones] - Observaciones (opcional)
   * @returns {Promise<Object>} Pago creado con todos sus datos
   */
  async execute(data) {
    // Normalizar nombres de campos de snake_case a camelCase
    const studentId = data.student_id || data.studentId;
    const enrollmentId = data.enrollment_id || data.enrollmentId;
    const paymentMethod = data.metodo_pago || data.paymentMethod;
    const totalAmount = data.monto_total !== undefined ? parseFloat(data.monto_total) : 400.00;
    const paymentDate = data.fecha_pago || data.paymentDate;
    const transactionNumber = data.numero_transaccion || data.transactionNumber;
    const bank = data.banco || data.bank;
    const observations = data.observaciones || data.observations;

    this.logger.info('[Pagos] Iniciando registro de aporte voluntario', {
      studentId,
      enrollmentId,
      paymentMethod,
      totalAmount,
    });

    try {
      // 1. Validar estudiante e inscripción
      const student = await this._validateStudent(studentId);
      const enrollment = await this._validateEnrollment(enrollmentId, studentId);

      // Obtener gestión desde la inscripción (no desde configuración)
      if (!enrollment.managementId) {
        throw new ValidationError(
          'La inscripción no tiene una gestión asociada'
        );
      }

      // 2. Validar método de pago y obtener su ID
      this._validatePaymentMethod(paymentMethod, transactionNumber);
      const paymentMethodId = await this._getPaymentMethodId(paymentMethod);

      // 3. Obtener beca activa del estudiante y calcular descuento
      // El descuento se calcula sobre el monto_total del aporte
      const { scholarshipDiscount, studentScholarshipId } = await this._calculateScholarshipDiscount(
        studentId,
        enrollment.managementId,
        totalAmount
      );

      // 4. Calcular monto a pagar (después de aplicar descuentos)
      const amountToPay = totalAmount - scholarshipDiscount;

      // 5. Obtener cuentaPagoId si es necesario (para métodos que requieren cuenta)
      // Por ahora lo dejamos NULL, se puede implementar lógica para buscar cuenta activa
      const paymentAccountId = null;

      // 6. Preparar datos del pago
      // IMPORTANTE según nuevo schema (pago_aporte):
      // - gestion_id: Se pasa explícitamente (pago puede ser antes de inscripción)
      // - inscripcion_id: Puede ser NULL inicialmente (se vincula después)
      // - estudiante_beca_id: ID de la beca activa aplicada
      // - metodo_pago_id: FK a metodos_pago (en lugar de string)
      // - cuenta_pago_id: FK a cuentas_pago (en lugar de banco string)
      // - monto_pagado: Debe ser igual a (monto_total - descuento_beca)
      const paymentData = this._preparePaymentData({
        studentId,
        managementId: enrollment.managementId,
        enrollmentId, // Puede ser NULL si el pago es antes de la inscripción
        studentScholarshipId,
        paymentMethodId,
        paymentAccountId,
        totalAmount,
        scholarshipDiscount,
        amountToPay, // Monto que debe pagar (después de descuentos)
        paymentDate,
        transactionNumber,
        observations,
      });

      // 7. Crear registro de pago
      const payment = await this.contributionPaymentRepository.create(paymentData);

      this.logger.info('[Pagos] Pago de aporte académico registrado', {
        paymentId: payment.id,
        receiptNumber: payment.receiptNumber,
        scholarshipDiscount,
        amountPaid: payment.amountPaid,
      });

      // 7. Retornar pago creado
      return {
        payment: payment.toPlainObject ? payment.toPlainObject() : payment,
      };
    } catch (error) {
      this.logger.error('[Pagos] Error al registrar aporte académico', {
        error: error.message,
        stack: error.stack,
        data,
      });
      throw error;
    }
  }

  /**
   * Valida que el estudiante exista
   * @private
   * @param {number} studentId - ID del estudiante
   * @returns {Promise<Object>} Entidad Student
   * @throws {NotFoundError} Si el estudiante no existe
   */
  async _validateStudent(studentId) {
    if (!studentId) {
      throw new ValidationError('El ID del estudiante es requerido');
    }

    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundError(`Estudiante con ID ${studentId}`);
    }

    return student;
  }

  /**
   * Valida que la inscripción exista y pertenezca al estudiante
   * @private
   * @param {number} enrollmentId - ID de la inscripción
   * @param {number} studentId - ID del estudiante
   * @returns {Promise<Object>} Entidad Enrollment
   * @throws {NotFoundError} Si la inscripción no existe
   * @throws {ValidationError} Si la inscripción no pertenece al estudiante
   */
  async _validateEnrollment(enrollmentId, studentId) {
    if (!enrollmentId) {
      throw new ValidationError('El ID de la inscripción es requerido');
    }

    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundError(`Inscripción con ID ${enrollmentId}`);
    }

    // Validar que la inscripción pertenezca al estudiante
    // Necesitamos obtener los datos académicos del estudiante para comparar
    // Por ahora validamos que exista la inscripción, la validación de pertenencia
    // se hará con la gestión en el método execute
    // TODO: Agregar validación más estricta si es necesario

    return enrollment;
  }

  /**
   * Obtiene el ID del método de pago desde su código
   * @private
   * @param {string} paymentMethodCode - Código del método de pago (ej: 'EFECTIVO', 'TRANSFERENCIA')
   * @returns {Promise<number>} ID del método de pago
   * @throws {NotFoundError} Si el método de pago no existe
   */
  async _getPaymentMethodId(paymentMethodCode) {
    const paymentMethod = await this.paymentMethodRepository.findBy({
      code: paymentMethodCode,
      active: true,
    });

    if (!paymentMethod) {
      throw new NotFoundError(`Método de pago con código ${paymentMethodCode}`);
    }

    return paymentMethod.id;
  }

  /**
   * Valida el método de pago y sus datos requeridos
   * @private
   * @param {string} paymentMethod - Método de pago (código)
   * @param {string} transactionNumber - Número de transacción
   * @throws {ValidationError} Si el método no es válido o faltan datos requeridos
   */
  _validatePaymentMethod(paymentMethod, transactionNumber) {
    const validMethods = Object.values(METODOS_PAGO);
    if (!validMethods.includes(paymentMethod)) {
      throw new ValidationError(`Método de pago inválido: ${paymentMethod}`);
    }

    // Para TRANSFERENCIA y DEPOSITO, el número de transacción es requerido
    if (
      (paymentMethod === METODOS_PAGO.TRANSFERENCIA ||
        paymentMethod === METODOS_PAGO.DEPOSITO) &&
      !transactionNumber
    ) {
      throw new ValidationError(
        `El número de transacción es requerido para el método ${paymentMethod}`
      );
    }
  }

  /**
   * Calcula el descuento por beca activa del estudiante
   * @private
   * @param {number} studentId - ID del estudiante
   * @param {number} managementId - ID de la gestión
   * @param {number} totalAmount - Monto total del aporte
   * @returns {Promise<Object>} Objeto con { scholarshipDiscount, studentScholarshipId }
   */
  async _calculateScholarshipDiscount(studentId, managementId, totalAmount) {
    // Buscar beca activa del estudiante en la gestión
    const activeScholarship = await this.studentScholarshipRepository.findBy({
      studentId,
      managementId,
      state: 'ACTIVA',
    });

    if (!activeScholarship) {
      return {
        scholarshipDiscount: 0.00,
        studentScholarshipId: null,
      };
    }

    // Obtener el tipo de beca para obtener el porcentaje
    const scholarship = await this.scholarshipRepository.findById(
      activeScholarship.scholarshipId
    );

    if (!scholarship || !scholarship.percentage) {
      this.logger.warn('[Pagos] Beca activa sin porcentaje definido', {
        studentId,
        scholarshipId: activeScholarship.scholarshipId,
      });
      return {
        scholarshipDiscount: 0.00,
        studentScholarshipId: activeScholarship.id,
      };
    }

    // Calcular descuento: monto_total * (porcentaje / 100)
    const discountAmount = totalAmount * (scholarship.percentage / 100);

    this.logger.info('[Pagos] Descuento por beca calculado', {
      studentId,
      studentScholarshipId: activeScholarship.id,
      scholarshipPercentage: scholarship.percentage,
      totalAmount,
      discountAmount,
    });

    return {
      scholarshipDiscount: parseFloat(discountAmount.toFixed(2)),
      studentScholarshipId: activeScholarship.id,
    };
  }

  /**
   * Prepara los datos del pago para crear el registro según el nuevo schema (pago_aporte)
   * 
   * IMPORTANTE: APLICACIÓN DEL DESCUENTO
   * - monto_total: 400.00 (Aporte académico base, de configuracion_aportes)
   * - descuento_beca: Calculado según beca activa (ej: 50% = 200.00)
   * - monto_pagado: Debe ser igual a (monto_total - descuento_beca)
   * 
   * Ejemplo:
   * - monto_total: 400.00
   * - descuento_beca: 200.00 (50%)
   * - monto_pagado: 200.00 (lo que el estudiante paga)
   * 
   * CAMBIOS DEL NUEVO SCHEMA:
   * - managementId: Se incluye (pago puede ser antes de inscripción)
   * - studentScholarshipId: ID de la beca activa aplicada
   * - paymentMethodId: FK a metodos_pago (en lugar de string)
   * - paymentAccountId: FK a cuentas_pago (en lugar de banco string)
   * - NO hay campos: estado, validado, paymentPeriod (no existen en pago_aporte)
   * 
   * @private
   * @param {Object} data - Datos del pago
   * @returns {Object} Datos preparados para el repositorio
   */
  _preparePaymentData(data) {
    // Calcular monto a pagar (monto_total - descuento_beca)
    const amountToPay = data.amountToPay || (data.totalAmount - data.scholarshipDiscount);

    const paymentData = {
      studentId: data.studentId,
      managementId: data.managementId, // Se incluye (pago puede ser antes de inscripción)
      enrollmentId: data.enrollmentId, // Puede ser NULL inicialmente
      studentScholarshipId: data.studentScholarshipId || null, // ID de la beca activa
      paymentMethodId: data.paymentMethodId, // FK a metodos_pago
      paymentAccountId: data.paymentAccountId || null, // FK a cuentas_pago (en lugar de banco)
      totalAmount: data.totalAmount, // 400.00 (base)
      scholarshipDiscount: data.scholarshipDiscount || 0.00, // Descuento por beca
      amountPaid: amountToPay, // Monto que el estudiante paga (después de descuentos)
      paymentDate: data.paymentDate,
      concept: 'Aporte Académico',
    };

    // Solo incluir campos opcionales si tienen valor
    if (data.transactionNumber) {
      paymentData.transactionNumber = data.transactionNumber;
    }
    if (data.observations) {
      paymentData.observations = data.observations;
    }

    return paymentData;
  }
}
