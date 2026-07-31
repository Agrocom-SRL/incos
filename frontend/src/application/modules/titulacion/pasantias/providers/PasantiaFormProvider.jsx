/**
 * Provider: alta/edición de un trámite de pasantía (TUT · Pasantías).
 *
 * Provider DELGADO (espejo de `ProyectoGradoFormProvider`): ensambla la ficha
 * (solo edición, para precargar el formulario), las mutaciones (P3/P4) y los
 * catálogos reutilizados del plan — empresas activas (P7), carreras y
 * docentes (con degradación si el rol no tiene el permiso del catálogo).
 * La orquestación del formulario vive en `usePasantiaFormPage`.
 */

import { useEffect, useMemo } from 'react';
import { useGetPasantia } from '@application-titulacion/pasantias/hooks/api/useGetPasantia';
import { usePasantiaMutations } from '@application-titulacion/pasantias/hooks/api/usePasantiaMutations';
import { usePasantiasEmpresasApi } from '@application-titulacion/pasantias/hooks/api/usePasantiasEmpresasApi';
import { useCarrerasCatalogoTutApi } from '@application-titulacion/proyectos-grado/hooks/api/useCarrerasCatalogoTutApi';
import { useDocentesCatalogoTutApi } from '@application-titulacion/proyectos-grado/hooks/api/useDocentesCatalogoTutApi';
import { PasantiaFormContext } from '@application-titulacion/pasantias/context/PasantiaFormContext';

export const PasantiaFormProvider = ({ children, pasantiaId = null }) => {
  const { pasantia, loading: loadingPasantia, error: errorPasantia, cargar } = useGetPasantia();
  const { saving, guardarPasantia } = usePasantiaMutations();
  const empresasCatalogo = usePasantiasEmpresasApi();
  const carrerasCatalogo = useCarrerasCatalogoTutApi();
  const docentesCatalogo = useDocentesCatalogoTutApi();

  const id = pasantiaId != null ? Number(pasantiaId) : null;
  const idValido = id != null && Number.isFinite(id) && id > 0;

  // Solo el modo edición precarga la ficha.
  useEffect(() => {
    if (idValido) {
      cargar(id);
    }
  }, [idValido, id, cargar]);

  const value = useMemo(
    () => ({
      pasantiaId: idValido ? id : null,
      pasantia,
      loadingPasantia: idValido ? loadingPasantia : false,
      errorPasantia,
      saving,
      guardarPasantia,
      // Catálogos
      empresaOptions: empresasCatalogo.options,
      loadingEmpresas: empresasCatalogo.loading,
      carreras: carrerasCatalogo.carreras,
      loadingCarreras: carrerasCatalogo.loading,
      carrerasDisponible: carrerasCatalogo.disponible,
      docentes: docentesCatalogo.docentes,
      loadingDocentes: docentesCatalogo.loading,
      docentesDisponible: docentesCatalogo.disponible,
    }),
    [
      idValido,
      id,
      pasantia,
      loadingPasantia,
      errorPasantia,
      saving,
      guardarPasantia,
      empresasCatalogo,
      carrerasCatalogo,
      docentesCatalogo,
    ],
  );

  return <PasantiaFormContext.Provider value={value}>{children}</PasantiaFormContext.Provider>;
};
