/**
 * Provider: ficha-hub de un proyecto de grado (TUT · Titulación).
 *
 * Ensambla los CUATRO datasets de la ficha (T6 proyecto, T14 bitácora, T18
 * avances, T22 dictámenes) con carga en paralelo al montar, más las
 * mutaciones de cabecera (tutor/transiciones/integrantes) y de bitácora.
 * La orquestación de pantalla (tabs, modales, feedback) vive en
 * `useProyectoGradoDetailPage`. Provider DELGADO: solo ensambla.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useGetProyectoGrado } from '@application-titulacion/proyectos-grado/hooks/api/useGetProyectoGrado';
import { useProyectoGradoMutations } from '@application-titulacion/proyectos-grado/hooks/api/useProyectoGradoMutations';
import { useBitacoraProyectoApi } from '@application-titulacion/proyectos-grado/hooks/api/useBitacoraProyectoApi';
import { useAvancesProyectoApi } from '@application-titulacion/proyectos-grado/hooks/api/useAvancesProyectoApi';
import { useDictamenesProyectoApi } from '@application-titulacion/proyectos-grado/hooks/api/useDictamenesProyectoApi';
import { useDocentesCatalogoTutApi } from '@application-titulacion/proyectos-grado/hooks/api/useDocentesCatalogoTutApi';
import { ProyectoGradoDetailContext } from '@application-titulacion/proyectos-grado/context/ProyectoGradoDetailContext';

export const ProyectoGradoDetailProvider = ({ children, proyectoId }) => {
  const { proyecto, loading, error, cargar } = useGetProyectoGrado();
  const mutations = useProyectoGradoMutations();
  const bitacora = useBitacoraProyectoApi();
  const avances = useAvancesProyectoApi();
  const dictamenes = useDictamenesProyectoApi();
  const docentesCatalogo = useDocentesCatalogoTutApi();

  const id = Number(proyectoId);
  const idValido = Number.isFinite(id) && id > 0;

  const { cargar: cargarBitacora } = bitacora;
  const { cargar: cargarAvances } = avances;
  const { cargar: cargarDictamenes } = dictamenes;

  useEffect(() => {
    if (!idValido) return;
    cargar(id);
    cargarBitacora(id);
    cargarAvances(id);
    cargarDictamenes(id);
  }, [idValido, id, cargar, cargarBitacora, cargarAvances, cargarDictamenes]);

  /** Recarga la ficha completa (cabecera + los tres satélites). */
  const refetch = useCallback(async () => {
    if (!idValido) return { success: false };
    const [ficha] = await Promise.all([
      cargar(id),
      cargarBitacora(id),
      cargarAvances(id),
      cargarDictamenes(id),
    ]);
    return ficha;
  }, [idValido, id, cargar, cargarBitacora, cargarAvances, cargarDictamenes]);

  const value = useMemo(
    () => ({
      proyectoId: idValido ? id : null,
      proyecto,
      loading,
      error: idValido ? error : 'Identificador de proyecto inválido',
      refetch,
      mutations,
      bitacora,
      avances,
      dictamenes,
      docentesCatalogo,
    }),
    [idValido, id, proyecto, loading, error, refetch, mutations, bitacora, avances, dictamenes, docentesCatalogo],
  );

  return (
    <ProyectoGradoDetailContext.Provider value={value}>
      {children}
    </ProyectoGradoDetailContext.Provider>
  );
};
