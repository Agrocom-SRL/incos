/**
 * Provider: catálogo de empresas de pasantía (TUT · Pasantías).
 *
 * ABM de catálogo (patrón catálogos de Configuración): lista con
 * `incluirInactivos: true` (administra el toggle de estado P10) + mutación de
 * estado. Provider DELGADO: solo ensambla; el feedback y las columnas viven
 * en `usePasantiasEmpresasListPage`.
 */

import { useMemo } from 'react';
import { usePasantiasEmpresasApi } from '@application-tutorias/pasantias/hooks/api/usePasantiasEmpresasApi';
import { usePasantiaEmpresaMutations } from '@application-tutorias/pasantias/hooks/api/usePasantiaEmpresaMutations';
import { PasantiasEmpresasListContext } from '@application-tutorias/pasantias/context/PasantiasEmpresasListContext';

export const PasantiasEmpresasListProvider = ({ children }) => {
  const { empresas, loading, error, refetch } = usePasantiasEmpresasApi({
    incluirInactivos: true,
  });
  const { cambiarEstadoEmpresa } = usePasantiaEmpresaMutations();

  const value = useMemo(
    () => ({ empresas, loading, error, refetch, cambiarEstadoEmpresa }),
    [empresas, loading, error, refetch, cambiarEstadoEmpresa],
  );

  return (
    <PasantiasEmpresasListContext.Provider value={value}>
      {children}
    </PasantiasEmpresasListContext.Provider>
  );
};
