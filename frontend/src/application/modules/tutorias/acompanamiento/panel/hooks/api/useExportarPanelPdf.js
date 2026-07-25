/**
 * Hook de API: exportación del panel de acompañamiento a PDF (módulo TUT · A11).
 *
 * Descarga por blob AUTENTICADO (permiso tutorias.acompanamiento.panel ·
 * EXPORTAR); nunca por URL estática.
 */

import { useCallback, useMemo, useState } from 'react';
import panelAcompanamientoRepository from '@implementations/PanelAcompanamientoRepository';
import { downloadBlob } from '@application/utils';

export const useExportarPanelPdf = () => {
  const [exportando, setExportando] = useState(false);

  const exportar = useCallback(async ({ gestionId } = {}) => {
    setExportando(true);
    try {
      const result = await panelAcompanamientoRepository.exportarPanel({ gestionId });
      if (result?.success && result.blob) {
        downloadBlob(result.blob, result.fileName || 'panel_acompanamiento.pdf');
        return { success: true };
      }
      return { success: false, error: result?.error || 'No se pudo exportar el panel' };
    } finally {
      setExportando(false);
    }
  }, []);

  return useMemo(() => ({ exportar, exportando }), [exportar, exportando]);
};
