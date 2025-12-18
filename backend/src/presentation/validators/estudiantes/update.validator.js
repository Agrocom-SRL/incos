import { body, param } from 'express-validator';

/**
 * PUT /api/v1/estudiantes/:id
 * Validaciones para actualizar datos de estudiante
 * Permite actualizar todos los campos básicos del estudiante (todos opcionales para actualizaciones parciales)
 */
export const updateStudentValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del estudiante debe ser un número entero válido'),

  // Datos personales básicos (todos opcionales para permitir actualizaciones parciales)
  body('nombres')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('El nombre debe tener entre 2 y 150 caracteres'),

  body('apellidoPaterno')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido paterno debe tener entre 2 y 100 caracteres'),

  body('apellidoMaterno')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El apellido materno no puede exceder 100 caracteres'),

  body('ci')
    .optional()
    .trim()
    .matches(/^\d{7,9}$/)
    .withMessage('El CI debe tener entre 7 y 9 dígitos'),

  body('expedicion')
    .optional()
    .trim()
    .isIn(['SC', 'LP', 'CB', 'TJ', 'BN', 'PD', 'OR', 'PT', 'CH'])
    .withMessage('La expedición debe ser una de: SC, LP, CB, TJ, BN, PD, OR, PT, CH'),

  body('fechaNacimiento')
    .optional()
    .isISO8601()
    .withMessage('La fecha de nacimiento debe tener formato válido (YYYY-MM-DD)')
    .custom((value) => {
      if (!value) return true;
      const fechaNac = new Date(value);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNac.getFullYear();
      const mesDiff = hoy.getMonth() - fechaNac.getMonth();
      const edadReal =
        mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < fechaNac.getDate())
          ? edad - 1
          : edad;

      if (edadReal < 17) {
        throw new Error('El estudiante debe tener al menos 17 años de edad');
      }
      return true;
    }),

  body('genero')
    .optional()
    .isIn(['MASCULINO', 'FEMENINO', 'OTRO'])
    .withMessage('El género debe ser MASCULINO, FEMENINO u OTRO'),

  body('estadoCivilId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El estado civil debe ser un ID válido'),

  body('nacionalidad')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('La nacionalidad no puede exceder 50 caracteres'),

  body('municipioNacimientoId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El municipio de nacimiento debe ser un ID válido'),

  body('ciudadNacimiento')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La ciudad de nacimiento no puede exceder 100 caracteres'),

  body('idiomaNatalId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El idioma natal debe ser un ID válido'),

  body('tipoSangre')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('El tipo de sangre debe ser uno de los valores válidos'),

  body('tieneDiscapacidad')
    .optional()
    .isBoolean()
    .withMessage('El campo tieneDiscapacidad debe ser un booleano'),

  body('tipoDiscapacidadId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El tipo de discapacidad debe ser un ID válido')
    .custom((value, { req }) => {
      // Si tiene discapacidad, el tipo es requerido
      if (req.body.tieneDiscapacidad === true && !value) {
        throw new Error('El tipo de discapacidad es requerido cuando tieneDiscapacidad es true');
      }
      return true;
    }),

  // Contacto
  body('emailPersonal')
    .optional()
    .isEmail()
    .withMessage('El email debe tener un formato válido')
    .normalizeEmail(),

  body('celular')
    .optional()
    .trim()
    .matches(/^\d{7,8}$/)
    .withMessage('El celular debe tener entre 7 y 8 dígitos'),

  body('telefonoFijo')
    .optional()
    .trim()
    .matches(/^\d{7,8}$/)
    .withMessage('El teléfono fijo debe tener entre 7 y 8 dígitos'),

  body('direccion')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La dirección no puede exceder 500 caracteres'),

  body('municipioResidenciaId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El municipio de residencia debe ser un ID válido'),

  body('zona')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La zona no puede exceder 100 caracteres'),

  // Observaciones
  body('observaciones')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las observaciones no pueden exceder 1000 caracteres'),
];
