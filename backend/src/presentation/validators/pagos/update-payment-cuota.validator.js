import { body, param } from 'express-validator';

/**
 * PUT /api/v1/pagos-aportes/cuotas/:id
 * Actualización de una cuota existente (misma semántica de negocio que el registro).
 */
export const updatePaymentCuotaValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('id de cuota debe ser un entero positivo')
    .toInt(),

  body('amount')
    .notEmpty()
    .withMessage('amount es requerido')
    .isFloat({ min: 0 })
    .withMessage('amount debe ser un número mayor o igual a 0')
    .toFloat(),

  body('payment_method_id')
    .notEmpty()
    .withMessage('payment_method_id es requerido')
    .isInt({ min: 1 })
    .withMessage('payment_method_id inválido')
    .isIn([1, 2, 3, 4])
    .withMessage('Método de pago debe ser 1 (EFECTIVO), 2 (QR), 3 (TRANSFERENCIA) o 4 (DEPOSITO)')
    .toInt(),

  body('payment_date')
    .notEmpty()
    .withMessage('payment_date es requerida')
    .isISO8601()
    .withMessage('payment_date debe estar en formato YYYY-MM-DD')
    .toDate(),

  body('descripcion')
    .optional({ nullable: true })
    .isString()
    .trim()
    .custom((value) => {
      if (value && value.length > 500) {
        throw new Error('La descripción no puede exceder 500 caracteres');
      }
      return true;
    }),

  body('payment_account_id')
    .optional({ nullable: true })
    .custom((value, { req }) => {
      const methodId = req.body.payment_method_id;
      if ((methodId === 3 || methodId === 4) && !value) {
        throw new Error('La cuenta de pago es requerida para TRANSFERENCIA o DEPOSITO');
      }
      if (methodId === 1 && value) {
        throw new Error('La cuenta de pago debe ser NULL para EFECTIVO');
      }
      if (value && (!Number.isInteger(Number(value)) || Number(value) < 1)) {
        throw new Error('payment_account_id inválido');
      }
      return true;
    })
    .toInt(),

  body('transaction_number')
    .optional({ nullable: true })
    .isString()
    .trim(),

  body('codigo_comprobante')
    .optional({ nullable: true })
    .custom((value, { req }) => {
      const methodId = req.body.payment_method_id;
      if ((methodId === 2 || methodId === 3 || methodId === 4) && !value) {
        throw new Error('codigo_comprobante es requerido para QR, TRANSFERENCIA o DEPOSITO');
      }
      if (value && typeof value === 'string' && value.trim().length === 0) {
        throw new Error('codigo_comprobante no puede estar vacío');
      }
      return true;
    })
    .trim(),
];
