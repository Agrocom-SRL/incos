/**
 * Historial académico — pantalla de detalle (transcript FORM-SIE-ITT-04).
 *
 * Carga el documento del estudiante `:id` (cabecera + filas + resumen) desde
 * `GET /estudiantes/:id/historial-academico` y expone las descargas del Excel
 * (`.../export`) y del PDF oficial (`.../export-pdf`). La página solo orquesta;
 * el fetch y el estado viven aquí.
 *
 * Estados resueltos: carga (loading), error, y vacío (documento sin filas). Las
 * filas se ordenan de forma estable por gestión → periodo → sigla para leer el
 * transcript en orden aunque el backend cambie el criterio.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import EstudianteRepository from '@infrastructure/repositories/EstudianteRepository.js';
import { downloadBlob } from '@application/utils';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { mapHistorialAcademico } from '@application-academico/historial/mappers/historialMapper.js';

/**
 * Orden estable del transcript: gestión → periodo → nro del documento (orden del
 * plan de estudio, el mismo que las columnas del centralizador) → sigla como
 * desempate. Ordenar por sigla alfabética rompía la numeración N° del documento
 * (CGA-102 antes que FUA-101).
 */
const ordenarFilas = (filas) =>
  [...filas].sort((a, b) => {
    const gestion = (a.gestionAnio ?? 0) - (b.gestionAnio ?? 0);
    if (gestion !== 0) return gestion;
    const periodo = (a.periodoNumero ?? 0) - (b.periodoNumero ?? 0);
    if (periodo !== 0) return periodo;
    const nro = (a.nro ?? Number.MAX_SAFE_INTEGER) - (b.nro ?? Number.MAX_SAFE_INTEGER);
    if (nro !== 0) return nro;
    return String(a.asignaturaSigla ?? '').localeCompare(String(b.asignaturaSigla ?? ''));
  });

export const useHistorialAcademico = (estudianteId) => {
  const [historial, setHistorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [descargando, setDescargando] = useState(false);
  const [descargandoPdf, setDescargandoPdf] = useState(false);

  const cargar = useCallback(async () => {
    if (estudianteId == null) {
      setHistorial(null);
      setError('Estudiante no especificado');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await EstudianteRepository.obtenerHistorialAcademico(estudianteId);
      if (!result?.success) {
        setHistorial(null);
        setError(result?.error || 'No se pudo cargar el historial académico');
        return;
      }
      setHistorial(mapHistorialAcademico(result.data));
    } catch (err) {
      setHistorial(null);
      setError(err?.message || 'No se pudo cargar el historial académico');
    } finally {
      setLoading(false);
    }
  }, [estudianteId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const exportarExcel = useCallback(async () => {
    if (estudianteId == null) {
      return { success: false, error: 'Estudiante no especificado' };
    }
    setDescargando(true);
    try {
      const result = await EstudianteRepository.descargarHistorialAcademicoExcel(estudianteId);
      if (!result?.success || !result.blob) {
        return { success: false, error: result?.error || 'No se pudo generar el Excel' };
      }
      downloadBlob(result.blob, result.fileName || 'historial_academico.xlsx');
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.message || 'Error al exportar el historial' };
    } finally {
      setDescargando(false);
    }
  }, [estudianteId]);

  const exportarPdf = useCallback(async () => {
    if (estudianteId == null) {
      return { success: false, error: 'Estudiante no especificado' };
    }
    setDescargandoPdf(true);
    try {
      const result = await EstudianteRepository.descargarHistorialAcademicoPdf(estudianteId);
      if (!result?.success || !result.blob) {
        return { success: false, error: result?.error || 'No se pudo generar el PDF' };
      }
      downloadBlob(result.blob, result.fileName || 'historial_academico.pdf');
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.message || 'Error al exportar el historial' };
    } finally {
      setDescargandoPdf(false);
    }
  }, [estudianteId]);

  const estudiante = historial?.estudiante ?? null;
  const resumen = historial?.resumen ?? null;
  const filas = useMemo(
    () => ordenarFilas(historial?.filas ?? []),
    [historial],
  );

  const sinFilas = !loading && !error && !!historial && filas.length === 0;

  const breadcrumbItems = useMemo(
    () =>
      createBreadcrumbItems(
        'ACA-HIS-DETALLE',
        'ACA-HIS',
        estudiante?.nombreCompleto || 'Historial académico',
      ),
    [estudiante],
  );

  return {
    historial,
    estudiante,
    filas,
    resumen,
    loading,
    error,
    sinFilas,
    descargando,
    descargandoPdf,
    exportarExcel,
    exportarPdf,
    breadcrumbItems,
    refetch: cargar,
  };
};

export default useHistorialAcademico;
