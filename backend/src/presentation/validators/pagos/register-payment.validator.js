import { body } from 'express-validator';

/**
 * Validador para registro de pagos de aporte académico
 * POST /api/v1/pagos-aportes
 * 
 * Reglas de Negocio:
 * - EFECTIVO (id=1): Requiere fecha, cuenta_pago_id = NULL, código comprobante no aplica
 * - QR (id=2): Requiere fecha y código_comprobante, cuenta_pago_id opcional, transaction_number opcional
 * - TRANSFERENCIA (id=3): Requiere fecha, cuenta_pago_id y código_comprobante, transaction_number opcional
 * - DEPOSITO (id=4): Requiere fecha, cuenta_pago_id y código_comprobante, transaction_number opcional
 * 
 * Campos que recibe del frontend:
 * - student_id: ID del estudiante (requerido)
 * - payment_method_id: ID del método de pago (requerido, 1=EFECTIVO, 2=QR, 3=TRANSFERENCIA, 4=DEPOSITO)
 * - payment_account_id: ID de la cuenta de pago (requerido para TRANSFERENCIA/DEPOSITO, opcional para QR, NULL para EFECTIVO)
 * - payment_date: Fecha del pago (SIEMPRE requerida, formato YYYY-MM-DD)
 * - codigo_comprobante: Código del comprobante (requerido para QR/TRANSFERENCIA/DEPOSITO, no aplica para EFECTIVO)
 * - transaction_number: Número de transacción (opcional para todos los métodos)
 * - descripcion: Descripción del pago (opcional)
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

    body('descripcion')
        .optional({ nullable: true })
        .isString()
        .withMessage('La descripción debe ser una cadena de texto')
        .trim()
        .custom((value) => {
            // Si se proporciona un valor, validar longitud
            if (value && value.length > 500) {
                throw new Error('La descripción no puede exceder 500 caracteres');
            }
            return true;
        }),

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
        .custom((value) => {
            // El número de transacción es completamente opcional
            // Si existe valor, debe ser una cadena válida
            if (value !== null && value !== undefined) {
                if (typeof value !== 'string') {
                    throw new Error('El número de transacción debe ser una cadena de texto');
                }
                // Permitir string vacío (se convertirá a null en el backend)
            }
            return true;
        })
        .trim(),

    // Código de comprobante - Obligatorio para QR, TRANSFERENCIA y DEPOSITO
    body('codigo_comprobante')
        .optional({ nullable: true })
        .custom((value, { req }) => {
            const methodId = req.body.payment_method_id;

            // Para QR (2), TRANSFERENCIA (3) y DEPOSITO (4), el código de comprobante es REQUERIDO
            if ((methodId === 2 || methodId === 3 || methodId === 4) && !value) {
                throw new Error('El código de comprobante es requerido para método QR, TRANSFERENCIA o DEPOSITO');
            }

            // Si existe valor, debe ser una cadena no vacía
            if (value && typeof value !== 'string') {
                throw new Error('El código de comprobante debe ser una cadena de texto');
            }

            if (value && value.trim().length === 0) {
                throw new Error('El código de comprobante no puede estar vacío');
            }

            return true;
        })
        .trim(),
];