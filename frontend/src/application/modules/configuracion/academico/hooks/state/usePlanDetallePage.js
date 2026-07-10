/**
 * Ficha-hub del plan de estudio — orquestación UI (Fase 8).
 *
 * Carga plan (`fetchPlanById`) + matriz (`fetchMatriz`) en paralelo y las
 * fusiona (mismo patrón que `usePlanesTabDocumento.js`, gemelo de solo
 * lectura de este hook). Expone:
 *   - Ficha: datos generales, carrera, estado vigente/borrador.
 *   - Acciones de cabecera: publicar vigente (`marcarVigente`) y nueva
 *     versión por RM (delegada en `usePlanNuevaVersion`, ver nota abajo).
 *   - CRUD de periodos y asignaturas de la matriz (recarga tras cada mutación).
 *   - CRUD de prerrequisitos del plan.
 *
 * Decisión (deviation documentada): NO se llaman `listarPrerrequisitos` /
 * `listarEsPrerrequisitoDe` por asignatura. `fetchPlanById` ya devuelve el
 * array plano de TODOS los prerrequisitos del plan (mismo filtro por
 * `studyPlanId` que usan esos endpoints por `subjectId`/`prerequisiteId`,
 * ver `ListPrerrequisitosByAsignaturaUseCase` / `ListEsPrerrequisitoDeUseCase`
 * en backend) — se deriva "requiere" / "es prerrequisito de" con `useMemo`
 * desde ese array ya cargado, evitando N llamadas HTTP redundantes.
 *
 * "Nueva versión (RM)" (Fase 9): la llamada a `clonarPlan` + notificación +
 * navegación a `planEditarPath` viven en `usePlanNuevaVersion.js` (hook
 * compartido con `PlanesTabPanel.jsx`, que también clona sin pasar por esta
 * ficha-hub). Este hook solo resuelve el `planId` del plan cargado y delega.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App } from 'antd';
import { usePlanEstudiosDetalleApi } from '@application-configuracion/academico/hooks/api/usePlanEstudiosDetalleApi';
import { useMateriasApi } from '@application-configuracion/academico/hooks/api/useMateriasApi';
import { usePlanNuevaVersion } from '@application-configuracion/academico/hooks/state/usePlanNuevaVersion';
import { mapPlanDetail, mapCarreraResumen } from '@application-configuracion/academico/mappers';
import {
  PLANES_LIST_PATH,
  planEditarPath,
} from '@application-configuracion/academico/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/academico/config/academicoNavigation';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

const initialsFromPlan = (plan, carrera) => {
  const src = (carrera?.codigo || plan?.nombrePlan || '?').trim();
  return src.slice(0, 2).toUpperCase();
};

export const usePlanDetallePage = () => {
  const { id } = useParams();
  const planId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const isInvalidId = !Number.isFinite(planId) || planId < 1;

  const returnListPath = resolveReturnListPath(location, PLANES_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const {
    fetchPlanById,
    fetchMatriz,
    marcarVigente,
    crearPeriodo,
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
  const [carrera, setCarrera] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [horasTotalPlan, setHorasTotalPlan] = useState(0);
  const [prerrequisitos, setPrerrequisitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Acciones de cabecera
  const [publicando, setPublicando] = useState(false);
  // Mutaciones de matriz / prerrequisitos (spinner compartido en modales/acciones puntuales)
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

      setPlan(mapPlanDetail(detalleRes.data));
      setPrerrequisitos(detalleRes.prerrequisitos ?? []);

      if (matrizRes.success) {
        const matrizData = matrizRes.data ?? {};
        setPeriodos(matrizData.periodos ?? []);
        setHorasTotalPlan(matrizData.horas_total_plan ?? 0);
        setCarrera(mapCarreraResumen(matrizData.plan?.carrera));
      } else {
        setPeriodos([]);
        setHorasTotalPlan(0);
        setCarrera(null);
      }
    } catch (e) {
      setError(e?.message || 'Error al cargar el plan de estudios');
      setPlan(null);
      setPeriodos([]);
      setPrerrequisitos([]);
      setCarrera(null);
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

  /** Lista plana de asignaturas de la matriz (para selects de prerrequisito). */
  const asignaturasFlat = useMemo(
    () =>
      periodos.flatMap((periodo) =>
        (periodo.asignaturas ?? []).map((asig) => ({
          id: asig.id,
          sigla: asig.materia?.sigla ?? null,
          nombre: asig.materia?.nombre ?? null,
          horasSemanales: asig.horas_semanales ?? null,
          periodoId: periodo.id,
          periodoNombre: periodo.nombre || `Año ${periodo.numero}`,
        })),
      ),
    [periodos],
  );

  /** Materias del catálogo aún no asignadas al periodo (por sigla, ver nota en handleCrearAsignatura). */
  const materiasDisponiblesPorPeriodo = useCallback(
    (periodoId) => {
      const periodo = periodos.find((p) => p.id === periodoId);
      const siglasUsadas = new Set(
        (periodo?.asignaturas ?? []).map((a) => a.materia?.sigla).filter(Boolean),
      );
      return materias.filter((m) => m.activo !== false && !siglasUsadas.has(m.sigla));
    },
    [periodos, materias],
  );

  const avatarInitials = useMemo(() => initialsFromPlan(plan, carrera), [plan, carrera]);
  const avatarColor = sanitizeDocenteColorHex(carrera?.colorHex) ?? null;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Académico', href: returnListPath },
      { title: 'Planes de estudio', href: returnListPath },
      { title: plan?.nombrePlan || 'Detalle de plan' },
    ],
    [returnListPath, plan?.nombrePlan],
  );

  const navState = useMemo(
    () => ({ returnListPath, menuSidebarKey }),
    [returnListPath, menuSidebarKey],
  );

  const { creandoVersion, crearNuevaVersion } = usePlanNuevaVersion({ navState });

  // ---------------------------------------------------------------------
  // Navegación
  // ---------------------------------------------------------------------

  const handleVolver = useCallback(() => {
    navigate(returnListPath, menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined);
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!plan?.id) return;
    navigate(planEditarPath(plan.id), { state: navState });
  }, [plan?.id, navigate, navState]);

  // ---------------------------------------------------------------------
  // Publicar vigente / nueva versión (RM)
  // ---------------------------------------------------------------------

  const handlePublicar = useCallback(async () => {
    if (!plan?.id) return;
    setPublicando(true);
    try {
      const result = await marcarVigente(plan.id);
      if (!result.success) {
        throw new Error(result.error || 'No se pudo publicar el plan como vigente');
      }
      notification.success({
        title: 'Plan publicado como vigente',
        description: 'El plan anterior de la carrera quedó como borrador (histórico), sin afectar a estudiantes ya inscritos.',
      });
      await load();
    } catch (e) {
      notification.error({ title: 'Error al publicar', description: e?.message });
    } finally {
      setPublicando(false);
    }
  }, [plan?.id, marcarVigente, notification, load]);

  const handleNuevaVersion = useCallback(() => {
    if (!plan?.id) return;
    crearNuevaVersion(plan.id);
  }, [plan?.id, crearNuevaVersion]);

  // ---------------------------------------------------------------------
  // CRUD periodos
  // ---------------------------------------------------------------------

  const handleCrearPeriodo = useCallback(
    async (payload) => {
      setGuardando(true);
      try {
        const result = await crearPeriodo(plan.id, payload);
        if (!result.success) throw new Error(result.error || 'No se pudo crear el periodo');
        notification.success({ title: 'Periodo creado' });
        await load();
        return true;
      } catch (e) {
        notification.error({ title: 'Error al crear periodo', description: e?.message });
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [crearPeriodo, plan?.id, notification, load],
  );

  const handleActualizarPeriodo = useCallback(
    async (periodoId, payload) => {
      setGuardando(true);
      try {
        const result = await actualizarPeriodo(periodoId, payload);
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
    [actualizarPeriodo, notification, load],
  );

  const handleEliminarPeriodo = useCallback(
    async (periodoId) => {
      setGuardando(true);
      try {
        const result = await eliminarPeriodo(periodoId);
        if (!result.success) throw new Error(result.error || 'No se pudo eliminar el periodo');
        notification.success({ title: 'Periodo eliminado' });
        await load();
      } catch (e) {
        notification.error({ title: 'Error al eliminar periodo', description: e?.message });
      } finally {
        setGuardando(false);
      }
    },
    [eliminarPeriodo, notification, load],
  );

  // ---------------------------------------------------------------------
  // CRUD asignaturas del periodo
  // ---------------------------------------------------------------------

  const handleCrearAsignatura = useCallback(
    async (periodoId, payload) => {
      setGuardando(true);
      try {
        const result = await crearAsignaturaPlan({
          plan_estudio_id: plan.id,
          periodo_id: periodoId,
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
    [crearAsignaturaPlan, plan?.id, notification, load],
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
  // CRUD prerrequisitos
  // ---------------------------------------------------------------------

  const handleCrearPrerrequisito = useCallback(
    async ({ asignaturaId, prerrequisitoId }) => {
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
    carrera,
    periodos,
    horasTotalPlan,
    prerrequisitos,
    asignaturasFlat,
    materiasDisponiblesPorPeriodo,
    materiasLoading,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    avatarColor,
    breadcrumbItems,
    publicando,
    creandoVersion,
    guardando,
    handleVolver,
    handleEditar,
    handlePublicar,
    handleNuevaVersion,
    handleCrearPeriodo,
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
