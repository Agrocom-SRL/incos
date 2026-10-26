import {
  parseBooleanoOpcional,
  parseNumeroOpcional,
  parseTextoOpcional,
  primerDefinido,
} from '../../utils/validacionEntrada.js';

const numero = (body, nombre, ...claves) =>
  parseNumeroOpcional(primerDefinido(body, ...claves), nombre, { min: 0 });

/**
 * Campos opcionales del plan de estudios (alias español/camelCase) ya validados.
 * `undefined` ⇒ no tocar; `null` ⇒ vaciar el campo.
 */
export function parsePlanEstudiosOpcionales(body = {}) {
  return {
    ministerialResolution: parseTextoOpcional(
      primerDefinido(body, 'resolucion_ministerial', 'resolucionMinisterial'),
      'resolucion_ministerial'
    ),
    documentPath: parseTextoOpcional(primerDefinido(body, 'documento_ruta', 'documentoRuta'), 'documento_ruta'),
    durationYears: numero(body, 'duracion_anios', 'duracion_anios', 'duracionAnios'),
    totalHours: numero(body, 'carga_horaria_total', 'carga_horaria_total', 'cargaHorariaTotal'),
    hoursPerWeek: numero(body, 'horas_semana', 'horas_semana', 'horasSemana'),
    hoursPerMonth: numero(body, 'horas_mes', 'horas_mes', 'horasMes'),
    hoursPerYear: numero(body, 'horas_anio', 'horas_anio', 'horasAnio'),
    observations: parseTextoOpcional(body.observaciones, 'observaciones'),
    isActive: parseBooleanoOpcional(primerDefinido(body, 'vigente', 'isActive'), 'vigente'),
  };
}
