/**
 * Provider: ficha de un curso de capacitación (CAP).
 *
 * Espejo de `PagosDetailProvider`: provider DELGADO que ensambla el hook de API
 * (auto-fetch por id) y publica el contrato de la ficha. La orquestación de
 * pantalla (breadcrumbs, tabs, handlers) vive en `useCursoCapacitacionDetailPage`.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useGetCursoCapacitacion } from '@application-capacitacion/cursos/hooks/api/useGetCursoCapacitacion';
import { CursoCapacitacionDetailContext } from '@application-capacitacion/cursos/context/CursoCapacitacionDetailContext';

export const CursoCapacitacionDetailProvider = ({ children, cursoId }) => {
  const { curso, loading, error, cargar } = useGetCursoCapacitacion();

  const id = Number(cursoId);
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
      cursoId: idValido ? id : null,
      curso,
      loading,
      error: idValido ? error : 'Identificador de curso inválido',
      refetch,
    }),
    [idValido, id, curso, loading, error, refetch],
  );

  return (
    <CursoCapacitacionDetailContext.Provider value={value}>
      {children}
    </CursoCapacitacionDetailContext.Provider>
  );
};
