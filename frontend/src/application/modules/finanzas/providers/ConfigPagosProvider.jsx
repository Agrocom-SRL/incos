/**
 * Provider: configuración de pagos (Finanzas).
 *
 * Provider DELGADO (espejo de `PagosRegistrarProvider`): ensambla las lecturas
 * — gestión vigente (catálogo compartido), las 4 entidades de configuración — y
 * las mutaciones, y publica su contrato. La orquestación de pantalla (handlers de
 * guardado por sección, estado de modales, feedback + refetch) vive en
 * `useConfigPagosPage` (hooks/state), no aquí.
 */

import { useMemo } from 'react';
import { useGestionesCatalogApi } from '@application-shared/hooks';
import { useConfigPagosCatalogsApi } from '@application-finanzas/hooks/api/useConfigPagosCatalogsApi';
import { useConfigPagosMutations } from '@application-finanzas/hooks/api/useConfigPagosMutations';
import { ConfigPagosContext } from '@application-finanzas/context/ConfigPagosContext';

export const ConfigPagosProvider = ({ children }) => {
  // El catálogo compartido ya filtra `vigente: 1`: el primero es la gestión vigente.
  const { gestiones } = useGestionesCatalogApi();
  const gestionVigente = useMemo(() => {
    const list = Array.isArray(gestiones) ? gestiones : [];
    return list.find((g) => g.vigente) ?? list[0] ?? null;
  }, [gestiones]);

  const catalogos = useConfigPagosCatalogsApi(gestionVigente);
  const mutaciones = useConfigPagosMutations();

  const value = useMemo(
    () => ({
      // Contexto de gestión
      gestionVigente,
      // Lecturas (4 entidades)
      aportes: catalogos.aportes,
      aporteVigente: catalogos.aporteVigente,
      metodos: catalogos.metodos,
      bancos: catalogos.bancos,
      cuentas: catalogos.cuentas,
      loading: catalogos.loading,
      error: catalogos.error,
      refetch: catalogos.refetch,
      // Mutaciones
      saving: mutaciones.saving,
      guardarConfiguracionAporte: mutaciones.guardarConfiguracionAporte,
      actualizarMetodoPago: mutaciones.actualizarMetodoPago,
      guardarBanco: mutaciones.guardarBanco,
      guardarCuenta: mutaciones.guardarCuenta,
    }),
    [gestionVigente, catalogos, mutaciones],
  );

  return <ConfigPagosContext.Provider value={value}>{children}</ConfigPagosContext.Provider>;
};

export default ConfigPagosProvider;
