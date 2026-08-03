/**
 * Hook de API: exportación a PDF del formulario de modalidad de graduación
 * FMDG-1 (módulo TIT · Titulación, Requisito 1 — extensión 2026-07-31).
 *
 * Descarga por blob AUTENTICADO (permiso `titulacion.proyecto` · EXPORTAR,
 * mismo criterio que `useExportarFichaPdf` de Supervisión docente); nunca por
 * URL estática. Aplica sobre un proyecto YA creado (ficha de detalle).
 */

import { useCallback, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';
import { downloadBlob } from '@application/utils';

export const useExportFormularioModalidadPdf = () => {
  const [descargando, setDescargando] = useState(false);

  const exportarPdf = useCallback(async (id) => {
    if (id == null) {
      return { success: false, error: 'Proyecto no especificado' };
    }
    setDescargando(true);
    try {
      const result = await proyectoGradoRepository.exportarFormularioModalidadPdf(id);
      if (!result?.success || !result.blob) {
        return {
          success: false,
          error: result?.error || 'No se pudo generar el formulario de modalidad de graduación',
        };
      }
      downloadBlob(result.blob, result.fileName || 'formulario_modalidad_graduacion.pdf');
      return { success: true };
    } finally {
      setDescargando(false);
    }
  }, []);

  return useMemo(() => ({ descargando, exportarPdf }), [descargando, exportarPdf]);
};

export default useExportFormularioModalidadPdf;
