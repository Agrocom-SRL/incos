/**
 * Hook de pantalla: listado de proyectos de grado (TUT · LISTAR).
 *
 * Espejo de `useCursosCapacitacionListPage` (CAP): consume el contexto del
 * provider, aplica los filtros carrera/modalidad/estado en cliente (modo
 * loadAll), genera columnas, breadcrumb y handlers, y devuelve props listas
 * para la página "dumb".
 */

import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProyectosGradoListContext } from '@application-tutorias/titulacion/hooks/context/useProyectosGradoListContext';
import { createProyectosGradoTableColumns } from '@tutorias/titulacion/config/proyectosGradoTableColumns';
import { ESTADOS_PROYECTO_GRADO, formatEstadoProyecto } from '@application-tutorias/utils/tutoriasPills';
import {
  PROYECTOS_GRADO_LIST_PATH,
  TUT_TITULACION_MENU_KEY,
  proyectoGradoRegistrarPath,
} from '@application-tutorias/config/paths';

export const useProyectosGradoListPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const {
    proyectos = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
    tablePagination,
    eliminarProyecto,
    modalidadOptions = [],
    loadingModalidades = false,
  } = useProyectosGradoListContext();

  /** Filtros en cliente (dataset completo en modo loadAll). */
  const [filtros, setFiltros] = useState({ carreraId: null, modalidadId: null, estado: null });

  const setFiltro = useCallback((campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor ?? null }));
  }, []);

  const proyectosFiltrados = useMemo(
    () =>
      proyectos.filter(
        (p) =>
          (filtros.carreraId == null || p.carreraId === filtros.carreraId) &&
          (filtros.modalidadId == null || p.modalidadId === filtros.modalidadId) &&
          (filtros.estado == null || p.estado === filtros.estado),
      ),
    [proyectos, filtros],
  );

  /** Opciones de carrera derivadas del dataset (sin catálogo extra). */
  const carreraOptions = useMemo(() => {
    const porId = new Map();
    for (const p of proyectos) {
      if (p.carreraId != null && !porId.has(p.carreraId)) {
        porId.set(p.carreraId, {
          value: p.carreraId,
          label: p.carreraNombre || p.carreraCodigo || `Carrera ${p.carreraId}`,
        });
      }
    }
    return Array.from(porId.values()).sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }, [proyectos]);

  const estadoOptions = useMemo(
    () => ESTADOS_PROYECTO_GRADO.map((estado) => ({ value: estado, label: formatEstadoProyecto(estado) })),
    [],
  );

  const listNavState = useMemo(
    () => ({
      menuSidebarKey: TUT_TITULACION_MENU_KEY,
      returnListPath: pathname || PROYECTOS_GRADO_LIST_PATH,
    }),
    [pathname],
  );

  /** deleteFn de TableActions (la confirmación/feedback los pone TableActions). */
  const handleEliminar = useCallback(
    async (proyectoId) => {
      if (!proyectoId) return { success: false, error: 'Proyecto inválido' };
      const result = await eliminarProyecto(proyectoId);
      return result ?? { success: false, error: 'No se pudo eliminar el proyecto' };
    },
    [eliminarProyecto],
  );

  const tableColumns = useMemo(
    () =>
      createProyectosGradoTableColumns({
        navigate,
        listNavState,
        refetch,
        deleteFn: handleEliminar,
      }),
    [navigate, listNavState, refetch, handleEliminar],
  );

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Titulación' }, { title: 'Proyectos de grado' }],
    [],
  );

  const handleRegistrar = useCallback(() => {
    navigate(proyectoGradoRegistrarPath, { state: listNavState });
  }, [navigate, listNavState]);

  const handleSearchChange = useCallback(
    (event) => {
      setSearchText(event.target.value);
    },
    [setSearchText],
  );

  return {
    proyectos: proyectosFiltrados,
    loading,
    error,
    searchText,
    filtros,
    setFiltro,
    carreraOptions,
    modalidadOptions,
    loadingModalidades,
    estadoOptions,
    tableColumns,
    breadcrumbItems,
    handleRegistrar,
    handleSearchChange,
    tablePagination,
  };
};
