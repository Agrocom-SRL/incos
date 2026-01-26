import { body } from 'express-validator';

/**
 * Validador para registro de pagos de aporte académico
 * POST /api/v1/pagos-aportes
 * 
 * Reglas de Negocio:
 * - EFECTIVO (id=1): No requiere numero_transaccion, cuenta_pago_id = NULL
 * - QR (id=2): Requiere numero_transaccion, cuenta_pago_id opcional (la cuenta está en la imagen del QR)
 * - TRANSFERENCIA (id=3): Requiere numero_transaccion, cuenta_pago_id requerida
 * 
 * Campos que recibe del frontend:
 * - student_id: ID del estudiante (requerido)
 * - payment_method_id: ID del método de pago (requerido, 1=EFECTIVO, 2=QR, 3=TRANSFERENCIA)
 * - payment_account_id: ID de la cuenta de pago (requerido solo para TRANSFERENCIA, opcional para QR, NULL para EFECTIVO)
 * - payment_date: Fecha del pago (requerido, formato YYYY-MM-DD)
 * - transaction_number: Número de transacción (requerido para QR y TRANSFERENCIA, opcional para EFECTIVO)
 * - concept: Concepto del pago (requerido, ej: "Aporte Académico", "Pago de Matrícula")
 */
export const registerPagoAporteValidator = [
    // ============================================
    // CAMPOS REQUERIDOS
    // ============================================
    body('student_id')
        .notEmpty()
        .withMessage('El ID del estudiante es requerido')
        .isInt({ min: 1 })
        .withMessage('El ID del estudiante debe ser un número entero mayor a 0')
        .toInt(),

    body('payment_method_id')
        .notEmpty()
        .withMessage('El ID del método de pago es requerido')
        .isInt({ min: 1 })
        .withMessage('El ID del método de pago debe ser un número entero mayor a 0')
        .isIn([1, 2, 3, 4])
        .withMessage('El método de pago debe ser: 1 (EFECTIVO), 2 (QR), 3 (TRANSFERENCIA) o 4 (DEPOSITO)')
        .toInt(),

    body('payment_date')
        .notEmpty()
        .withMessage('La fecha de pago es requerida')
        .isISO8601()
        .withMessage('La fecha de pago debe estar en formato YYYY-MM-DD')
        .toDate(),

    body('concept')
        .notEmpty()
        .withMessage('El concepto del pago es requerido')
        .isString()
        .withMessage('El concepto debe ser una cadena de texto')
        .trim()
        .isLength({ min: 3, max: 500 })
        .withMessage('El concepto debe tener entre 3 y 500 caracteres'),

    // ============================================
    // CAMPOS CONDICIONALES (según método de pago)
    // ============================================
    body('payment_account_id')
        .optional({ nullable: true })
        .custom((value, { req }) => {
            const methodId = req.body.payment_method_id;

            // Para TRANSFERENCIA (3) y DEPOSITO (4), la cuenta es REQUERIDA
            if ((methodId === 3 || methodId === 4) && !value) {
                throw new Error('La cuenta de pago es requerida para método TRANSFERENCIA o DEPOSITO');
            }

            // Para EFECTIVO (1), la cuenta debe ser NULL
            if (methodId === 1 && value) {
                throw new Error('La cuenta de pago debe ser NULL para método EFECTIVO');
            }

            // Para QR (2), la cuenta es OPCIONAL (la cuenta está en la imagen del QR)
            // No se valida si está presente o no

            // Si existe valor, debe ser un número válido
            if (value && (!Number.isInteger(Number(value)) || Number(value) < 1)) {
                throw new Error('El ID de la cuenta de pago debe ser un número entero mayor a 0');
            }

            return true;
        })
        .toInt(),

    body('transaction_number')
        .optional({ nullable: true })
        .custom((value, { req }) => {
            const methodId = req.body.payment_method_id;

            // Para QR (2), TRANSFERENCIA (3) y DEPOSITO (4), el número de transacción es REQUERIDO
            if ((methodId === 2 || methodId === 3 || methodId === 4) && !value) {
                throw new Error('El número de transacción es requerido para método QR, TRANSFERENCIA o DEPOSITO');
            }

            // Si existe valor, debe ser una cadena no vacía
            if (value && typeof value !== 'string') {
                throw new Error('El número de transacción debe ser una cadena de texto');
            }

            if (value && value.trim().length === 0) {
                throw new Error('El número de transacción no puede estar vacío');
            }

            return true;
        })
        .trim(),
];