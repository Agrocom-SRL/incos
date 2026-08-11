/**
 * Hook de API: exportación a PDF del reporte de avance de tutorías por
 * carrera (módulo TIT · Titulación, Requisito 2 — extensión 2026-07-31).
 *
 * Descarga por blob AUTENTICADO (permiso `titulacion.proyecto` · EXPORTAR);
 * nunca por URL estática. Botón directo en `ProyectosGradoList` (sin página
 * intermedia): siempre gestión vigente + todas las carreras, mismo criterio
 * que aplica el backend cuando no recibe `gestionId`/`carreraId`.
 */

import { useCallback, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';
import { downloadBlob } from '@application/utils';

export const useExportAvanceTutoriaCarreraPdf = () => {
  const [exportando, setExportando] = useState(false);

  const exportar = useCallback(async ({ gestionId, carreraId } = {}) => {
    setExportando(true);
    try {
      const result = await proyectoGradoRepository.exportarAvanceTutoriaCarreraPdf({
        gestionId: gestionId ?? undefined,
        carreraId: carreraId ?? undefined,
      });
      if (result?.success && result.blob) {
        downloadBlob(result.blob, result.fileName || 'reporte_avance_tutorias_carrera.pdf');
        return { success: true };
      }
      return { success: false, error: result?.error || 'No se pudo exportar el reporte' };
    } finally {
      setExportando(false);
    }
  }, []);

  return useMemo(() => ({ exportar, exportando }), [exportar, exportando]);
};

export default useExportAvanceTutoriaCarreraPdf;
