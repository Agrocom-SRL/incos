/**
 * Hook: useInscripcionNuevaPeriodos
 *
 * Single Responsibility: Cargar lista de periodos del plan académico para el wizard de inscripción.
 *
 * - Obtiene periodos únicos a partir de paralelos (GET /paralelos con carrera_id).
 * - Según tipo de admisión: NUEVO = solo primer periodo (Primer Año); ANTIGUO = todos los periodos del plan.
 * - Para NUEVO auto-selecciona el primer periodo para cargar paralelos y materias.
 *
 * @param {Object} options - carreraId, tipoAdmision ('NUEVO' | 'ANTIGUO')
 * @returns {Object} periodos, loading, error, refetch, selectedPeriod, onSelectPeriod
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useParalelosApi } from '@application-academico/paralelos/hooks/useParalelosApi';

/**
 * Extrae periodos únicos de la lista de paralelos (id, numero, nombre).
 * El nombre viene de la API (periodos.nombre en BD); si no viene, se usa "Periodo N".
 */
function extractPeriodosFromParalelos(paralelos) {
  if (!Array.isArray(paralelos) || paralelos.length === 0) return [];
  const byId = new Map();
  paralelos.forEach((p) => {
    const id = p.periodoId ?? p.periodId;
    const numero = p.periodoNumero ?? p.numero ?? (typeof id === 'number' ? id : null);
    const nombre = p.periodoNombre ?? (numero != null ? `Periodo ${numero}` : null);
    if (id != null && numero != null && !byId.has(id)) {
      byId.set(id, { id, numero, nombre: nombre || `Periodo ${numero}` });
    }
  });
  return Array.from(byId.values()).sort((a, b) => (a.numero ?? 0) - (b.numero ?? 0));
}

export const useInscripcionNuevaPeriodos = (options = {}) => {
  const { carreraId = null, tipoAdmision = null } = options;
  const { paralelos, loading, error, fetch } = useParalelosApi();
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  const loadParalelos = useCallback(() => {
    const params = { limit: 100 };
    if (carreraId) params.carrera_id = carreraId;
    fetch({ params });
  }, [carreraId, fetch]);

  useEffect(() => {
    if (carreraId != null) {
      setSelectedPeriod(null);
      loadParalelos();
    }
  }, [carreraId, loadParalelos]);

  const allPeriodos = useMemo(() => extractPeriodosFromParalelos(paralelos), [paralelos]);

  const periodos = useMemo(() => {
    if (!Array.isArray(allPeriodos) || allPeriodos.length === 0) return [];
    if (tipoAdmision === 'NUEVO') {
      return allPeriodos.filter((p) => p.numero === 1);
    }
    return allPeriodos;
  }, [allPeriodos, tipoAdmision]);

  useEffect(() => {
    if (tipoAdmision === 'NUEVO' && periodos.length === 1 && !selectedPeriod) {
      setSelectedPeriod(periodos[0]);
    }
  }, [tipoAdmision, periodos, selectedPeriod]);

  const onSelectPeriod = useCallback((periodOrId) => {
    if (periodOrId == null) return;
    let period = periodOrId;
    if (typeof periodOrId === 'number' || typeof periodOrId === 'string') {
      const id = typeof periodOrId === 'string' ? parseInt(periodOrId, 10) : periodOrId;
      period = allPeriodos.find((p) => p.id === id) ?? periodos.find((p) => p.id === id);
    }
    if (period && (period.id != null || period.numero != null)) {
      setSelectedPeriod((prev) => {
        const numero = period.numero ?? period.id;
        const nombre = period.nombre ?? `Periodo ${numero}`;
        const next = { id: period.id ?? period.numero, numero, nombre };
        if (prev?.id === next.id) return prev;
        return next;
      });
    }
  }, [allPeriodos, periodos]);

  const prevResultRef = useRef(null);
  return useMemo(() => {
    const current = {
      periodos,
      loading,
      error,
      refetch: loadParalelos,
      selectedPeriod,
      onSelectPeriod,
    };
    const prev = prevResultRef.current;
    if (
      prev &&
      prev.loading === current.loading &&
      prev.error === current.error &&
      prev.periodos === current.periodos &&
      prev.selectedPeriod?.id === current.selectedPeriod?.id &&
      prev.onSelectPeriod === current.onSelectPeriod
    ) {
      return prev;
    }
    prevResultRef.current = current;
    return current;
  }, [periodos, loading, error, loadParalelos, selectedPeriod, onSelectPeriod]);
};
