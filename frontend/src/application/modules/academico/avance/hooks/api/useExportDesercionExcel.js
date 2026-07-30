/**
 * Exporta la Deserción estudiantil en .xlsx (GET /v1/desercion/export).
 * Acepta los mismos filtros de pantalla (`gestionId`, `carreraId`) para que
 * el Excel y las tablas muestren el MISMO universo. Delega en el repo de
 * infraestructura y dispara la descarga con `downloadBlob`. No conoce la UI.
 */

import { useCallback, useState } from 'react';
import DesercionRepository from '@infrastructure/repositories/DesercionRepository.js';
import { downloadBlob } from '@application/utils';

export const useExportDesercionExcel = () => {
  const [loading, setLoading] = useState(false);

  const exportar = useCallback(async ({ gestionId = null, carreraId = null } = {}) => {
    setLoading(true);
    try {
      const result = await DesercionRepository.descargarDesercionExcel({ gestionId, carreraId });
      if (!result.success || !result.blob) {
        return {
          success: false,
          error: result.error || 'No se pudo generar el archivo',
        };
      }
      downloadBlob(result.blob, result.fileName || 'desercion.xlsx');
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

export default useExportDesercionExcel;
