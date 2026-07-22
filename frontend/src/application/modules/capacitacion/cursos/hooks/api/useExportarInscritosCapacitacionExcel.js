/**
 * Exporta el Excel (.xlsx) del listado de inscritos vigentes de un curso de
 * capacitación (permiso capacitacion.inscripcion EXPORTAR). Delega en el repo
 * de infraestructura (`CursoCapacitacionRepository`), recibe `{ blob, fileName }`
 * y dispara la descarga con `downloadBlob`. No conoce la UI.
 */

import { useCallback, useState } from 'react';
import cursoCapacitacionRepository from '@implementations/CursoCapacitacionRepository';
import { downloadBlob } from '@application/utils';

export const useExportarInscritosCapacitacionExcel = () => {
  const [loading, setLoading] = useState(false);

  const exportar = useCallback(async (cursoId) => {
    if (!cursoId) {
      return { success: false, error: 'Curso inválido' };
    }

    setLoading(true);
    try {
      const result = await cursoCapacitacionRepository.exportarInscritos(cursoId);
      if (!result.success || !result.blob) {
        return {
          success: false,
          error: result.error || 'No se pudo generar el archivo',
        };
      }
      downloadBlob(result.blob, result.fileName || 'inscritos_capacitacion.xlsx');
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

export default useExportarInscritosCapacitacionExcel;
