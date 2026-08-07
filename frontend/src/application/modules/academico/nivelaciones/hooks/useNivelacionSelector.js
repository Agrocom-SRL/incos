/**
 * Estado de pantalla — landing SIN contexto de `/academico/nivelaciones/inscribir`
 * (acceso por menú, sin deep-link). Calcada de
 * `useHistorialSelector.js`: combina el padrón completo de estudiantes
 * (`useEstudiantesApi`, agrupado por carrera) con la búsqueda por texto
 * (`useBuscarEstudiantesHistorial`, ya expuesta y reutilizable — no es
 * específica de Historial, es un mapper de selección de estudiante).
 *
 * GAP CONOCIDO (documentado en el plan de datos, Fase D — "Gap 2"): no existe
 * todavía un endpoint de "materias pendientes/arrastradas de un estudiante
 * concreto" (reutilizaría la vista 185 filtrada por estudiante en vez de por
 * paralelo). Por eso `seleccionarEstudiante` NO resuelve materias — solo deja
 * el estudiante elegido en `estudianteSeleccionado` para que la página
 * muestre el estado "próximamente" en vez de fabricar datos. El flujo QUE SÍ
 * funciona hoy es el deep-link con contexto desde la grilla (P1 nivel 2).
 */

import { useCallback, useState } from 'react';
import { useEstudiantesApi } from '@application-estudiantes/hooks/api/useEstudiantesApi';
import { useServerPaginatedList } from '@application/utils';
import {
  useBuscarEstudiantesHistorial,
  MIN_QUERY_LENGTH,
} from '@application-academico/historial/hooks/api/useBuscarEstudiantesHistorial.js';

export const useNivelacionSelector = () => {
  const [query, setQuery] = useState('');
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);

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

  const {
    estudiantes: resultadosBusqueda,
    loading: busquedaLoading,
    error: busquedaError,
    buscar,
  } = useBuscarEstudiantesHistorial();

  const modoBusqueda = query.trim().length >= MIN_QUERY_LENGTH;

  const onQueryChange = useCallback(
    (value) => {
      const next = value ?? '';
      setQuery(next);
      buscar(next);
    },
    [buscar],
  );

  const seleccionarEstudiante = useCallback((estudiante) => {
    setEstudianteSeleccionado(estudiante ?? null);
  }, []);

  const limpiarSeleccion = useCallback(() => setEstudianteSeleccionado(null), []);

  return {
    query,
    onQueryChange,
    modoBusqueda,
    estudiantesLista,
    listaLoading,
    listaError,
    tablePagination,
    resultadosBusqueda,
    busquedaLoading,
    busquedaError,
    estudianteSeleccionado,
    seleccionarEstudiante,
    limpiarSeleccion,
  };
};

export default useNivelacionSelector;
