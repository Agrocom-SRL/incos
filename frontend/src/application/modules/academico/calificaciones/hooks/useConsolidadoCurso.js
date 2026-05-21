/**
 * Registro académico de notas — datos desde GET asignaciones/:id/notas.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCasesFactory } from '@container';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { MIS_CURSOS_PATH } from '../utils/calificacionesPaths.js';
import { useCalificacionesVistaContext } from './useCalificacionesVistaContext.js';

const BIMESTRE_TITULOS = [
  'Primer bimestre',
  'Segundo bimestre',
  'Tercer bimestre',
  'Cuarto bimestre',
];

export const useConsolidadoCurso = () => {
  const { asignacionId } = useParams();
  const { esVistaCoordinacion } = useCalificacionesVistaContext();

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
      setBimestresCalendario(
        Array.isArray(data.bimestresCalendario) ? data.bimestresCalendario : [],
      );
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
    () => createBreadcrumbItems('ACA-CAL-NOTAS', 'ACA-CAL', curso?.materia ?? null),
    [curso?.materia],
  );

  const subtituloCurso = curso
    ? [
        curso.carrera,
        curso.periodo ? `Régimen ${curso.periodo}` : null,
        curso.paralelo ? `Paralelo ${curso.paralelo}` : null,
        curso.turno,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  const profileStats = useMemo(
    () => [
      { label: 'Gestión', value: docente?.gestionVigente ?? '—' },
      { label: 'Paralelo', value: curso?.paralelo ?? '—' },
      { label: 'Estudiantes', value: String(curso?.estudiantes ?? estudiantes.length) },
      { label: 'Turno', value: curso?.turno ?? '—' },
    ],
    [curso, docente, estudiantes.length],
  );

  const bimestresEditables = useMemo(() => {
    const map = new Map(
      (bimestresCalendario ?? []).map((b) => [Number(b.numero), Boolean(b.editable)]),
    );
    return BIMESTRE_TITULOS.map((_, i) => map.get(i + 1) ?? false);
  }, [bimestresCalendario]);

  return {
    curso,
    docente,
    estudiantes,
    bimestreTitulos: BIMESTRE_TITULOS,
    bimestresEditables,
    bimestreVigente,
    notaMinimaAprobacion,
    profileStats,
    subtituloCurso,
    isLoading,
    error,
    refetch: cargar,
    breadcrumbItems,
    volverPath: MIS_CURSOS_PATH,
    asignacionId,
    esVistaCoordinacion,
  };
};
