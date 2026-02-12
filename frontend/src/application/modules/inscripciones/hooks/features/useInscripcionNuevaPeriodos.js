/**
 * Hook: useInscripcionNuevaPeriodos
 *
 * Single Responsibility: Cargar lista de periodos del plan académico para el wizard de inscripción.
 *
 * - Obtiene periodos únicos a partir de paralelos (GET /paralelos con carrera_id).
 * - Según tipo de admisión: NUEVO = solo primer periodo (Primer Año); ANTIGUO = todos los periodos del plan.
 * - Para NUEVO auto-selecciona el primer periodo. Para ANTIGUO permite multi-selección (checkbox).
 * - selectedPeriods: array de periodos seleccionados (para cargar paralelos de varios periodos).
 * - selectedPeriod: primer periodo seleccionado (compatibilidad con lógica que espera un solo periodo).
 *
 * @param {Object} options - carreraId, tipoAdmision ('NUEVO' | 'ANTIGUO')
 * @returns {Object} periodos, loading, error, refetch, selectedPeriods, selectedPeriod, onTogglePeriods
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useParalelosApi } from '@application-academico/paralelos/hooks/useParalelosApi';

/**
 * Extrae periodos únicos de la lista de paralelos (id, numero, nombre).
 * Acepta camelCase (periodoId, periodoNumero, periodoNombre) y snake_case (periodo_id, etc.)
 * por si la API o el mapper devuelven uno u otro.
 */
function extractPeriodosFromParalelos(paralelos) {
  if (!Array.isArray(paralelos) || paralelos.length === 0) return [];
  const byId = new Map();
  paralelos.forEach((p) => {
    const id = p.periodoId ?? p.periodId ?? p.periodo_id;
    const numero =
      p.periodoNumero ?? p.numero ?? p.periodo_numero ?? (typeof id === 'number' ? id : null);
    const nombre =
      p.periodoNombre ?? p.periodo_nombre ?? (numero != null ? `Periodo ${numero}` : null);
    if (id != null && !byId.has(id)) {
      byId.set(id, {
        id,
        numero: numero ?? id,
        nombre: nombre || `Periodo ${numero ?? id}`,
      });
    }
  });
  return Array.from(byId.values()).sort((a, b) => (a.numero ?? 0) - (b.numero ?? 0));
}

export const useInscripcionNuevaPeriodos = (options = {}) => {
  const { carreraId = null, tipoAdmision = null, initialPeriodId = null, initialSelectedPeriodIds = null } = options;
  const { paralelos, loading, error, fetch } = useParalelosApi();
  const [selectedPeriodIds, setSelectedPeriodIds] = useState([]);

  const loadParalelos = useCallback(() => {
    const params = { limit: 100 };
    if (carreraId) params.carrera_id = carreraId;
    fetch({ params });
  }, [carreraId, fetch]);

  useEffect(() => {
    if (carreraId != null) {
      // En modo edición no borrar selección; aplicar initialSelectedPeriodIds de inmediato para que los checkboxes se marquen
      const hasInitialPeriods = Array.isArray(initialSelectedPeriodIds) && initialSelectedPeriodIds.length > 0;
      if (hasInitialPeriods) {
        setSelectedPeriodIds([...initialSelectedPeriodIds]);
      } else {
        setSelectedPeriodIds([]);
      }
      loadParalelos();
    }
  }, [carreraId, loadParalelos, initialSelectedPeriodIds]);

  const allPeriodos = useMemo(() => extractPeriodosFromParalelos(paralelos), [paralelos]);

  const periodos = useMemo(() => {
    if (!Array.isArray(allPeriodos) || allPeriodos.length === 0) return [];
    if (tipoAdmision === 'NUEVO') {
      return allPeriodos.filter((p) => p.numero === 1);
    }
    return allPeriodos;
  }, [allPeriodos, tipoAdmision]);

  useEffect(() => {
    if (tipoAdmision === 'NUEVO' && periodos.length === 1 && selectedPeriodIds.length === 0) {
      setSelectedPeriodIds([periodos[0].id]);
    }
  }, [tipoAdmision, periodos, selectedPeriodIds.length]);

  // Modo edición: pre-seleccionar el periodo de la inscripción cuando initialPeriodId está definido
  // (no aplicar si ya tenemos initialSelectedPeriodIds, para no pisar varios periodos en ANTIGUO)
  useEffect(() => {
    if (initialPeriodId == null || !periodos.length) return;
    if (Array.isArray(initialSelectedPeriodIds) && initialSelectedPeriodIds.length > 0) return;
    const periodId = Number(initialPeriodId);
    const exists = periodos.some((p) => Number(p.id) === periodId);
    if (!exists) return;
    setSelectedPeriodIds((prev) => {
      if (prev.includes(periodId)) return prev;
      return [periodId];
    });
  }, [initialPeriodId, initialSelectedPeriodIds, periodos]);

  // Modo edición ANTIGUO: pre-seleccionar varios periodos cuando initialSelectedPeriodIds está definido
  useEffect(() => {
    if (!Array.isArray(initialSelectedPeriodIds) || initialSelectedPeriodIds.length === 0 || !periodos.length) return;
    // Usar el id tal como viene de periodos para que coincida con las options del checkbox (evitar número vs string)
    const ids = initialSelectedPeriodIds
      .map((id) => {
        const num = Number(id);
        const p = periodos.find((p) => Number(p.id) === num);
        return p ? p.id : null;
      })
      .filter((id) => id != null);
    if (ids.length === 0) return;
    setSelectedPeriodIds((prev) => {
      if (prev.length === ids.length && prev.every((id, i) => id === ids[i])) return prev;
      return ids;
    });
  }, [initialSelectedPeriodIds, periodos]);

  const onTogglePeriods = useCallback((checkedIds) => {
    const ids = Array.isArray(checkedIds) ? checkedIds : [];
    setSelectedPeriodIds((prev) => {
      if (prev.length === ids.length && prev.every((id, i) => id === ids[i])) return prev;
      return ids;
    });
  }, []);

  const onSelectPeriod = useCallback((periodOrId) => {
    if (periodOrId == null) return;
    const id = typeof periodOrId === 'object' ? periodOrId?.id : periodOrId;
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (numId != null) setSelectedPeriodIds((prev) => (prev.length === 1 && prev[0] === numId ? prev : [numId]));
  }, []);

  const selectedPeriods = useMemo(() => {
    if (!selectedPeriodIds.length || !periodos.length) return [];
    return periodos.filter((p) => selectedPeriodIds.includes(p.id));
  }, [periodos, selectedPeriodIds]);

  const selectedPeriod = useMemo(() => selectedPeriods[0] ?? null, [selectedPeriods]);

  const prevResultRef = useRef(null);
  return useMemo(() => {
    const current = {
      periodos,
      loading,
      error,
      refetch: loadParalelos,
      selectedPeriods,
      selectedPeriod,
      selectedPeriodIds,
      onTogglePeriods,
      onSelectPeriod,
    };
    const prev = prevResultRef.current;
    const sameIds =
      prev?.selectedPeriodIds?.length === current.selectedPeriodIds?.length &&
      prev?.selectedPeriodIds?.every((id, i) => id === current.selectedPeriodIds[i]);
    if (
      prev &&
      prev.loading === current.loading &&
      prev.error === current.error &&
      prev.periodos === current.periodos &&
      sameIds &&
      prev.onTogglePeriods === current.onTogglePeriods &&
      prev.onSelectPeriod === current.onSelectPeriod
    ) {
      return prev;
    }
    prevResultRef.current = current;
    return current;
  }, [periodos, loading, error, loadParalelos, selectedPeriods, selectedPeriod, selectedPeriodIds, onTogglePeriods, onSelectPeriod]);
};
