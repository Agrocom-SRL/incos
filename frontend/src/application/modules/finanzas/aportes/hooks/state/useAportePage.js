/**
 * Hook de pantalla: Aporte de la gestión vigente (Finanzas).
 *
 * Orquesta la página `/finanzas/aportes` (antes tab "Aporte" de "Config. de
 * pagos"; promovida a página propia con su permiso `finanzas.aporte` —
 * LISTAR/CREAR/EDITAR, sin ELIMINAR). Consume el contexto del provider,
 * expone breadcrumbs y el handler de guardado (UPSERT + feedback + refetch).
 * No hace fetch (eso vive en el provider).
 *
 * Regla de negocio: si `aporteVigente` existe → PUT por id; si no → POST. El
 * backend asocia la gestión vigente cuando no se envía `gestion_id`.
 */

import { useCallback, useMemo } from 'react';
import { App } from 'antd';
import dayjs from 'dayjs';
import { useAporteContext } from '@application-finanzas/aportes/hooks/context/useAporteContext';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';

/** Formato de fecha que espera el backend (DATEONLY). */
const toFechaBackend = (value) => (value ? dayjs(value).format('YYYY-MM-DD') : null);

export const useAportePage = () => {
  const { message } = App.useApp();
  const { gestionVigente, aporteVigente, loading, error, refetch, saving, guardarConfiguracionAporte } =
    useAporteContext();

  const breadcrumbItems = useMemo(() => createBreadcrumbItems('FIN-APORTES', 'FIN', 'Aportes'), []);

  const guardarAporte = useCallback(
    async (values) => {
      const payload = {
        monto_base: Number(values.montoBase),
        aporte_activo: !!values.aporteActivo,
        fecha_inicio: toFechaBackend(values.fechaInicio),
        fecha_fin: toFechaBackend(values.fechaFin),
      };
      // UPSERT: con id existente → PUT; sin id → POST (gestión vigente la pone el back).
      const resultado = await guardarConfiguracionAporte({
        id: aporteVigente?.id ?? null,
        payload,
      });
      if (resultado?.success) {
        message.success('Aporte de la gestión guardado');
        await refetch();
        return true;
      }
      message.error(resultado?.error || 'No se pudo guardar. Reintentar.');
      return false;
    },
    [aporteVigente, guardarConfiguracionAporte, message, refetch],
  );

  return {
    gestionVigente,
    breadcrumbItems,
    aporteVigente,
    loading,
    error,
    refetch,
    saving,
    guardarAporte,
  };
};

export default useAportePage;
