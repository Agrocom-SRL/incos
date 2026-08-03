/**
 * Exporta el Centralizador ANUAL de UN paralelo en formato .xlsx (grano nuevo:
 * una sola hoja, sobre los folios YA generados del Libro de registro). Hermano
 * de `useExportCentralizadorExcel` (que exporta por bimestre); este hook no
 * recibe bimestre.
 *
 * Si el paralelo aún no tiene folios generados, el backend responde 400 con un
 * mensaje claro ("El paralelo aún no tiene folios generados en el libro de la
 * gestión") — se propaga tal cual, sin reemplazarlo por uno propio. Delega en
 * el repo de infraestructura (`CalificacionRepository`), recibe
 * `{ blob, fileName }` y dispara la descarga con `downloadBlob`. No conoce la UI.
 */

import { useCallback, useState } from 'react';
import CalificacionRepository from '@infrastructure/repositories/CalificacionRepository.js';
import { downloadBlob } from '@application/utils';

export const useExportCentralizadorAnualExcel = () => {
  const [loading, setLoading] = useState(false);

  const exportar = useCallback(async (paraleloGestionId) => {
    if (!paraleloGestionId) {
      return { success: false, error: 'Paralelo inválido' };
    }

    setLoading(true);
    try {
      const result = await CalificacionRepository.descargarCentralizadorAnualExcel({
        paraleloGestionId,
      });
      if (!result.success || !result.blob) {
        return {
          success: false,
          error: result.error || 'No se pudo generar el archivo',
        };
      }
      downloadBlob(result.blob, result.fileName || 'centralizador_anual.xlsx');
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

export default useExportCentralizadorAnualExcel;
