/**
 * Provider: alta/edición de una empresa del catálogo de pasantías (TUT).
 *
 * Provider DELGADO: el catálogo no expone `GET /empresas/:id`, así que en
 * edición la empresa se resuelve del LISTADO completo (P7,
 * `incluirInactivos: true` — universo pequeño de catálogo). Publica las
 * mutaciones P8/P9; la orquestación vive en `usePasantiaEmpresaFormPage`.
 */

import { useMemo } from 'react';
import { usePasantiasEmpresasApi } from '@application-titulacion/pasantias/hooks/api/usePasantiasEmpresasApi';
import { usePasantiaEmpresaMutations } from '@application-titulacion/pasantias/hooks/api/usePasantiaEmpresaMutations';
import { PasantiaEmpresaFormContext } from '@application-titulacion/pasantias/context/PasantiaEmpresaFormContext';

export const PasantiaEmpresaFormProvider = ({ children, empresaId = null }) => {
  const id = empresaId != null ? Number(empresaId) : null;
  const idValido = id != null && Number.isFinite(id) && id > 0;

  const { empresas, loading: loadingEmpresas, error: errorEmpresas } = usePasantiasEmpresasApi({
    incluirInactivos: true,
  });
  const { saving, guardarEmpresa } = usePasantiaEmpresaMutations();

  /** Empresa a editar, resuelta del catálogo (null mientras carga o en alta). */
  const empresa = useMemo(
    () => (idValido ? (empresas.find((e) => e.id === id) ?? null) : null),
    [idValido, id, empresas],
  );

  const value = useMemo(
    () => ({
      empresaId: idValido ? id : null,
      empresa,
      loadingEmpresa: idValido ? loadingEmpresas : false,
      errorEmpresa: idValido ? errorEmpresas : null,
      saving,
      guardarEmpresa,
    }),
    [idValido, id, empresa, loadingEmpresas, errorEmpresas, saving, guardarEmpresa],
  );

  return (
    <PasantiaEmpresaFormContext.Provider value={value}>
      {children}
    </PasantiaEmpresaFormContext.Provider>
  );
};
