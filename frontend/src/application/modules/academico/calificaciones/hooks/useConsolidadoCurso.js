/**
 * Registro académico de notas — datos desde GET asignaciones/:id/notas.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCasesFactory } from '@container';
import { createCalificacionesBreadcrumbItems } from '../utils/calificacionesBreadcrumbs.js';
import { MIS_CURSOS_PATH } from '../utils/calificacionesPaths.js';
import { BIMESTRE_TITULOS } from '../utils/bimestreTitulos.js';
import { mapBimestresCalendario } from '../utils/bimestrePlazoUtils.js';

export const useConsolidadoCurso = () => {
  const { asignacionId } = useParams();

  const [curso, setCurso] = useState(null);
  const [docente, setDocente] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [bimestresCalendario, setBimestresCalendario] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const uc = useCasesFactory.obtenerRegistroNotasCurso();
      const result = await uc.ejecutar(asignacionId);

      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el registro de notas');
      }

      const data = result.data ?? {};
      setDocente(data.docente ?? null);
      setCurso(data.curso ?? null);
      setEstudiantes(Array.isArray(data.estudiantes) ? data.estudiantes : []);
      setBimestresCalendario(mapBimestresCalendario(data.bimestresCalendario));
    } catch (err) {
      setError(err?.message || err);
      setCurso(null);
      setDocente(null);
      setEstudiantes([]);
    } finally {
      setIsLoading(false);
    }
  }, [asignacionId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const bimestreVigente = Number(docente?.bimestreVigente) || 1;
  const notaMinimaAprobacion = Number(docente?.notaMinimaAprobacion) || 61;

  const breadcrumbItems = useMemo(
    () =>
      createCalificacionesBreadcrumbItems('ACA-CAL-NOTAS', 'ACA-CAL', curso?.materia ?? null, {
        asignacionId,
      }),
    [curso?.materia, asignacionId],
  );

  return {
    curso,
    docente,
    estudiantes,
    bimestreTitulos: BIMESTRE_TITULOS,
    bimestresCalendario,
    bimestreVigente,
    notaMinimaAprobacion,
    subtituloCurso: curso?.carrera ?? '',
    isLoading,
    error,
    refetch: cargar,
    breadcrumbItems,
    volverPath: MIS_CURSOS_PATH,
    asignacionId,
  };
};
