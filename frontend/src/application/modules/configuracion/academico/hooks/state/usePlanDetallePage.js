/**
 * Ficha-hub del plan de estudio — orquestación UI (Fase 8, documento en Fase 10).
 *
 * Carga plan (`fetchPlanById`) + matriz (`fetchMatriz`) en paralelo y las
 * fusiona (mismo patrón que `usePlanesTabDocumento.js`, gemelo de solo
 * lectura de este hook). Expone:
 *   - Ficha: datos generales, carrera, estado vigente/borrador.
 *   - Acciones de cabecera: publicar vigente (`marcarVigente`) y nueva
 *     versión por RM (delegada en `usePlanNuevaVersion`, ver nota abajo).
 *   - Datos para `PlanEstudioDocumentoView` (documento con columnas por
 *     periodo): `planMetaRaw` (snake_case, mismo shape que consume la vista
 *     documento del tab «Planes») y `prereqSiglaByAsignaturaId`.
 *   - Alta rápida de periodo (`handleCrearPeriodo`, botón «+ Periodo»); la
 *     edición/baja de un periodo y el CRUD de sus asignaturas y
 *     prerrequisitos viven en el builder por periodo (`usePlanBuilder.js`,
 *     alcanzado desde el lápiz de cada columna del documento).
 *
 * Decisión (deviation documentada): NO se llaman `listarPrerrequisitos` /
 * `listarEsPrerrequisitoDe` por asignatura. `fetchPlanById` ya devuelve el
 * array plano de TODOS los prerrequisitos del plan (mismo filtro por
 * `studyPlanId` que usan esos endpoints por `subjectId`/`prerequisiteId`,
 * ver `ListPrerrequisitosByAsignaturaUseCase` / `ListEsPrerrequisitoDeUseCase`
 * en backend) — se deriva el mapa de siglas de prerrequisito con `useMemo`
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
import { usePlanNuevaVersion } from '@application-configuracion/academico/hooks/state/usePlanNuevaVersion';
import { mapPlanDetail, mapCarreraResumen } from '@application-configuracion/academico/mappers';
import { buildPrerrequisitoSiglaMap } from '@application-configuracion/academico/utils/buildPrerrequisitoSiglaMap';
import {
  PLANES_LIST_PATH,
  planEditarPath,
  planPeriodoAsignaturasPath,
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

  const { fetchPlanById, fetchMatriz, marcarVigente, crearPeriodo } = usePlanEstudiosDetalleApi();

  const [plan, setPlan] = useState(null);
  const [planMetaRaw, setPlanMetaRaw] = useState(null);
  const [carrera, setCarrera] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [horasTotalPlan, setHorasTotalPlan] = useState(0);
  const [prerrequisitos, setPrerrequisitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Acciones de cabecera
  const [publicando, setPublicando] = useState(false);
  // Alta de periodo (spinner del modal «+ Periodo»)
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
        // `planMetaRaw` — mismo shape snake_case que consume `PlanEstudioDocumentoView`
        // en el tab «Planes» (ver `usePlanesTabDocumento.js`): fusiona el detalle
        // (`resolucion_ministerial`, `horas_semana`, …) con el plan anidado en la matriz.
        setPlanMetaRaw({
          ...detalleRes.data,
          ...(matrizData.plan ?? {}),
          id: matrizData.plan?.id ?? detalleRes.data?.id ?? planId,
        });
      } else {
        setPeriodos([]);
        setHorasTotalPlan(0);
        setCarrera(null);
        setPlanMetaRaw(null);
      }
    } catch (e) {
      setError(e?.message || 'Error al cargar el plan de estudios');
      setPlan(null);
      setPeriodos([]);
      setPrerrequisitos([]);
      setCarrera(null);
      setPlanMetaRaw(null);
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

  /** Mapa asignatura_plan_id → sigla del prerrequisito, para las celdas «PRE REQUISITO» del documento. */
  const prereqSiglaByAsignaturaId = useMemo(
    () => buildPrerrequisitoSiglaMap(periodos, prerrequisitos),
    [periodos, prerrequisitos],
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

  /** Lápiz de cabecera de columna del documento → builder drag & drop de ese periodo. */
  const handleEditarPeriodo = useCallback(
    (periodoId) => {
      if (!plan?.id || !periodoId) return;
      navigate(planPeriodoAsignaturasPath(plan.id, periodoId), { state: navState });
    },
    [plan?.id, navigate, navState],
  );

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

  return {
    plan,
    planMetaRaw,
    carrera,
    periodos,
    horasTotalPlan,
    prerrequisitos,
    prereqSiglaByAsignaturaId,
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
    handleEditarPeriodo,
    handlePublicar,
    handleNuevaVersion,
    handleCrearPeriodo,
    refetch: load,
  };
};
