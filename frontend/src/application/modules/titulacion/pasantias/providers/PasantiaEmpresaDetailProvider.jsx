/**
 * Provider: ficha de una empresa del catálogo de pasantías (TIT · DETALLE).
 *
 * Provider DELGADO: carga la ficha (P20) al montar; la orquestación de
 * pantalla (breadcrumbs, volver, editar, eliminar) vive en
 * `usePasantiaEmpresaDetailPage`.
 */

import { useEffect, useMemo } from 'react';
import { useGetPasantiaEmpresa } from '@application-titulacion/pasantias/hooks/api/useGetPasantiaEmpresa';
import { PasantiaEmpresaDetailContext } from '@application-titulacion/pasantias/context/PasantiaEmpresaDetailContext';

export const PasantiaEmpresaDetailProvider = ({ children, empresaId }) => {
  const { empresa, loading, error, cargar } = useGetPasantiaEmpresa();

  const id = Number(empresaId);
  const idValido = Number.isFinite(id) && id > 0;

  useEffect(() => {
    if (!idValido) return;
    cargar(id);
  }, [idValido, id, cargar]);

  const refetch = useMemo(() => (idValido ? () => cargar(id) : async () => ({ success: false })), [
    idValido,
    id,
    cargar,
  ]);

  const value = useMemo(
    () => ({
      empresaId: idValido ? id : null,
      empresa,
      loading,
      error: idValido ? error : 'Identificador de empresa inválido',
      refetch,
    }),
    [idValido, id, empresa, loading, error, refetch],
  );

  return (
    <PasantiaEmpresaDetailContext.Provider value={value}>
      {children}
    </PasantiaEmpresaDetailContext.Provider>
  );
};
