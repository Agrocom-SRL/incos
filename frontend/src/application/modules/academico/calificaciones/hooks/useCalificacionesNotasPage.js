/**
 * Registro de notas por curso y bimestre (evaluaciones → bimestres_matricula).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useGetDocenteById } from '@application-docentes/hooks/api';
import { useAuthContext } from '@application-auth';
import { BIMESTRES } from '../utils/calificacionesDefaults.js';
import {
  isPlanListo,
  loadNotasBorrador,
  loadPlanCalificaciones,
  saveNotasBorrador,
} from '../utils/planCalificacionesStorage.js';
import { resolveDocenteIdFromUsuario } from '../utils/resolveDocenteId.js';
import {
  calificacionesCursosPath,
  calificacionesPlanPath,
  CALIFICACIONES_SELECCION_PATH,
} from '../utils/calificacionesPaths.js';

/** Estudiantes de demostración hasta exista API matriculas_materia por asignación. */
const ESTUDIANTES_DEMO = [
  { matriculaId: 101, codigo: '2024-001', nombre: 'Ana María López' },
  { matriculaId: 102, codigo: '2024-002', nombre: 'Carlos Eduardo Rojas' },
  { matriculaId: 103, codigo: '2024-003', nombre: 'María Fernanda Vargas' },
  { matriculaId: 104, codigo: '2024-004', nombre: 'Juan Pablo Quispe' },
  { matriculaId: 105, codigo: '2024-005', nombre: 'Lucía Pamela Condori' },
];

function notaKey(matriculaId, evaluacionId) {
  return `${matriculaId}:${evaluacionId}`;
}

export const useCalificacionesNotasPage = () => {
  const { asignacionId: asignacionIdParam, docenteId: docenteIdParam } = useParams();
  const asignacionId = Number(asignacionIdParam);
  const docenteId = Number(docenteIdParam);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { usuario } = useAuthContext();
  const docenteIdFromUser = resolveDocenteIdFromUsuario(usuario);
  const esDocente = Boolean(docenteIdFromUser);
  const docenteIdValido = Number.isFinite(docenteId) && docenteId > 0;

  const bimestreFromUrl = Number(searchParams.get('bimestre')) || 1;
  const [bimestreActivo, setBimestreActivo] = useState(
    BIMESTRES.includes(bimestreFromUrl) ? bimestreFromUrl : 1,
  );
  const [notas, setNotas] = useState({});
  const [guardando, setGuardando] = useState(false);

  const { docente, loading, error, getDocenteById } = useGetDocenteById();

  useEffect(() => {
    if (docenteIdValido) getDocenteById(docenteId);
  }, [docenteId, docenteIdValido, getDocenteById]);

  useEffect(() => {
    if (Number.isFinite(asignacionId) && asignacionId > 0) {
      setNotas(loadNotasBorrador(asignacionId));
    }
  }, [asignacionId]);

  const plan = useMemo(
    () => (Number.isFinite(asignacionId) ? loadPlanCalificaciones(asignacionId) : null),
    [asignacionId],
  );

  const curso = useMemo(() => {
    const list = docente?.assignments ?? [];
    const a = list.find((x) => Number(x.id) === asignacionId);
    if (!a) return null;
    return {
      materia: a.materia,
      siglaMateria: a.siglaMateria,
      paralelo: a.paralelo,
      turnoParalelo: a.turnoParalelo,
      gestion: a.gestion,
      cursoCodigo: a.cursoCodigo,
      cargaHorariaSemanal: a.cargaHorariaSemanal,
      cursoColorHex: a.cursoColorHex,
      carreraColorHex: a.carreraColorHex,
    };
  }, [docente, asignacionId]);

  const evaluacionesColumnas = useMemo(() => {
    const delBimestre = plan?.evaluacionesPorBimestre?.[bimestreActivo] ?? [];
    if (delBimestre.length > 0) return delBimestre;
    return [
      { id: 'demo-teorico', nombre: 'Examen parcial (teórico)', componente: 'TEORICO', peso: 50 },
      { id: 'demo-practico', nombre: 'Práctico bimestral', componente: 'PRACTICO', peso: 50 },
    ];
  }, [plan, bimestreActivo]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      {
        title: 'Calificaciones',
        href: esDocente ? undefined : CALIFICACIONES_SELECCION_PATH,
      },
      {
        title: docente?.profile?.nombreCompleto || 'Cursos',
        href: docenteIdValido ? calificacionesCursosPath(docenteId) : undefined,
      },
      { title: curso?.materia || 'Registrar notas' },
    ],
    [curso?.materia, docente?.profile?.nombreCompleto, docenteId, docenteIdValido, esDocente],
  );

  const handleCambiarBimestre = useCallback(
    (b) => {
      setBimestreActivo(b);
      setSearchParams({ bimestre: String(b) }, { replace: true });
    },
    [setSearchParams],
  );

  const handleNotaChange = useCallback((matriculaId, evaluacionId, value) => {
    const n = value === '' || value == null ? null : Number(value);
    setNotas((prev) => {
      const key = notaKey(matriculaId, evaluacionId);
      const next = { ...prev };
      if (n == null || Number.isNaN(n)) delete next[key];
      else next[key] = Math.min(100, Math.max(0, n));
      return next;
    });
  }, []);

  const getNota = useCallback(
    (matriculaId, evaluacionId) => {
      const v = notas[notaKey(matriculaId, evaluacionId)];
      return v == null ? undefined : v;
    },
    [notas],
  );

  const handleGuardar = useCallback(() => {
    if (!Number.isFinite(asignacionId)) return;
    setGuardando(true);
    try {
      saveNotasBorrador(asignacionId, notas);
    } finally {
      setGuardando(false);
    }
  }, [asignacionId, notas]);

  const handleIrPlan = useCallback(() => {
    if (!docenteIdValido) return;
    navigate(calificacionesPlanPath(docenteId, asignacionId), {
      state: { menuSidebarKey: 'ACA-CAL' },
    });
  }, [navigate, asignacionId, docenteId, docenteIdValido]);

  const handleVolver = useCallback(() => {
    if (!docenteIdValido) return;
    navigate(calificacionesCursosPath(docenteId), { state: { menuSidebarKey: 'ACA-CAL' } });
  }, [navigate, docenteId, docenteIdValido]);

  return {
    asignacionId,
    curso,
    loading,
    error: !curso && !loading ? 'No se encontró el curso.' : error,
    plan,
    planListo: isPlanListo(plan),
    bimestreActivo,
    bimestres: BIMESTRES,
    evaluacionesColumnas,
    estudiantes: ESTUDIANTES_DEMO,
    getNota,
    handleNotaChange,
    handleCambiarBimestre,
    handleGuardar,
    guardando,
    breadcrumbItems,
    handleIrPlan,
    handleVolver,
    cuotas: plan?.cuotas ?? { teorico: 30, practico: 70 },
  };
};
