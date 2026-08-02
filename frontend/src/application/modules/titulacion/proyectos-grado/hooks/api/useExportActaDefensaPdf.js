/**
 * Hook de API: exportación a PDF de un acta de defensa (módulo TIT,
 * extensión 2026-08-01 · proyecto·EXPORTAR).
 *
 * Descarga por blob AUTENTICADO, mismo criterio que
 * `useExportFormularioModalidadPdf`/`useDictamenesProyectoApi.descargarDictamen`
 * (nunca por URL estática). `descargandoId` (no un booleano único) porque un
 * proyecto PSP grupal puede tener N actas: identifica cuál se está exportando.
 */

import { useCallback, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';
import { downloadBlob } from '@application/utils';

export const useExportActaDefensaPdf = () => {
  const [descargandoId, setDescargandoId] = useState(null);

  const exportarPdf = useCallback(async (proyectoId, acta) => {
    const actaId = acta?.id ?? acta;
    if (proyectoId == null || actaId == null) {
      return { success: false, error: 'Acta de defensa no especificada' };
    }
    setDescargandoId(actaId);
    try {
      const result = await proyectoGradoRepository.exportarActaDefensaPdf(proyectoId, actaId);
      if (!result?.success || !result.blob) {
        return {
          success: false,
          error: result?.error || 'No se pudo generar el acta de defensa',
        };
      }
      downloadBlob(result.blob, result.fileName || 'acta_defensa.pdf');
      return { success: true };
    } finally {
      setDescargandoId(null);
    }
  }, []);

  return useMemo(() => ({ descargandoId, exportarPdf }), [descargandoId, exportarPdf]);
};

export default useExportActaDefensaPdf;
