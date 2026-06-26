/**
 * Descarga el Boletín de calificaciones (PDF) de UN estudiante del paralelo.
 *
 * Espeja a `useExportCentralizadorExcel`: delega en `CalificacionRepository`,
 * recibe `{ blob, fileName }` y dispara la descarga con `downloadBlob`. No conoce
 * la UI.
 *
 * A diferencia del export Excel (un único `loading`), aquí se descarga por fila,
 * así que el estado de carga es el `estudianteId` que se está descargando
 * (`descandoId`, null si ninguno). La fila activa muestra el spinner; las demás no.
 */

import { useCallback, useState } from 'react';
import CalificacionRepository from '@infrastructure/repositories/CalificacionRepository.js';
import { downloadBlob } from '@application/utils';

export const useExportBoletinEstudiante = () => {
  const [descargandoId, setDescargandoId] = useState(null);

  const exportar = useCallback(async (paraleloGestionId, estudianteId) => {
    if (!paraleloGestionId || !estudianteId) {
      return { success: false, error: 'Paralelo o estudiante inválido' };
    }

    setDescargandoId(estudianteId);
    try {
      const result = await CalificacionRepository.descargarBoletinEstudiante({
        paraleloGestionId,
        estudianteId,
      });
      if (!result.success || !result.blob) {
        return {
          success: false,
          error: result.error || 'No se pudo generar el boletín',
        };
      }
      downloadBlob(result.blob, result.fileName || 'Boletin.pdf');
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err?.message || 'Error al exportar el boletín',
      };
    } finally {
      setDescargandoId(null);
    }
  }, []);

  return { exportar, descargandoId };
};

export default useExportBoletinEstudiante;
