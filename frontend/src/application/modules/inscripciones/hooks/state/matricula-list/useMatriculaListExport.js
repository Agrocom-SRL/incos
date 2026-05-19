/**
 * Exportación Excel por carrera en el listado de matrículas.
 */

import { useMemo, useState, useCallback } from 'react';
import { useCarrerasApi } from '@application-configuracion/academico/carreras/hooks/useCarrerasApi';
import { useExportListaInscritosPorCarreraExcel } from '../../features/useExportListaInscritosPorCarreraExcel';
import { useMessage } from '@application/utils';
import { usePermiso } from '@/presentation/hooks/usePermiso.js';

export const useMatriculaListExport = () => {
  const showMessage = useMessage();

  const puedeExportarAdmision = usePermiso('matricula.admision.ver', 'EXPORTAR');
  const puedeExportarInscripcion = usePermiso('matricula.inscribir', 'EXPORTAR');
  const puedeExportarLista = puedeExportarAdmision || puedeExportarInscripcion;

  const [selectedCarreraId, setSelectedCarreraId] = useState(null);
  const { carreras = [], loading: carrerasLoading } = useCarrerasApi();
  const { exportar, loading: exportLoading } = useExportListaInscritosPorCarreraExcel();

  const selectedCarrera = useMemo(() => {
    if (!selectedCarreraId) return null;
    return (carreras || []).find((c) => c.id === selectedCarreraId) || null;
  }, [carreras, selectedCarreraId]);

  const carreraColor = selectedCarrera?.colorHex || '#1677ff';

  const handleExportLista = useCallback(async () => {
    if (!selectedCarreraId) {
      showMessage('warning', 'Seleccione una carrera para exportar');
      return;
    }
    const result = await exportar({ carreraId: selectedCarreraId });
    if (!result.success) {
      showMessage('error', result.error || 'No se pudo exportar');
    } else {
      showMessage('success', 'Archivo generado');
    }
  }, [selectedCarreraId, exportar, showMessage]);

  const carreraSelectOptions = useMemo(
    () =>
      (carreras || []).map((c) => ({
        value: c.id,
        color: c.colorHex || '#1677ff',
        codigo: c.codigo,
        nombre: c.nombre,
      })),
    [carreras],
  );

  return {
    puedeExportarLista,
    selectedCarreraId,
    setSelectedCarreraId,
    carrerasLoading,
    exportLoading,
    selectedCarrera,
    carreraColor,
    carreraSelectOptions,
    handleExportLista,
  };
};
