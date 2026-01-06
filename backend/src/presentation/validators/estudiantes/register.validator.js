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
 * - estudiantes: ci, expedicion, nombres, apellidoPaterno, fechaNacimiento, genero, celular
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
    .notEmpty()
    .withMessage('Expedición es requerida')
    .isString()
    .withMessage('Expedición debe ser una cadena de texto')
    .trim()
    .isLength({ min: 2, max: 5 })
    .withMessage('Expedición debe tener entre 2 y 5 caracteres'),

  body('nombres')
    .notEmpty()
    .withMessage('Nombres son requeridos')
    .isString()
    .withMessage('Nombres debe ser una cadena de texto')
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Nombres debe tener entre 2 y 150 caracteres'),

  body('apellidoPaterno')
    .notEmpty()
    .withMessage('Apellido paterno es requerido')
    .isString()
    .withMessage('Apellido paterno debe ser una cadena de texto')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Apellido paterno debe tener entre 2 y 100 caracteres'),

  body('fechaNacimiento')
    .notEmpty()
    .withMessage('Fecha de nacimiento es requerida')
    .isISO8601()
    .withMessage('Fecha de nacimiento debe ser una fecha válida (ISO 8601)')
    .custom((value) => {
      const fecha = new Date(value);
      const hoy = new Date();
      const edadMinima = new Date();
      edadMinima.setFullYear(hoy.getFullYear() - 100); // Máximo 100 años
      
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
    .optional()
    .isString()
    .withMessage('Apellido materno debe ser una cadena de texto')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Apellido materno debe tener entre 2 y 100 caracteres'),

  body('estadoCivilId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Estado civil ID debe ser un número entero mayor a 0'),

  body('tipoSangre')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Tipo de sangre debe ser uno de: A+, A-, B+, B-, AB+, AB-, O+, O-'),

  body('emailPersonal')
    .optional()
    .isEmail()
    .withMessage('Email personal debe ser un email válido')
    .normalizeEmail(),

  body('telefonoFijo')
    .optional()
    .isString()
    .withMessage('Teléfono fijo debe ser una cadena de texto')
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('Teléfono fijo debe tener entre 7 y 20 caracteres'),

  body('direccion')
    .optional()
    .isString()
    .withMessage('Dirección debe ser una cadena de texto')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Dirección no puede exceder 500 caracteres'),

  body('zona')
    .optional()
    .isString()
    .withMessage('Zona debe ser una cadena de texto')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Zona no puede exceder 100 caracteres'),

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

  body('tipoDiscapacidadId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Tipo de discapacidad ID debe ser un número entero mayor a 0'),

  body('gradoDiscapacidad')
    .optional()
    .isString()
    .withMessage('Grado de discapacidad debe ser una cadena de texto')
    .trim()
    .isLength({ max: 50 })
    .withMessage('Grado de discapacidad no puede exceder 50 caracteres'),

  body('descripcion')
    .optional()
    .isString()
    .withMessage('Descripción debe ser una cadena de texto')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descripción no puede exceder 500 caracteres'),

  // ============================================
  // ORIGEN/NACIONALIDAD (OPCIONAL)
  // ============================================
  body('paisId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('País ID debe ser un número entero mayor a 0'),

  body('ciudadNacimiento')
    .optional()
    .isString()
    .withMessage('Ciudad de nacimiento debe ser una cadena de texto')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Ciudad de nacimiento no puede exceder 100 caracteres'),

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
    .notEmpty()
    .withMessage('Apellidos son requeridos para cada contacto')
    .isString()
    .withMessage('Apellidos debe ser una cadena de texto')
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Apellidos debe tener entre 2 y 150 caracteres'),

  body('contactosEmergencia.*.ci')
    .if(body('contactosEmergencia').isArray())
    .optional()
    .isString()
    .withMessage('CI debe ser una cadena de texto')
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('CI debe tener entre 5 y 20 caracteres'),

  body('contactosEmergencia.*.telefono')
    .if(body('contactosEmergencia').isArray())
    .optional()
    .isString()
    .withMessage('Teléfono debe ser una cadena de texto')
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('Teléfono debe tener entre 7 y 20 caracteres'),

  body('contactosEmergencia.*.celular')
    .if(body('contactosEmergencia').isArray())
    .optional()
    .isString()
    .withMessage('Celular debe ser una cadena de texto')
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('Celular debe tener entre 7 y 20 caracteres'),

  body('contactosEmergencia.*.email')
    .if(body('contactosEmergencia').isArray())
    .optional()
    .isEmail()
    .withMessage('Email debe ser un email válido')
    .normalizeEmail(),

  body('contactosEmergencia.*.ocupacion')
    .if(body('contactosEmergencia').isArray())
    .optional()
    .isString()
    .withMessage('Ocupación debe ser una cadena de texto')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Ocupación no puede exceder 100 caracteres'),

  body('contactosEmergencia.*.lugarTrabajo')
    .if(body('contactosEmergencia').isArray())
    .optional()
    .isString()
    .withMessage('Lugar de trabajo debe ser una cadena de texto')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Lugar de trabajo no puede exceder 200 caracteres'),

  body('contactosEmergencia.*.direccion')
    .if(body('contactosEmergencia').isArray())
    .optional()
    .isString()
    .withMessage('Dirección debe ser una cadena de texto')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Dirección no puede exceder 500 caracteres'),

  body('contactosEmergencia.*.esContactoEmergencia')
    .if(body('contactosEmergencia').isArray())
    .optional()
    .isBoolean()
    .withMessage('esContactoEmergencia debe ser un booleano'),

  body('contactosEmergencia.*.esApoderadoLegal')
    .if(body('contactosEmergencia').isArray())
    .optional()
    .isBoolean()
    .withMessage('esApoderadoLegal debe ser un booleano'),

  body('contactosEmergencia.*.viveConEstudiante')
    .if(body('contactosEmergencia').isArray())
    .optional()
    .isBoolean()
    .withMessage('viveConEstudiante debe ser un booleano'),

  body('contactosEmergencia.*.observaciones')
    .if(body('contactosEmergencia').isArray())
    .optional()
    .isString()
    .withMessage('Observaciones debe ser una cadena de texto')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Observaciones no puede exceder 500 caracteres'),

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

