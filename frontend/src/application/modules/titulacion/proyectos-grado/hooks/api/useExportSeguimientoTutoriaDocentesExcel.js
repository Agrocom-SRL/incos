/**
 * Hook de API: exportación a Excel del seguimiento de tutorías a docentes
 * (módulo TIT · Titulación, extensión 2026-08-10 — reemplaza la planilla de
 * avance "10 en 10" de 3er año).
 *
 * Descarga por blob AUTENTICADO (permiso `titulacion.proyecto` · EXPORTAR);
 * nunca por URL estática. Mismos filtros que la vista en pantalla
 * (`useSeguimientoTutoriaDocentesApi`), todos OPCIONALES.
 */

import { useCallback, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';
import { downloadBlob } from '@application/utils';

export const useExportSeguimientoTutoriaDocentesExcel = () => {
  const [exportando, setExportando] = useState(false);

  const exportar = useCallback(async ({ docenteId, carreraId, anio, mes } = {}) => {
    setExportando(true);
    try {
      const result = await proyectoGradoRepository.exportarSeguimientoTutoriaDocentesExcel({
        docenteId: docenteId ?? undefined,
        carreraId: carreraId ?? undefined,
        anio: anio ?? undefined,
        mes: mes ?? undefined,
      });
      if (result?.success && result.blob) {
        downloadBlob(result.blob, result.fileName || 'seguimiento_tutoria_docentes.xlsx');
        return { success: true };
      }
      return {
        success: false,
        error: result?.error || 'No se pudo exportar el seguimiento de tutorías a docentes',
      };
    } finally {
      setExportando(false);
    }
  }, []);

  return useMemo(() => ({ exportar, exportando }), [exportar, exportando]);
};

export default useExportSeguimientoTutoriaDocentesExcel;
