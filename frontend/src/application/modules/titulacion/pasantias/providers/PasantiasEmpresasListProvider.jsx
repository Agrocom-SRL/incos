/**
 * Provider: catálogo de empresas de pasantía (TIT · Pasantías).
 *
 * ABM de catálogo (patrón catálogos de Configuración): lista con
 * `incluirInactivos: true` (administra el toggle de estado P10) + mutaciones
 * de estado y eliminación (P21). Provider DELGADO: solo ensambla; el feedback
 * y las columnas viven en `usePasantiasEmpresasListPage`.
 */

import { useMemo } from 'react';
import { usePasantiasEmpresasApi } from '@application-titulacion/pasantias/hooks/api/usePasantiasEmpresasApi';
import { usePasantiaEmpresaMutations } from '@application-titulacion/pasantias/hooks/api/usePasantiaEmpresaMutations';
import { PasantiasEmpresasListContext } from '@application-titulacion/pasantias/context/PasantiasEmpresasListContext';

export const PasantiasEmpresasListProvider = ({ children }) => {
  const { empresas, loading, error, refetch } = usePasantiasEmpresasApi({
    incluirInactivos: true,
  });
  const { cambiarEstadoEmpresa, eliminarEmpresa } = usePasantiaEmpresaMutations();

  const value = useMemo(
    () => ({ empresas, loading, error, refetch, cambiarEstadoEmpresa, eliminarEmpresa }),
    [empresas, loading, error, refetch, cambiarEstadoEmpresa, eliminarEmpresa],
  );

  return (
    <PasantiasEmpresasListContext.Provider value={value}>
      {children}
    </PasantiasEmpresasListContext.Provider>
  );
};
