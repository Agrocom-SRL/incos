/**
 * Exporta el libro de registro en formato .xlsx (una hoja por paralelo,
 * folios apilados + firmas de docentes + banda #196B45; ya resuelto en el
 * backend). Sin `carreraId` exporta las 3 carreras; con `carreraId` filtra
 * solo las hojas de esa carrera (botón "Exportar libro" dentro de cada tab
 * de carrera, ficha del libro). Mismo patrón que `useExportCentralizadorExcel`:
 * delega en el repo de infraestructura, recibe `{ blob, fileName }` y dispara
 * la descarga con `downloadBlob`. No conoce la UI.
 */

import { useCallback, useState } from 'react';
import LibroRegistroRepository from '@infrastructure/repositories/LibroRegistroRepository.js';
import { downloadBlob } from '@application/utils';

export const useExportLibroExcel = () => {
  const [loading, setLoading] = useState(false);

  const exportar = useCallback(async (id, carreraId = null) => {
    if (!id) {
      return { success: false, error: 'Libro inválido' };
    }

    setLoading(true);
    try {
      const result = await LibroRegistroRepository.exportar(id, carreraId);
      if (!result.success || !result.blob) {
        return {
          success: false,
          error: result.error || 'No se pudo generar el archivo',
        };
      }
      downloadBlob(result.blob, result.fileName || 'libro_registro.xlsx');
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

export default useExportLibroExcel;
