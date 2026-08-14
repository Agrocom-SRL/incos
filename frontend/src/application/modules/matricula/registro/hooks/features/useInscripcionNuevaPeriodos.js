/**
 * Hook: useInscripcionNuevaPeriodos
 *
 * Single Responsibility: exponer los periodos del plan para el wizard de
 * inscripción y la selección de periodos DERIVADA de las materias marcadas.
 *
 * Fuente de datos: contexto de matrícula (GET /inscripciones/contexto-matricula,
 * §3-A3 del plan) — se eliminó la derivación histórica desde GET /paralelos.
 * selectedPeriodIds ya no es estado propio: son los periodos con ≥1 materia
 * marcada en la planilla (useMatriculaWizardMateriasSelection), ordenados por
 * número de periodo.
 *
 * @param {Object} options
 * @param {Object|null} options.contexto - contexto-matricula (usa contexto.periodos)
 * @param {boolean} [options.loading] - contextoLoading
 * @param {string|null} [options.error] - contextoError
 * @param {string|null} [options.tipoAdmision] - NUEVO | ANTIGUO | TRASPASO | TRANSITABILIDAD
 * @param {string|null} [options.anioCursadoTraspaso] - PRIMERO | SEGUNDO | null
 * @param {Object} [options.selectedMateriaIdsByPeriod] - { [periodoId]: materiaIds[] }
 * @returns {Object} periodos, loading, error, selectedPeriodIds, selectedPeriods,
 *   selectedPeriod, periodosDisabledByTraspaso
 */

import { useMemo } from 'react';

/** Para TRASPASO: según año cursado en origen, deshabilitar periodos ya cursados (numero → bool). */
function buildPeriodosDisabledByTraspaso(anioCursadoTraspaso) {
  if (!anioCursadoTraspaso) return null;
  const v = String(anioCursadoTraspaso).toUpperCase();
  if (v === 'PRIMERO') return { 1: true, 2: false, 3: false };
  if (v === 'SEGUNDO') return { 1: true, 2: true, 3: false };
  return null;
}

export const useInscripcionNuevaPeriodos = (options = {}) => {
  const {
    contexto = null,
    loading = false,
    error = null,
    tipoAdmision = null,
    anioCursadoTraspaso = null,
    selectedMateriaIdsByPeriod = {},
  } = options;

  // Lista plana de periodos del plan (todas las claves numéricas normalizadas).
  const periodos = useMemo(
    () =>
      (contexto?.periodos ?? [])
        .map((p) => ({
          id: Number(p.id),
          numero: Number(p.numero ?? 0) || 0,
          nombre: p.nombre || `Periodo ${p.numero ?? p.id}`,
        }))
        .sort((a, b) => a.numero - b.numero),
    [contexto?.periodos]
  );

  const periodosDisabledByTraspaso = useMemo(
    () =>
      String(tipoAdmision ?? '').toUpperCase() === 'TRASPASO'
        ? buildPeriodosDisabledByTraspaso(anioCursadoTraspaso)
        : null,
    [tipoAdmision, anioCursadoTraspaso]
  );

  // Selección implícita: periodos con ≥1 materia marcada, ordenados por numero.
  const selectedPeriodIds = useMemo(() => {
    const numeroById = new Map(periodos.map((p) => [p.id, p.numero]));
    return Object.entries(selectedMateriaIdsByPeriod ?? {})
      .filter(([, ids]) => Array.isArray(ids) && ids.length > 0)
      .map(([key]) => Number(key))
      .filter(Number.isFinite)
      .sort((a, b) => (numeroById.get(a) ?? 0) - (numeroById.get(b) ?? 0));
  }, [selectedMateriaIdsByPeriod, periodos]);

  const selectedPeriods = useMemo(
    () => selectedPeriodIds.map((id) => periodos.find((p) => p.id === id)).filter(Boolean),
    [periodos, selectedPeriodIds]
  );

  const selectedPeriod = useMemo(() => selectedPeriods[0] ?? null, [selectedPeriods]);

  return useMemo(
    () => ({
      periodos,
      loading,
      error,
      selectedPeriodIds,
      selectedPeriods,
      selectedPeriod,
      periodosDisabledByTraspaso,
    }),
    [periodos, loading, error, selectedPeriodIds, selectedPeriods, selectedPeriod, periodosDisabledByTraspaso]
  );
};
