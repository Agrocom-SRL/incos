/**
 * Estado de pantalla — landing SIN contexto de `/academico/nivelaciones/inscribir`
 * (acceso por menú, sin deep-link). Calcada de
 * `useHistorialSelector.js`: combina el padrón completo de estudiantes
 * (`useEstudiantesApi`, agrupado por carrera) con la búsqueda por texto
 * (`useBuscarEstudiantesHistorial`, ya expuesta y reutilizable — no es
 * específica de Historial, es un mapper de selección de estudiante).
 *
 * Al seleccionar un estudiante, carga sus materias pendientes/arrastradas
 * (`GET /nivelaciones/estudiante/:id/pendientes`, cierre del "Gap 2" — antes
 * mostraba un estado "próximamente" en vez de fabricar datos).
 */

import { useCallback, useEffect, useState } from 'react';
import { useEstudiantesApi } from '@application-matricula/admision/hooks/api/useEstudiantesApi';
import { useServerPaginatedList } from '@application/utils';
import { useCasesFactory } from '@container';
import {
  useBuscarEstudiantesHistorial,
  MIN_QUERY_LENGTH,
} from '@application-academico/historial/hooks/api/useBuscarEstudiantesHistorial.js';

export const useNivelacionSelector = () => {
  const [query, setQuery] = useState('');
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [materiasPendientes, setMateriasPendientes] = useState(null);
  const [materiasPendientesLoading, setMateriasPendientesLoading] = useState(false);
  const [materiasPendientesError, setMateriasPendientesError] = useState(null);

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

  const cargarMateriasPendientes = useCallback(async (estudianteId) => {
    if (estudianteId == null) {
      setMateriasPendientes(null);
      setMateriasPendientesError(null);
      return;
    }
    setMateriasPendientesLoading(true);
    setMateriasPendientesError(null);
    try {
      const result = await useCasesFactory
        .listarMateriasPendientesEstudiante()
        .ejecutar({ estudianteId });
      if (!result?.success) {
        setMateriasPendientesError(
          result?.error || 'No se pudieron cargar las materias pendientes del estudiante',
        );
        setMateriasPendientes(null);
        return;
      }
      setMateriasPendientes(result.data ?? null);
    } catch (err) {
      setMateriasPendientesError(err?.message || String(err));
      setMateriasPendientes(null);
    } finally {
      setMateriasPendientesLoading(false);
    }
  }, []);

  useEffect(() => {
    const estudianteId = estudianteSeleccionado?.id ?? estudianteSeleccionado?.estudianteId;
    cargarMateriasPendientes(estudianteId);
  }, [cargarMateriasPendientes, estudianteSeleccionado]);

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
    materiasPendientes,
    materiasPendientesLoading,
    materiasPendientesError,
  };
};

export default useNivelacionSelector;
