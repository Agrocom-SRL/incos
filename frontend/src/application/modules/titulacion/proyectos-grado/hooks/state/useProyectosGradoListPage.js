/**
 * Hook de pantalla: listado de proyectos de grado (TIT · LISTAR).
 *
 * Espejo de `useCursosCapacitacionListPage` (CAP): consume el contexto del
 * provider, aplica los filtros carrera/modalidad/estado en cliente (modo
 * loadAll), genera columnas, breadcrumb y handlers, y devuelve props listas
 * para la página "dumb". Incluye la exportación PDF del reporte de avance
 * por carrera (Requisito 2): ya no es una página propia, es una descarga
 * directa desde este listado (siempre gestión vigente + todas las carreras,
 * mismo criterio que aplicaba el backend por defecto en la página retirada).
 */

import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { useProyectosGradoListContext } from '@application-titulacion/proyectos-grado/hooks/context/useProyectosGradoListContext';
import { useExportAvanceTutoriaCarreraPdf } from '@application-titulacion/proyectos-grado/hooks/api/useExportAvanceTutoriaCarreraPdf';
import { createProyectosGradoTableColumns } from '@titulacion/proyectos-grado/config/proyectosGradoTableColumns';
import { ESTADOS_PROYECTO_GRADO, formatEstadoProyecto } from '@application-titulacion/utils/titulacionPills';
import {
  PROYECTOS_GRADO_LIST_PATH,
  SEGUIMIENTO_TUTORIA_DOCENTES_PATH,
  TIT_PROYECTOS_MENU_KEY,
  proyectoGradoRegistrarPath,
} from '@application-titulacion/config/paths';

export const useProyectosGradoListPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { message } = App.useApp();
  const { exportar: exportarAvanceCarrera, exportando: exportandoAvanceCarrera } =
    useExportAvanceTutoriaCarreraPdf();

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
      menuSidebarKey: TIT_PROYECTOS_MENU_KEY,
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

  /**
   * Exportación PDF del reporte de avance de tutorías por carrera
   * (Requisito 2) — descarga directa, sin página intermedia.
   */
  const handleExportarAvanceCarrera = useCallback(async () => {
    const result = await exportarAvanceCarrera();
    if (!result?.success) {
      message.error(result?.error || 'No se pudo exportar el reporte de avance por carrera');
    }
  }, [exportarAvanceCarrera, message]);

  /** Seguimiento de tutorías a docentes (extensión 2026-08-10) — sin ítem de menú propio. */
  const handleIrSeguimientoTutoriaDocentes = useCallback(() => {
    navigate(SEGUIMIENTO_TUTORIA_DOCENTES_PATH, { state: listNavState });
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
    handleExportarAvanceCarrera,
    exportandoAvanceCarrera,
    handleIrSeguimientoTutoriaDocentes,
    handleSearchChange,
    tablePagination,
  };
};
