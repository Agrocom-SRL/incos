/**
 * Hook de estado: landing del Historial académico (selector de estudiante).
 *
 * Combina DOS fuentes ya expuestas, sin duplicar lógica:
 * - Lista completa de estudiantes (`GET /estudiantes` vía `useEstudiantesApi` +
 *   `useServerPaginatedList` en modo loadAll), para mostrar el padrón de entrada
 *   agrupado por carrera (CarreraTabsListView) — misma API que EstudiantesList.
 * - Búsqueda por texto libre (`GET /estudiantes/search` vía
 *   `useBuscarEstudiantesHistorial`, debounced) cuando el usuario escribe
 *   al menos `MIN_QUERY_LENGTH` caracteres.
 *
 * Una sola fuente de verdad del término (`query`): la página alterna entre la
 * lista completa y los resultados de búsqueda según `modoBusqueda`.
 */

import { useCallback, useState } from 'react';
import { useEstudiantesApi } from '@application-estudiantes/hooks/api/useEstudiantesApi';
import { useServerPaginatedList } from '@application/utils';
import {
  useBuscarEstudiantesHistorial,
  MIN_QUERY_LENGTH,
} from '../api/useBuscarEstudiantesHistorial.js';

export const useHistorialSelector = () => {
  const [query, setQuery] = useState('');

  // Lista completa (padrón): mismas API y parámetros que el listado de Estudiantes.
  const { fetch: fetchEstudiantes } = useEstudiantesApi();
  const {
    rows: estudiantesLista,
    loading: listaLoading,
    error: listaError,
    tablePagination,
  } = useServerPaginatedList({
    loadAll: true,
    fetch: fetchEstudiantes,
    buildRequest: ({ page, limit }) => ({
      params: { page, limit, sort: 'created_at:DESC' },
    }),
  });

  // Búsqueda debounced contra /estudiantes/search (DTO de selección ya mapeado).
  const {
    estudiantes: resultadosBusqueda,
    loading: busquedaLoading,
    error: busquedaError,
    buscar,
  } = useBuscarEstudiantesHistorial();

  /** Con término suficiente se muestran resultados de búsqueda; si no, el padrón. */
  const modoBusqueda = query.trim().length >= MIN_QUERY_LENGTH;

  /** Único punto de entrada del buscador de la página (estado + búsqueda debounced). */
  const onQueryChange = useCallback(
    (value) => {
      const next = value ?? '';
      setQuery(next);
      buscar(next);
    },
    [buscar],
  );

  return {
    // Buscador (única fuente de verdad del término)
    query,
    onQueryChange,
    modoBusqueda,
    // Lista completa (tabs por carrera)
    estudiantesLista,
    listaLoading,
    listaError,
    tablePagination,
    // Resultados de búsqueda
    resultadosBusqueda,
    busquedaLoading,
    busquedaError,
  };
};

export default useHistorialSelector;
