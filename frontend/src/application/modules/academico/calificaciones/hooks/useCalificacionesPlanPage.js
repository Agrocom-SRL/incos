/**
 * Plan de calificaciones del curso (tipos, ponderación, cronograma por bimestre).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetDocenteById } from '@application-docentes/hooks/api';
import { useAuthContext } from '@application-auth';
import {
  BIMESTRES,
  COMPONENTES_EVALUACION,
  createEvaluacionDraft,
  createPlanVacio,
  TIPOS_EVALUACION_SUGERIDOS,
} from '../utils/calificacionesDefaults.js';
import {
  isPlanListo,
  loadPlanCalificaciones,
  savePlanCalificaciones,
} from '../utils/planCalificacionesStorage.js';
import { resolveDocenteIdFromUsuario } from '../utils/resolveDocenteId.js';

export const useCalificacionesPlanPage = () => {
  const { asignacionId: asignacionIdParam } = useParams();
  const asignacionId = Number(asignacionIdParam);
  const navigate = useNavigate();
  const { usuario } = useAuthContext();
  const docenteId = resolveDocenteIdFromUsuario(usuario);

  const { docente, loading, error, getDocenteById } = useGetDocenteById();
  const [plan, setPlan] = useState(() => createPlanVacio());
  const [bimestreActivo, setBimestreActivo] = useState(1);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (docenteId) getDocenteById(docenteId);
  }, [docenteId, getDocenteById]);

  useEffect(() => {
    if (Number.isFinite(asignacionId) && asignacionId > 0) {
      setPlan(loadPlanCalificaciones(asignacionId));
    }
  }, [asignacionId]);

  const curso = useMemo(() => {
    const list = docente?.assignments ?? [];
    return list.find((a) => Number(a.id) === asignacionId) ?? null;
  }, [docente, asignacionId]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Calificaciones', href: '/academico/calificaciones' },
      { title: curso?.materia || 'Plan de calificaciones' },
    ],
    [curso?.materia],
  );

  const evaluacionesBimestre = plan.evaluacionesPorBimestre?.[bimestreActivo] ?? [];

  const sumaPesosTeorico = useMemo(
    () =>
      evaluacionesBimestre
        .filter((e) => e.componente === 'TEORICO')
        .reduce((s, e) => s + (Number(e.peso) || 0), 0),
    [evaluacionesBimestre],
  );

  const sumaPesosPractico = useMemo(
    () =>
      evaluacionesBimestre
        .filter((e) => e.componente === 'PRACTICO')
        .reduce((s, e) => s + (Number(e.peso) || 0), 0),
    [evaluacionesBimestre],
  );

  const handleCuotaChange = useCallback((field, value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return;
    setPlan((prev) => {
      const cuotas = { ...prev.cuotas, [field]: n };
      if (field === 'teorico') cuotas.practico = Math.max(0, 100 - n);
      if (field === 'practico') cuotas.teorico = Math.max(0, 100 - n);
      return { ...prev, cuotas };
    });
  }, []);

  const handleAgregarEvaluacion = useCallback(() => {
    setPlan((prev) => {
      const list = [...(prev.evaluacionesPorBimestre[bimestreActivo] ?? [])];
      list.push(createEvaluacionDraft({ bimestre: bimestreActivo }));
      return {
        ...prev,
        evaluacionesPorBimestre: {
          ...prev.evaluacionesPorBimestre,
          [bimestreActivo]: list,
        },
      };
    });
  }, [bimestreActivo]);

  const handleActualizarEvaluacion = useCallback((evalId, patch) => {
    setPlan((prev) => {
      const list = (prev.evaluacionesPorBimestre[bimestreActivo] ?? []).map((e) =>
        e.id === evalId ? { ...e, ...patch } : e,
      );
      return {
        ...prev,
        evaluacionesPorBimestre: {
          ...prev.evaluacionesPorBimestre,
          [bimestreActivo]: list,
        },
      };
    });
  }, [bimestreActivo]);

  const handleEliminarEvaluacion = useCallback((evalId) => {
    setPlan((prev) => {
      const list = (prev.evaluacionesPorBimestre[bimestreActivo] ?? []).filter((e) => e.id !== evalId);
      return {
        ...prev,
        evaluacionesPorBimestre: {
          ...prev.evaluacionesPorBimestre,
          [bimestreActivo]: list,
        },
      };
    });
  }, [bimestreActivo]);

  const handleAgregarEvaluacionFinal = useCallback(() => {
    setPlan((prev) => ({
      ...prev,
      evaluacionesFinales: [
        ...(prev.evaluacionesFinales ?? []),
        createEvaluacionDraft({ ambito: 'MATERIA_COMPLETA', componente: 'PRACTICO', bimestre: null }),
      ],
    }));
  }, []);

  const handleGuardarPlan = useCallback(() => {
    if (!Number.isFinite(asignacionId)) return;
    setGuardando(true);
    try {
      savePlanCalificaciones(asignacionId, plan);
      setPlan(loadPlanCalificaciones(asignacionId));
    } finally {
      setGuardando(false);
    }
  }, [asignacionId, plan]);

  const handleIrNotas = useCallback(() => {
    navigate(`/academico/calificaciones/curso/${asignacionId}/notas`, {
      state: { menuSidebarKey: 'ACA-CAL' },
    });
  }, [navigate, asignacionId]);

  const handleVolver = useCallback(() => {
    navigate('/academico/calificaciones', { state: { menuSidebarKey: 'ACA-CAL' } });
  }, [navigate]);

  const planValido =
    sumaPesosTeorico === 100 &&
    sumaPesosPractico === 100 &&
    Number(plan.cuotas?.teorico) + Number(plan.cuotas?.practico) === 100;

  return {
    asignacionId,
    curso,
    loading,
    error: !curso && !loading ? 'No se encontró el curso para esta asignación.' : error,
    plan,
    bimestreActivo,
    setBimestreActivo,
    evaluacionesBimestre,
    sumaPesosTeorico,
    sumaPesosPractico,
    planValido,
    planListo: isPlanListo(plan),
    guardando,
    breadcrumbItems,
    bimestres: BIMESTRES,
    componentes: COMPONENTES_EVALUACION,
    tiposSugeridos: TIPOS_EVALUACION_SUGERIDOS,
    handleCuotaChange,
    handleAgregarEvaluacion,
    handleActualizarEvaluacion,
    handleEliminarEvaluacion,
    handleAgregarEvaluacionFinal,
    handleGuardarPlan,
    handleIrNotas,
    handleVolver,
  };
};
