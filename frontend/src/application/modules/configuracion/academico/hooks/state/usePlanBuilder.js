/**
 * Builder drag & drop de asignaturas/prerrequisitos de UN periodo del plan
 * (`PlanPeriodoAsignaturasPage.jsx`, alcanzado desde el lápiz de columna del
 * documento en `PlanDetailPage.jsx`). Gemelo periodo-scoped de
 * `usePlanDetallePage.js`: carga el plan COMPLETO (todos los periodos, no
 * solo el editado) porque el Flujo B (prerrequisito cross-periodo) necesita
 * ofrecer como origen las asignaturas de periodos anteriores.
 *
 * CRUD de asignaturas y prerrequisitos migrado desde `usePlanDetallePage.js`
 * (antes vivía en la ficha-hub con las 3 tabs, ver Fase 10). Edición/baja
 * del periodo en sí (nombre/número) también vive aquí, no en la ficha-hub.
 *
 * Validaciones de negocio (tope de horas del periodo, prerrequisito de
 * periodo estrictamente anterior) son SOLO client-side, ver
 * `utils/planBuilderRules.js`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App } from 'antd';
import { usePlanEstudiosDetalleApi } from '@application-configuracion/academico/hooks/api/usePlanEstudiosDetalleApi';
import { useMateriasApi } from '@application-configuracion/academico/hooks/api/useMateriasApi';
import { mapPlanDetail } from '@application-configuracion/academico/mappers';
import { horasDisponiblesPeriodo, esPeriodoAnterior } from '@application-configuracion/academico/utils/planBuilderRules';
import { PLANES_LIST_PATH, planDetallePath } from '@application-configuracion/academico/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/academico/config/academicoNavigation';

export const usePlanBuilder = () => {
  const { id, periodoId } = useParams();
  const planId = Number(id);
  const periodoIdNum = Number(periodoId);
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const isInvalidId = !Number.isFinite(planId) || planId < 1 || !Number.isFinite(periodoIdNum) || periodoIdNum < 1;

  const returnListPath = resolveReturnListPath(location, PLANES_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);
  const navState = useMemo(() => ({ returnListPath, menuSidebarKey }), [returnListPath, menuSidebarKey]);

  const {
    fetchPlanById,
    fetchMatriz,
    actualizarPeriodo,
    eliminarPeriodo,
    crearAsignaturaPlan,
    actualizarAsignatura,
    eliminarAsignaturaPlan,
    crearPrerrequisito,
    eliminarPrerrequisito,
  } = usePlanEstudiosDetalleApi();

  const { materias = [], loading: materiasLoading } = useMateriasApi();

  const [plan, setPlan] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [prerrequisitos, setPrerrequisitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const load = useCallback(async () => {
    if (isInvalidId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [detalleRes, matrizRes] = await Promise.all([
        fetchPlanById(planId),
        fetchMatriz(planId),
      ]);

      if (!detalleRes.success) {
        throw new Error(detalleRes.error || 'No se pudo cargar el plan de estudios');
      }
      if (!matrizRes.success) {
        throw new Error(matrizRes.error || 'No se pudo cargar la matriz del plan');
      }

      setPlan(mapPlanDetail(detalleRes.data));
      setPrerrequisitos(detalleRes.prerrequisitos ?? []);
      setPeriodos(matrizRes.data?.periodos ?? []);
    } catch (e) {
      setError(e?.message || 'Error al cargar el plan de estudios');
      setPlan(null);
      setPeriodos([]);
      setPrerrequisitos([]);
    } finally {
      setLoading(false);
    }
  }, [fetchPlanById, fetchMatriz, isInvalidId, planId]);

  useEffect(() => {
    load();
  }, [load]);

  // ---------------------------------------------------------------------
  // Derivados
  // ---------------------------------------------------------------------

  const periodoActual = useMemo(
    () => periodos.find((p) => p.id === periodoIdNum) ?? null,
    [periodos, periodoIdNum],
  );
  const periodoNoEncontrado = !loading && !error && periodos.length > 0 && !periodoActual;

  /** Asignaturas de OTROS periodos, agrupadas, con `periodoNumero` para validar el drag de prerrequisito. */
  const gruposOtrosPeriodos = useMemo(
    () =>
      periodos
        .filter((p) => p.id !== periodoIdNum)
        .map((p) => ({
          periodoId: p.id,
          periodoNombre: p.nombre || `Año ${p.numero}`,
          periodoNumero: p.numero,
          esAnterior: periodoActual ? esPeriodoAnterior(p.numero, periodoActual.numero) : false,
          asignaturas: (p.asignaturas ?? []).map((asig) => ({
            id: asig.id,
            sigla: asig.materia?.sigla ?? null,
            nombre: asig.materia?.nombre ?? null,
            periodoId: p.id,
            periodoNombre: p.nombre || `Año ${p.numero}`,
            periodoNumero: p.numero,
          })),
        })),
    [periodos, periodoIdNum, periodoActual],
  );

  /** Etiqueta de cualquier asignatura del plan (para tags de prerrequisito ya asignado). */
  const asignaturaLabelById = useMemo(() => {
    const map = new Map();
    for (const p of periodos) {
      for (const asig of p.asignaturas ?? []) {
        map.set(asig.id, {
          sigla: asig.materia?.sigla ?? null,
          nombre: asig.materia?.nombre ?? null,
          periodoNombre: p.nombre || `Año ${p.numero}`,
          periodoNumero: p.numero,
        });
      }
    }
    return map;
  }, [periodos]);

  /** Materias del catálogo aún no asignadas a NINGÚN periodo del plan (por sigla) — el plan no repite materias entre periodos. */
  const materiasDisponibles = useMemo(() => {
    const siglasUsadas = new Set(
      periodos.flatMap((p) => (p.asignaturas ?? []).map((a) => a.materia?.sigla)).filter(Boolean),
    );
    return materias.filter((m) => m.activo !== false && !siglasUsadas.has(m.sigla));
  }, [materias, periodos]);

  /** Asignaturas de periodos ESTRICTAMENTE ANTERIORES — única fuente válida de prerrequisito. */
  const gruposPeriodosAnteriores = useMemo(
    () => gruposOtrosPeriodos.filter((g) => g.esAnterior && g.asignaturas.length > 0),
    [gruposOtrosPeriodos],
  );

  const horasDisponibles = useMemo(
    () => horasDisponiblesPeriodo(periodoActual, plan?.horasSemana),
    [periodoActual, plan?.horasSemana],
  );

  const prerrequisitosDe = useCallback(
    (asignaturaId) => prerrequisitos.filter((p) => p.asignatura_id === asignaturaId),
    [prerrequisitos],
  );

  const puedeAgregarHoras = useCallback(
    (horas) => horasDisponibles >= (Number(horas) || 0),
    [horasDisponibles],
  );

  const puedeSerPrerrequisito = useCallback(
    (asignaturaOrigen, asignaturaDestinoId) => {
      if (!periodoActual || !asignaturaOrigen) return false;
      if (asignaturaOrigen.id === asignaturaDestinoId) return false;
      return esPeriodoAnterior(asignaturaOrigen.periodoNumero, periodoActual.numero);
    },
    [periodoActual],
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Planes de estudio', href: returnListPath },
      { title: plan?.nombrePlan || 'Plan', href: planId ? planDetallePath(planId) : undefined },
      { title: periodoActual ? periodoActual.nombre || `Año ${periodoActual.numero}` : 'Periodo' },
    ],
    [returnListPath, plan?.nombrePlan, planId, periodoActual],
  );

  // ---------------------------------------------------------------------
  // Navegación
  // ---------------------------------------------------------------------

  const handleVolver = useCallback(() => {
    navigate(planDetallePath(planId), { state: navState });
  }, [navigate, planId, navState]);

  // ---------------------------------------------------------------------
  // CRUD periodo actual (nombre/número, baja)
  // ---------------------------------------------------------------------

  const handleActualizarPeriodo = useCallback(
    async (payload) => {
      if (!periodoActual) return false;
      setGuardando(true);
      try {
        const result = await actualizarPeriodo(periodoActual.id, payload);
        if (!result.success) throw new Error(result.error || 'No se pudo actualizar el periodo');
        notification.success({ title: 'Periodo actualizado' });
        await load();
        return true;
      } catch (e) {
        notification.error({ title: 'Error al actualizar periodo', description: e?.message });
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [actualizarPeriodo, periodoActual, notification, load],
  );

  const handleEliminarPeriodo = useCallback(async () => {
    if (!periodoActual) return;
    setGuardando(true);
    try {
      const result = await eliminarPeriodo(periodoActual.id);
      if (!result.success) throw new Error(result.error || 'No se pudo eliminar el periodo');
      notification.success({ title: 'Periodo eliminado' });
      handleVolver();
    } catch (e) {
      notification.error({ title: 'Error al eliminar periodo', description: e?.message });
    } finally {
      setGuardando(false);
    }
  }, [eliminarPeriodo, periodoActual, notification, handleVolver]);

  // ---------------------------------------------------------------------
  // CRUD asignaturas del periodo actual
  // ---------------------------------------------------------------------

  const handleCrearAsignatura = useCallback(
    async (payload) => {
      if (!plan?.id || !periodoActual) return false;
      setGuardando(true);
      try {
        const result = await crearAsignaturaPlan({
          plan_estudio_id: plan.id,
          periodo_id: periodoActual.id,
          ...payload,
        });
        if (!result.success) throw new Error(result.error || 'No se pudo agregar la asignatura');
        notification.success({ title: 'Asignatura agregada al periodo' });
        await load();
        return true;
      } catch (e) {
        notification.error({ title: 'Error al agregar asignatura', description: e?.message });
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [crearAsignaturaPlan, plan?.id, periodoActual, notification, load],
  );

  const handleActualizarAsignatura = useCallback(
    async (asignaturaId, payload) => {
      setGuardando(true);
      try {
        const result = await actualizarAsignatura(asignaturaId, payload);
        if (!result.success) throw new Error(result.error || 'No se pudo actualizar la asignatura');
        notification.success({ title: 'Asignatura actualizada' });
        await load();
        return true;
      } catch (e) {
        notification.error({ title: 'Error al actualizar asignatura', description: e?.message });
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [actualizarAsignatura, notification, load],
  );

  const handleEliminarAsignatura = useCallback(
    async (asignaturaId) => {
      setGuardando(true);
      try {
        const result = await eliminarAsignaturaPlan(asignaturaId);
        if (!result.success) throw new Error(result.error || 'No se pudo eliminar la asignatura');
        notification.success({ title: 'Asignatura eliminada del periodo' });
        await load();
      } catch (e) {
        notification.error({ title: 'Error al eliminar asignatura', description: e?.message });
      } finally {
        setGuardando(false);
      }
    },
    [eliminarAsignaturaPlan, notification, load],
  );

  // ---------------------------------------------------------------------
  // CRUD prerrequisitos (Flujo B)
  // ---------------------------------------------------------------------

  const handleCrearPrerrequisito = useCallback(
    async ({ asignaturaId, prerrequisitoId }) => {
      if (!plan?.id) return false;
      setGuardando(true);
      try {
        const result = await crearPrerrequisito({
          plan_estudio_id: plan.id,
          asignatura_id: asignaturaId,
          prerrequisito_id: prerrequisitoId,
        });
        if (!result.success) throw new Error(result.error || 'No se pudo crear el prerrequisito');
        notification.success({ title: 'Prerrequisito agregado' });
        await load();
        return true;
      } catch (e) {
        notification.error({ title: 'Error al agregar prerrequisito', description: e?.message });
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [crearPrerrequisito, plan?.id, notification, load],
  );

  const handleEliminarPrerrequisito = useCallback(
    async (prerrequisitoRowId) => {
      setGuardando(true);
      try {
        const result = await eliminarPrerrequisito(prerrequisitoRowId);
        if (!result.success) throw new Error(result.error || 'No se pudo eliminar el prerrequisito');
        notification.success({ title: 'Prerrequisito eliminado' });
        await load();
      } catch (e) {
        notification.error({ title: 'Error al eliminar prerrequisito', description: e?.message });
      } finally {
        setGuardando(false);
      }
    },
    [eliminarPrerrequisito, notification, load],
  );

  return {
    plan,
    periodoActual,
    periodoNoEncontrado,
    gruposOtrosPeriodos,
    gruposPeriodosAnteriores,
    asignaturaLabelById,
    materiasDisponibles,
    materiasLoading,
    horasDisponibles,
    prerrequisitos,
    prerrequisitosDe,
    puedeAgregarHoras,
    puedeSerPrerrequisito,
    breadcrumbItems,
    loading,
    error,
    isInvalidId,
    guardando,
    handleVolver,
    handleActualizarPeriodo,
    handleEliminarPeriodo,
    handleCrearAsignatura,
    handleActualizarAsignatura,
    handleEliminarAsignatura,
    handleCrearPrerrequisito,
    handleEliminarPrerrequisito,
    refetch: load,
  };
};
