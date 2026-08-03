/**
 * Provider: ficha-hub de un proyecto de grado (TIT · Titulación).
 *
 * Ensambla los CUATRO datasets de la ficha (T6 proyecto, T14 bitácora, T18
 * avances, T22 dictámenes) con carga en paralelo al montar, más las
 * mutaciones de cabecera (tutor/transiciones/integrantes), de bitácora y la
 * exportación del formulario de modalidad de graduación FMDG-1 (Requisito 1,
 * extensión 2026-07-31). La orquestación de pantalla (tabs, modales,
 * feedback) vive en `useProyectoGradoDetailPage`. Provider DELGADO: solo
 * ensambla.
 *
 * El acta de defensa (extensión 2026-08-01, más anulación P8 del 2026-08-02)
 * se instancia aquí pero NO se carga en el efecto de montaje: es la única tab
 * de carga LAZY de la ficha (se dispara desde `useProyectoGradoDetailPage` al
 * abrir la tab por primera vez), por eso queda fuera del `Promise.all` de
 * `cargar`/`refetch`.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useGetProyectoGrado } from '@application-titulacion/proyectos-grado/hooks/api/useGetProyectoGrado';
import { useProyectoGradoMutations } from '@application-titulacion/proyectos-grado/hooks/api/useProyectoGradoMutations';
import { useBitacoraProyectoApi } from '@application-titulacion/proyectos-grado/hooks/api/useBitacoraProyectoApi';
import { useAvancesProyectoApi } from '@application-titulacion/proyectos-grado/hooks/api/useAvancesProyectoApi';
import { useDictamenesProyectoApi } from '@application-titulacion/proyectos-grado/hooks/api/useDictamenesProyectoApi';
import { useDocentesCatalogoTitApi } from '@application-titulacion/proyectos-grado/hooks/api/useDocentesCatalogoTitApi';
import { useExportFormularioModalidadPdf } from '@application-titulacion/proyectos-grado/hooks/api/useExportFormularioModalidadPdf';
import { useActaDefensaApi } from '@application-titulacion/proyectos-grado/hooks/api/useActaDefensaApi';
import { useRegistrarActaDefensa } from '@application-titulacion/proyectos-grado/hooks/api/useRegistrarActaDefensa';
import { useExportActaDefensaPdf } from '@application-titulacion/proyectos-grado/hooks/api/useExportActaDefensaPdf';
import { useAnularActaDefensa } from '@application-titulacion/proyectos-grado/hooks/api/useAnularActaDefensa';
import { ProyectoGradoDetailContext } from '@application-titulacion/proyectos-grado/context/ProyectoGradoDetailContext';

export const ProyectoGradoDetailProvider = ({ children, proyectoId }) => {
  const { proyecto, loading, error, cargar } = useGetProyectoGrado();
  const mutations = useProyectoGradoMutations();
  const bitacora = useBitacoraProyectoApi();
  const avances = useAvancesProyectoApi();
  const dictamenes = useDictamenesProyectoApi();
  const docentesCatalogo = useDocentesCatalogoTitApi();
  const formularioModalidad = useExportFormularioModalidadPdf();
  const actaDefensa = useActaDefensaApi();
  const registrarActaDefensa = useRegistrarActaDefensa();
  const exportActaDefensaPdf = useExportActaDefensaPdf();
  const anularActaDefensa = useAnularActaDefensa();

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
      formularioModalidad,
      actaDefensa,
      registrarActaDefensa,
      exportActaDefensaPdf,
      anularActaDefensa,
    }),
    [
      idValido,
      id,
      proyecto,
      loading,
      error,
      refetch,
      mutations,
      bitacora,
      avances,
      dictamenes,
      docentesCatalogo,
      formularioModalidad,
      actaDefensa,
      registrarActaDefensa,
      exportActaDefensaPdf,
      anularActaDefensa,
    ],
  );

  return (
    <ProyectoGradoDetailContext.Provider value={value}>
      {children}
    </ProyectoGradoDetailContext.Provider>
  );
};
