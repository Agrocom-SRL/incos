import { useCallback, useEffect, useState } from 'react';
import docenteRepository from '@implementations/DocenteRepository';

export const useDocentesAsignacionCatalogos = (editingAssignment = null) => {
  const [planes, setPlanes] = useState([]);
  const [loadingPlanes, setLoadingPlanes] = useState(false);
  const [errorPlanes, setErrorPlanes] = useState(null);
  const [gestionPlanId, setGestionPlanId] = useState(null);

  const [periodos, setPeriodos] = useState([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);
  const [errorPeriodos, setErrorPeriodos] = useState(null);
  const [periodoId, setPeriodoId] = useState(null);

  const [paralelos, setParalelos] = useState([]);
  const [loadingParalelos, setLoadingParalelos] = useState(false);
  const [errorParalelos, setErrorParalelos] = useState(null);
  const [paraleloId, setParaleloId] = useState(null);

  const [cursos, setCursos] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [errorCursos, setErrorCursos] = useState(null);
  const [cursoId, setCursoId] = useState(null);

  const resetFromPlan = useCallback(() => {
    setPeriodoId(null);
    setParaleloId(null);
    setCursoId(null);
    setPeriodos([]);
    setParalelos([]);
    setCursos([]);
    setErrorPeriodos(null);
    setErrorParalelos(null);
    setErrorCursos(null);
  }, []);

  const handleGestionPlanChange = useCallback(
    (id) => {
      setGestionPlanId(id);
      resetFromPlan();
    },
    [resetFromPlan]
  );

  const handleSelectPeriodo = useCallback((id) => {
    setPeriodoId(id);
    setParaleloId(null);
    setCursoId(null);
    setParalelos([]);
    setCursos([]);
  }, []);

  const handleSelectParalelo = useCallback((id) => {
    setParaleloId(id);
    setCursoId(null);
    setCursos([]);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingPlanes(true);
      setErrorPlanes(null);
      const res = await docenteRepository.listarPlanesHabilitadosAsignacion({ page: 1, limit: 500 });
      if (cancelled) return;
      if (!res.success) {
        const msg =
          typeof res.error === 'string' ? res.error : res.error?.message || 'No se pudieron cargar los planes habilitados';
        setErrorPlanes(msg);
        setPlanes([]);
      } else {
        setPlanes(Array.isArray(res.data) ? res.data : []);
      }
      setLoadingPlanes(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!editingAssignment || gestionPlanId) return;
    if (editingAssignment.gestionPlanId != null && Number.isFinite(Number(editingAssignment.gestionPlanId))) {
      setGestionPlanId(Number(editingAssignment.gestionPlanId));
      return;
    }
    if (editingAssignment.planHabilitado) {
      const plan = planes.find((p) => String(p.nombre || '').trim() === String(editingAssignment.planHabilitado).trim());
      if (plan?.id != null) setGestionPlanId(Number(plan.id));
    }
  }, [editingAssignment, planes, gestionPlanId]);

  useEffect(() => {
    if (!gestionPlanId) {
      setPeriodos([]);
      setPeriodoId(null);
      setParaleloId(null);
      setCursoId(null);
      setParalelos([]);
      setCursos([]);
      setErrorPeriodos(null);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoadingPeriodos(true);
      setErrorPeriodos(null);
      const res = await docenteRepository.listarPeriodosAsignacion({ gestionPlanId, page: 1, limit: 100 });
      if (cancelled) return;
      if (!res.success) {
        const msg = typeof res.error === 'string' ? res.error : res.error?.message || 'No se pudieron cargar los periodos';
        setErrorPeriodos(msg);
        setPeriodos([]);
      } else {
        setPeriodos(Array.isArray(res.data) ? res.data : []);
      }
      setLoadingPeriodos(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [gestionPlanId]);

  useEffect(() => {
    if (!editingAssignment || !gestionPlanId || periodoId || !periodos.length) return;
    if (editingAssignment.periodoId != null && Number.isFinite(Number(editingAssignment.periodoId))) {
      setPeriodoId(Number(editingAssignment.periodoId));
      return;
    }
    const periodNameTarget = editingAssignment.periodoMateriaPlan || editingAssignment.periodoParalelo;
    if (!periodNameTarget) return;
    const period = periodos.find((p) => String(p.nombre || '').trim() === String(periodNameTarget).trim());
    if (period?.id != null) setPeriodoId(Number(period.id));
  }, [editingAssignment, gestionPlanId, periodos, periodoId]);

  useEffect(() => {
    if (!gestionPlanId || !periodoId) {
      setParalelos([]);
      setParaleloId(null);
      setCursoId(null);
      setCursos([]);
      setErrorParalelos(null);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoadingParalelos(true);
      setErrorParalelos(null);
      const res = await docenteRepository.listarParalelosAsignacion({ gestionPlanId, periodoId, page: 1, limit: 200 });
      if (cancelled) return;
      if (!res.success) {
        const msg =
          typeof res.error === 'string' ? res.error : res.error?.message || 'No se pudieron cargar los paralelos';
        setErrorParalelos(msg);
        setParalelos([]);
        setParaleloId(null);
        setCursoId(null);
        setCursos([]);
      } else {
        setParalelos(Array.isArray(res.data) ? res.data : []);
        setParaleloId(null);
        setCursoId(null);
        setCursos([]);
      }
      setLoadingParalelos(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [gestionPlanId, periodoId]);

  useEffect(() => {
    if (!editingAssignment || !gestionPlanId || !periodoId || paraleloId || !paralelos.length) return;
    if (editingAssignment.paraleloId != null && Number.isFinite(Number(editingAssignment.paraleloId))) {
      setParaleloId(Number(editingAssignment.paraleloId));
      return;
    }
    const paralelo = paralelos.find((p) => {
      const sameName = String(p.nombre || '').trim() === String(editingAssignment.paralelo || '').trim();
      const sameTurno =
        !editingAssignment.turnoParalelo ||
        String(p.turno || '').trim().toUpperCase() === String(editingAssignment.turnoParalelo || '').trim().toUpperCase();
      return sameName && sameTurno;
    });
    if (paralelo?.id != null) setParaleloId(Number(paralelo.id));
  }, [editingAssignment, gestionPlanId, periodoId, paraleloId, paralelos]);

  useEffect(() => {
    if (!paraleloId || !gestionPlanId) {
      setCursos([]);
      setCursoId(null);
      setErrorCursos(null);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoadingCursos(true);
      setErrorCursos(null);
      const res = await docenteRepository.listarCursosPorParaleloAsignacion({
        paraleloId,
        gestionPlanId,
        page: 1,
        limit: 500,
      });
      if (cancelled) return;
      if (!res.success) {
        const msg = typeof res.error === 'string' ? res.error : res.error?.message || 'No se pudieron cargar los cursos';
        setErrorCursos(msg);
        setCursos([]);
        setCursoId(null);
      } else {
        setCursos(Array.isArray(res.data) ? res.data : []);
        setCursoId(null);
      }
      setLoadingCursos(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [paraleloId, gestionPlanId]);

  useEffect(() => {
    if (!editingAssignment || !paraleloId || cursoId || !cursos.length) return;
    if (editingAssignment.cursoId != null && Number.isFinite(Number(editingAssignment.cursoId))) {
      setCursoId(Number(editingAssignment.cursoId));
      return;
    }
    const course = cursos.find((c) => {
      const matchesCode =
        editingAssignment.cursoCodigo &&
        String(c.codigo || '').trim().toUpperCase() === String(editingAssignment.cursoCodigo).trim().toUpperCase();
      const matchesMateria =
        editingAssignment.materia &&
        String(c.materiaNombre || '').trim().toUpperCase() === String(editingAssignment.materia).trim().toUpperCase();
      const matchesSigla =
        editingAssignment.siglaMateria &&
        String(c.materiaSigla || '').trim().toUpperCase() === String(editingAssignment.siglaMateria).trim().toUpperCase();
      return matchesCode || matchesMateria || matchesSigla;
    });
    if (course?.id != null) setCursoId(Number(course.id));
  }, [editingAssignment, paraleloId, cursos, cursoId]);

  return {
    planes,
    loadingPlanes,
    errorPlanes,
    gestionPlanId,
    handleGestionPlanChange,
    periodos,
    loadingPeriodos,
    errorPeriodos,
    periodoId,
    handleSelectPeriodo,
    paralelos,
    loadingParalelos,
    errorParalelos,
    paraleloId,
    handleSelectParalelo,
    cursos,
    loadingCursos,
    errorCursos,
    cursoId,
    setCursoId,
  };
};

