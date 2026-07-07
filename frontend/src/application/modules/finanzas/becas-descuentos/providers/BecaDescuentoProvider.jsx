/**
 * Provider: catálogo maestro Becas y descuentos (Finanzas). Provider DELGADO
 * (espejo de `ConfigPagosProvider`): ensambla la lectura del catálogo y las
 * mutaciones, y publica su contrato. Se monta por pantalla (tab embebido en
 * "Config. de pagos" y páginas de alta/edición/detalle), cada una con su
 * propia instancia (catálogo corto, sin estado compartido entre rutas).
 */

import { useMemo } from 'react';
import { useBecaDescuentoCatalogApi } from '@application-finanzas/becas-descuentos/hooks/api/useBecaDescuentoCatalogApi';
import { useBecaDescuentoMutations } from '@application-finanzas/becas-descuentos/hooks/api/useBecaDescuentoMutations';
import { BecaDescuentoContext } from '@application-finanzas/becas-descuentos/context/BecaDescuentoContext';

export const BecaDescuentoProvider = ({ children }) => {
  const catalogo = useBecaDescuentoCatalogApi();
  const mutaciones = useBecaDescuentoMutations();

  const value = useMemo(
    () => ({
      becasDescuentos: catalogo.becasDescuentos,
      loading: catalogo.loading,
      error: catalogo.error,
      refetch: catalogo.refetch,
      saving: mutaciones.saving,
      crear: mutaciones.crear,
      actualizar: mutaciones.actualizar,
      eliminar: mutaciones.eliminar,
    }),
    [catalogo, mutaciones],
  );

  return <BecaDescuentoContext.Provider value={value}>{children}</BecaDescuentoContext.Provider>;
};

export default BecaDescuentoProvider;
