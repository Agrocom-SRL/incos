/**
 * Bimestre cerrado — resumen por componente (suma de evaluaciones con 0 si falta nota).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CalificacionRepository from '@infrastructure/repositories/CalificacionRepository.js';
import { createCalificacionesBreadcrumbItems } from '../utils/calificacionesBreadcrumbs.js';
import { tituloBimestre } from '../utils/bimestreTitulos.js';
import { MIS_CURSOS_PATH, notasCursoPath, cuadernoBimestrePath, CALIFICACIONES_VIEW_ROUTE_KEY } from '../utils/calificacionesPaths.js';
import { useRouteViewMode } from '@navigation/hooks/useRouteViewMode.js';
import { cargarContextoCursoRegistro } from '../utils/cargarContextoCursoRegistro.js';

export const useBimestreConsolidado = () => {
  const { asignacionId, n: bimestreRuta } = useParams();
  const navigate = useNavigate();
  const { isView } = useRouteViewMode(CALIFICACIONES_VIEW_ROUTE_KEY);
  const esVistaCoordinacion = isView('coordinacion');

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
        if (bimestreNum == null) {
          throw new Error('Bimestre inválido');
        }

        const ctx = await cargarContextoCursoRegistro(asignacionId);
        if (cancelled) return;

        const metaBimestre = (ctx.bimestresCalendario ?? []).find(
          (b) => Number(b.numero) === bimestreNum,
        );
        if (metaBimestre?.reabierto) {
          navigate(cuadernoBimestrePath(asignacionId, bimestreNum), { replace: true });
          return;
        }

        setBase({
          docente: ctx.docente,
          curso: ctx.curso,
          estudiantesBase: ctx.estudiantesBase,
          bimestreVigente: ctx.bimestreVigente,
        });

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
  }, [asignacionId, bimestreNum, navigate]);

  const bimestreVigente = base?.bimestreVigente ?? 1;
  const bimestreActivo = consolidado?.bimestre ?? bimestreNum ?? 1;
  const bimestreTitulo = tituloBimestre(bimestreActivo);

  const materiaCurso = base?.curso?.materia ?? null;

  const estudiantes = useMemo(() => {
    const list = [...(consolidado?.estudiantes ?? [])];
    list.sort((a, b) =>
      String(a.nombre ?? '').localeCompare(String(b.nombre ?? ''), 'es', {
        sensitivity: 'base',
      }),
    );
    return list.map((e, i) => ({ ...e, nro: i + 1 }));
  }, [consolidado?.estudiantes]);

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

  const reabrirBimestre = useCallback(async () => {
    const res = await CalificacionRepository.reabrirBimestreCurso(asignacionId, bimestreActivo);
    if (!res?.success) {
      throw new Error(res?.error || 'No se pudo reabrir el bimestre');
    }
    return res.data;
  }, [asignacionId, bimestreActivo]);

  return {
    curso: base?.curso ?? null,
    docente: base?.docente ?? null,
    estudiantes,
    evaluaciones: consolidado?.evaluaciones ?? [],
    cuotaTeorico: consolidado?.cuotaTeorico ?? 30,
    cuotaPractico: consolidado?.cuotaPractico ?? 70,
    bimestreActivo,
    bimestreVigente,
    bimestreTitulo,
    periodoConsolidado: consolidado?.periodo ?? null,
    cerrado: consolidado?.cerrado ?? true,
    isLoading,
    isRefetching: false,
    error,
    breadcrumbItems,
    tituloPagina,
    volverPath: asignacionId ? notasCursoPath(asignacionId) : MIS_CURSOS_PATH,
    cursoId: asignacionId,
    esVistaCoordinacion,
    reabrirBimestre,
  };
};
