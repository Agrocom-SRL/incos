/**
 * Provider: ficha-hub de un trámite de pasantía (TUT · Pasantías).
 *
 * Ensambla los TRES datasets de la ficha (P2 trámite, P11 informes, P15
 * seguimientos) con carga en paralelo al montar, más las mutaciones de
 * cabecera (transición de estado P6) y de los satélites (informes P12/P13,
 * seguimientos P16/P17). La orquestación de pantalla (tabs, modales,
 * feedback) vive en `usePasantiaDetailPage`. Provider DELGADO: solo ensambla.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useGetPasantia } from '@application-tutorias/pasantias/hooks/api/useGetPasantia';
import { usePasantiaMutations } from '@application-tutorias/pasantias/hooks/api/usePasantiaMutations';
import { useInformesPasantiaApi } from '@application-tutorias/pasantias/hooks/api/useInformesPasantiaApi';
import { useSeguimientosPasantiaApi } from '@application-tutorias/pasantias/hooks/api/useSeguimientosPasantiaApi';
import { PasantiaDetailContext } from '@application-tutorias/pasantias/context/PasantiaDetailContext';

export const PasantiaDetailProvider = ({ children, pasantiaId }) => {
  const { pasantia, loading, error, cargar } = useGetPasantia();
  const mutations = usePasantiaMutations();
  const informes = useInformesPasantiaApi();
  const seguimientos = useSeguimientosPasantiaApi();

  const id = Number(pasantiaId);
  const idValido = Number.isFinite(id) && id > 0;

  const { cargar: cargarInformes } = informes;
  const { cargar: cargarSeguimientos } = seguimientos;

  useEffect(() => {
    if (!idValido) return;
    cargar(id);
    cargarInformes(id);
    cargarSeguimientos(id);
  }, [idValido, id, cargar, cargarInformes, cargarSeguimientos]);

  /** Recarga la ficha completa (cabecera + los dos satélites). */
  const refetch = useCallback(async () => {
    if (!idValido) return { success: false };
    const [ficha] = await Promise.all([cargar(id), cargarInformes(id), cargarSeguimientos(id)]);
    return ficha;
  }, [idValido, id, cargar, cargarInformes, cargarSeguimientos]);

  const value = useMemo(
    () => ({
      pasantiaId: idValido ? id : null,
      pasantia,
      loading,
      error: idValido ? error : 'Identificador de trámite inválido',
      refetch,
      mutations,
      informes,
      seguimientos,
    }),
    [idValido, id, pasantia, loading, error, refetch, mutations, informes, seguimientos],
  );

  return <PasantiaDetailContext.Provider value={value}>{children}</PasantiaDetailContext.Provider>;
};
