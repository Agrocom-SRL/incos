/**
 * Filtros de la grilla de matrículas (carrera, paralelo, periodo, tipo, historial).
 */

import { useMemo, useState, useCallback } from 'react';
import {
  applyMatriculaListFilters,
  buildMatriculaListFilterOptions,
  emptyMatriculaListFilters,
  hasActiveMatriculaListFilters,
  MATRICULA_HISTORIAL_ESTADO_OPTIONS,
  MATRICULA_TIPOS_INSCRIPCION,
} from '@application-inscripciones/utils/matriculaListFilters';

export const useMatriculaListFilters = (sourceRows = []) => {
  const [filters, setFilters] = useState(emptyMatriculaListFilters);

  const filterOptions = useMemo(
    () => buildMatriculaListFilterOptions(sourceRows),
    [sourceRows],
  );

  const paralelosForCarrera = useMemo(() => {
    if (filters.carreraId == null) return filterOptions.paralelos;
    return filterOptions.paralelos.filter(
      (p) => p.carreraId == null || Number(p.carreraId) === Number(filters.carreraId),
    );
  }, [filterOptions.paralelos, filters.carreraId]);

  const filteredRows = useMemo(
    () => applyMatriculaListFilters(sourceRows, filters),
    [sourceRows, filters],
  );

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value ?? null };
      if (key === 'carreraId' && value !== prev.carreraId) {
        next.paraleloId = null;
      }
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(emptyMatriculaListFilters());
  }, []);

  const hasActiveFilters = hasActiveMatriculaListFilters(filters);

  return {
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters,
    filterOptions,
    paralelosForCarrera,
    filteredRows,
    tipoInscripcionOptions: MATRICULA_TIPOS_INSCRIPCION,
    historialEstadoOptions: MATRICULA_HISTORIAL_ESTADO_OPTIONS,
  };
};
