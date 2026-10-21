import { body } from 'express-validator';

/**
 * Validador para registro de estudiantes (POST /api/v1/estudiantes)
 *
 * Valida la estructura de datos que viene del frontend:
 * - Campos planos en el root (ci, nombres, apellidoPaterno, etc.)
 * - contactosEmergencia como array
 * - documentacion como objeto con keys doc_1, doc_2, etc.
 *
 * NOTA: Este validator valida la estructura del frontend.
 * El controller transformará estos datos a la estructura que espera el use case.
 *
 * Campos requeridos basados en schema SQL (NOT NULL):
 * - estudiantes: ci, nombres, fechaNacimiento, genero, celular
 * - estudiantes_apoderados: Todos los campos son opcionales (NULL permitido)
 *
 * Ubicación: presentation/validators/estudiantes (validators específicos del módulo)
 *
 * Principios SOLID:
 * - Single Responsibility: Solo valida estructura y tipos de datos del request
 * - La lógica de negocio (validaciones complejas) está en el use case
 *
 * @example
 * import { registerStudentValidator } from '../validators/estudiantes/index.js';
 * router.post('/', registerStudentValidator, validateRequest, controller);
 */
export const registerStudentValidator = [
  // ============================================
  // DATOS PERSONALES (REQUERIDOS según schema)
  // ============================================
  body('ci')
    .notEmpty()
    .withMessage('CI es requerido')
    .isString()
    .withMessage('CI debe ser una cadena de texto')
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('CI debe tener entre 5 y 20 caracteres'),

  body('expedicionId')
    .customSanitizer((value) => {
      // Convertir string vacío a null antes de validar
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true }) // Expedición NO es requerida
    .isString()
    .withMessage('Expedición debe ser una cadena de texto')
    .trim()
    .custom((value) => {
      // Si está presente después del trim, validar longitud
      if (value && value.length > 0) {
        if (value.length < 2 || value.length > 5) {
          throw new Error('Expedición debe tener entre 2 y 5 caracteres');
        }
      }
      return true;
    }),

  body('nombres')
    .notEmpty()
    .withMessage('Nombres son requeridos')
    .isString()
    .withMessage('Nombres debe ser una cadena de texto')
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Nombres debe tener entre 2 y 150 caracteres'),

  body('apellidoPaterno')
    .customSanitizer((value) => {
      // Convertir string vacío a null antes de validar
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true }) // Apellido paterno NO es requerido
    .isString()
    .withMessage('Apellido paterno debe ser una cadena de texto')
    .trim()
    .custom((value) => {
      // Si está presente después del trim, validar longitud
      if (value && value.length > 0) {
        if (value.length < 2 || value.length > 100) {
          throw new Error('Apellido paterno debe tener entre 2 y 100 caracteres');
        }
      }
      return true;
    }),

  body('fechaNacimiento')
    .notEmpty()
    .withMessage('Fecha de nacimiento es requerida')
    .isISO8601()
    .withMessage('Fecha de nacimiento debe ser una fecha válida (ISO 8601)')
    .custom((value) => {
      const fecha = new Date(value);
      const hoy = new Date();
      // Ajustar a medianoche para comparación correcta
      hoy.setHours(0, 0, 0, 0);
      fecha.setHours(0, 0, 0, 0);
      const edadMinima = new Date();
      edadMinima.setFullYear(hoy.getFullYear() - 100); // Máximo 100 años

      // Aceptar edad cumplida hasta la fecha (puede ser hoy)
      if (fecha > hoy) {
        throw new Error('La fecha de nacimiento no puede ser futura');
      }
      if (fecha < edadMinima) {
        throw new Error('La fecha de nacimiento no puede ser anterior a 100 años');
      }
      return true;
    }),

  body('generoId')
    .notEmpty()
    .withMessage('Género es requerido')
    .isIn(['MASCULINO', 'FEMENINO', 'OTRO'])
    .withMessage('Género debe ser MASCULINO, FEMENINO u OTRO'),

  body('celular')
    .notEmpty()
    .withMessage('Celular es requerido')
    .isString()
    .withMessage('Celular debe ser una cadena de texto')
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('Celular debe tener entre 7 y 20 caracteres'),

  // ============================================
  // DATOS PERSONALES (OPCIONALES)
  // ============================================
  body('apellidoMaterno')
    .customSanitizer((value) => {
      // Convertir string vacío a null antes de validar
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true }) // Permitir null, undefined, '' según schema (es opcional)
    .trim()
    .custom((value) => {
      // Si está presente después del trim, validar longitud
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
    .optional({ nullable: true, checkFalsy: false })
    .customSanitizer((value) => {
      // Solo valores actuales (ARH (+), etc.). Legacy (A+, etc.) -> null (default).
      if (value === null || value === undefined || value === '') return null;
      const trimmed = typeof value === 'string' ? value.trim() : String(value);
      const validValues = ['ARH (+)', 'ARH (-)', 'BRH (+)', 'BRH (-)', 'ABRH (+)', 'ABRH (-)', 'ORH (+)', 'ORH (-)'];
      return validValues.includes(trimmed) ? trimmed : null;
    })
    .custom(() => true),

  body('emailPersonal')
    .customSanitizer((value) => {
      // Convertir string vacío a null antes de validar
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true }) // Permitir null, undefined, '' según schema (es opcional)
    .isEmail()
    .withMessage('Email personal debe ser un email válido')
    .normalizeEmail(),

  body('telefonoFijo')
    .customSanitizer((value) => {
      // Convertir string vacío a null antes de validar
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true }) // Permitir null, undefined, '' según schema (es opcional)
    .trim()
    .custom((value) => {
      // Si está presente después del trim, validar longitud
      if (value && value.length > 0) {
        if (value.length < 7 || value.length > 20) {
          throw new Error('Teléfono fijo debe tener entre 7 y 20 caracteres');
        }
      }
      return true;
    }),

  body('direccion')
    .customSanitizer((value) => {
      // Convertir string vacío a null antes de validar
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true }) // Permitir null, undefined, '' según schema (es opcional)
    .trim()
    .custom((value) => {
      // Si está presente después del trim, validar longitud
      if (value && value.length > 0) {
        if (value.length > 500) {
          throw new Error('Dirección no puede exceder 500 caracteres');
        }
      }
      return true;
    }),

  body('zona')
    .customSanitizer((value) => {
      // Convertir string vacío a null antes de validar
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true }) // Permitir null, undefined, '' según schema (es opcional)
    .trim()
    .custom((value) => {
      // Si está presente después del trim, validar longitud
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
    .optional()
    .isInt({ min: 1 })
    .withMessage('Municipio de residencia ID debe ser un número entero mayor a 0'),

  body('departamentoResidenciaId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Departamento de residencia ID debe ser un número entero mayor a 0'),

  body('provinciaResidenciaId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Provincia de residencia ID debe ser un número entero mayor a 0'),

  // ============================================
  // DISCAPACIDAD (OPCIONAL)
  // ============================================
  body('tieneDiscapacidad')
    .optional()
    .isBoolean()
    .withMessage('tieneDiscapacidad debe ser un booleano'),

  body('esTraspaso')
    .optional()
    .isBoolean()
    .withMessage('esTraspaso debe ser un booleano'),

  body('tipoDiscapacidadId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Tipo de discapacidad ID debe ser un número entero mayor a 0'),

  body('gradoDiscapacidad')
    .customSanitizer((value) => {
      // Convertir string vacío a null antes de validar
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true }) // Permitir null, undefined, '' según schema (es opcional)
    .trim()
    .custom((value) => {
      // Si está presente después del trim, validar longitud
      if (value && value.length > 0) {
        if (value.length > 50) {
          throw new Error('Grado de discapacidad no puede exceder 50 caracteres');
        }
      }
      return true;
    }),

  body('descripcion')
    .customSanitizer((value) => {
      // Convertir string vacío a null antes de validar
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true }) // Permitir null, undefined, '' según schema (es opcional)
    .trim()
    .custom((value) => {
      // Si está presente después del trim, validar longitud
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
    .optional()
    .isInt({ min: 1 })
    .withMessage('País ID debe ser un número entero mayor a 0'),

  body('ciudadNacimiento')
    .customSanitizer((value) => {
      // Convertir string vacío a null antes de validar
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true }) // Permitir null, undefined, '' según schema (es opcional)
    .trim()
    .custom((value) => {
      // Si está presente después del trim, validar longitud
      if (value && value.length > 0) {
        if (value.length > 100) {
          throw new Error('Ciudad de nacimiento no puede exceder 100 caracteres');
        }
      }
      return true;
    }),

  body('idiomaMaternoId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Idioma materno ID debe ser un número entero mayor a 0'),

  body('idiomaSecundarioId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Idioma secundario ID debe ser un número entero mayor a 0'),

  body('tipoOrigen')
    .optional()
    .custom((value) => {
      // Acepta valores numéricos (0, 1, 2) o strings del ENUM
      const validValues = ['BOLIVIANA', 'EXTRANJERA', 'DOBLE_NACIONALIDAD', 0, 1, 2, '0', '1', '2'];
      if (!validValues.includes(value)) {
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
    .isInt({ min: 1 })
    .withMessage('Tipo de parentesco ID debe ser un número entero mayor a 0'),

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
    .optional()
    .isISO8601()
    .withMessage('fechaEntrega debe ser una fecha válida (ISO 8601)'),

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
  // TIPO DE ADMISIÓN Y DATOS ACADÉMICOS INICIALES
  // ============================================
  body('tipoAdmision')
    .optional()
    .isIn(['NUEVO', 'ANTIGUO', 'TRANSITABILIDAD', 'TRASPASO'])
    .withMessage('El tipo de admisión debe ser uno de: NUEVO, ANTIGUO, TRANSITABILIDAD, TRASPASO'),

  body('gestionIngresoId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Gestión de ingreso ID debe ser un número entero mayor a 0')
    .toInt()
    .custom((value, { req }) => {
      // Si tipoAdmision es ANTIGUO, gestionIngresoId es requerido
      if (req.body.tipoAdmision === 'ANTIGUO' && !value) {
        throw new Error('Gestión de ingreso es requerida para estudiantes antiguos');
      }
      return true;
    }),

  body('carreraId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Carrera ID debe ser un número entero mayor a 0')
    .toInt()
    .custom((value, { req }) => {
      // Si tipoAdmision es ANTIGUO, carreraId es requerido
      if (req.body.tipoAdmision === 'ANTIGUO' && !value) {
        throw new Error('Carrera es requerida para estudiantes antiguos');
      }
      return true;
    }),
];
