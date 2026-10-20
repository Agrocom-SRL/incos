import { body, param, query } from 'express-validator';
import {
  ESTADOS_LIBRO_VALUES,
  ESTADOS_FOLIO_VALUES,
} from '../../../domain/constants/libros.constants.js';

const libroIdParam = param('id').isInt({ min: 1 }).withMessage('Libro inválido');
const folioIdParam = param('folioId').isInt({ min: 1 }).withMessage('Folio inválido');
const filaIdParam = param('filaId').isInt({ min: 1 }).withMessage('Fila de folio inválida');
const gestionIdParam = param('gestionId').isInt({ min: 1 }).withMessage('Gestión inválida');

export const listLibrosValidator = [
  query('gestionId').optional().isInt({ min: 1 }).withMessage('Gestión inválida'),
];

export const abrirLibroValidator = [
  body('gestionId').isInt({ min: 1 }).withMessage('La gestión es obligatoria'),
  // El número de libro se ingresa cada gestión; no se auto-sugiere en servidor.
  body('numeroLibro').isInt({ min: 1 }).withMessage('El número de libro es obligatorio'),
  body('codigoRegistro')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Código de registro inválido'),
  body('folioInicial').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Folio inicial inválido'),
  body('folioFinal').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Folio final inválido'),
  body('fechaApertura').optional({ nullable: true }).isISO8601().withMessage('Fecha de apertura inválida'),
  body('observaciones').optional({ nullable: true }).isString().isLength({ max: 2000 }),
];

export const getLibroByIdValidator = [libroIdParam];

export const editarLibroValidator = [
  libroIdParam,
  body('codigoRegistro')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Código de registro inválido'),
  body('folioFinal').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Folio final inválido'),
  body('fechaApertura').optional({ nullable: true }).isISO8601().withMessage('Fecha de apertura inválida'),
  body('estado').optional().isIn(ESTADOS_LIBRO_VALUES).withMessage('Estado de libro inválido'),
  body('observaciones').optional({ nullable: true }).isString().isLength({ max: 2000 }),
  // Cierre con notas pendientes (estado: CERRADO): `forzarCierre` asienta los
  // pendientes como ABANDONO y exige `motivo` (mínimo lo valida el use case).
  body('forzarCierre')
    .optional()
    .isBoolean()
    .withMessage('forzarCierre inválido')
    .toBoolean(),
  body('motivo')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Motivo inválido (máximo 2000 caracteres)'),
];

export const listParalelosLibroValidator = [libroIdParam];

export const generarFoliosParaleloValidator = [
  libroIdParam,
  body('paraleloGestionId').isInt({ min: 1 }).withMessage('El paralelo es obligatorio'),
  body('fechaRegistro').optional({ nullable: true }).isISO8601().withMessage('Fecha de registro inválida'),
];

export const getFolioByIdValidator = [libroIdParam, folioIdParam];

export const cambiarEstadoFolioValidator = [
  libroIdParam,
  folioIdParam,
  body('estado').isIn(ESTADOS_FOLIO_VALUES).withMessage('Estado de folio inválido'),
  body('motivo').optional({ nullable: true }).isString().isLength({ max: 2000 }),
];

export const editarFolioEstudianteValidator = [
  libroIdParam,
  folioIdParam,
  filaIdParam,
  body('observaciones').optional({ nullable: true }).isString().isLength({ max: 255 }),
];

export const exportLibroExcelValidator = [
  libroIdParam,
  query('carreraId').optional().isInt({ min: 1 }).withMessage('Carrera inválida'),
];

/** POST /libros/gestiones/:gestionId/folios — generación masiva por gestión. */
export const generarFoliosGestionValidator = [
  gestionIdParam,
  body('fechaRegistro').optional({ nullable: true }).isISO8601().withMessage('Fecha de registro inválida'),
];
