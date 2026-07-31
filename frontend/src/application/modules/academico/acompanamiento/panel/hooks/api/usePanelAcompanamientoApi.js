/**
 * Hook de API: panel de acompañamiento (módulo ACA · A10).
 *
 * GET /acompanamiento/panel?gestionId= — sin gestionId el backend usa la
 * gestión vigente. `dataKey` ('panelAcompanamiento') coincide con el
 * `dataFieldName` del backend (GetPanelAcompanamientoUseCase).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import panelAcompanamientoRepository from '@implementations/PanelAcompanamientoRepository';
import { mapPanelAcompanamiento } from '@application-academico/acompanamiento/panel/mappers/panelAcompanamientoMapper';

/** Clave de datos = dataFieldName del backend (contrato A10). */
export const PANEL_ACOMPANAMIENTO_DATA_KEY = 'panelAcompanamiento';

export const usePanelAcompanamientoApi = ({ gestionId } = {}) => {
  const [panel, setPanel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await panelAcompanamientoRepository.obtenerPanel({ gestionId });
    if (result?.success) {
      const raw = result.data?.[PANEL_ACOMPANAMIENTO_DATA_KEY] ?? result.data;
      setPanel(mapPanelAcompanamiento(raw));
    } else {
      setPanel(null);
      setError(result?.error || 'No se pudo cargar el panel de acompañamiento');
    }
    setLoading(false);
    return result;
  }, [gestionId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return useMemo(
    () => ({ panel, loading, error, refetch: cargar }),
    [panel, loading, error, cargar],
  );
};
