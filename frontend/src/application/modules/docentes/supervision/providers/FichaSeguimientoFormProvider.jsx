/**
 * Provider: registrar/editar ficha de seguimiento en clase (DOC ·
 * Supervisión docente).
 *
 * Provider DELGADO: ensambla la ficha (solo edición, S2), las mutaciones
 * (S3/S4) y el catálogo de cursos reutilizado (asignaciones docentes
 * vigentes, con degradación por permiso). La orquestación (precarga, submit)
 * vive en `useFichaSeguimientoFormPage`.
 */

import { useEffect, useMemo } from 'react';
import { useGetFichaSeguimiento } from '@application-docentes/supervision/hooks/api/useGetFichaSeguimiento';
import { useFichaSeguimientoMutations } from '@application-docentes/supervision/hooks/api/useFichaSeguimientoMutations';
import { useAsignacionesCatalogoDocApi } from '@application-docentes/supervision/hooks/api/useAsignacionesCatalogoDocApi';
import { FichaSeguimientoFormContext } from '@application-docentes/supervision/context/FichaSeguimientoFormContext';

export const FichaSeguimientoFormProvider = ({ children, fichaId = null }) => {
  const { ficha, loading: loadingFicha, error: errorFicha, cargar } = useGetFichaSeguimiento();
  const { saving, guardarFicha } = useFichaSeguimientoMutations();
  const asignacionesCatalogo = useAsignacionesCatalogoDocApi();

  const id = fichaId != null ? Number(fichaId) : null;
  const idValido = id != null && Number.isFinite(id) && id > 0;

  // Solo el modo edición precarga la ficha.
  useEffect(() => {
    if (idValido) {
      cargar(id);
    }
  }, [idValido, id, cargar]);

  const value = useMemo(
    () => ({
      fichaId: idValido ? id : null,
      ficha,
      loadingFicha: idValido ? loadingFicha : false,
      errorFicha,
      saving,
      guardarFicha,
      asignacionOptions: asignacionesCatalogo.options,
      loadingAsignaciones: asignacionesCatalogo.loading,
      asignacionesDisponible: asignacionesCatalogo.disponible,
    }),
    [idValido, id, ficha, loadingFicha, errorFicha, saving, guardarFicha, asignacionesCatalogo],
  );

  return (
    <FichaSeguimientoFormContext.Provider value={value}>
      {children}
    </FichaSeguimientoFormContext.Provider>
  );
};
