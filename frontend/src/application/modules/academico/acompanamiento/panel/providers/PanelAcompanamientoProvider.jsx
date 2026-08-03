/**
 * Provider: panel de acompañamiento (ACA · Acompañamiento).
 *
 * Provider DELGADO: ensambla la lectura agregada (A10, gestión vigente por
 * defecto) y la exportación a PDF (A11). La orquestación (feedback del
 * export) vive en `usePanelAcompanamientoPage`.
 */

import { useMemo } from 'react';
import { usePanelAcompanamientoApi } from '@application-academico/acompanamiento/panel/hooks/api/usePanelAcompanamientoApi';
import { useExportarPanelPdf } from '@application-academico/acompanamiento/panel/hooks/api/useExportarPanelPdf';
import { PanelAcompanamientoContext } from '@application-academico/acompanamiento/panel/context/PanelAcompanamientoContext';

export const PanelAcompanamientoProvider = ({ children }) => {
  const { panel, loading, error, refetch } = usePanelAcompanamientoApi();
  const { exportar, exportando } = useExportarPanelPdf();

  const value = useMemo(
    () => ({ panel, loading, error, refetch, exportar, exportando }),
    [panel, loading, error, refetch, exportar, exportando],
  );

  return (
    <PanelAcompanamientoContext.Provider value={value}>
      {children}
    </PanelAcompanamientoContext.Provider>
  );
};
