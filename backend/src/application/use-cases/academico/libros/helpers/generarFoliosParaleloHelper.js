/**
 * calcularPaginasParalelo / generarParaUnParalelo — CORE de la generación de
 * folios (páginas del centralizador) de UN paralelo, extraído de
 * `GenerarFoliosParaleloUseCase` para que también lo usen
 * `GenerarFoliosGestionUseCase` (reajuste masivo de TODOS los paralelos de
 * una gestión, en orden canónico de carrera).
 *
 * Algoritmo (réplica del libro físico):
 * 1. Nómina del paralelo (vista 177) en orden institucional → páginas de 10
 *    estudiantes (ESTUDIANTES_POR_FOLIO).
 * 2. numero_orden continuo del estudiante en el paralelo; orden_en_paralelo =
 *    1ra, 2da... página del paralelo. numero_folio NO se calcula aquí (es
 *    correlativo POR GESTIÓN, cruzando TODAS las carreras): lo asigna quien
 *    persiste — `crearFoliosConEstudiantes` (paralelo único, MAX+1) o
 *    `reajustarFoliosGestion` (gestión completa, numeración fresca 1..N).
 * 3. estado_academico SUGERIDO desde las filas de la vista 135 (caché
 *    matriculas_materia.estado).
 */

import { ValidationError } from '../../../../../domain/errors/AppError.js';
import { ESTADOS_FOLIO, ESTUDIANTES_POR_FOLIO } from '../../../../../domain/constants/libros.constants.js';
import { toFolioDTO } from '../../../../mappers/academico/LibroRegistroPresentationMapper.js';
import { agruparFilas135PorEstudiante, derivarEstadoAcademico } from './folioCeldasHelper.js';

/**
 * Calcula las páginas (folios, sin `numeroFolio` ni persistir) de UN
 * paralelo a partir de su nómina actual. Pura función de lectura: no toca la
 * base de datos de escritura.
 *
 * @param {Object} params
 * @param {Object} params.libroRegistroViewRepository
 * @param {Object} params.calificacionCentralizadorRepository
 * @param {number} params.paraleloGestionId
 * @param {string|null} [params.fechaRegistro] - ISO date; hoy si se omite.
 * @returns {Promise<{ paginas: Array<Object>, totalEstudiantes: number }>}
 *   `paginas` = [{ paraleloGestionId, ordenEnParalelo, estado, fechaRegistro,
 *   estudiantes: [{ numeroOrden, estudianteId, inscripcionId, estadoAcademico,
 *   observaciones }] }] — mismo shape que espera `crearFoliosConEstudiantes`.
 * @throws {ValidationError} Si el paralelo no tiene estudiantes matriculados.
 */
export async function calcularPaginasParalelo({
  libroRegistroViewRepository,
  calificacionCentralizadorRepository,
  paraleloGestionId,
  fechaRegistro = null,
}) {
  // 1) Nómina ordenada por apellido (vista 177).
  const nomina =
    await libroRegistroViewRepository.listarNominaPorParaleloGestion(paraleloGestionId);
  if (nomina.length === 0) {
    throw new ValidationError('El paralelo no tiene estudiantes matriculados');
  }

  // 2) Estado académico sugerido desde la vista 135 (por estudiante).
  const filas135 = await calificacionCentralizadorRepository
    .listarFilasCentralizadorPorParaleloGestion(paraleloGestionId);
  const filasPorEstudiante = agruparFilas135PorEstudiante(filas135);

  // 3) Corte en páginas de 10 con orden continuo.
  const fecha = fechaRegistro ?? new Date().toISOString().slice(0, 10);

  const paginas = [];
  for (let inicio = 0; inicio < nomina.length; inicio += ESTUDIANTES_POR_FOLIO) {
    const pagina = nomina.slice(inicio, inicio + ESTUDIANTES_POR_FOLIO);
    paginas.push({
      paraleloGestionId,
      ordenEnParalelo: paginas.length + 1,
      estado: ESTADOS_FOLIO.BORRADOR,
      fechaRegistro: fecha,
      estudiantes: pagina.map((est, idx) => ({
        numeroOrden: inicio + idx + 1,
        estudianteId: est.estudiante_id,
        inscripcionId: est.inscripcion_id,
        estadoAcademico: derivarEstadoAcademico(filasPorEstudiante.get(est.estudiante_id)),
        observaciones: null,
      })),
    });
  }

  return { paginas, totalEstudiantes: nomina.length };
}

/**
 * @param {Object} params
 * @param {Object} params.libroRegistroRepository
 * @param {Object} params.libroRegistroViewRepository
 * @param {Object} params.calificacionCentralizadorRepository
 * @param {Object} params.libro - Entidad de libro (`LibroRegistroRepository.toEntity`):
 *        { id, gestionId, folioInicial, ... }.
 * @param {Object} params.paralelo - Fila de paralelo candidato (vista 127 +
 *        conteos, de `listarParalelosPorGestion`): requiere `paralelo_gestion_id`.
 * @param {string|null} [params.fechaRegistro] - ISO date; hoy si se omite.
 * @param {number|null} [params.usuarioId]
 * @returns {Promise<{ creados: Array<Object>, folios: Array<Object>, totalEstudiantes: number }>}
 *   `creados` = filas planas de `crearFoliosConEstudiantes` (con `numeroFolio`);
 *   `folios` = DTOs de presentación (vista 176) del paralelo recién generado.
 */
export async function generarParaUnParalelo({
  libroRegistroRepository,
  libroRegistroViewRepository,
  calificacionCentralizadorRepository,
  libro,
  paralelo,
  fechaRegistro = null,
  usuarioId = null,
}) {
  const paraleloGestionId = Number(paralelo?.paralelo_gestion_id);

  const { paginas, totalEstudiantes } = await calcularPaginasParalelo({
    libroRegistroViewRepository,
    calificacionCentralizadorRepository,
    paraleloGestionId,
    fechaRegistro,
  });

  // Persistencia transaccional (numeración + folios + filas, todo o nada;
  // esta transacción es SOLO de este paralelo).
  const creados = await libroRegistroRepository.crearFoliosConEstudiantes(
    {
      libroId: libro.id,
      gestionId: libro.gestionId,
      folioInicial: libro.folioInicial,
      folios: paginas,
    },
    usuarioId,
  );

  // DTOs de presentación (vista 176) del paralelo recién generado.
  const rows = await libroRegistroViewRepository.listarFoliosPorLibro(libro.id, {
    paraleloGestionId,
  });

  return { creados, folios: rows.map(toFolioDTO), totalEstudiantes };
}

export default generarParaUnParalelo;
