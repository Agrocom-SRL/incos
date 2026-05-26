/**
 * Bimestre cerrado — resumen por componente (suma de evaluaciones con 0 si falta nota).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCasesFactory } from '@container';
import CalificacionRepository from '@infrastructure/repositories/CalificacionRepository.js';
import { createCalificacionesBreadcrumbItems } from '../utils/calificacionesBreadcrumbs.js';
import { tituloBimestre } from '../utils/bimestreTitulos.js';
import { MIS_CURSOS_PATH, notasCursoPath } from '../utils/calificacionesPaths.js';
import { useCalificacionesVistaContext } from './useCalificacionesVistaContext.js';

const mapEstudiantesRegistro = (filas = []) =>
  filas.map((e, index) => ({
    id: e.id,
    nro: e.nro ?? index + 1,
    codigo: e.codigo ?? '',
    nombre: e.nombre ?? '',
  }));

export const useBimestreConsolidado = () => {
  const { asignacionId, n: bimestreRuta } = useParams();
  const navigate = useNavigate();
  const { docenteIdCoordinacion, esVistaCoordinacion } = useCalificacionesVistaContext();

  const [base, setBase] = useState(null);
  const [consolidado, setConsolidado] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const bimestreNum = useMemo(() => {
    const n = Number(bimestreRuta);
    return n >= 1 && n <= 4 ? n : null;
  }, [bimestreRuta]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setIsLoading(true);
      setError(null);
      setBase(null);
      setConsolidado(null);
      try {
        const ucCursos = useCasesFactory.listarMisCursosCalificaciones();
        const resCursos = esVistaCoordinacion
          ? await ucCursos.ejecutar({ docenteId: docenteIdCoordinacion })
          : await ucCursos.ejecutar();

        if (!resCursos?.success) {
          throw new Error(resCursos?.error || 'No se pudo cargar el contexto del curso');
        }

        const data = resCursos.data ?? {};
        const docente = data.docente ?? null;
        const cursos = Array.isArray(data.cursos) ? data.cursos : [];
        const cursoList = cursos.find((c) => String(c.id) === String(asignacionId));

        if (!docente || !cursoList) {
          const err = new Error('CURSO_NOT_FOUND');
          err.code = 'CURSO_NOT_FOUND';
          throw err;
        }

        const ucRegistro = useCasesFactory.obtenerRegistroNotasCurso();
        const resRegistro = await ucRegistro.ejecutar(asignacionId);
        if (!resRegistro?.success) {
          throw new Error(resRegistro?.error || 'No se pudo cargar el listado de estudiantes');
        }

        if (cancelled) return;

        setBase({
          docente,
          curso: {
            ...cursoList,
            periodo: cursoList.periodo ?? resRegistro.data?.periodo ?? null,
          },
          estudiantesBase: mapEstudiantesRegistro(resRegistro.data?.estudiantes),
          bimestreVigente: Number(docente.bimestreVigente) || 1,
        });

        if (bimestreNum == null) {
          throw new Error('Bimestre inválido');
        }

        const resConsolidado = await CalificacionRepository.obtenerBimestreConsolidado(
          asignacionId,
          bimestreNum,
        );
        if (!resConsolidado?.success) {
          throw new Error(resConsolidado?.error || 'No se pudo cargar el consolidado');
        }

        if (!cancelled) {
          setConsolidado(resConsolidado.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || err);
          if (err?.code === 'CURSO_NOT_FOUND') {
            navigate(MIS_CURSOS_PATH, { replace: true });
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [asignacionId, bimestreNum, docenteIdCoordinacion, esVistaCoordinacion, navigate]);

  const bimestreVigente = base?.bimestreVigente ?? 1;
  const bimestreActivo = consolidado?.bimestre ?? bimestreNum ?? 1;
  const bimestreTitulo = tituloBimestre(bimestreActivo);

  const materiaCurso = base?.curso?.materia ?? null;

  const breadcrumbItems = useMemo(
    () =>
      createCalificacionesBreadcrumbItems('ACA-CAL-BIM-CONSOLIDADO', 'ACA-CAL', tituloBimestre(bimestreActivo), {
        asignacionId,
        n: bimestreActivo,
        materia: materiaCurso,
      }),
    [bimestreActivo, asignacionId, materiaCurso],
  );

  const tituloPagina = `Consolidado · ${bimestreTitulo}`;

  const guardarConsolidado = useCallback(
    async (filas) => {
      const res = await CalificacionRepository.guardarBimestreConsolidado(
        asignacionId,
        bimestreActivo,
        filas,
      );
      if (!res?.success) {
        throw new Error(res?.error || 'No se pudo guardar');
      }
      const refreshed = await CalificacionRepository.obtenerBimestreConsolidado(
        asignacionId,
        bimestreActivo,
      );
      if (refreshed?.success) {
        setConsolidado(refreshed.data);
      }
      return res.data;
    },
    [asignacionId, bimestreActivo],
  );

  return {
    curso: base?.curso ?? null,
    docente: base?.docente ?? null,
    estudiantes: useMemo(() => {
      const list = [...(consolidado?.estudiantes ?? [])];
      list.sort((a, b) =>
        String(a.nombre ?? '').localeCompare(String(b.nombre ?? ''), 'es', {
          sensitivity: 'base',
        }),
      );
      return list.map((e, i) => ({ ...e, nro: i + 1 }));
    }, [consolidado?.estudiantes]),
    evaluaciones: consolidado?.evaluaciones ?? [],
    cuotaTeorico: consolidado?.cuotaTeorico ?? 30,
    cuotaPractico: consolidado?.cuotaPractico ?? 70,
    bimestreActivo,
    bimestreVigente,
    bimestreTitulo,
    periodoConsolidado: consolidado?.periodo ?? null,
    cerrado: consolidado?.cerrado ?? true,
    isLoading,
    error,
    breadcrumbItems,
    tituloPagina,
    volverPath: asignacionId ? notasCursoPath(asignacionId) : MIS_CURSOS_PATH,
    cursoId: asignacionId,
    esVistaCoordinacion,
    guardarConsolidado,
  };
};
