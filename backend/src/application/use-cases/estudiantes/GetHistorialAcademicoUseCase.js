/**
 * Historial académico (kardex / transcript FORM-SIE-ITT-04) de un estudiante.
 *
 * Lee la vista base 138 (una fila por estudiante × asignatura × gestión, todas
 * las gestiones + arrastre/convalidación) y la cabecera del estudiante, y arma
 * el contrato { estudiante, filas, resumen } que consume el frontend.
 *
 * - `filas`: se numeran (nro) tras ordenar por gestión → periodo → orden (la
 *   vista ya entrega ese orden).
 * - `resumen`: carga horaria acumulada (aprobadas/convalidadas), asignaturas
 *   aprobadas vs. total, y promedio general (AVG de notas efectivas aprobadas).
 *
 * No recalcula la nota efectiva: la vista ya la resuelve por precedencia
 * (nota_forzada → nivelación aprobada → nota_final).
 */

import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import {
  mapCabeceraEstudiante,
  mapFilaHistorial,
} from '../../mappers/estudiantes/HistorialAcademicoMapper.js';

/** Estados que cuentan como asignatura aprobada en el transcript. */
const ESTADOS_APROBADOS = new Set(['APROBADO', 'CONVALIDADO']);

export class GetHistorialAcademicoUseCase {
  /**
   * @param {Object} params
   * @param {import('../../../infrastructure/repositories/views/HistorialAcademicoRepository.js').HistorialAcademicoRepository} params.historialAcademicoRepository
   * @param {Object} params.logger
   */
  constructor({ historialAcademicoRepository, logger }) {
    if (!historialAcademicoRepository) {
      throw new Error('historialAcademicoRepository es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.historialAcademicoRepository = historialAcademicoRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number|string} params.estudianteId
   * @returns {Promise<{ estudiante: Object, filas: Array<Object>, resumen: Object }>}
   */
  async execute({ estudianteId }) {
    const id = Number.parseInt(String(estudianteId), 10);
    if (!Number.isFinite(id) || id < 1) {
      throw new ValidationError('estudianteId inválido');
    }

    const [cabeceraRow, filasRow] = await Promise.all([
      this.historialAcademicoRepository.obtenerCabeceraEstudiante(id),
      this.historialAcademicoRepository.listarFilasHistorialPorEstudiante(id),
    ]);

    if (!cabeceraRow) {
      throw new NotFoundError(`Estudiante con ID ${id}`);
    }

    const estudiante = mapCabeceraEstudiante(cabeceraRow);

    const safeRows = Array.isArray(filasRow) ? filasRow : [];
    const filas = safeRows.map((row, index) => ({
      nro: index + 1,
      ...mapFilaHistorial(row),
    }));

    const resumen = this._calcularResumen(filas);

    this.logger.info('[Estudiantes] Historial académico obtenido', {
      estudianteId: id,
      filas: filas.length,
      aprobadas: resumen.asignaturasAprobadas,
    });

    return { estudiante, filas, resumen };
  }

  /**
   * Resumen del pie del transcript.
   * @param {Array<Object>} filas
   */
  _calcularResumen(filas) {
    let totalCargaHoraria = 0;
    let asignaturasAprobadas = 0;
    const notasAprobadas = [];

    for (const fila of filas) {
      if (ESTADOS_APROBADOS.has(fila.estado)) {
        asignaturasAprobadas += 1;
        if (Number.isFinite(fila.cargaHoraria)) {
          totalCargaHoraria += fila.cargaHoraria;
        }
        if (Number.isFinite(fila.notaFinal)) {
          notasAprobadas.push(fila.notaFinal);
        }
      }
    }

    const promedioGeneral =
      notasAprobadas.length > 0
        ? Math.round(notasAprobadas.reduce((acc, n) => acc + n, 0) / notasAprobadas.length)
        : null;

    return {
      totalCargaHoraria,
      asignaturasAprobadas,
      asignaturasTotal: filas.length,
      promedioGeneral,
    };
  }
}
