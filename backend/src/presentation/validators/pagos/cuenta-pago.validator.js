import { body, param } from 'express-validator';

/**
 * Validators para cuentas de pago.
 *
 * NOTA: las rutas aceptan multipart (archivo `qr` opcional). Con multipart, los
 * campos numéricos llegan como string; por eso se validan de forma laxa
 * (la conversión a número la hace el use case). El archivo no se valida aquí
 * (lo gestiona el middleware multer `uploadCuentaPagoQr`).
 */

/**
 * POST /api/v1/cuentas-pago
 */
export const createCuentaPagoValidator = [
  body('nombre_titular')
    .notEmpty()
    .withMessage('nombre_titular es requerido')
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('nombre_titular debe tener entre 1 y 200 caracteres'),

  body('metodo_pago_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('metodo_pago_id debe ser un entero positivo'),

  body('banco_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('banco_id debe ser un entero positivo'),

  body('numero_cuenta')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('numero_cuenta no puede exceder 50 caracteres'),

  body('numero_celular')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage('numero_celular no puede exceder 20 caracteres'),

  body('qr_imagen_url')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('qr_imagen_url no puede exceder 500 caracteres'),

  body('activo')
    .optional({ nullable: true, checkFalsy: true })
    .isBoolean()
    .withMessage('activo debe ser booleano'),
];

/**
 * PUT /api/v1/cuentas-pago/:id
 */
export const updateCuentaPagoValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('id debe ser un entero positivo')
    .toInt(),

  body('nombre_titular')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('nombre_titular debe tener entre 1 y 200 caracteres'),

  body('metodo_pago_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('metodo_pago_id debe ser un entero positivo'),

  body('banco_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('banco_id debe ser un entero positivo'),

  body('numero_cuenta')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('numero_cuenta no puede exceder 50 caracteres'),

  body('numero_celular')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage('numero_celular no puede exceder 20 caracteres'),

  body('qr_imagen_url')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('qr_imagen_url no puede exceder 500 caracteres'),

  body('activo')
    .optional({ nullable: true, checkFalsy: true })
    .isBoolean()
    .withMessage('activo debe ser booleano'),
];
