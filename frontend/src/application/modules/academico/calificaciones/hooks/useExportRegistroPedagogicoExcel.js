/**
 * Exporta Registro Pedagógico Bimestral (.xlsx) desde consolidado bimestre cerrado.
 */

import { useCallback, useState } from 'react';
import CalificacionRepository from '@infrastructure/repositories/CalificacionRepository.js';
import { downloadBlob } from '@application/utils';

export const useExportRegistroPedagogicoExcel = () => {
  const [loading, setLoading] = useState(false);

  const exportar = useCallback(async (asignacionId, bimestre) => {
    if (!asignacionId || bimestre == null) {
      return { success: false, error: 'Curso o bimestre inválido' };
    }

    setLoading(true);
    try {
      const result = await CalificacionRepository.descargarRegistroPedagogicoExcel(
        asignacionId,
        bimestre,
      );
      if (!result.success || !result.blob) {
        return {
          success: false,
          error: result.error || 'No se pudo generar el archivo',
        };
      }
      downloadBlob(result.blob, result.fileName || 'registro_pedagogico.xlsx');
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
