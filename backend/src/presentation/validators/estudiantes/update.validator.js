import { body } from 'express-validator';

/**
 * Validador para actualización de estudiantes (PUT /api/v1/estudiantes/:id)
 * 
 * Valida la estructura de datos que viene del frontend para actualizar un estudiante.
 * Todos los campos son OPCIONALES ya que es una actualización parcial.
 * 
 * NOTA: Este validator valida la estructura del frontend.
 * El controller transformará estos datos a la estructura que espera el use case.
 * 
 * Campos opcionales (actualización parcial):
 * - Todos los campos son opcionales, pero cuando están presentes deben cumplir las validaciones
 * 
 * Ubicación: presentation/validators/estudiantes (validators específicos del módulo)
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo valida estructura y tipos de datos del request
 * - La lógica de negocio (validaciones complejas) está en el use case
 * 
 * @example
 * import { updateStudentValidator } from '../validators/estudiantes/index.js';
 * router.put('/:id', updateStudentValidator, validateRequest, controller);
 */
export const updateStudentValidator = [
  // ============================================
  // DATOS PERSONALES (OPCIONALES - actualización parcial)
  // NOTA: En actualización, todos los campos son opcionales.
  // Si se envía un campo, debe cumplir las validaciones.
  // Campos REQUERIDOS en schema (ci, expedicion, nombres, apellidoPaterno, fechaNacimiento, genero, celular)
  // también son opcionales en update, permitiendo actualización parcial.
  // ============================================
  body('ci')
    .optional({ nullable: true, checkFalsy: false })
    .custom((value) => {
      // Si se proporciona y no es null/undefined/vacío, validar
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value !== 'string') {
          throw new Error('CI debe ser una cadena de texto');
        }
        const trimmed = value.trim();
        if (trimmed.length < 5 || trimmed.length > 20) {
          throw new Error('CI debe tener entre 5 y 20 caracteres');
        }
      }
      return true;
    }),

  body('expedicionId')
    .optional({ nullable: true, checkFalsy: false })
    .custom((value) => {
      // Si se proporciona y no es null/undefined/vacío, validar
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value !== 'string') {
          throw new Error('Expedición debe ser una cadena de texto');
        }
        const trimmed = value.trim();
        if (trimmed.length < 2 || trimmed.length > 5) {
          throw new Error('Expedición debe tener entre 2 y 5 caracteres');
        }
      }
      return true;
    }),

  body('nombres')
    .optional({ nullable: true, checkFalsy: false })
    .custom((value) => {
      // Si se proporciona y no es null/undefined/vacío, validar
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value !== 'string') {
          throw new Error('Nombres debe ser una cadena de texto');
        }
        const trimmed = value.trim();
        if (trimmed.length < 2 || trimmed.length > 150) {
          throw new Error('Nombres debe tener entre 2 y 150 caracteres');
        }
      }
      return true;
    }),

  body('apellidoPaterno')
    .optional({ nullable: true, checkFalsy: false })
    .custom((value) => {
      // Si se proporciona y no es null/undefined/vacío, validar
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value !== 'string') {
          throw new Error('Apellido paterno debe ser una cadena de texto');
        }
        const trimmed = value.trim();
        if (trimmed.length < 2 || trimmed.length > 100) {
          throw new Error('Apellido paterno debe tener entre 2 y 100 caracteres');
        }
      }
      return true;
    }),

  body('fechaNacimiento')
    .optional({ nullable: true, checkFalsy: false })
    .custom((value) => {
      // Si se proporciona y no es null/undefined/vacío, validar
      if (value !== null && value !== undefined && value !== '') {
        // Validar formato ISO 8601
        const fechaRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$|^\d{4}-\d{2}-\d{2}$/;
        if (!fechaRegex.test(value)) {
          throw new Error('Fecha de nacimiento debe ser una fecha válida (ISO 8601)');
        }
        
        const fecha = new Date(value);
        if (isNaN(fecha.getTime())) {
          throw new Error('Fecha de nacimiento debe ser una fecha válida');
        }
        
        const hoy = new Date();
        const edadMinima = new Date();
        edadMinima.setFullYear(hoy.getFullYear() - 100);
        
        if (fecha > hoy) {
          throw new Error('La fecha de nacimiento no puede ser futura');
        }
        if (fecha < edadMinima) {
          throw new Error('La fecha de nacimiento no puede ser anterior a 100 años');
        }
      }
      return true;
    }),

  body('generoId')
    .optional({ nullable: true, checkFalsy: false })
    .custom((value) => {
      // Si se proporciona y no es null/undefined/vacío, validar
      if (value !== null && value !== undefined && value !== '') {
        const validValues = ['MASCULINO', 'FEMENINO', 'OTRO'];
        if (!validValues.includes(value)) {
          throw new Error('Género debe ser MASCULINO, FEMENINO u OTRO');
        }
      }
      return true;
    }),

  body('celular')
    .optional({ nullable: true, checkFalsy: false })
    .custom((value) => {
      // Si se proporciona y no es null/undefined/vacío, validar
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value !== 'string') {
          throw new Error('Celular debe ser una cadena de texto');
        }
        const trimmed = value.trim();
        if (trimmed.length < 7 || trimmed.length > 20) {
          throw new Error('Celular debe tener entre 7 y 20 caracteres');
        }
      }
      return true;
    }),

  // ============================================
  // DATOS PERSONALES (OPCIONALES)
  // ============================================
  body('apellidoMaterno')
    .customSanitizer((value) => {
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .custom((value) => {
      if (value && value.length > 0) {
        if (value.length < 2 || value.length > 100) {
          throw new Error('Apellido materno debe tener entre 2 y 100 caracteres');
        }
      }
      return true;
    }),

  body('estadoCivilId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Estado civil ID debe ser un número entero mayor a 0'),

  body('tipoSangre')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Tipo de sangre debe ser uno de: A+, A-, B+, B-, AB+, AB-, O+, O-'),

  body('emailPersonal')
    .customSanitizer((value) => {
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true })
    .isEmail()
    .withMessage('Email personal debe ser un email válido')
    .normalizeEmail(),

  body('telefonoFijo')
    .customSanitizer((value) => {
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .custom((value) => {
      if (value && value.length > 0) {
        if (value.length < 7 || value.length > 20) {
          throw new Error('Teléfono fijo debe tener entre 7 y 20 caracteres');
        }
      }
      return true;
    }),

  body('direccion')
    .customSanitizer((value) => {
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .custom((value) => {
      if (value && value.length > 0) {
        if (value.length > 500) {
          throw new Error('Dirección no puede exceder 500 caracteres');
        }
      }
      return true;
    }),

  body('zona')
    .customSanitizer((value) => {
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .custom((value) => {
      if (value && value.length > 0) {
        if (value.length > 100) {
          throw new Error('Zona no puede exceder 100 caracteres');
        }
      }
      return true;
    }),

  // ============================================
  // DATOS GEOGRÁFICOS (OPCIONALES)
  // ============================================
  body('municipioResidenciaId')
    .optional({ nullable: true, checkFalsy: false })
    .custom((value) => {
      // Si se proporciona, debe ser un número entero válido
      if (value !== null && value !== undefined && value !== '') {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 1) {
          throw new Error('Municipio de residencia ID debe ser un número entero mayor a 0');
        }
      }
      return true;
    }),

  // ============================================
  // DISCAPACIDAD (OPCIONAL - solo el flag, los detalles están en otra tabla)
  // ============================================
  body('tieneDiscapacidad')
    .optional()
    .isBoolean()
    .withMessage('tieneDiscapacidad debe ser un booleano'),

  // ============================================
  // OBSERVACIONES (OPCIONAL)
  // ============================================
  body('observaciones')
    .customSanitizer((value) => {
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .custom((value) => {
      if (value && value.length > 0) {
        if (value.length > 1000) {
          throw new Error('Observaciones no puede exceder 1000 caracteres');
        }
      }
      return true;
    }),
];
