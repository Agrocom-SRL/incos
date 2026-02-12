/**
 * Hook: useInscripcionNuevaParalelos
 *
 * Single Responsibility: Orquestar la carga y selección de paralelos para el wizard de inscripción
 *
 * - Acepta periodoId (uno) o periodoIds (array). Con varios periodos, carga paralelos de cada uno y los fusiona.
 * - Maneja la selección del paralelo para el formulario de inscripción.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useParalelosApi } from '@application-academico/paralelos/hooks/useParalelosApi';
import { useCasesFactory } from '@container';
import { normalizeFieldToArray } from '@application/utils';
import { mapParalelosList } from '@application-academico/paralelos/mappers';

/**
 * Hook para cargar y seleccionar paralelos en el contexto de inscripción nueva
 *
 * @param {Object} options - Opciones del hook
 * @param {number} [options.carreraId] - ID de la carrera para filtrar paralelos
 * @param {number} [options.periodoId] - ID de un solo periodo (compatibilidad)
 * @param {number[]} [options.periodoIds] - IDs de varios periodos; si se usa, se cargan y fusionan paralelos de todos
 * @param {number} [options.initialParaleloId] - ID del paralelo para pre-seleccionar (opcional)
 * @returns {Object} paralelos, loading, error, refetch, selectedParalelo, onSelectParalelo
 */
export const useInscripcionNuevaParalelos = (options = {}) => {
  const { carreraId, periodoId, periodoIds: periodoIdsProp, initialParaleloId = null, initialParallelIdsByPeriod = null } = options;
  const periodoIds = Array.isArray(periodoIdsProp) && periodoIdsProp.length > 0
    ? periodoIdsProp
    : periodoId != null ? [periodoId] : [];

  const { paralelos: paralelosSingle, loading: loadingSingle, error: errorSingle, fetch } = useParalelosApi();
  const [mergedParalelos, setMergedParalelos] = useState([]);
  const [mergedLoading, setMergedLoading] = useState(false);
  const [mergedError, setMergedError] = useState(null);
  /** Selección por periodo: { [periodoId]: paralelo }. Cada periodo tiene su paralelo seleccionado de forma independiente. */
  const [selectedParalelosByPeriod, setSelectedParalelosByPeriod] = useState({});

  const isMultiPeriod = periodoIds.length > 1;

  // Un solo periodo: usar estado del hook useParalelosApi
  useEffect(() => {
    if (periodoIds.length === 0) return;
    if (periodoIds.length === 1 && carreraId != null) {
      fetch({ params: { periodo_id: periodoIds[0], carrera_id: carreraId } });
    }
  }, [carreraId, periodoIds, fetch]);

  // Varios periodos: cargar cada uno y fusionar
  useEffect(() => {
    if (!isMultiPeriod || carreraId == null) return;
    let cancelled = false;
    setMergedLoading(true);
    setMergedError(null);
    const useCaseInstance = useCasesFactory.obtenerTodosParalelos?.();
    if (!useCaseInstance) {
      setMergedLoading(false);
      setMergedError('No disponible');
      return;
    }
    Promise.all(
      periodoIds.map((pid) =>
        useCaseInstance.ejecutar({ params: { periodo_id: pid, carrera_id: carreraId } })
      )
    )
      .then((results) => {
        if (cancelled) return;
        const all = [];
        for (const result of results) {
          if (!result?.success || !result.data) continue;
          const raw = normalizeFieldToArray(result.data, 'paralelos');
          all.push(...mapParalelosList(raw));
        }
        setMergedParalelos(all);
        setMergedError(null);
      })
      .catch((err) => {
        if (!cancelled) setMergedError(err?.message || 'Error al cargar paralelos');
      })
      .finally(() => {
        if (!cancelled) setMergedLoading(false);
      });
    return () => { cancelled = true; };
  }, [isMultiPeriod, carreraId, periodoIds.join(',')]);

  const paralelos = isMultiPeriod ? mergedParalelos : paralelosSingle;
  const loading = isMultiPeriod ? mergedLoading : loadingSingle;
  const error = isMultiPeriod ? mergedError : errorSingle;

  const refetch = useCallback(() => {
    if (periodoIds.length === 0) return;
    if (periodoIds.length === 1 && carreraId != null) {
      fetch({ params: { periodo_id: periodoIds[0], carrera_id: carreraId } });
    } else if (isMultiPeriod) {
      setMergedLoading(true);
      setMergedError(null);
      const useCaseInstance = useCasesFactory.obtenerTodosParalelos?.();
      if (!useCaseInstance) return;
      Promise.all(
        periodoIds.map((pid) =>
          useCaseInstance.ejecutar({ params: { periodo_id: pid, carrera_id: carreraId } })
        )
      )
        .then((results) => {
          const all = [];
          for (const result of results) {
            if (!result?.success || !result.data) continue;
            const raw = normalizeFieldToArray(result.data, 'paralelos');
            all.push(...mapParalelosList(raw));
          }
          setMergedParalelos(all);
        })
        .catch((err) => setMergedError(err?.message || 'Error'))
        .finally(() => setMergedLoading(false));
    }
  }, [carreraId, periodoIds, isMultiPeriod, fetch]);

  /**
   * Función para manejar la selección de un paralelo.
   * La selección es independiente por periodo: elegir un paralelo en un periodo no desmarca el de otro.
   * @param {Object} paralelo - Paralelo seleccionado (debe tener periodoId)
   */
  const onSelectParalelo = useCallback((paralelo) => {
    if (!paralelo?.id) return;
    const periodoId = paralelo.periodoId ?? paralelo.periodo_id;
    if (periodoId == null) return;
    const snapshot = {
      id: paralelo.id,
      nombre: paralelo.nombre,
      codigo: paralelo.codigo,
      carreraId: paralelo.carreraId,
      periodoId,
      materiaId: paralelo.materiaId,
    };
    setSelectedParalelosByPeriod((prev) => {
      if (prev[periodoId]?.id === paralelo.id) return prev;
      return { ...prev, [periodoId]: snapshot };
    });
  }, []);

  /** Paralelo "principal" para compatibilidad (form, horario): primer periodo seleccionado o primer selección en el mapa. */
  const selectedParalelo = useMemo(() => {
    if (periodoIds.length === 0) return null;
    const firstPeriodId = periodoIds[0];
    const byPeriod = selectedParalelosByPeriod;
    if (byPeriod[firstPeriodId]) return byPeriod[firstPeriodId];
    return Object.values(byPeriod)[0] ?? null;
  }, [periodoIds, selectedParalelosByPeriod]);

  // Limpiar selecciones de periodos que ya no están seleccionados
  useEffect(() => {
    const currentIds = new Set(periodoIds);
    setSelectedParalelosByPeriod((prev) => {
      const next = { ...prev };
      let changed = false;
      Object.keys(next).forEach((pid) => {
        const id = Number(pid);
        if (!currentIds.has(id)) {
          delete next[pid];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [periodoIds.join(',')]);

  // Pre-seleccionar paralelo si se proporciona initialParaleloId
  useEffect(() => {
    if (!initialParaleloId || !paralelos?.length) return;
    const paralelo = paralelos.find((p) => p.id === Number(initialParaleloId));
    if (paralelo) {
      const pid = paralelo.periodoId ?? paralelo.periodo_id;
      setSelectedParalelosByPeriod((prev) => {
        if (prev[pid]?.id === paralelo.id) return prev;
        return {
          ...prev,
          [pid]: {
            id: paralelo.id,
            nombre: paralelo.nombre,
            codigo: paralelo.codigo,
            carreraId: paralelo.carreraId,
            periodoId: pid,
            materiaId: paralelo.materiaId,
          },
        };
      });
    }
  }, [initialParaleloId, paralelos]);

  // Modo edición ANTIGUO: pre-seleccionar paralelos por periodo cuando initialParallelIdsByPeriod está definido
  useEffect(() => {
    if (!initialParallelIdsByPeriod || typeof initialParallelIdsByPeriod !== 'object' || !paralelos?.length) return;
    const entries = Object.entries(initialParallelIdsByPeriod).filter(([, plid]) => plid != null);
    if (entries.length === 0) return;
    setSelectedParalelosByPeriod((prev) => {
      let next = { ...prev };
      let changed = false;
      for (const [periodIdKey, parallelId] of entries) {
        const paralelo = paralelos.find((p) => p.id === Number(parallelId));
        if (!paralelo) continue;
        const pid = paralelo.periodoId ?? paralelo.periodo_id ?? periodIdKey;
        const pidStr = String(pid);
        if (prev[pidStr]?.id === paralelo.id) continue;
        next = {
          ...next,
          [String(pid)]: {
            id: paralelo.id,
            nombre: paralelo.nombre,
            codigo: paralelo.codigo,
            carreraId: paralelo.carreraId,
            periodoId: pid,
            materiaId: paralelo.materiaId,
          },
        };
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [initialParallelIdsByPeriod, paralelos]);

  // TODO: Aquí se puede agregar lógica específica de inscripciones si es necesario
  // Por ejemplo: filtrar paralelos según la carrera seleccionada, validaciones específicas, etc.

  // MANTENER REFERENCIA ESTABLE
  // Comparar valores, no solo referencias, para evitar recálculos innecesarios
  const prevResultRef = useRef(null);
  
  return useMemo(() => {
    const current = {
      paralelos,
      loading,
      error,
      refetch,
      selectedParalelo,
      selectedParalelosByPeriod,
      onSelectParalelo,
    };

    const prev = prevResultRef.current;
    const sameByPeriod =
      prev?.selectedParalelosByPeriod &&
      Object.keys(prev.selectedParalelosByPeriod).length === Object.keys(selectedParalelosByPeriod).length &&
      Object.keys(selectedParalelosByPeriod).every((k) => prev.selectedParalelosByPeriod[k]?.id === selectedParalelosByPeriod[k]?.id);

    if (
      prev &&
      prev.loading === current.loading &&
      prev.error === current.error &&
      prev.refetch === current.refetch &&
      prev.paralelos === current.paralelos &&
      prev.selectedParalelo?.id === current.selectedParalelo?.id &&
      sameByPeriod &&
      prev.onSelectParalelo === current.onSelectParalelo
    ) {
      return prev;
    }

    prevResultRef.current = current;
    return current;
  }, [paralelos, loading, error, refetch, selectedParalelo, selectedParalelosByPeriod, onSelectParalelo]);
};
