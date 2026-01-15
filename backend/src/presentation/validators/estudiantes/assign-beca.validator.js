import { body } from 'express-validator';
import { idValidator } from '../common/id.validator.js';

/**
 * Validador para asignar beca a estudiante (POST /api/v1/estudiantes/:id/scholarships)
 * 
 * Valida la estructura de datos que viene del frontend:
 * - :id en el path (ID del estudiante, validado con idValidator común)
 * - beca_descuento_id en el body (requerido)
 * - observaciones en el body (opcional, puede ser null, vacío o string con máximo 1000 caracteres)
 * 
 * NOTA: El ID del estudiante viene en el parámetro de la ruta, no en el body.
 * Esto evita redundancia y sigue el patrón RESTful estándar.
 * 
 * NOTA: Este validator valida la estructura del frontend.
 * El controller transformará estos datos a la estructura que espera el use case.
 * 
 * NOTA: La gestión se obtiene automáticamente de la configuración del sistema.
 * La fecha de solicitud se establece automáticamente como la fecha actual.
 * El estado se establece automáticamente como PENDIENTE.
 * 
 * Campos requeridos:
 * - :id (path parameter): ID del estudiante
 * - beca_descuento_id (body): ID de la beca/descuento
 * 
 * Campos opcionales:
 * - observaciones (body): Observaciones (puede ser null, vacío o string con máximo 1000 caracteres)
 * 
 * Ubicación: presentation/validators/estudiantes (validators específicos del módulo)
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo valida estructura y tipos de datos del request
 * - La lógica de negocio (validaciones complejas) está en el use case
 * - DRY: Reutiliza idValidator común para validar el parámetro :id
 * 
 * @example
 * import { assignBecaValidator } from '../validators/estudiantes/index.js';
 * router.post('/:id/scholarships', assignBecaValidator, validateRequest, controller);
 */
export const assignBecaValidator = [
  // ============================================
  // PATH PARAMETER: ID del estudiante (usa validador común)
  // ============================================
  ...idValidator,

  // ============================================
  // BODY: Datos de la asignación de beca
  // ============================================
  body('beca_descuento_id')
    .notEmpty()
    .withMessage('La beca/descuento es requerida')
    .isInt({ min: 1 })
    .withMessage('La beca/descuento debe ser un número entero mayor a 0')
    .toInt(),

  body('observaciones')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      // Permite null, undefined, string vacío o string con contenido
      if (value === null || value === undefined || value === '') {
        return true;
      }
      // Si es string, validar longitud máxima
      if (typeof value === 'string') {
        if (value.length > 1000) {
          throw new Error('Las observaciones no pueden exceder 1000 caracteres');
        }
        return true;
      }
      // Si no es null, undefined o string, es inválido
      throw new Error('Las observaciones deben ser texto');
    }),
];
