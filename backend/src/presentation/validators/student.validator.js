import { body } from 'express-validator';

/**
 * Validaciones para el registro de estudiantes
 * Basadas en RF-EST-001 y CU-001
 */
export const registerStudentValidator = [
  // Datos personales básicos
  body('nombres')
    .trim()
    .notEmpty()
    .withMessage('Los nombres son requeridos')
    .isLength({ min: 2, max: 150 })
    .withMessage('Los nombres deben tener entre 2 y 150 caracteres'),

  body('apellidoPaterno')
    .trim()
    .notEmpty()
    .withMessage('El apellido paterno es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido paterno debe tener entre 2 y 100 caracteres'),

  body('apellidoMaterno')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El apellido materno no puede exceder 100 caracteres'),

  body('ci')
    .trim()
    .notEmpty()
    .withMessage('El CI es requerido')
    .matches(/^\d{7,9}$/)
    .withMessage('El CI debe tener entre 7 y 9 dígitos'),

  body('expedicion')
    .trim()
    .notEmpty()
    .withMessage('La expedición del CI es requerida')
    .isIn(['SC', 'LP', 'CB', 'TJ', 'BN', 'PD', 'OR', 'PT', 'CH'])
    .withMessage('La expedición debe ser una de: SC, LP, CB, TJ, BN, PD, OR, PT, CH'),

  body('fechaNacimiento')
    .notEmpty()
    .withMessage('La fecha de nacimiento es requerida')
    .isISO8601()
    .withMessage('La fecha de nacimiento debe tener formato válido (YYYY-MM-DD)')
    .custom((value) => {
      const fechaNac = new Date(value);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNac.getFullYear();
      const mesDiff = hoy.getMonth() - fechaNac.getMonth();
      const edadReal = mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < fechaNac.getDate()) ? edad - 1 : edad;
      
      if (edadReal < 17) {
        throw new Error('El estudiante debe tener al menos 17 años de edad');
      }
      return true;
    }),

  body('genero')
    .notEmpty()
    .withMessage('El género es requerido')
    .isIn(['MASCULINO', 'FEMENINO', 'OTRO'])
    .withMessage('El género debe ser MASCULINO, FEMENINO u OTRO'),

  body('estadoCivilId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El estado civil debe ser un ID válido'),

  body('municipioNacimientoId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El municipio de nacimiento debe ser un ID válido'),

  body('idiomaNatalId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El idioma natal debe ser un ID válido'),

  body('tipoSangre')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('El tipo de sangre debe ser uno de los valores válidos'),

  // Contacto
  body('emailPersonal')
    .optional()
    .isEmail()
    .withMessage('El email debe tener un formato válido')
    .normalizeEmail(),

  body('celular')
    .trim()
    .notEmpty()
    .withMessage('El celular es requerido')
    .matches(/^\d{7,8}$/)
    .withMessage('El celular debe tener entre 7 y 8 dígitos'),

  body('telefonoFijo')
    .optional()
    .trim()
    .matches(/^\d{7,8}$/)
    .withMessage('El teléfono fijo debe tener entre 7 y 8 dígitos'),

  body('municipioResidenciaId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El municipio de residencia debe ser un ID válido'),

  // Datos académicos
  body('carreraId')
    .notEmpty()
    .withMessage('La carrera es requerida')
    .isInt({ min: 1 })
    .withMessage('La carrera debe ser un ID válido'),

  body('gestionIngresoId')
    .notEmpty()
    .withMessage('La gestión de ingreso es requerida')
    .isInt({ min: 1 })
    .withMessage('La gestión de ingreso debe ser un ID válido'),

  body('unidadEducativaProcedencia')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La unidad educativa de procedencia no puede exceder 200 caracteres'),

  body('anioEgresoSecundaria')
    .optional()
    .isInt({ min: 1950, max: new Date().getFullYear() })
    .withMessage('El año de egreso debe ser válido'),

  body('promedioAnual')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('El promedio anual debe estar entre 0 y 100'),

  // Becas
  body('becaDescuentoId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La beca/descuento debe ser un ID válido'),

  body('becaMotivo')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('El motivo de la beca debe tener al menos 10 caracteres'),
];
