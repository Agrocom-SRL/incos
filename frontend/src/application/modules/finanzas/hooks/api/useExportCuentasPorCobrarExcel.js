/**
 * Exporta la planilla de control de cuentas por cobrar (.xlsx, read-only).
 *
 * Espejo de `useExportRegistroPedagogicoExcel` (Calificaciones): llama al repo
 * de infraestructura (`PagoAporteRepository`), recibe `{ blob, fileName }` y
 * dispara la descarga con `downloadBlob`. No conoce la UI; expone `{ exportar, loading }`.
 */

import { useCallback, useState } from 'react';
import pagoAporteRepository from '@implementations/PagoAporteRepository';
import { downloadBlob } from '@application/utils';

export const useExportCuentasPorCobrarExcel = () => {
  const [loading, setLoading] = useState(false);

  const exportar = useCallback(async (gestionId = null) => {
    setLoading(true);
    try {
      const result = await pagoAporteRepository.descargarCuentasPorCobrarExcel({ gestionId });
      if (!result.success || !result.blob) {
        return {
          success: false,
          error: result.error || 'No se pudo generar el archivo',
        };
      }
      downloadBlob(result.blob, result.fileName || 'cuentas_por_cobrar.xlsx');
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

export default useExportCuentasPorCobrarExcel;
