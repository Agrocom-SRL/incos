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
    .optional({ nullable: true, checkFalsy: false })
    .custom((value) => {
      // Si se proporciona y no es null/undefined, validar
      if (value !== null && value !== undefined) {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 1) {
          throw new Error('Estado civil ID debe ser un número entero mayor a 0');
        }
      }
      return true;
    }),

  body('tipoSangre')
    .optional({ nullable: true, checkFalsy: false })
    .customSanitizer((value) => {
      // Solo valores actuales (ARH (+), etc.). Legacy (A+, etc.) -> null (default) para no bloquear la edición.
      if (value === null || value === undefined || value === '') return null;
      const trimmed = typeof value === 'string' ? value.trim() : String(value);
      const validValues = ['ARH (+)', 'ARH (-)', 'BRH (+)', 'BRH (-)', 'ABRH (+)', 'ABRH (-)', 'ORH (+)', 'ORH (-)'];
      return validValues.includes(trimmed) ? trimmed : null;
    })
    .custom(() => true),

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
  // DATOS GEOGRÁFICOS ADICIONALES (OPCIONALES)
  // ============================================
  body('departamentoResidenciaId')
    .optional({ nullable: true, checkFalsy: false })
    .custom((value) => {
      // Si se proporciona, debe ser un número entero válido
      if (value !== null && value !== undefined && value !== '') {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 1) {
          throw new Error('Departamento de residencia ID debe ser un número entero mayor a 0');
        }
      }
      return true;
    }),

  body('provinciaResidenciaId')
    .optional({ nullable: true, checkFalsy: false })
    .custom((value) => {
      // Si se proporciona, debe ser un número entero válido
      if (value !== null && value !== undefined && value !== '') {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 1) {
          throw new Error('Provincia de residencia ID debe ser un número entero mayor a 0');
        }
      }
      return true;
    }),

  // ============================================
  // DISCAPACIDAD (OPCIONAL)
  // ============================================
  body('tieneDiscapacidad')
    .optional()
    .isBoolean()
    .withMessage('tieneDiscapacidad debe ser un booleano'),

  body('tipoDiscapacidadId')
    .optional({ nullable: true, checkFalsy: false })
    .custom((value) => {
      // Si se proporciona, debe ser un número entero válido
      if (value !== null && value !== undefined && value !== '') {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 1) {
          throw new Error('Tipo de discapacidad ID debe ser un número entero mayor a 0');
        }
      }
      return true;
    }),

  body('gradoDiscapacidad')
    .customSanitizer((value) => {
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .custom((value) => {
      if (value && value.length > 0) {
        if (value.length > 50) {
          throw new Error('Grado de discapacidad no puede exceder 50 caracteres');
        }
      }
      return true;
    }),

  body('descripcion')
    .customSanitizer((value) => {
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .custom((value) => {
      if (value && value.length > 0) {
        if (value.length > 500) {
          throw new Error('Descripción no puede exceder 500 caracteres');
        }
      }
      return true;
    }),

  // ============================================
  // ORIGEN/NACIONALIDAD (OPCIONAL)
  // ============================================
  body('paisId')
    .optional({ nullable: true, checkFalsy: false })
    .custom((value) => {
      // Si se proporciona, debe ser un número entero válido
      if (value !== null && value !== undefined && value !== '') {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 1) {
          throw new Error('País ID debe ser un número entero mayor a 0');
        }
      }
      return true;
    }),

  body('ciudadNacimiento')
    .customSanitizer((value) => {
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .custom((value) => {
      if (value && value.length > 0) {
        if (value.length > 100) {
          throw new Error('Ciudad de nacimiento no puede exceder 100 caracteres');
        }
      }
      return true;
    }),

  body('idiomaMaternoId')
    .optional({ nullable: true, checkFalsy: false })
    .custom((value) => {
      // Si se proporciona, debe ser un número entero válido
      if (value !== null && value !== undefined && value !== '') {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 1) {
          throw new Error('Idioma materno ID debe ser un número entero mayor a 0');
        }
      }
      return true;
    }),

  body('idiomaSecundarioId')
    .optional({ nullable: true, checkFalsy: false })
    .custom((value) => {
      // Si se proporciona, debe ser un número entero válido
      if (value !== null && value !== undefined && value !== '') {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 1) {
          throw new Error('Idioma secundario ID debe ser un número entero mayor a 0');
        }
      }
      return true;
    }),

  body('tipoOrigen')
    .optional()
    .custom((value) => {
      // Acepta valores numéricos (0, 1, 2) o strings del ENUM
      const validValues = ['BOLIVIANA', 'EXTRANJERA', 'DOBLE_NACIONALIDAD', 0, 1, 2, '0', '1', '2'];
      if (value !== null && value !== undefined && !validValues.includes(value)) {
        throw new Error('Tipo de origen debe ser: 0 o BOLIVIANA, 1 o EXTRANJERA, 2 o DOBLE_NACIONALIDAD');
      }
      return true;
    }),

  // ============================================
  // CONTACTOS DE EMERGENCIA (OPCIONAL - Array)
  // ============================================
  body('contactosEmergencia')
    .optional()
    .isArray()
    .withMessage('contactosEmergencia debe ser un array'),

  body('contactosEmergencia.*.tipoParentescoId')
    .if(body('contactosEmergencia').isArray())
    .customSanitizer((value) => {
      // Convertir string vacío a null antes de validar
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true }) // Todos los campos son opcionales
    .custom((value) => {
      // Si se proporciona y no es null/undefined/vacío, validar
      if (value !== null && value !== undefined && value !== '') {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 1) {
          throw new Error('Tipo de parentesco ID debe ser un número entero mayor a 0');
        }
      }
      return true;
    }),

  body('contactosEmergencia.*.nombres')
    .if(body('contactosEmergencia').isArray())
    .customSanitizer((value) => {
      // Convertir string vacío a null antes de validar
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true }) // Todos los campos son opcionales
    .isString()
    .withMessage('Nombres debe ser una cadena de texto')
    .trim()
    .custom((value) => {
      // Si está presente después del trim, validar longitud
      if (value && value.length > 0) {
        if (value.length < 2 || value.length > 150) {
          throw new Error('Nombres debe tener entre 2 y 150 caracteres');
        }
      }
      return true;
    }),

  body('contactosEmergencia.*.apellidos')
    .if(body('contactosEmergencia').isArray())
    .customSanitizer((value) => {
      // Convertir string vacío a null antes de validar
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true }) // Todos los campos son opcionales
    .trim()
    .custom((value) => {
      // Si está presente después del trim, validar longitud
      if (value && value.length > 0) {
        if (value.length < 2 || value.length > 150) {
          throw new Error('Apellidos debe tener entre 2 y 150 caracteres');
        }
      }
      return true;
    }),

  body('contactosEmergencia.*.celular1')
    .if(body('contactosEmergencia').isArray())
    .customSanitizer((value) => {
      // Convertir string vacío a null antes de validar
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true }) // Todos los campos son opcionales
    .trim()
    .custom((value) => {
      // Si está presente después del trim, validar longitud
      if (value && value.length > 0) {
        if (value.length < 7 || value.length > 20) {
          throw new Error('Celular 1 debe tener entre 7 y 20 caracteres');
        }
      }
      return true;
    }),

  body('contactosEmergencia.*.celular2')
    .if(body('contactosEmergencia').isArray())
    .customSanitizer((value) => {
      // Convertir string vacío a null antes de validar
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true }) // Todos los campos son opcionales
    .trim()
    .custom((value) => {
      // Si está presente después del trim, validar longitud
      if (value && value.length > 0) {
        if (value.length < 7 || value.length > 20) {
          throw new Error('Celular 2 debe tener entre 7 y 20 caracteres');
        }
      }
      return true;
    }),

  body('contactosEmergencia.*.viveConEstudiante')
    .if(body('contactosEmergencia').isArray())
    .optional()
    .isBoolean()
    .withMessage('viveConEstudiante debe ser un booleano'),

  // ============================================
  // DOCUMENTACIÓN (OPCIONAL - Objeto)
  // ============================================
  body('documentacion')
    .optional()
    .isObject()
    .withMessage('documentacion debe ser un objeto'),

  // Validar cada documento en el objeto documentacion
  // Las keys son dinámicas (doc_1, doc_2, etc.), así que validamos la estructura
  body('documentacion.*.entregado')
    .if(body('documentacion').isObject())
    .optional()
    .isBoolean()
    .withMessage('entregado debe ser un booleano'),

  body('documentacion.*.en_tramite')
    .if(body('documentacion').isObject())
    .optional()
    .isBoolean()
    .withMessage('en_tramite debe ser un booleano'),

  body('documentacion.*.fechaEntrega')
    .if(body('documentacion').isObject())
    .optional({ nullable: true, checkFalsy: false })
    .custom((value) => {
      // Si se proporciona y no es null/undefined/vacío, validar formato ISO 8601
      if (value !== null && value !== undefined && value !== '') {
        const fechaRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$|^\d{4}-\d{2}-\d{2}$/;
        if (!fechaRegex.test(value)) {
          throw new Error('fechaEntrega debe ser una fecha válida (ISO 8601)');
        }
        const fecha = new Date(value);
        if (isNaN(fecha.getTime())) {
          throw new Error('fechaEntrega debe ser una fecha válida');
        }
      }
      return true;
    }),

  body('documentacion.*.observaciones')
    .if(body('documentacion').isObject())
    .customSanitizer((value) => {
      // Convertir string vacío a null antes de validar
      if (value === '' || (typeof value === 'string' && value.trim() === '')) {
        return null;
      }
      return value;
    })
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      // Si es null o undefined, es válido (campo opcional)
      if (value === null || value === undefined) {
        return true;
      }
      // Si es string, validar que no esté vacío después de trim y que no exceda 500 caracteres
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.length === 0) {
          return true; // String vacío se convierte a null en el sanitizer
        }
        if (trimmed.length > 500) {
          throw new Error('Observaciones no puede exceder 500 caracteres');
        }
        return true;
      }
      throw new Error('Observaciones debe ser una cadena de texto');
    }),

  // ============================================
  // TIPO DE ADMISIÓN Y DATOS ACADÉMICOS INICIALES (OPCIONAL - misma vista que registro)
  // ============================================
  body('tipoAdmision')
    .optional()
    .isIn(['NUEVO', 'ANTIGUO', 'TRANSITABILIDAD', 'TRASPASO'])
    .withMessage('El tipo de admisión debe ser uno de: NUEVO, ANTIGUO, TRANSITABILIDAD, TRASPASO'),

  body('gestionIngresoId')
    .customSanitizer((value) => (value === '' ? null : value))
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value !== null && value !== undefined) {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 1) {
          throw new Error('Gestión de ingreso ID debe ser un número entero mayor a 0');
        }
      }
      return true;
    })
    .custom((value, { req }) => {
      if (req.body.tipoAdmision === 'ANTIGUO' && (value == null || value === '')) {
        throw new Error('Gestión de ingreso es requerida para estudiantes antiguos');
      }
      return true;
    }),

  body('carreraId')
    .customSanitizer((value) => (value === '' ? null : value))
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value !== null && value !== undefined) {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 1) {
          throw new Error('Carrera ID debe ser un número entero mayor a 0');
        }
      }
      return true;
    })
    .custom((value, { req }) => {
      if (req.body.tipoAdmision === 'ANTIGUO' && (value == null || value === '')) {
        throw new Error('Carrera es requerida para estudiantes antiguos');
      }
      return true;
    }),

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
