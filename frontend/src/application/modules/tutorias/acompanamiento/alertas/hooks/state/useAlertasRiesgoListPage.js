/**
 * Hook de pantalla: alertas de riesgo pedagógico — vista institucional
 * (TUT · alerta·LISTAR).
 *
 * Consume el contexto del provider (A1), aplica los filtros carrera/materia
 * en cliente (loadAll), gobierna el drawer de detalle por estudiante (A3) y
 * genera columnas y breadcrumb para la página "dumb".
 */

import { useCallback, useMemo, useState } from 'react';
import { useAlertasRiesgoListContext } from '@application-tutorias/acompanamiento/alertas/hooks/context/useAlertasRiesgoListContext';
import { createAlertasRiesgoTableColumns } from '@tutorias/acompanamiento/alertas/config/alertasRiesgoTableColumns';

export const useAlertasRiesgoListPage = () => {
  const {
    alertas = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    tablePagination,
    detalleEstudiante,
  } = useAlertasRiesgoListContext();

  /** Filtros en cliente (dataset completo en modo loadAll). */
  const [filtros, setFiltros] = useState({ carreraId: null, materiaId: null });

  const setFiltro = useCallback((campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor ?? null }));
  }, []);

  const alertasFiltradas = useMemo(
    () =>
      alertas.filter(
        (a) =>
          (filtros.carreraId == null || a.carreraId === filtros.carreraId) &&
          (filtros.materiaId == null || a.materiaId === filtros.materiaId),
      ),
    [alertas, filtros],
  );

  const carreraOptions = useMemo(() => {
    const porId = new Map();
    for (const a of alertas) {
      if (a.carreraId != null && !porId.has(a.carreraId)) {
        porId.set(a.carreraId, { value: a.carreraId, label: a.carreraNombre || a.carreraCodigo });
      }
    }
    return Array.from(porId.values()).sort((a, b) => (a.label || '').localeCompare(b.label, 'es'));
  }, [alertas]);

  const materiaOptions = useMemo(() => {
    const porId = new Map();
    for (const a of alertas) {
      if (a.materiaId != null && !porId.has(a.materiaId)) {
        porId.set(a.materiaId, { value: a.materiaId, label: a.materiaNombre });
      }
    }
    return Array.from(porId.values()).sort((a, b) => (a.label || '').localeCompare(b.label, 'es'));
  }, [alertas]);

  // ————— Drawer de detalle por estudiante (A3) —————
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleVerEstudiante = useCallback(
    (alerta) => {
      if (alerta?.estudianteId == null) return;
      setDrawerOpen(true);
      detalleEstudiante.cargar(alerta.estudianteId);
    },
    [detalleEstudiante],
  );

  const handleCerrarDrawer = useCallback(() => {
    setDrawerOpen(false);
    detalleEstudiante.limpiar();
  }, [detalleEstudiante]);

  const tableColumns = useMemo(
    () => createAlertasRiesgoTableColumns({ onVerEstudiante: handleVerEstudiante }),
    [handleVerEstudiante],
  );

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Tutorías' }, { title: 'Alumnos en riesgo' }],
    [],
  );

  const handleSearchChange = useCallback(
    (event) => {
      setSearchText(event.target.value);
    },
    [setSearchText],
  );

  return {
    alertas: alertasFiltradas,
    totalEnRiesgo: alertasFiltradas.length,
    loading,
    error,
    searchText,
    handleSearchChange,
    filtros,
    setFiltro,
    carreraOptions,
    materiaOptions,
    tableColumns,
    breadcrumbItems,
    tablePagination,
    drawer: {
      open: drawerOpen,
      cerrar: handleCerrarDrawer,
      detalle: detalleEstudiante.detalle,
      loading: detalleEstudiante.loading,
      error: detalleEstudiante.error,
    },
  };
};
