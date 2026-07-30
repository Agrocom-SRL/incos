/**
 * Exporta el Avance académico en .xlsx (GET /v1/avance-academico/export).
 * Acepta el mismo `carreraId` del filtro de pantalla para que el Excel y la
 * tabla muestren el MISMO universo. Delega en el repo de infraestructura,
 * recibe `{ blob, fileName }` y dispara la descarga con `downloadBlob`.
 * No conoce la UI (patrón useExportCentralizadorExcel).
 */

import { useCallback, useState } from 'react';
import AvanceAcademicoRepository from '@infrastructure/repositories/AvanceAcademicoRepository.js';
import { downloadBlob } from '@application/utils';

export const useExportAvanceAcademicoExcel = () => {
  const [loading, setLoading] = useState(false);

  const exportar = useCallback(async ({ carreraId = null } = {}) => {
    setLoading(true);
    try {
      const result = await AvanceAcademicoRepository.descargarAvanceExcel({ carreraId });
      if (!result.success || !result.blob) {
        return {
          success: false,
          error: result.error || 'No se pudo generar el archivo',
        };
      }
      downloadBlob(result.blob, result.fileName || 'avance_academico.xlsx');
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

export default useExportAvanceAcademicoExcel;
