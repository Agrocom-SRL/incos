/**
 * Exporta el Centralizador en formato .xlsx en dos granos:
 *  - `exportar`        → libro de UN paralelo para un bimestre (`loading`).
 *  - `exportarCarrera` → libro multi-hoja de TODA la carrera del paralelo para
 *                        el bimestre (`loadingCarrera`).
 *
 * Cada acción mantiene su PROPIO estado de carga para que los dos botones de la
 * P3 no compartan spinner. Delega en el repo de infraestructura
 * (`CalificacionRepository`), recibe `{ blob, fileName }` y dispara la descarga
 * con `downloadBlob`. No conoce la UI.
 */

import { useCallback, useState } from 'react';
import CalificacionRepository from '@infrastructure/repositories/CalificacionRepository.js';
import { downloadBlob } from '@application/utils';

export const useExportCentralizadorExcel = () => {
  const [loading, setLoading] = useState(false);
  const [loadingCarrera, setLoadingCarrera] = useState(false);

  const exportar = useCallback(async (paraleloGestionId, bimestre) => {
    if (!paraleloGestionId || bimestre == null) {
      return { success: false, error: 'Paralelo o bimestre inválido' };
    }

    setLoading(true);
    try {
      const result = await CalificacionRepository.descargarCentralizadorExcel({
        paraleloGestionId,
        bimestre,
      });
      if (!result.success || !result.blob) {
        return {
          success: false,
          error: result.error || 'No se pudo generar el archivo',
        };
      }
      downloadBlob(result.blob, result.fileName || 'centralizador.xlsx');
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

  const exportarCarrera = useCallback(async (paraleloGestionId, bimestre) => {
    if (!paraleloGestionId || bimestre == null) {
      return { success: false, error: 'Paralelo o bimestre inválido' };
    }

    setLoadingCarrera(true);
    try {
      const result = await CalificacionRepository.descargarCentralizadorCarreraExcel({
        paraleloGestionId,
        bimestre,
      });
      if (!result.success || !result.blob) {
        return {
          success: false,
          error: result.error || 'No se pudo generar el archivo',
        };
      }
      downloadBlob(result.blob, result.fileName || 'centralizador_carrera.xlsx');
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err?.message || 'Error al exportar',
      };
    } finally {
      setLoadingCarrera(false);
    }
  }, []);

  return { exportar, loading, exportarCarrera, loadingCarrera };
};

export default useExportCentralizadorExcel;
