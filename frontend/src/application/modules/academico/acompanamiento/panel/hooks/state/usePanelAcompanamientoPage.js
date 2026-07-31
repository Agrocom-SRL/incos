/**
 * Hook de pantalla: panel de acompañamiento (TUT · panel·LISTAR).
 *
 * Consume el contexto del provider (A10), deriva las stat-cards y gobierna la
 * exportación a PDF (A11) con feedback. Sin librería de gráficos: stat-cards
 * + Progress AntD + tabla de casos críticos (decisión cerrada del plan).
 */

import { useCallback, useMemo } from 'react';
import { App } from 'antd';
import { usePanelAcompanamientoContext } from '@application-tutorias/acompanamiento/panel/hooks/context/usePanelAcompanamientoContext';

export const usePanelAcompanamientoPage = () => {
  const { message } = App.useApp();
  const { panel, loading, error, refetch, exportar, exportando } = usePanelAcompanamientoContext();

  const handleExportar = useCallback(async () => {
    const result = await exportar({ gestionId: panel?.gestionId ?? undefined });
    if (!result?.success) {
      message.error(result?.error || 'No se pudo exportar el panel de acompañamiento');
    }
  }, [exportar, panel?.gestionId, message]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Académico' },
      { title: 'Panel de acompañamiento' },
    ],
    [],
  );

  return {
    panel,
    totales: panel?.totales ?? null,
    loading,
    error,
    refetch,
    breadcrumbItems,
    handleExportar,
    exportando,
  };
};
