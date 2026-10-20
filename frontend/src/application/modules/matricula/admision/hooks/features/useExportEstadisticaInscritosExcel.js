/**
 * Exporta a Excel la estadística de inscritos (misma plantilla que vista_reporte_excel_inscritos).
 */

import { useState, useCallback } from 'react';
import { useCasesFactory } from '@container';
import { downloadBlob } from '@application/utils';

export const useExportEstadisticaInscritosExcel = () => {
  const [loading, setLoading] = useState(false);

  const exportar = useCallback(async (options = {}) => {
    const useCase = useCasesFactory.exportarEstadisticaInscritosExcel?.();
    if (!useCase) {
      return { success: false, error: 'No se pudo inicializar la exportación' };
    }

    setLoading(true);
    try {
      const result = await useCase.ejecutar(options);
      if (!result.success || !result.blob) {
        return {
          success: false,
          error: result.error || 'No se pudo generar el archivo',
        };
      }
      downloadBlob(result.blob, result.fileName || 'estadistica_inscritos.xlsx');
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
