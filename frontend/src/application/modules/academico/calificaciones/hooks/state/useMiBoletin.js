/**
 * Mi boletín — portal del estudiante (SOLO LECTURA + descarga del PDF del boletín).
 *
 * Carga el boletín del estudiante autenticado (cabecera + asignaturas con notas
 * por bimestre) y expone la descarga del PDF (única descarga permitida al
 * estudiante). La página solo orquesta; el fetch vive aquí.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import CalificacionRepository from '@infrastructure/repositories/CalificacionRepository.js';
import { downloadBlob } from '@application/utils';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';

export const useMiBoletin = () => {
  const [boletin, setBoletin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [descargando, setDescargando] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await CalificacionRepository.obtenerMiBoletin();
      if (!result?.success) {
        setBoletin(null);
        setError(result?.error || 'No se pudo cargar su boletín');
        return;
      }
      setBoletin(result.data ?? null);
    } catch (err) {
      setBoletin(null);
      setError(err?.message || 'No se pudo cargar su boletín');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const descargarPdf = useCallback(async () => {
    setDescargando(true);
    try {
      const result = await CalificacionRepository.descargarMiBoletin();
      if (!result?.success || !result.blob) {
        return { success: false, error: result?.error || 'No se pudo generar el boletín' };
      }
      downloadBlob(result.blob, result.fileName || 'Boletin.pdf');
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
    refetch: cargar,
  };
};

export default useMiBoletin;
