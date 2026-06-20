/**
 * Hook de pantalla: planilla de cuentas por cobrar por carrera y paralelo
 * (Finanzas, read-only).
 *
 * Espejo de `useBecasReportePage`: consume el contexto del provider y devuelve
 * props listas para la página "dumb". No hace fetch.
 *
 * Agrupación (faithful a la planilla de referencia):
 *   carreras[] → cada carrera es una SECCIÓN; dentro, sus paralelos[] son
 *   sub-tablas (cabecera de paralelo + filas de estudiante). Los totales por
 *   carrera y el resumen general se exponen ya mapeados.
 */

import { useMemo } from 'react';
import { useCuentasPorCobrarContext } from '@application-finanzas/hooks/context/useCuentasPorCobrarContext';

export const useCuentasPorCobrarPage = () => {
  const { reporte, loading, error, gestionId, refetch } = useCuentasPorCobrarContext();

  const gestion = useMemo(() => reporte?.gestion ?? null, [reporte]);

  const montoMaximoPorEstudiante = useMemo(
    () => reporte?.montoMaximoPorEstudiante ?? 0,
    [reporte],
  );

  const carreras = useMemo(() => reporte?.carreras ?? [], [reporte]);

  const resumen = useMemo(() => reporte?.resumen ?? null, [reporte]);

  /** Fecha de emisión = hoy (la planilla se emite al consultarse). */
  const fechaEmision = useMemo(() => new Date(), []);

  /** Leyenda de alertas (mismas etiquetas/estados que la columna Estado). */
  const leyenda = useMemo(
    () => [
      { key: 'AL_DIA', estado: 'AL_DIA', descripcion: 'Estudiante al día (saldo 0).' },
      {
        key: 'PROXIMA',
        estado: 'PROXIMA',
        descripcion: 'Compromiso de pago próximo a vencer (3 días o menos).',
      },
      { key: 'VENCIDA', estado: 'VENCIDA', descripcion: 'Fecha de compromiso vencida.' },
    ],
    [],
  );

  /** Observaciones generales fijas de la planilla (texto breve). */
  const observacionesGenerales = useMemo(
    () => [
      'El monto máximo por estudiante corresponde al aporte anual de la gestión.',
      'Los pagos realizados pueden corresponder a una o varias cuotas (100, 200, 300 o 400 Bs).',
      'La planilla muestra el saldo pendiente individual por estudiante.',
      'Se recomienda dar seguimiento a las cuentas según la alerta para una cobranza oportuna.',
    ],
    [],
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Reportes de pagos' },
      { title: 'Cuentas por cobrar' },
    ],
    [],
  );

  const isEmpty = !loading && !error && carreras.length === 0;

  return {
    loading,
    error,
    isEmpty,
    breadcrumbItems,
    gestion,
    gestionId,
    refetch,
    montoMaximoPorEstudiante,
    fechaEmision,
    carreras,
    resumen,
    leyenda,
    observacionesGenerales,
  };
};

export default useCuentasPorCobrarPage;
