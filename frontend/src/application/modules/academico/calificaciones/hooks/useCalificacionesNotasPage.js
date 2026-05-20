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
  const { asignacionId: asignacionIdParam } = useParams();
  const asignacionId = Number(asignacionIdParam);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { usuario } = useAuthContext();
  const docenteId = resolveDocenteIdFromUsuario(usuario);

  const bimestreFromUrl = Number(searchParams.get('bimestre')) || 1;
  const [bimestreActivo, setBimestreActivo] = useState(
    BIMESTRES.includes(bimestreFromUrl) ? bimestreFromUrl : 1,
  );
  const [notas, setNotas] = useState({});
  const [guardando, setGuardando] = useState(false);

  const { docente, loading, error, getDocenteById } = useGetDocenteById();

  useEffect(() => {
    if (docenteId) getDocenteById(docenteId);
  }, [docenteId, getDocenteById]);

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
    return list.find((a) => Number(a.id) === asignacionId) ?? null;
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
      { title: 'Calificaciones', href: '/academico/calificaciones' },
      { title: curso?.materia || 'Registrar notas' },
    ],
    [curso?.materia],
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
    navigate(`/academico/calificaciones/curso/${asignacionId}/plan`, {
      state: { menuSidebarKey: 'ACA-CAL' },
    });
  }, [navigate, asignacionId]);

  const handleVolver = useCallback(() => {
    navigate('/academico/calificaciones', { state: { menuSidebarKey: 'ACA-CAL' } });
  }, [navigate]);

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
