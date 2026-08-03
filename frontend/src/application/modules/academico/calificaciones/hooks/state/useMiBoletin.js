/**
 * Mi boletín — portal del estudiante (SOLO LECTURA + descarga del PDF del boletín).
 *
 * Carga el boletín del estudiante autenticado (cabecera + asignaturas con notas
 * por bimestre) y expone la descarga del PDF (única descarga permitida al
 * estudiante): boletín ANUAL o, con `{ bimestre: 1..4 }`, el boletín de un
 * bimestre. La página solo orquesta; el fetch vive aquí.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import CalificacionRepository from '@infrastructure/repositories/CalificacionRepository.js';
import { downloadBlob } from '@application/utils';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';

export const useMiBoletin = () => {
  const [boletin, setBoletin] = useState(null);
  // `loading` nace en true: el effect inicial SOLO dispara la carga (sin
  // setState síncrono dentro del effect); `refetch` sí reactiva el spinner.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [descargando, setDescargando] = useState(false);

  const fetchBoletin = useCallback(async () => {
    try {
      const result = await CalificacionRepository.obtenerMiBoletin();
      if (!result?.success) {
        setBoletin(null);
        setError(result?.error || 'No se pudo cargar su boletín');
        return;
      }
      setBoletin(result.data ?? null);
      setError(null);
    } catch (err) {
      setBoletin(null);
      setError(err?.message || 'No se pudo cargar su boletín');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoletin();
  }, [fetchBoletin]);

  /** Recarga bajo demanda (reactiva el spinner antes de volver a pedir datos). */
  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    return fetchBoletin();
  }, [fetchBoletin]);

  /**
   * Descarga el PDF del boletín. Sin argumentos descarga el boletín ANUAL
   * (comportamiento de siempre); con `{ bimestre: 1..4 }` descarga el boletín
   * de ese bimestre. El nombre del archivo lo fija el servidor (incluye el
   * bimestre); el fallback local replica esa convención.
   */
  const descargarPdf = useCallback(async ({ bimestre = null } = {}) => {
    setDescargando(true);
    try {
      const result = await CalificacionRepository.descargarMiBoletin({ bimestre });
      if (!result?.success || !result.blob) {
        return { success: false, error: result?.error || 'No se pudo generar el boletín' };
      }
      const fallbackName = bimestre != null ? `Boletin_Bimestre${bimestre}.pdf` : 'Boletin.pdf';
      downloadBlob(result.blob, result.fileName || fallbackName);
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.message || 'Error al descargar el boletín' };
    } finally {
      setDescargando(false);
    }
  }, []);

  const asignaturas = useMemo(
    () => (Array.isArray(boletin?.asignaturas) ? boletin.asignaturas : []),
    [boletin],
  );

  const breadcrumbItems = useMemo(
    () => createBreadcrumbItems('ACA-MI-BOLETIN', 'ACA-CAL', 'Mi boletín'),
    [],
  );

  return {
    boletin,
    asignaturas,
    loading,
    error,
    descargando,
    descargarPdf,
    breadcrumbItems,
    refetch,
  };
};

export default useMiBoletin;
