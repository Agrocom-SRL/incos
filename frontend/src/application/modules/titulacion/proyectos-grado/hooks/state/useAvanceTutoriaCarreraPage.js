/**
 * Hook de pantalla: reporte de avance de tutorías por carrera (TIT ·
 * Titulación, Requisito 2 — extensión 2026-07-31, `proyecto·LISTAR`/`EXPORTAR`).
 *
 * Consume el contexto del provider (filtros carrera/gestión + reporte +
 * exportación), arma columnas del detalle y feedback de la exportación a PDF.
 * Página "dumb".
 */

import { useCallback, useMemo } from 'react';
import { App } from 'antd';
import { useAvanceTutoriaCarreraContext } from '@application-titulacion/proyectos-grado/hooks/context/useAvanceTutoriaCarreraContext';
import { createAvanceTutoriaCarreraTableColumns } from '@titulacion/proyectos-grado/config/avanceTutoriaCarreraTableColumns';

export const useAvanceTutoriaCarreraPage = () => {
  const { message } = App.useApp();
  const {
    avance,
    loading,
    error,
    refetch,
    exportar,
    exportando,
    carreras,
    loadingCarreras,
    gestiones,
    loadingGestiones,
    gestionId,
    setGestionId,
    carreraId,
    setCarreraId,
  } = useAvanceTutoriaCarreraContext();

  const carreraOptions = useMemo(
    () => carreras.map((c) => ({ value: c.id, label: c.nombre })),
    [carreras],
  );
  const gestionOptions = useMemo(
    () =>
      gestiones.map((g) => ({
        value: g.id,
        label: g.nombre || (g.anio != null ? `Gestión ${g.anio}` : `Gestión ${g.id}`),
      })),
    [gestiones],
  );

  const tableColumns = useMemo(() => createAvanceTutoriaCarreraTableColumns(), []);

  const handleExportar = useCallback(async () => {
    const result = await exportar({ gestionId, carreraId });
    if (!result?.success) {
      message.error(result?.error || 'No se pudo exportar el reporte de avance por carrera');
    }
  }, [exportar, gestionId, carreraId, message]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Titulación' },
      { title: 'Avance de tutorías por carrera' },
    ],
    [],
  );

  return {
    avance,
    loading,
    error,
    refetch,
    tableColumns,
    breadcrumbItems,
    handleExportar,
    exportando,
    carreraOptions,
    loadingCarreras,
    gestionOptions,
    loadingGestiones,
    gestionId,
    setGestionId,
    carreraId,
    setCarreraId,
  };
};

export default useAvanceTutoriaCarreraPage;
