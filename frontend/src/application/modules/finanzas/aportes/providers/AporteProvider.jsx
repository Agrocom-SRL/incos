/**
 * Provider: Aporte de la gestión vigente (Finanzas).
 *
 * Provider DELGADO (espejo de `ConfigPagosProvider`): resuelve la gestión
 * vigente (catálogo compartido), ensambla la lectura del aporte y la
 * mutación UPSERT, y publica su contrato. La orquestación de pantalla
 * (breadcrumbs, feedback + refetch) vive en `useAportePage` (hooks/state),
 * no aquí.
 */

import { useMemo } from 'react';
import { useGestionesCatalogApi } from '@application-shared/hooks';
import { useAporteCatalogApi } from '@application-finanzas/aportes/hooks/api/useAporteCatalogApi';
import { useAporteMutations } from '@application-finanzas/aportes/hooks/api/useAporteMutations';
import { AporteContext } from '@application-finanzas/aportes/context/AporteContext';

export const AporteProvider = ({ children }) => {
  // El catálogo compartido ya filtra `vigente: 1`: el primero es la gestión vigente.
  const { gestiones } = useGestionesCatalogApi();
  const gestionVigente = useMemo(() => {
    const list = Array.isArray(gestiones) ? gestiones : [];
    return list.find((g) => g.vigente) ?? list[0] ?? null;
  }, [gestiones]);

  const catalogo = useAporteCatalogApi(gestionVigente);
  const mutaciones = useAporteMutations();

  const value = useMemo(
    () => ({
      gestionVigente,
      aporteVigente: catalogo.aporteVigente,
      loading: catalogo.loading,
      error: catalogo.error,
      refetch: catalogo.refetch,
      saving: mutaciones.saving,
      guardarConfiguracionAporte: mutaciones.guardarConfiguracionAporte,
    }),
    [gestionVigente, catalogo, mutaciones],
  );

  return <AporteContext.Provider value={value}>{children}</AporteContext.Provider>;
};

export default AporteProvider;
