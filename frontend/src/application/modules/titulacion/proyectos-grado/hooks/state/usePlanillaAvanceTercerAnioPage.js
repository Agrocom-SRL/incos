/**
 * Hook de pantalla: planilla de avance de tutorías "10 en 10" (TIT ·
 * Titulación, Requisito 3 — extensión 2026-07-31, `proyecto·LISTAR`/`EXPORTAR`).
 *
 * Consume el contexto del provider (filtros carrera/gestión/bimestre +
 * planilla + exportación) y arma breadcrumb/feedback. `carreraId` y
 * `bimestre` son requeridos: mientras falte alguno, la página muestra un
 * estado vacío orientador (sin llamar al backend, ver
 * `usePlanillaAvanceTercerAnioApi`).
 */

import { useCallback, useMemo } from 'react';
import { App } from 'antd';
import { usePlanillaAvanceTercerAnioContext } from '@application-titulacion/proyectos-grado/hooks/context/usePlanillaAvanceTercerAnioContext';
import { BIMESTRE_OPTIONS } from '@application-titulacion/proyectos-grado/utils/bimestreOptions';

export const usePlanillaAvanceTercerAnioPage = () => {
  const { message } = App.useApp();
  const {
    planilla,
    loading,
    error,
    exportar,
    exportando,
    carreras,
    loadingCarreras,
    gestiones,
    loadingGestiones,
    carreraId,
    setCarreraId,
    gestionId,
    setGestionId,
    bimestre,
    setBimestre,
  } = usePlanillaAvanceTercerAnioContext();

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

  const filtrosCompletos = carreraId != null && bimestre != null;

  const handleExportar = useCallback(async () => {
    const result = await exportar({ carreraId, gestionId, bimestre });
    if (!result?.success) {
      message.error(result?.error || 'No se pudo exportar la planilla de avance de tutorías');
    }
  }, [exportar, carreraId, gestionId, bimestre, message]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Titulación' },
      { title: 'Planilla de avance (3er año)' },
    ],
    [],
  );

  return {
    planilla,
    loading,
    error,
    filtrosCompletos,
    handleExportar,
    exportando,
    breadcrumbItems,
    carreraOptions,
    loadingCarreras,
    gestionOptions,
    loadingGestiones,
    bimestreOptions: BIMESTRE_OPTIONS,
    carreraId,
    setCarreraId,
    gestionId,
    setGestionId,
    bimestre,
    setBimestre,
  };
};

export default usePlanillaAvanceTercerAnioPage;
