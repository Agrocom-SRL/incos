/**
 * Hook de API: exportación a Excel de la planilla de avance de tutorías
 * "10 en 10" (módulo TIT · Titulación, Requisito 3 — extensión 2026-07-31).
 *
 * Descarga por blob AUTENTICADO (permiso `titulacion.proyecto` · EXPORTAR);
 * nunca por URL estática. Mismos filtros que la vista en pantalla
 * (`usePlanillaAvanceTercerAnioApi`); `carreraId` y `bimestre` requeridos.
 */

import { useCallback, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';
import { downloadBlob } from '@application/utils';

export const useExportPlanillaAvanceTercerAnioExcel = () => {
  const [exportando, setExportando] = useState(false);

  const exportar = useCallback(async ({ carreraId, gestionId, bimestre } = {}) => {
    if (carreraId == null || bimestre == null) {
      return { success: false, error: 'Seleccione carrera y bimestre para exportar la planilla' };
    }
    setExportando(true);
    try {
      const result = await proyectoGradoRepository.exportarPlanillaAvanceTercerAnioExcel({
        carreraId,
        gestionId: gestionId ?? undefined,
        bimestre,
      });
      if (result?.success && result.blob) {
        downloadBlob(result.blob, result.fileName || 'planilla_avance_tutoria.xlsx');
        return { success: true };
      }
      return { success: false, error: result?.error || 'No se pudo exportar la planilla' };
    } finally {
      setExportando(false);
    }
  }, []);

  return useMemo(() => ({ exportar, exportando }), [exportar, exportando]);
};

export default useExportPlanillaAvanceTercerAnioExcel;
