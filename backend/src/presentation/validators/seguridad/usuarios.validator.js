import { body, param, query, validationResult } from 'express-validator';
import { UnprocessableEntityError } from '../../../domain/errors/AppError.js';

export const usuariosListQueryValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString().trim(),
  query('sort').optional().isString().trim(),
  query('categoria')
    .optional()
    .isIn(['sistema', 'estudiante', 'docente', 'personal'])
    .withMessage('categoria debe ser sistema, estudiante, docente o personal'),
];

export const usuarioIdParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('id debe ser un entero positivo'),
];

export const rolIdParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('id debe ser un entero positivo'),
];

export const overrideIdParamValidator = [
  param('overrideId').isInt({ min: 1 }).withMessage('overrideId debe ser un entero positivo'),
];

export const crearUsuarioValidator = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('username es requerido')
    .isLength({ max: 50 })
    .withMessage('username máximo 50 caracteres'),
  body('password')
    .notEmpty()
    .withMessage('password es requerido')
    .isLength({ min: 8, max: 100 })
    .withMessage('password debe tener entre 8 y 100 caracteres'),
  body('rol_id').isInt({ min: 1 }).withMessage('rol_id es requerido y debe ser entero positivo'),
  body('categoria_creacion')
    .optional({ nullable: true })
    .isIn(['ACCESO_SISTEMA', 'PERSONAL_INSTITUCIONAL', 'ASIGNAR_ESTUDIANTE', 'ASIGNAR_DOCENTE']),
  body('estudiante_id').optional({ nullable: true }).isInt({ min: 1 }),
  body('docente_id').optional({ nullable: true }).isInt({ min: 1 }),
  body('personal').optional({ nullable: true }).isObject(),
  body('referencia_id').optional({ nullable: true }).isInt({ min: 1 }),
  body('tipo_referencia')
    .optional({ nullable: true })
    .isIn(['ESTUDIANTE', 'DOCENTE', 'RECTOR', 'DIRECTOR', 'SECRETARIA']),
];

export const actualizarUsuarioValidator = [
  body('username')
    .optional()
    .trim()
    .notEmpty()
    .isLength({ max: 50 })
    .withMessage('username máximo 50 caracteres'),
  body('rol_id').optional().isInt({ min: 1 }),
  body('foto_url').optional({ nullable: true }).isString(),
  body('password')
    .optional({ nullable: true })
    .isLength({ min: 8, max: 100 })
    .withMessage('password debe tener entre 8 y 100 caracteres'),
  body('categoria_creacion')
    .optional({ nullable: true })
    .isIn(['ACCESO_SISTEMA', 'PERSONAL_INSTITUCIONAL', 'ASIGNAR_ESTUDIANTE', 'ASIGNAR_DOCENTE']),
  body('estudiante_id').optional({ nullable: true }).isInt({ min: 1 }),
  body('docente_id').optional({ nullable: true }).isInt({ min: 1 }),
  body('personal').optional({ nullable: true }).isObject(),
];

/** Permite estado null explícito (reactivar) */
export const cambiarEstadoUsuarioBodyValidator = [
  body('estado')
    .exists({ checkFalsy: false })
    .withMessage('estado es requerido (null para reactivar)')
    .custom((value) => {
      if (value === null) {
        return true;
      }
      if (['BLOQUEADO', 'SUSPENDIDO', 'RETIRADO'].includes(value)) {
        return true;
      }
      throw new Error('estado debe ser null, BLOQUEADO, SUSPENDIDO o RETIRADO');
    }),
  body('motivo').optional({ nullable: true }).isString(),
];

export const cambiarPasswordValidator = [
  body('password_nuevo')
    .notEmpty()
    .withMessage('password_nuevo es requerido')
    .isLength({ min: 8, max: 100 })
    .withMessage('password_nuevo debe tener entre 8 y 100 caracteres'),
];

export const agregarOverrideValidator = [
  body('permiso_id').isInt({ min: 1 }).withMessage('permiso_id inválido'),
  body('accion')
    .notEmpty()
    .isIn([
      'LISTAR',
      'DETALLE',
      'CREAR',
      'EDITAR',
      'ELIMINAR',
      'ACTIVAR',
      'APROBAR',
      'EXPORTAR',
      'GENERAR_PDF',
    ]),
  body('tipo').notEmpty().isIn(['GRANT', 'REVOKE']),
  body('motivo').optional({ nullable: true }).isString(),
];

export const crearRolValidator = [
  body('codigo')
    .trim()
    .notEmpty()
    .withMessage('codigo es requerido')
    .toUpperCase()
    .isLength({ min: 2, max: 50 })
    .withMessage('codigo debe tener entre 2 y 50 caracteres')
    .matches(/^[A-Z0-9_]+$/)
    .withMessage('codigo solo admite letras mayúsculas, números y guion bajo'),
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('nombre debe tener entre 2 y 100 caracteres'),
  body('tipo')
    .optional({ nullable: true })
    .isString()
    .withMessage('tipo debe ser texto')
    .isLength({ max: 50 })
    .withMessage('tipo máximo 50 caracteres'),
];

export const actualizarPermisosRolValidator = [
  body('asignaciones').isArray().withMessage('asignaciones debe ser un array'),
  body('asignaciones.*.permiso_id').isInt({ min: 1 }),
  body('asignaciones.*.accion')
    .notEmpty()
    .isIn([
      'LISTAR',
      'DETALLE',
      'CREAR',
      'EDITAR',
      'ELIMINAR',
      'ACTIVAR',
      'APROBAR',
      'EXPORTAR',
      'GENERAR_PDF',
    ]),
];

export const permisosCatalogoQueryValidator = [
  query('dominio').optional().isString().trim().isLength({ min: 1, max: 50 }),
];

export function validateSeguridadRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((err) => ({
      field: err.path || err.param || err.location,
      message: err.msg,
      value: err.value,
    }));
    return next(
      new UnprocessableEntityError('Los datos proporcionados son inválidos', details)
    );
  }
  next();
}
