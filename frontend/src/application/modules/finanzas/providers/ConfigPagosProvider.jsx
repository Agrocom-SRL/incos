/**
 * Provider: configuración de pagos (Finanzas).
 *
 * Provider DELGADO (espejo de `PagosRegistrarProvider`): ensambla las lecturas
 * de las 3 entidades de configuración (métodos, bancos, cuentas) y las
 * mutaciones, y publica su contrato. La orquestación de pantalla (handlers de
 * guardado por sección, estado de modales, feedback + refetch) vive en
 * `useConfigPagosPage` (hooks/state), no aquí.
 *
 * El aporte de la gestión vigente se movió a su propia página
 * `/finanzas/aportes` (permiso `finanzas.aporte`, `AporteProvider`).
 */

import { useMemo } from 'react';
import { useConfigPagosCatalogsApi } from '@application-finanzas/hooks/api/useConfigPagosCatalogsApi';
import { useConfigPagosMutations } from '@application-finanzas/hooks/api/useConfigPagosMutations';
import { ConfigPagosContext } from '@application-finanzas/context/ConfigPagosContext';

export const ConfigPagosProvider = ({ children }) => {
  const catalogos = useConfigPagosCatalogsApi();
  const mutaciones = useConfigPagosMutations();

  const value = useMemo(
    () => ({
      // Lecturas (3 entidades)
      metodos: catalogos.metodos,
      bancos: catalogos.bancos,
      cuentas: catalogos.cuentas,
      loading: catalogos.loading,
      error: catalogos.error,
      refetch: catalogos.refetch,
      // Mutaciones
      saving: mutaciones.saving,
      actualizarMetodoPago: mutaciones.actualizarMetodoPago,
      guardarBanco: mutaciones.guardarBanco,
      guardarCuenta: mutaciones.guardarCuenta,
    }),
    [catalogos, mutaciones],
  );

  return <ConfigPagosContext.Provider value={value}>{children}</ConfigPagosContext.Provider>;
};

export default ConfigPagosProvider;
