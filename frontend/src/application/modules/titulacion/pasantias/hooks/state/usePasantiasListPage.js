/**
 * Hook de pantalla: listado de trámites de pasantía (TUT · LISTAR).
 *
 * Espejo de `useProyectosGradoListPage` (TUT · Titulación): consume el
 * contexto del provider, aplica los filtros gestión/carrera/camino/estado en
 * cliente (modo loadAll — la vista 167 expone gestion_id/carrera_id/estado/
 * tipo), genera columnas, breadcrumb y handlers, y devuelve props listas para
 * la página "dumb".
 */

import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePasantiasListContext } from '@application-tutorias/pasantias/hooks/context/usePasantiasListContext';
import { createPasantiasTableColumns } from '@tutorias/pasantias/config/pasantiasTableColumns';
import {
  ESTADO_PASANTIA_OPTIONS,
  TIPO_PASANTIA_OPTIONS,
} from '@application-tutorias/utils/pasantiasPills';
import {
  PASANTIAS_LIST_PATH,
  PASANTIAS_EMPRESAS_PATH,
  TUT_PASANTIAS_MENU_KEY,
  pasantiaRegistrarPath,
} from '@application-tutorias/config/paths';

export const usePasantiasListPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const {
    pasantias = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
    tablePagination,
    eliminarPasantia,
  } = usePasantiasListContext();

  /** Filtros en cliente (dataset completo en modo loadAll). */
  const [filtros, setFiltros] = useState({
    gestionId: null,
    carreraId: null,
    tipo: null,
    estado: null,
  });

  const setFiltro = useCallback((campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor ?? null }));
  }, []);

  const pasantiasFiltradas = useMemo(
    () =>
      pasantias.filter(
        (p) =>
          (filtros.gestionId == null || p.gestionId === filtros.gestionId) &&
          (filtros.carreraId == null || p.carreraId === filtros.carreraId) &&
          (filtros.tipo == null || p.tipo === filtros.tipo) &&
          (filtros.estado == null || p.estado === filtros.estado),
      ),
    [pasantias, filtros],
  );

  /** Opciones de gestión y carrera derivadas del dataset (sin catálogo extra). */
  const gestionOptions = useMemo(() => {
    const porId = new Map();
    for (const p of pasantias) {
      if (p.gestionId != null && !porId.has(p.gestionId)) {
        porId.set(p.gestionId, { value: p.gestionId, label: p.gestionLabel || `Gestión ${p.gestionId}` });
      }
    }
    return Array.from(porId.values()).sort((a, b) => b.label.localeCompare(a.label, 'es'));
  }, [pasantias]);

  const carreraOptions = useMemo(() => {
    const porId = new Map();
    for (const p of pasantias) {
      if (p.carreraId != null && !porId.has(p.carreraId)) {
        porId.set(p.carreraId, {
          value: p.carreraId,
          label: p.carreraNombre || p.carreraCodigo || `Carrera ${p.carreraId}`,
        });
      }
    }
    return Array.from(porId.values()).sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }, [pasantias]);

  const tipoOptions = TIPO_PASANTIA_OPTIONS;
  const estadoOptions = ESTADO_PASANTIA_OPTIONS;

  const listNavState = useMemo(
    () => ({
      menuSidebarKey: TUT_PASANTIAS_MENU_KEY,
      returnListPath: pathname || PASANTIAS_LIST_PATH,
    }),
    [pathname],
  );

  /** deleteFn de TableActions (la confirmación/feedback los pone TableActions). */
  const handleEliminar = useCallback(
    async (pasantiaId) => {
      if (!pasantiaId) return { success: false, error: 'Trámite inválido' };
      const result = await eliminarPasantia(pasantiaId);
      return result ?? { success: false, error: 'No se pudo eliminar el trámite' };
    },
    [eliminarPasantia],
  );

  const tableColumns = useMemo(
    () =>
      createPasantiasTableColumns({
        navigate,
        listNavState,
        refetch,
        deleteFn: handleEliminar,
      }),
    [navigate, listNavState, refetch, handleEliminar],
  );

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Titulación' }, { title: 'Pasantías' }],
    [],
  );

  const handleRegistrar = useCallback(() => {
    navigate(pasantiaRegistrarPath, { state: listNavState });
  }, [navigate, listNavState]);

  const handleVerEmpresas = useCallback(() => {
    navigate(PASANTIAS_EMPRESAS_PATH, { state: listNavState });
  }, [navigate, listNavState]);

  const handleSearchChange = useCallback(
    (event) => {
      setSearchText(event.target.value);
    },
    [setSearchText],
  );

  return {
    pasantias: pasantiasFiltradas,
    loading,
    error,
    searchText,
    filtros,
    setFiltro,
    gestionOptions,
    carreraOptions,
    tipoOptions,
    estadoOptions,
    tableColumns,
    breadcrumbItems,
    handleRegistrar,
    handleVerEmpresas,
    handleSearchChange,
    tablePagination,
  };
};
