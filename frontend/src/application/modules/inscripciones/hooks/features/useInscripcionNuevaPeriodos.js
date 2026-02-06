/**
 * Hook: useInscripcionNuevaPeriodos
 *
 * Single Responsibility: Cargar lista de periodos para que el usuario seleccione uno en el wizard.
 *
 * Obtiene periodos únicos a partir de la lista de paralelos (GET /paralelos sin filtro),
 * para no depender de un endpoint GET /periodos. Cada paralelo trae periodoId y periodoNumero.
 *
 * @param {Object} options - Opciones (carreraId opcional: si hay carrera, filtrar paralelos por ella para periodos de esa carrera)
 * @returns {Object} periodos, loading, error, refetch, selectedPeriod, onSelectPeriod
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useParalelosApi } from '@application-academico/paralelos/hooks/useParalelosApi';

/**
 * Extrae periodos únicos de la lista de paralelos (id, numero, nombre).
 */
function extractPeriodosFromParalelos(paralelos) {
  if (!Array.isArray(paralelos) || paralelos.length === 0) return [];
  const byId = new Map();
  paralelos.forEach((p) => {
    const id = p.periodoId ?? p.periodId;
    const numero = p.periodoNumero ?? p.numero ?? id;
    if (id != null && !byId.has(id)) {
      byId.set(id, { id, numero, nombre: `Periodo ${numero}` });
    }
  });
  return Array.from(byId.values()).sort((a, b) => (a.numero ?? 0) - (b.numero ?? 0));
}

export const useInscripcionNuevaPeriodos = (options = {}) => {
  const { carreraId = null } = options;
  const { paralelos, loading, error, fetch } = useParalelosApi();
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  const loadParalelos = useCallback(() => {
    const params = { limit: 100 };
    if (carreraId) params.carrera_id = carreraId;
    fetch({ params });
  }, [carreraId, fetch]);

  useEffect(() => {
    if (carreraId != null) {
      loadParalelos();
    }
  }, [carreraId, loadParalelos]);

  const periodos = useMemo(() => extractPeriodosFromParalelos(paralelos), [paralelos]);

  const onSelectPeriod = useCallback((period) => {
    if (period && (period.id != null || period.numero != null)) {
      setSelectedPeriod((prev) => {
        const next = { id: period.id ?? period.numero, numero: period.numero ?? period.id, nombre: period.nombre ?? `Periodo ${period.numero ?? period.id}` };
        if (prev?.id === next.id) return prev;
        return next;
      });
    }
  }, []);

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
