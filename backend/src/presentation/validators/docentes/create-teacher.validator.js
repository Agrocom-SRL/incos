import { body } from 'express-validator';
import { GENEROS_VALUES } from '../../../domain/constants/estudiantes.constants.js';
import {
  NIVELES_ACADEMICOS_PERSONAL_VALUES,
  TIPOS_CONTRATO_DOCENTE_VALUES,
  ESTADOS_LABORALES_VALUES,
} from '../../../domain/constants/docentes.constants.js';

const EXPEDICIONES = ['LP', 'CB', 'SC', 'OR', 'PT', 'CH', 'TJ', 'BN', 'PD'];

/** Campos comunes create/update (cuerpo en español, alineado al front DocentesForm). */
const teacherBodyFields = () => [
  body('ci')
    .notEmpty()
    .withMessage('El CI es requerido')
    .isString()
    .trim()
    .isLength({ min: 1, max: 25 })
    .withMessage('CI inválido'),

  body('expedicion')
    .optional({ nullable: true, values: 'falsy' })
    .isString()
    .trim()
    .isIn(EXPEDICIONES)
    .withMessage(`Expedición debe ser una de: ${EXPEDICIONES.join(', ')}`),

  body('nombres')
    .notEmpty()
    .withMessage('Los nombres son requeridos')
    .isString()
    .trim()
    .isLength({ min: 1, max: 150 }),

  body('apellidoPaterno')
    .notEmpty()
    .withMessage('El apellido paterno es requerido')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 }),

  body('apellidoMaterno')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 100 }),

  body('fechaNacimiento')
    .notEmpty()
    .withMessage('La fecha de nacimiento es requerida')
    .isISO8601()
    .withMessage('La fecha de nacimiento debe ser YYYY-MM-DD'),

  body('genero')
    .notEmpty()
    .withMessage('El género es requerido')
    .isIn([...GENEROS_VALUES])
    .withMessage('Género inválido'),

  body('estadoCivilId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .toInt(),

  body('nacionalidad')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 50 }),

  body('celular')
    .notEmpty()
    .withMessage('El celular es requerido')
    .isString()
    .trim()
    .isLength({ min: 1, max: 20 }),

  body('telefono')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 20 }),

  body('emailPersonal')
    .optional({ nullable: true, values: 'falsy' })
    .isString()
    .trim()
    .isLength({ max: 150 })
    .isEmail()
    .withMessage('Correo personal inválido'),

  body('direccion')
    .optional({ nullable: true })
    .isString()
    .trim(),

  body('municipioResidenciaId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .toInt(),

  body('zona')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 100 }),

  body('tituloProfesional')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 200 }),

  body('especialidad')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 200 }),

  body('nivelAcademico')
    .optional({ nullable: true })
    .isIn([...NIVELES_ACADEMICOS_PERSONAL_VALUES])
    .withMessage('Nivel académico inválido'),

  body('institucionEgreso')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 200 }),

  body('anioEgreso')
    .optional({ nullable: true })
    .isInt({ min: 1950, max: 2100 })
    .toInt(),

  body('aniosExperiencia')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 80 })
    .toInt(),

  body('fechaContratacion')
    .optional({ nullable: true, values: 'falsy' })
    .isISO8601(),

  body('fechaRetiro')
    .optional({ nullable: true, values: 'falsy' })
    .isISO8601(),

  body('tipoContrato')
    .optional({ nullable: true })
    .isIn([...TIPOS_CONTRATO_DOCENTE_VALUES]),

  body('estadoLaboral')
    .optional({ nullable: true })
    .isIn([...ESTADOS_LABORALES_VALUES]),

  body('observaciones')
    .optional({ nullable: true })
    .isString()
    .trim(),

  body('activo')
    .optional()
    .isBoolean()
    .toBoolean(),

  body('maxHorasSemana')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 60 })
    .toInt(),

  body('maxHorasMes')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 320 })
    .toInt(),
];

export const createTeacherValidator = teacherBodyFields();
