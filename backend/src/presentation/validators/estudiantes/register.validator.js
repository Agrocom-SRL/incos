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
 * - estudiantes_apoderados: tipoParentescoId, nombres, apellidos (si se envía el array)
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
    .optional()
    .isIn(['ARH (+)', 'ARH (-)', 'BRH (+)', 'BRH (-)', 'ABRH (+)', 'ABRH (-)', 'ORH (+)', 'ORH (-)'])
    .withMessage('Tipo de sangre debe ser uno de: ARH (+), ARH (-), BRH (+), BRH (-), ABRH (+), ABRH (-), ORH (+), ORH (-)'),

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
    .notEmpty()
    .withMessage('Tipo de parentesco es requerido para cada contacto')
    .isInt({ min: 1 })
    .withMessage('Tipo de parentesco ID debe ser un número entero mayor a 0'),

  body('contactosEmergencia.*.nombres')
    .if(body('contactosEmergencia').isArray())
    .notEmpty()
    .withMessage('Nombres son requeridos para cada contacto')
    .isString()
    .withMessage('Nombres debe ser una cadena de texto')
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Nombres debe tener entre 2 y 150 caracteres'),

  body('contactosEmergencia.*.apellidos')
    .if(body('contactosEmergencia').isArray())
    .customSanitizer((value) => {
      // Convertir string vacío a null antes de validar
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true }) // Permitir null, undefined, '' según schema (es opcional)
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

  body('contactosEmergencia.*.ci')
    .if(body('contactosEmergencia').isArray())
    .customSanitizer((value) => {
      // Convertir string vacío a null antes de validar
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true }) // Permitir null, undefined, '' según schema (es opcional)
    .trim()
    .custom((value) => {
      // Si está presente después del trim, validar longitud
      if (value && value.length > 0) {
        if (value.length < 5 || value.length > 20) {
          throw new Error('CI debe tener entre 5 y 20 caracteres');
        }
      }
      return true;
    }),

  body('contactosEmergencia.*.telefono')
    .if(body('contactosEmergencia').isArray())
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
          throw new Error('Teléfono debe tener entre 7 y 20 caracteres');
        }
      }
      return true;
    }),

  body('contactosEmergencia.*.email')
    .if(body('contactosEmergencia').isArray())
    .customSanitizer((value) => {
      // Convertir string vacío a null antes de validar
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true }) // Permitir null, undefined, '' según schema (es opcional)
    .isEmail()
    .withMessage('Email debe ser un email válido')
    .normalizeEmail(),

  body('contactosEmergencia.*.ocupacion')
    .if(body('contactosEmergencia').isArray())
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
          throw new Error('Ocupación no puede exceder 100 caracteres');
        }
      }
      return true;
    }),

  body('contactosEmergencia.*.lugarTrabajo')
    .if(body('contactosEmergencia').isArray())
    .customSanitizer((value) => {
      // Convertir string vacío a null antes de validar
      return value === '' ? null : value;
    })
    .optional({ nullable: true, checkFalsy: true }) // Permitir null, undefined, '' según schema (es opcional)
    .trim()
    .custom((value) => {
      // Si está presente después del trim, validar longitud
      if (value && value.length > 0) {
        if (value.length > 200) {
          throw new Error('Lugar de trabajo no puede exceder 200 caracteres');
        }
      }
      return true;
    }),

  body('contactosEmergencia.*.direccion')
    .if(body('contactosEmergencia').isArray())
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

  body('contactosEmergencia.*.esContactoEmergencia')
    .if(body('contactosEmergencia').isArray())
    .optional()
    .isBoolean()
    .withMessage('esContactoEmergencia debe ser un booleano'),

  body('contactosEmergencia.*.viveConEstudiante')
    .if(body('contactosEmergencia').isArray())
    .optional()
    .isBoolean()
    .withMessage('viveConEstudiante debe ser un booleano'),

  body('contactosEmergencia.*.observaciones')
    .if(body('contactosEmergencia').isArray())
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
          throw new Error('Observaciones no puede exceder 500 caracteres');
        }
      }
      return true;
    }),

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

  body('documentacion.*.es_original')
    .if(body('documentacion').isObject())
    .optional()
    .isBoolean()
    .withMessage('es_original debe ser un booleano'),

  body('documentacion.*.fechaEntrega')
    .if(body('documentacion').isObject())
    .optional()
    .isISO8601()
    .withMessage('fechaEntrega debe ser una fecha válida (ISO 8601)'),

  body('documentacion.*.fechaVencimientoTramite')
    .if(body('documentacion').isObject())
    .optional()
    .isISO8601()
    .withMessage('fechaVencimientoTramite debe ser una fecha válida (ISO 8601)'),

  body('documentacion.*.observaciones')
    .if(body('documentacion').isObject())
    .optional()
    .isString()
    .withMessage('Observaciones debe ser una cadena de texto')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Observaciones no puede exceder 500 caracteres'),
];

