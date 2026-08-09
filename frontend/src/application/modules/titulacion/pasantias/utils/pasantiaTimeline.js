/**
 * Línea de tiempo del trámite de pasantía (ficha, siempre visible) — deriva
 * los pasos de la máquina de estados P6 SEGÚN EL CAMINO (`pasantia.tipo`).
 * A diferencia de Proyecto de grado, `pasantias` no tiene un campo de fecha
 * por etapa ni tabla de historial (decisión 2026-08-08: no se agrega tabla
 * nueva) — el stepper muestra las etapas POSIBLES con la actual resaltada,
 * sin fechas intermedias reales.
 *
 * Mismo diseño estructural que `proyectoGradoTimeline.js`: N pasos
 * intermedios (progreso) + 1 paso de resultado final, que usa el pill REAL
 * del estado (mismo color que el StatusPill de la cabecera de la ficha) en
 * vez de un Tag genérico — para que un desenlace exitoso (Finalizada/
 * Convalidada) se vea "completado" (verde) y no "en curso" (azul).
 */

import {
  formatEstadoPasantia,
  getEstadoPasantiaPillClass,
} from '@application-titulacion/utils/pasantiasPills';

/** Pasos intermedios (progreso) de cada camino — sin el resultado final. */
const ETAPAS_INTERMEDIAS = {
  PASANTIA: [
    { estado: 'SOLICITADA', label: 'Solicitada' },
    { estado: 'EN_CURSO', label: 'En curso' },
  ],
  CONVALIDACION: [{ estado: 'SOLICITADA', label: 'Solicitada' }],
};

/** Resultado final EXITOSO de cada camino (TRANSICIONES_PASANTIA). */
const RESULTADO_EXITOSO_POR_TIPO = {
  PASANTIA: 'FINALIZADA',
  CONVALIDACION: 'CONVALIDADA',
};

/** Desvío (RECHAZADA/CANCELADA) → etapa intermedia tras la que se corta. */
const PUNTO_CORTE_DESVIO = {
  RECHAZADA: 'SOLICITADA',
  CANCELADA: 'EN_CURSO',
};

const STEP_STATUS = { completado: 'finish', actual: 'process', pendiente: 'wait' };
const ETAPA_TAG = {
  completado: { color: 'success', label: 'Completado' },
  actual: { color: 'processing', label: 'Vigente' },
  pendiente: { color: 'default', label: 'Pendiente' },
};

/**
 * @param {Object} pasantia - Ficha del trámite (`GetPasantiaByIdUseCase`).
 * @returns {Array<{stepStatus, titulo, tag?, pillClass?, pillLabel?}>}
 */
export function buildPasantiaTimeline(pasantia) {
  if (!pasantia) return [];

  const { tipo, estado } = pasantia;
  const etapas = ETAPAS_INTERMEDIAS[tipo] ?? ETAPAS_INTERMEDIAS.PASANTIA;
  const resultadoExitoso = RESULTADO_EXITOSO_POR_TIPO[tipo] ?? RESULTADO_EXITOSO_POR_TIPO.PASANTIA;
  const esResultadoExitoso = estado === resultadoExitoso;
  const esDesvio = estado === 'RECHAZADA' || estado === 'CANCELADA';
  const hayDesenlace = esResultadoExitoso || esDesvio;

  let currentIndex;
  if (esResultadoExitoso) {
    currentIndex = etapas.length;
  } else if (esDesvio) {
    const corte = PUNTO_CORTE_DESVIO[estado];
    const idxCorte = etapas.findIndex((e) => e.estado === corte);
    currentIndex = idxCorte >= 0 ? idxCorte + 1 : 1;
  } else {
    const idx = etapas.findIndex((e) => e.estado === estado);
    currentIndex = idx >= 0 ? idx : 0;
  }

  const items = etapas.map((etapa, i) => {
    const clave =
      i < currentIndex ? 'completado' : i === currentIndex && !hayDesenlace ? 'actual' : 'pendiente';
    return {
      stepStatus: STEP_STATUS[clave],
      titulo: etapa.label,
      tag: ETAPA_TAG[clave],
    };
  });

  // Paso de resultado: aparece con cualquier desenlace (éxito o desvío),
  // siempre con el pill REAL del estado — mismo color que la cabecera.
  if (hayDesenlace) {
    items.push({
      stepStatus: estado === 'RECHAZADA' ? 'error' : 'finish',
      titulo: formatEstadoPasantia(estado),
      tag: null,
      pillClass: getEstadoPasantiaPillClass(estado),
      pillLabel: formatEstadoPasantia(estado),
    });
  }

  return items;
}

export default buildPasantiaTimeline;
