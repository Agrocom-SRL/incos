/**
 * Provider: ficha de una sesión de reforzamiento (TUT · Acompañamiento).
 *
 * Espejo de `CursoCapacitacionDetailProvider`: ensambla el hook de API
 * (A5, auto-fetch por id) y las mutaciones (A7 editar, A9 registro batch de
 * asistencia). La orquestación (edición inline de asistencia, feedback) vive
 * en `useSesionReforzamientoDetailPage`.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useGetSesionReforzamiento } from '@application-tutorias/acompanamiento/sesiones/hooks/api/useGetSesionReforzamiento';
import { useSesionReforzamientoMutations } from '@application-tutorias/acompanamiento/sesiones/hooks/api/useSesionReforzamientoMutations';
import { SesionReforzamientoDetailContext } from '@application-tutorias/acompanamiento/sesiones/context/SesionReforzamientoDetailContext';

export const SesionReforzamientoDetailProvider = ({ children, sesionId }) => {
  const { sesion, loading, error, cargar } = useGetSesionReforzamiento();
  const { saving, registrarParticipantes, guardarSesion } = useSesionReforzamientoMutations();

  const id = Number(sesionId);
  const idValido = Number.isFinite(id) && id > 0;

  useEffect(() => {
    if (idValido) {
      cargar(id);
    }
  }, [idValido, id, cargar]);

  const refetch = useCallback(() => {
    if (idValido) return cargar(id);
    return Promise.resolve({ success: false });
  }, [idValido, id, cargar]);

  const value = useMemo(
    () => ({
      sesionId: idValido ? id : null,
      sesion,
      loading,
      error: idValido ? error : 'Identificador de sesión inválido',
      refetch,
      saving,
      registrarParticipantes,
      guardarSesion,
    }),
    [idValido, id, sesion, loading, error, refetch, saving, registrarParticipantes, guardarSesion],
  );

  return (
    <SesionReforzamientoDetailContext.Provider value={value}>
      {children}
    </SesionReforzamientoDetailContext.Provider>
  );
};
