/**
 * Hook de pantalla: configuración de pagos (Finanzas).
 *
 * Orquesta la pantalla "Config. de pagos" (gemela de `PoliticaInstitucionalPage`
 * de calificaciones): consume el contexto del provider y expone breadcrumbs +
 * los catálogos ya cargados. Alta/edición de método/banco/cuenta viven en sus
 * propias páginas (`BancoFormPage`/`CuentaFormPage`/`MetodoFormPage`, ver
 * `useBancoForm`/`useCuentaForm`/`useMetodoForm`); este hook ya no gestiona
 * estado de modales ni submits directos.
 *
 * El aporte de la gestión vigente (UPSERT) vive en la página
 * `/finanzas/configuracion/aportes` (sin ítem de menú propio, `useAportePage`),
 * con su permiso `finanzas.aporte`.
 */

import { useMemo } from 'react';
import { useConfigPagosContext } from '@application-finanzas/hooks/context/useConfigPagosContext';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';

export const useConfigPagosPage = () => {
  const { metodos, bancos, cuentas, loading, error, refetch, saving } = useConfigPagosContext();

  const breadcrumbItems = useMemo(
    () => createBreadcrumbItems('FIN-CFG', 'FIN', 'Config. de pagos'),
    [],
  );

  return {
    breadcrumbItems,
    metodos,
    bancos,
    cuentas,
    loading,
    error,
    refetch,
    saving,
  };
};

export default useConfigPagosPage;
