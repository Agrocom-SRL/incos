/**
 * Exporta el Consolidado % de asistencia en .xlsx
 * (GET /v1/asistencia/consolidado/export). Mismos query que la pantalla
 * (`paraleloGestionId` + `bimestre` opcional = acumulado anual) para paridad
 * pantalla ↔ Excel. Delega en el repo y descarga con `downloadBlob`.
 */

import { useCallback, useState } from 'react';
import AsistenciaRepository from '@infrastructure/repositories/AsistenciaRepository.js';
import { downloadBlob } from '@application/utils';

export const useExportConsolidadoAsistenciaExcel = () => {
  const [loading, setLoading] = useState(false);

  const exportar = useCallback(async ({ paraleloGestionId, bimestre = null } = {}) => {
    if (!paraleloGestionId) {
      return { success: false, error: 'Seleccione un paralelo antes de exportar' };
    }

    setLoading(true);
    try {
      const result = await AsistenciaRepository.descargarConsolidadoExcel({
        paraleloGestionId,
        bimestre,
      });
      if (!result.success || !result.blob) {
        return {
          success: false,
          error: result.error || 'No se pudo generar el archivo',
        };
      }
      downloadBlob(result.blob, result.fileName || 'consolidado_asistencia.xlsx');
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err?.message || 'Error al exportar',
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return { exportar, loading };
};

export default useExportConsolidadoAsistenciaExcel;
