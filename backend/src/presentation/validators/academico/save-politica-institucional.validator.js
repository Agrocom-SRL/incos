import { body } from 'express-validator';

const POLITICAS_VALIDAS = ['NO_AFECTA', 'COMPUTA_NOTA', 'CAUSA_REPROBACION'];

export const savePoliticaInstitucionalValidator = [
  body('cuotaTeorico').isFloat({ min: 0, max: 100 }).withMessage('cuotaTeorico inválida'),
  body('cuotaPractico').isFloat({ min: 0, max: 100 }).withMessage('cuotaPractico inválida'),
  body('pesosBimestres')
    .isArray({ min: 4, max: 4 })
    .withMessage('pesosBimestres debe tener 4 elementos'),
  body('pesosBimestres.*').isFloat({ min: 0, max: 100 }).withMessage('peso bimestral inválido'),
  body('evaluacionesFinalesDisponibles').optional().isArray(),
  body('evaluacionesFinalesDisponibles.*.codigo').optional().isString(),
  body('evaluacionesFinalesDisponibles.*.habilitadaInstitucional').optional().isBoolean(),
  body('politicaAsistenciaDefault.politica')
    .isIn(POLITICAS_VALIDAS)
    .withMessage('política de asistencia inválida'),
  body('politicaAsistenciaDefault.pesoAsistencia').optional({ nullable: true }).isFloat({ min: 0.01, max: 100 }),
  body('politicaAsistenciaDefault.minimoAsistencia').optional({ nullable: true }).isFloat({ min: 0, max: 100 }),
  body('politicaAsistenciaDefault.notaReprobada').optional({ nullable: true }).isFloat({ min: 0, max: 100 }),
  body('notaMinimaAprobacion').isFloat({ min: 0, max: 100 }).withMessage('notaMinimaAprobacion inválida'),
];
