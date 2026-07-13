/**
 * Builder drag & drop de asignaturas/prerrequisitos de UN periodo del plan
 * (`PlanPeriodoAsignaturasPage.jsx`, alcanzado desde el lápiz de columna del
 * documento en `PlanDetailPage.jsx`).
 *
 * Modo BORRADOR (igual que el cuaderno de calificaciones): agregar/quitar
 * asignaturas, editar horas y arrastrar prerrequisitos solo mutan `draftFilas`
 * en memoria; nada viaja al backend hasta `guardarCambios()`, que aplica el
 * diff contra el estado del servidor (bajas de prerrequisitos → bajas de
 * asignaturas → horas → altas de asignaturas → altas de prerrequisitos) y
 * recarga. `descartarCambios()` reconstruye el borrador desde el servidor.
 *
 * El catálogo expone TODAS las materias activas anotadas con el periodo del
 * plan donde ya están asignadas (`asignadaEn`): una materia libre se arrastra
 * al periodo; una asignada a un año ANTERIOR se arrastra como prerrequisito
 * (reemplaza al antiguo panel «Periodos anteriores»). Validaciones de negocio
 * (cupo de horas, periodo anterior) en `utils/planBuilderRules.js`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App } from 'antd';
import { usePlanEstudiosDetalleApi } from '@application-configuracion/academico/hooks/api/usePlanEstudiosDetalleApi';
import { useMateriasApi } from '@application-configuracion/academico/hooks/api/useMateriasApi';
import { mapPlanDetail } from '@application-configuracion/academico/mappers';
import { esPeriodoAnterior } from '@application-configuracion/academico/utils/planBuilderRules';
import { PLANES_LIST_PATH, planDetallePath } from '@application-configuracion/academico/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/academico/config/academicoNavigation';

const HORAS_DEFAULT_MAX = 4;

/** Borrador de filas del periodo a partir del estado del servidor. */
const buildDraftFromServer = (periodo, prerrequisitos, labelById) =>
  (periodo?.asignaturas ?? []).map((asig) => ({
    key: `srv-${asig.id}`,
    asignaturaId: asig.id,
    materiaId: asig.materia_id ?? asig.materia?.id ?? null,
    sigla: asig.materia?.sigla ?? null,
    nombre: asig.materia?.nombre ?? null,
    horas: asig.horas_semanales,
    prereqs: prerrequisitos
      .filter((p) => p.asignatura_id === asig.id)
      .map((p) => {
        const info = labelById.get(p.prerrequisito_id);
        return {
          key: `srv-prereq-${p.id}`,
          id: p.id,
          prerrequisitoId: p.prerrequisito_id,
          sigla: info?.sigla ?? null,
          nombre: info?.nombre ?? null,
          periodoNombre: info?.periodoNombre ?? null,
        };
      }),
  }));

/** Forma canónica del borrador para detectar cambios (orden-insensible en prereqs). */
const normalizeDraft = (filas) =>
  filas.map((f) => ({
    asignaturaId: f.asignaturaId,
    materiaId: f.materiaId,
    horas: Number(f.horas) || 0,
    prereqs: f.prereqs.map((p) => p.prerrequisitoId).sort((a, b) => a - b),
  }));

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
  const [draftFilas, setDraftFilas] = useState([]);

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
  // Derivados del servidor
  // ---------------------------------------------------------------------

  const periodoActual = useMemo(
    () => periodos.find((p) => p.id === periodoIdNum) ?? null,
    [periodos, periodoIdNum],
  );
  const periodoNoEncontrado = !loading && !error && periodos.length > 0 && !periodoActual;
  const periodoNombre = periodoActual ? periodoActual.nombre || `Año ${periodoActual.numero}` : '';
  const tienePeriodosAnteriores = Boolean(periodoActual && periodoActual.numero > 1);

  /** Etiqueta de cualquier asignatura del plan (tags de prerrequisito). */
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

  // ---------------------------------------------------------------------
  // Borrador (draft) — se reconstruye en cada recarga del servidor
  // ---------------------------------------------------------------------

  const serverDraft = useMemo(
    () => buildDraftFromServer(periodoActual, prerrequisitos, asignaturaLabelById),
    [periodoActual, prerrequisitos, asignaturaLabelById],
  );

  useEffect(() => {
    setDraftFilas(serverDraft);
  }, [serverDraft]);

  const hayCambios = useMemo(
    () => JSON.stringify(normalizeDraft(draftFilas)) !== JSON.stringify(normalizeDraft(serverDraft)),
    [draftFilas, serverDraft],
  );

  const horasAsignadas = useMemo(
    () => draftFilas.reduce((total, f) => total + (Number(f.horas) || 0), 0),
    [draftFilas],
  );
  const horasSemana = plan?.horasSemana ?? null;
  const horasDisponibles = horasSemana != null ? horasSemana - horasAsignadas : Infinity;

  /**
   * Catálogo de materias activas anotado contra el plan: `enPeriodoActual`
   * (ya en el borrador), `asignadaEn` (otro periodo) y `esPrerrequisitoValido`
   * (asignada a un periodo estrictamente anterior → fuente de prerrequisito).
   * Las materias asignadas a otro periodo que NO sirven como prerrequisito
   * (periodos posteriores, o cualquiera en el primer año) se EXCLUYEN: no
   * aportan nada en esta pantalla.
   */
  const materiasCatalogo = useMemo(() => {
    const porSigla = new Map();
    for (const p of periodos) {
      if (p.id === periodoIdNum) continue;
      for (const asig of p.asignaturas ?? []) {
        if (asig.materia?.sigla) {
          porSigla.set(asig.materia.sigla, {
            asignaturaId: asig.id,
            periodoNumero: p.numero,
            periodoNombre: p.nombre || `Año ${p.numero}`,
          });
        }
      }
    }
    const siglasEnDraft = new Set(draftFilas.map((f) => f.sigla).filter(Boolean));
    return materias
      .filter((m) => m.activo !== false)
      .map((m) => {
        const asignadaEn = porSigla.get(m.sigla) ?? null;
        return {
          ...m,
          enPeriodoActual: siglasEnDraft.has(m.sigla),
          asignadaEn,
          esPrerrequisitoValido: Boolean(
            asignadaEn && periodoActual && esPeriodoAnterior(asignadaEn.periodoNumero, periodoActual.numero),
          ),
        };
      })
      .filter((m) => !m.asignadaEn || m.esPrerrequisitoValido);
  }, [materias, periodos, periodoIdNum, draftFilas, periodoActual]);

  // ---------------------------------------------------------------------
  // Mutaciones del borrador (solo memoria)
  // ---------------------------------------------------------------------

  const agregarMateria = useCallback(
    (materia) => {
      if (materia.enPeriodoActual || materia.asignadaEn) return false;
      if (horasDisponibles <= 0) {
        notification.warning({
          title: 'Sin cupo de horas',
          description: `${periodoNombre} ya usa las ${horasSemana ?? '—'} h/semana del plan.`,
        });
        return false;
      }
      const horasDefault = Math.max(1, Math.min(HORAS_DEFAULT_MAX, horasDisponibles));
      setDraftFilas((prev) => [
        ...prev,
        {
          key: `new-${materia.id}`,
          asignaturaId: null,
          materiaId: materia.id,
          sigla: materia.sigla ?? null,
          nombre: materia.nombre ?? null,
          horas: horasDefault,
          prereqs: [],
        },
      ]);
      return true;
    },
    [horasDisponibles, horasSemana, periodoNombre, notification],
  );

  const quitarFila = useCallback((filaKey) => {
    setDraftFilas((prev) => prev.filter((f) => f.key !== filaKey));
  }, []);

  const cambiarHoras = useCallback((filaKey, horas) => {
    if (horas == null) return;
    setDraftFilas((prev) => prev.map((f) => (f.key === filaKey ? { ...f, horas } : f)));
  }, []);

  const agregarPrerrequisito = useCallback(
    (filaKey, materia) => {
      if (!materia.esPrerrequisitoValido || !materia.asignadaEn) {
        notification.warning({
          title: 'Prerrequisito inválido',
          description: 'El prerrequisito debe ser una materia asignada a un año anterior del plan.',
        });
        return false;
      }
      setDraftFilas((prev) =>
        prev.map((f) => {
          if (f.key !== filaKey) return f;
          if (f.prereqs.some((p) => p.prerrequisitoId === materia.asignadaEn.asignaturaId)) return f;
          return {
            ...f,
            prereqs: [
              ...f.prereqs,
              {
                key: `new-prereq-${materia.asignadaEn.asignaturaId}`,
                id: null,
                prerrequisitoId: materia.asignadaEn.asignaturaId,
                sigla: materia.sigla ?? null,
                nombre: materia.nombre ?? null,
                periodoNombre: materia.asignadaEn.periodoNombre,
              },
            ],
          };
        }),
      );
      return true;
    },
    [notification],
  );

  /**
   * Mueve un prerrequisito ya colocado a OTRA fila del periodo (drag del tag
   * entre filas): en el borrador sale de la fila origen y entra como nuevo en
   * la destino; al guardar, el diff lo resuelve como baja + alta.
   */
  const moverPrerrequisito = useCallback(
    (origenKey, destinoKey, prereqKey) => {
      if (origenKey === destinoKey) return;
      setDraftFilas((prev) => {
        const origen = prev.find((f) => f.key === origenKey);
        const destino = prev.find((f) => f.key === destinoKey);
        const prereq = origen?.prereqs.find((p) => p.key === prereqKey);
        if (!origen || !destino || !prereq) return prev;
        if (destino.prereqs.some((p) => p.prerrequisitoId === prereq.prerrequisitoId)) {
          notification.warning({
            title: 'Prerrequisito repetido',
            description: `${destino.sigla ?? 'La asignatura'} ya tiene ese prerrequisito.`,
          });
          return prev;
        }
        return prev.map((f) => {
          if (f.key === origenKey) {
            return { ...f, prereqs: f.prereqs.filter((p) => p.key !== prereqKey) };
          }
          if (f.key === destinoKey) {
            return {
              ...f,
              prereqs: [
                ...f.prereqs,
                { ...prereq, id: null, key: `new-prereq-${prereq.prerrequisitoId}` },
              ],
            };
          }
          return f;
        });
      });
    },
    [notification],
  );

  const quitarPrerrequisito = useCallback((filaKey, prereqKey) => {
    setDraftFilas((prev) =>
      prev.map((f) =>
        f.key === filaKey ? { ...f, prereqs: f.prereqs.filter((p) => p.key !== prereqKey) } : f,
      ),
    );
  }, []);

  const descartarCambios = useCallback(() => {
    setDraftFilas(serverDraft);
  }, [serverDraft]);

  // ---------------------------------------------------------------------
  // Guardar cambios — diff borrador vs servidor, en orden seguro para el cupo
  // ---------------------------------------------------------------------

  const guardarCambios = useCallback(async () => {
    if (!plan?.id || !periodoActual || guardando) return false;
    setGuardando(true);
    try {
      const draftByAsigId = new Map(
        draftFilas.filter((f) => f.asignaturaId).map((f) => [f.asignaturaId, f]),
      );

      // 1. Prerrequisitos eliminados de filas conservadas
      for (const sf of serverDraft) {
        const df = draftByAsigId.get(sf.asignaturaId);
        if (!df) continue; // la fila se elimina completa en el paso 2
        const conservados = new Set(df.prereqs.map((p) => p.id).filter(Boolean));
        for (const sp of sf.prereqs) {
          if (!conservados.has(sp.id)) {
            const r = await eliminarPrerrequisito(sp.id);
            if (!r.success) throw new Error(r.error || `No se pudo quitar el prerrequisito ${sp.sigla ?? ''}`);
          }
        }
      }

      // 2. Asignaturas eliminadas (sus prerrequisitos primero)
      for (const sf of serverDraft) {
        if (draftByAsigId.has(sf.asignaturaId)) continue;
        for (const sp of sf.prereqs) {
          const r = await eliminarPrerrequisito(sp.id);
          if (!r.success) throw new Error(r.error || `No se pudo quitar el prerrequisito ${sp.sigla ?? ''}`);
        }
        const r = await eliminarAsignaturaPlan(sf.asignaturaId);
        if (!r.success) throw new Error(r.error || `No se pudo quitar ${sf.sigla ?? 'la asignatura'}`);
      }

      // 3. Horas modificadas en filas existentes
      const serverByAsigId = new Map(serverDraft.map((f) => [f.asignaturaId, f]));
      for (const df of draftFilas) {
        if (!df.asignaturaId) continue;
        const sf = serverByAsigId.get(df.asignaturaId);
        if (sf && Number(df.horas) !== Number(sf.horas)) {
          const r = await actualizarAsignatura(df.asignaturaId, { horas_semanales: df.horas });
          if (!r.success) throw new Error(r.error || `No se pudieron actualizar las horas de ${df.sigla ?? ''}`);
        }
      }

      // 4. Asignaturas nuevas (capturando el id creado para sus prerrequisitos)
      const idPorKey = new Map();
      for (const df of draftFilas) {
        if (df.asignaturaId) continue;
        const r = await crearAsignaturaPlan({
          plan_estudio_id: plan.id,
          periodo_id: periodoActual.id,
          materia_id: df.materiaId,
          horas_semanales: df.horas,
        });
        if (!r.success) throw new Error(r.error || `No se pudo agregar ${df.sigla ?? 'la asignatura'}`);
        idPorKey.set(df.key, r.data?.id ?? null);
      }

      // 4b. Fallback: si el alta no devolvió id y la fila trae prerrequisitos,
      // resolverlo releyendo la matriz (match por materia)
      const necesitaResolver = draftFilas.some(
        (df) => !df.asignaturaId && !idPorKey.get(df.key) && df.prereqs.length > 0,
      );
      if (necesitaResolver) {
        const mres = await fetchMatriz(plan.id);
        const periodoFresco = (mres.data?.periodos ?? []).find((p) => p.id === periodoActual.id);
        for (const df of draftFilas) {
          if (df.asignaturaId || idPorKey.get(df.key)) continue;
          const match = (periodoFresco?.asignaturas ?? []).find(
            (a) => (a.materia_id ?? a.materia?.id) === df.materiaId || a.materia?.sigla === df.sigla,
          );
          if (match) idPorKey.set(df.key, match.id);
        }
      }

      // 5. Prerrequisitos nuevos
      for (const df of draftFilas) {
        const asignaturaId = df.asignaturaId ?? idPorKey.get(df.key);
        if (!asignaturaId) continue;
        for (const pr of df.prereqs) {
          if (pr.id) continue;
          const r = await crearPrerrequisito({
            plan_estudio_id: plan.id,
            asignatura_id: asignaturaId,
            prerrequisito_id: pr.prerrequisitoId,
          });
          if (!r.success) throw new Error(r.error || `No se pudo agregar el prerrequisito ${pr.sigla ?? ''}`);
        }
      }

      notification.success({
        title: 'Cambios guardados',
        description: `${periodoNombre} quedó actualizado.`,
      });
      await load();
      return true;
    } catch (e) {
      notification.error({ title: 'Error al guardar cambios', description: e?.message });
      await load();
      return false;
    } finally {
      setGuardando(false);
    }
  }, [
    plan?.id,
    periodoActual,
    guardando,
    draftFilas,
    serverDraft,
    eliminarPrerrequisito,
    eliminarAsignaturaPlan,
    actualizarAsignatura,
    crearAsignaturaPlan,
    crearPrerrequisito,
    fetchMatriz,
    notification,
    periodoNombre,
    load,
  ]);

  // ---------------------------------------------------------------------
  // Navegación y baja del periodo
  // ---------------------------------------------------------------------

  const handleVolver = useCallback(() => {
    navigate(planDetallePath(planId), { state: navState });
  }, [navigate, planId, navState]);

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

  return {
    plan,
    periodoActual,
    periodoNombre,
    periodoNoEncontrado,
    tienePeriodosAnteriores,
    materiasCatalogo,
    materiasLoading,
    draftFilas,
    hayCambios,
    horasAsignadas,
    horasSemana,
    horasDisponibles,
    breadcrumbItems,
    loading,
    error,
    isInvalidId,
    guardando,
    agregarMateria,
    quitarFila,
    cambiarHoras,
    agregarPrerrequisito,
    moverPrerrequisito,
    quitarPrerrequisito,
    descartarCambios,
    guardarCambios,
    handleVolver,
    handleEliminarPeriodo,
    refetch: load,
  };
};
