/**
 * Provider: ficha de una sesión de refuerzo (ACA · Acompañamiento).
 *
 * Espejo de `CursoCapacitacionDetailProvider`: ensambla el hook de API
 * (A5, auto-fetch por id) y las mutaciones (A7 editar, A9 registro batch de
 * asistencia). La orquestación (edición inline de asistencia, feedback) vive
 * en `useSesionRefuerzoDetailPage`.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useGetSesionRefuerzo } from '@application-academico/acompanamiento/sesiones/hooks/api/useGetSesionRefuerzo';
import { useSesionRefuerzoMutations } from '@application-academico/acompanamiento/sesiones/hooks/api/useSesionRefuerzoMutations';
import { SesionRefuerzoDetailContext } from '@application-academico/acompanamiento/sesiones/context/SesionRefuerzoDetailContext';

export const SesionRefuerzoDetailProvider = ({ children, sesionId }) => {
  const { sesion, loading, error, cargar } = useGetSesionRefuerzo();
  const { saving, registrarEstudiantes, guardarSesion } = useSesionRefuerzoMutations();

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
      registrarEstudiantes,
      guardarSesion,
    }),
    [idValido, id, sesion, loading, error, refetch, saving, registrarEstudiantes, guardarSesion],
  );

  return (
    <SesionRefuerzoDetailContext.Provider value={value}>
      {children}
    </SesionRefuerzoDetailContext.Provider>
  );
};
