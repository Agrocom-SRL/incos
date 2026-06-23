/**
 * Hook de pantalla: planilla de control de becas por carrera (Finanzas, read-only).
 *
 * Espejo de `usePagosListPage`: consume el contexto del provider y devuelve props
 * listas para la página "dumb": breadcrumbs, columnas DINÁMICAS (derivadas de
 * `porcentajes`, no hardcodeadas), filas de la tabla, datos de la fila de totales,
 * datos del donut/distribución y el resumen general. No hace fetch.
 */

import { useMemo } from 'react';
import { useBecasReporteContext } from '@application-finanzas/hooks/context/useBecasReporteContext';
import { createBecasTableColumns } from '@finanzas/reportes/config/becasTableColumns';

export const useBecasReportePage = () => {
  const { reporte, loading, error, gestionId, refetch } = useBecasReporteContext();

  const porcentajes = useMemo(() => reporte?.porcentajes ?? [], [reporte]);

  const tableColumns = useMemo(
    () => createBecasTableColumns(porcentajes),
    [porcentajes],
  );

  const filas = useMemo(() => reporte?.filas ?? [], [reporte]);

  const totales = useMemo(() => reporte?.totales ?? null, [reporte]);

  const distribucion = useMemo(() => reporte?.distribucion ?? [], [reporte]);

  const resumen = useMemo(() => reporte?.resumen ?? null, [reporte]);

  const catalogo = useMemo(() => reporte?.catalogo ?? [], [reporte]);

  const catalogoResumen = useMemo(() => reporte?.catalogoResumen ?? null, [reporte]);

  const gestion = useMemo(() => reporte?.gestion ?? null, [reporte]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Reportes de pagos' },
      { title: 'Becas' },
    ],
    [],
  );

  const isEmpty = !loading && !error && filas.length === 0;

  return {
    loading,
    error,
    isEmpty,
    breadcrumbItems,
    gestion,
    gestionId,
    refetch,
    porcentajes,
    tableColumns,
    filas,
    totales,
    distribucion,
    resumen,
    catalogo,
    catalogoResumen,
  };
};

export default useBecasReportePage;
