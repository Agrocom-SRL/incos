/**
 * Hook de API: exportación a PDF de la ficha de seguimiento en clase (módulo
 * DOC · Supervisión docente, S6). Descarga el binario y dispara la descarga
 * en el navegador (`downloadBlob`); expone el estado de descarga para el
 * botón "Exportar PDF" (gated por permiso EXPORTAR en la página).
 */

import { useCallback, useMemo, useState } from 'react';
import fichaSeguimientoRepository from '@implementations/FichaSeguimientoRepository';
import { downloadBlob } from '@application/utils';

export const useExportarFichaPdf = () => {
  const [descargando, setDescargando] = useState(false);

  const exportarPdf = useCallback(async (id) => {
    if (id == null) {
      return { success: false, error: 'Ficha no especificada' };
    }
    setDescargando(true);
    try {
      const result = await fichaSeguimientoRepository.exportarPdf(id);
      if (!result?.success || !result.blob) {
        return { success: false, error: result?.error || 'No se pudo generar el PDF de la ficha' };
      }
      downloadBlob(result.blob, result.fileName || 'ficha-seguimiento.pdf');
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.message || 'Error al exportar la ficha a PDF' };
    } finally {
      setDescargando(false);
    }
  }, []);

  return useMemo(() => ({ descargando, exportarPdf }), [descargando, exportarPdf]);
};
