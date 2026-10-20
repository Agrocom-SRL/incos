/**
 * Helpers puros del CIERRE del libro de registro (`EditarLibroUseCase`,
 * `estado: CERRADO`): a partir de los folios vigentes (vista 176), la nómina
 * congelada de cada folio (`listarEstudiantesFolio`) y las notas VIVAS del
 * centralizador (vista 135) clasifican cada fila que sigue en CURSANDO en:
 *
 * - PENDIENTE: el estudiante todavía tiene ≥1 materia sin `nota_final`
 *   (`derivarEstadoAcademico` → CURSANDO). Bloquea el cierre (409 con el
 *   resumen por paralelo/folio) salvo cierre FORZADO, donde se asienta como
 *   ABANDONO + observación.
 * - DESACTUALIZADA: el folio se generó antes de que el docente cargara las
 *   notas y hoy la 135 ya tiene todas → el snapshot `estado_academico` quedó
 *   viejo. No bloquea: al cerrar se re-deriva con `derivarEstadoAcademico`
 *   (misma regla que la generación) y se sincroniza la fila. Sin esto, el
 *   cierre forzado marcaría ABANDONO a estudiantes que SÍ tienen notas.
 *
 * Solo se tocan filas CURSANDO: el resto ya quedó decidido al generar el
 * folio (APROBADO/REPROBADO/ABANDONO) y el estado no es editable a mano
 * (`EditarFolioEstudianteUseCase`).
 *
 * El desglose del 409 es deliberadamente COMPACTO (pedido del usuario,
 * 2026-08-21): por paralelo, cada folio con pendientes y el rango de
 * apellidos inicial–final de esa página ("Folio 12 · AÑEZ – CASTRO"). No
 * viaja la lista de estudiantes ni las materias/docentes — con ~400 filas
 * eso pesaba 412 KB para un modal que solo necesita 44 líneas.
 */

import {
  ESTADOS_ACADEMICOS_FOLIO,
  ESTADOS_FOLIO,
  ordenCarreraLibro,
} from '../../../../../domain/constants/libros.constants.js';
import { agruparFilas135PorEstudiante, derivarEstadoAcademico } from './folioCeldasHelper.js';

/**
 * Folios VIGENTES del libro con filas CURSANDO (`total_cursando > 0`, vista
 * 176), agrupados por paralelo en gestión y en el orden canónico del libro
 * (Contaduría → Administración → Informática, periodo, paralelo). Los folios
 * de cada grupo quedan ordenados por `numero_folio`.
 * @param {Array<Object>} folios176
 * @returns {Array<{ paraleloGestionId:number, folios:Array<Object> }>}
 */
export function agruparFoliosConCursandoPorParalelo(folios176) {
  const porParalelo = new Map();
  const conCursando = (folios176 ?? []).filter(
    (folio) => folio.estado !== ESTADOS_FOLIO.ANULADO && Number(folio.total_cursando ?? 0) > 0,
  );
  for (const folio of conCursando) {
    const key = Number(folio.paralelo_gestion_id);
    const lista = porParalelo.get(key) ?? [];
    lista.push(folio);
    porParalelo.set(key, lista);
  }

  return [...porParalelo.entries()]
    .map(([paraleloGestionId, folios]) => ({
      paraleloGestionId,
      folios: [...folios].sort((a, b) => Number(a.numero_folio) - Number(b.numero_folio)),
    }))
    .sort((a, b) => {
      const fa = a.folios[0];
      const fb = b.folios[0];
      const ordenCarrera =
        ordenCarreraLibro(fa.carrera_codigo) - ordenCarreraLibro(fb.carrera_codigo);
      if (ordenCarrera !== 0) return ordenCarrera;
      const ordenPeriodo = Number(fa.periodo_numero ?? 0) - Number(fb.periodo_numero ?? 0);
      if (ordenPeriodo !== 0) return ordenPeriodo;
      return String(fa.paralelo_nombre ?? '').localeCompare(String(fb.paralelo_nombre ?? ''));
    });
}

/**
 * Apellido paterno de la fila de nómina (columna propia o primer token del
 * nombre completo, que ya viene en orden APELLIDO_PATERNO APELLIDO_MATERNO
 * NOMBRES).
 * @param {Object} fila - Fila de `listarEstudiantesFolio`.
 * @returns {string}
 */
function apellidoPaternoFila(fila) {
  const propio = String(fila.apellido_paterno ?? '').trim();
  if (propio) return propio;
  return String(fila.nombre_completo ?? '').trim().split(/\s+/)[0] ?? '';
}

/**
 * Clasifica las filas CURSANDO de UN paralelo contra sus notas vivas.
 * @param {Object} params
 * @param {Array<Object>} params.folios - Folios (vista 176) del paralelo, ordenados.
 * @param {Map<number, Array<Object>>} params.nominasPorFolio - folio.id → filas
 *        de `listarEstudiantesFolio`.
 * @param {Array<Object>} params.filas135 - Filas del centralizador del paralelo.
 * @param {number} params.notaMinimaAprobacion
 * @returns {{ pendientes: Array<Object>, desactualizadas: Array<Object> }}
 *   pendientes[]: { folioEstudianteId, estudianteId, numeroFolio, numeroOrden,
 *   apellidoPaterno };
 *   desactualizadas[]: { folioEstudianteId, ..., estadoAcademico (re-derivado) }.
 */
export function clasificarFilasCursandoParalelo({
  folios,
  nominasPorFolio,
  filas135,
  notaMinimaAprobacion,
}) {
  const filasPorEstudiante = agruparFilas135PorEstudiante(filas135);
  const pendientes = [];
  const desactualizadas = [];

  for (const folio of folios) {
    const cursando = (nominasPorFolio.get(folio.id) ?? []).filter(
      (fila) => fila.estado_academico === ESTADOS_ACADEMICOS_FOLIO.CURSANDO,
    );
    for (const fila of cursando) {
      const filasEstudiante = filasPorEstudiante.get(fila.estudiante_id) ?? [];
      const estadoVivo = derivarEstadoAcademico(filasEstudiante, notaMinimaAprobacion);
      const base = {
        folioEstudianteId: fila.id,
        estudianteId: fila.estudiante_id ?? null,
        numeroFolio: folio.numero_folio ?? null,
        numeroOrden: fila.numero_orden ?? null,
        apellidoPaterno: apellidoPaternoFila(fila),
      };

      if (estadoVivo === ESTADOS_ACADEMICOS_FOLIO.CURSANDO) {
        pendientes.push(base);
      } else {
        desactualizadas.push({ ...base, estadoAcademico: estadoVivo });
      }
    }
  }

  return { pendientes, desactualizadas };
}

/**
 * Resumen por FOLIO de los pendientes de un paralelo: cuántos y el rango de
 * apellidos inicial–final según el N° de orden de la página (la nómina del
 * folio ya está en orden institucional por apellido).
 * @param {Array<Object>} pendientes - Salida de `clasificarFilasCursandoParalelo`.
 * @returns {Array<{ numeroFolio:number, totalEstudiantes:number,
 *   apellidoDesde:string, apellidoHasta:string }>}
 */
export function resumirFoliosPendientes(pendientes) {
  const porFolio = new Map();
  for (const fila of pendientes) {
    const key = Number(fila.numeroFolio);
    const lista = porFolio.get(key) ?? [];
    lista.push(fila);
    porFolio.set(key, lista);
  }

  return [...porFolio.entries()]
    .sort(([a], [b]) => a - b)
    .map(([numeroFolio, filas]) => {
      const ordenadas = [...filas].sort(
        (a, b) => Number(a.numeroOrden ?? 0) - Number(b.numeroOrden ?? 0),
      );
      return {
        numeroFolio,
        totalEstudiantes: ordenadas.length,
        apellidoDesde: ordenadas[0]?.apellidoPaterno ?? '',
        apellidoHasta: ordenadas[ordenadas.length - 1]?.apellidoPaterno ?? '',
      };
    });
}

/**
 * DTO de un paralelo con pendientes para el desglose del 409 (cabecera desde
 * la primera fila 176 del grupo + resumen por folio). SIN lista de
 * estudiantes: el modal solo muestra "Folio N · APELLIDO – APELLIDO".
 * @param {{ paraleloGestionId:number, folios:Array<Object> }} grupo
 * @param {Array<Object>} pendientes - Salida de `clasificarFilasCursandoParalelo`.
 * @returns {Object|null} null si el paralelo no tiene pendientes reales.
 */
export function toParaleloPendientesDTO(grupo, pendientes) {
  if (!pendientes || pendientes.length === 0) return null;
  const cabecera = grupo.folios[0] ?? {};
  const folios = resumirFoliosPendientes(pendientes);

  return {
    paraleloGestionId: grupo.paraleloGestionId,
    carreraId: cabecera.carrera_id ?? null,
    carreraCodigo: cabecera.carrera_codigo ?? null,
    carreraNombre: cabecera.carrera_nombre ?? null,
    carreraColorHex: cabecera.carrera_color_hex ?? null,
    periodoNumero: cabecera.periodo_numero ?? null,
    periodoNombre: cabecera.periodo_nombre ?? null,
    paraleloNombre: cabecera.paralelo_nombre ?? null,
    turno: cabecera.turno ?? null,
    folioDesde: folios[0]?.numeroFolio ?? null,
    folioHasta: folios[folios.length - 1]?.numeroFolio ?? null,
    totalEstudiantes: pendientes.length,
    folios,
  };
}

/**
 * Asientos a persistir al cerrar (`LibroRegistroRepository.cerrarLibro`):
 * un grupo ABANDONO + observación para los pendientes (solo en cierre forzado)
 * y un grupo por estado re-derivado para las filas desactualizadas.
 * @param {Object} params
 * @param {Array<Object>} params.pendientes - Pendientes de TODOS los paralelos.
 * @param {Array<Object>} params.desactualizadas - Desactualizadas de TODOS los paralelos.
 * @param {string} params.observacionAbandono
 * @returns {Array<{ ids:Array<number>, estadoAcademico:string, observacion?:string }>}
 */
export function construirAsientosCierre({ pendientes, desactualizadas, observacionAbandono }) {
  const asientos = [];

  if (pendientes.length > 0) {
    asientos.push({
      ids: pendientes.map((p) => p.folioEstudianteId),
      estadoAcademico: ESTADOS_ACADEMICOS_FOLIO.ABANDONO,
      observacion: observacionAbandono,
    });
  }

  const porEstado = new Map();
  for (const fila of desactualizadas) {
    const ids = porEstado.get(fila.estadoAcademico) ?? [];
    ids.push(fila.folioEstudianteId);
    porEstado.set(fila.estadoAcademico, ids);
  }
  for (const [estadoAcademico, ids] of porEstado.entries()) {
    asientos.push({ ids, estadoAcademico });
  }

  return asientos;
}

export default {
  agruparFoliosConCursandoPorParalelo,
  clasificarFilasCursandoParalelo,
  resumirFoliosPendientes,
  toParaleloPendientesDTO,
  construirAsientosCierre,
};
