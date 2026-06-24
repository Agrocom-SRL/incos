/**
 * Estado de la pantalla GRILLA SEMANAL de asistencia.
 *
 * Orquesta: semana activa (desde query o vigente), navegación semana ant/sig dentro
 * del bimestre, mapa de celdas modificadas (sparse), modo corrección (registro reabierto)
 * y guardado del lote. La página y la grilla solo consumen este contrato.
 *
 * Reglas de marcado en `asistenciaMarcas.js`. El orden de filas viene del backend.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { App } from 'antd';
import { useAuth } from '@application-auth';
import { usePlanillaAsistenciaApi } from '../api/usePlanillaAsistenciaApi.js';
import { useCalendarioAsistenciaApi } from '../api/useCalendarioAsistenciaApi.js';
import { useBulkAsistenciaApi } from '../api/useBulkAsistenciaApi.js';
import { useRegistroCierreApi } from '../api/useRegistroCierreApi.js';
import { useSesionEspecialApi } from '../api/useSesionEspecialApi.js';
import { ASISTENCIA_PERMISOS } from '../../utils/asistenciaPermisos.js';
import { createAsistenciaBreadcrumbItems } from '../../utils/asistenciaBreadcrumbs.js';
import { MIS_CURSOS_PATH } from '../../utils/asistenciaPaths.js';
import { ESTADOS_REGISTRO } from '../../utils/asistenciaEstados.js';
import {
  semanaDeFecha,
  semanaLibreDeFecha,
  semanaAnterior,
  semanaSiguiente,
} from '../../utils/asistenciaSemanas.js';
import {
  ESTADO,
  estadoEfectivo,
  siguienteEstado,
  permiteAtraso,
  celdaEditable,
} from '../../utils/asistenciaMarcas.js';

/** Clave estable de una celda (estudiante|fecha) para el mapa de cambios. */
const claveCelda = (matriculaMateriaId, fecha) => `${matriculaMateriaId}|${fecha}`;

/**
 * Espera (debounce) tras la última marca antes de persistir automáticamente. El docente
 * marca varias celdas seguidas; se agrupan en un único guardado al hacer una pausa.
 */
const AUTOGUARDADO_DELAY_MS = 1200;

/**
 * Reintento con backoff: si un autoguardado falla, se reintenta solo en segundo plano
 * (sin avisar al usuario), espaciando cada intento hasta este techo. La caché sobrevive
 * mientras tanto; la red de seguridad real está al cerrar día / salir.
 */
const AUTOGUARDADO_BACKOFF_MAX_MS = 15000;

export const usePlanillaAsistenciaState = () => {
  const { asignacionId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { notification } = App.useApp();
  const { hasPermiso } = useAuth();

  const { planilla, loading, error, fetch } = usePlanillaAsistenciaApi();
  const { calendario, fetch: fetchCalendario } = useCalendarioAsistenciaApi();
  const { guardar } = useBulkAsistenciaApi();
  const { cerrar, reabrir, procesando: procesandoCierre } = useRegistroCierreApi();
  const { crear: crearSesion, creando: creandoSesion } = useSesionEspecialApi();

  const puedeEditar = hasPermiso(ASISTENCIA_PERMISOS.registroCuaderno, 'EDITAR');

  // Mapa de celdas modificadas en memoria (caché local de marcas SIN persistir):
  //   clave → estado destino (PRESENTE|AUSENTE|TARDANZA).
  // Cada entrada es un delta respecto al backend cargado; al autoguardarse con éxito se
  // recarga la planilla y la entrada se poda (el backend pasa a ser la verdad).
  const [cambios, setCambios] = useState(() => new Map());
  // Modo corrección: se activa al reabrir; habilita el ciclo con TARDANZA.
  const [modoCorreccion, setModoCorreccion] = useState(false);

  // Autoguardado por celda (debounce) SILENCIOSO: no expone estado a la UI. Refs espejo
  // para leer la caché viva dentro del timer/await sin recrear closures, el handle del
  // debounce, un cerrojo de envío en curso y el delay actual de backoff de reintento.
  const cambiosRef = useRef(cambios);
  const debounceRef = useRef(null);
  const flushEnCursoRef = useRef(false);
  const backoffRef = useRef(AUTOGUARDADO_DELAY_MS);
  const programarRef = useRef(null);

  useEffect(() => {
    cambiosRef.current = cambios;
  }, [cambios]);

  // Al desmontar, cancelar cualquier autoguardado pendiente.
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  const desdeQuery = searchParams.get('desde');
  const hastaQuery = searchParams.get('hasta');

  // Rango del bimestre (límites de la navegación) desde el calendario.
  const rangoBimestre = calendario?.rango ?? null;
  const bimestre = calendario?.bimestre ?? null;
  // Ficha y resumen del bimestre (mismos datos que la pantalla de calendario): el
  // endpoint del calendario trae docente, gestión, color del bimestre, horario y KPIs.
  const cursoFicha = calendario?.curso ?? null;
  const bimestreNombre = calendario?.bimestreNombre ?? null;
  const bimestreColor = calendario?.bimestreColor ?? null;
  const gestion = calendario?.gestion ?? null;
  const anioCalendario = calendario?.anioCalendario ?? null;
  const resumen = calendario?.resumen ?? null;
  const horario = useMemo(() => calendario?.horario ?? [], [calendario]);
  const hoy = calendario?.hoy ?? null;

  // Rango de navegación = la gestión completa (año calendario), no solo el bimestre:
  // las flechas y el salto a fecha permiten moverse por toda la gestión vigente. Sin
  // año disponible aún, cae al rango del bimestre (comportamiento previo).
  const rangoGestion = useMemo(() => {
    if (anioCalendario) {
      return { desde: `${anioCalendario}-01-01`, hasta: `${anioCalendario}-12-31` };
    }
    return rangoBimestre;
  }, [anioCalendario, rangoBimestre]);

  const cargarPlanilla = useCallback(() => {
    if (!asignacionId) return Promise.resolve();
    return fetch(asignacionId, { desde: desdeQuery, hasta: hastaQuery });
  }, [asignacionId, desdeQuery, hastaQuery, fetch]);

  // El resumen (presentes/atrasados/faltantes/licencias del bimestre) sale del endpoint
  // del calendario; al guardar marcas o habilitar una sesión hay que recargarlo para que
  // la sumatoria de la cabecera quede al día (la planilla sola no lo refresca).
  const recargarCalendario = useCallback(() => {
    if (asignacionId) fetchCalendario(asignacionId, {});
  }, [asignacionId, fetchCalendario]);

  // El calendario se carga una vez (límites de navegación + bimestre activo).
  useEffect(() => {
    if (asignacionId) fetchCalendario(asignacionId, {});
  }, [asignacionId, fetchCalendario]);

  useEffect(() => {
    cargarPlanilla();
  }, [cargarPlanilla]);

  const filas = useMemo(() => planilla?.filas ?? [], [planilla]);
  const dias = useMemo(() => planilla?.dias ?? [], [planilla]);
  const diasValidos = useMemo(() => planilla?.diasValidos ?? [], [planilla]);
  const rangoSemana = planilla?.rango ?? null;
  const registroEstado = planilla?.registroEstado ?? ESTADOS_REGISTRO.ABIERTO;
  const registroCerrado = registroEstado === ESTADOS_REGISTRO.CERRADO;
  const curso = planilla?.curso ?? null;

  // Columnas editables = días válidos no neutros ni futuros (mapa por fecha del día de cabecera).
  const diaPorFecha = useMemo(() => {
    const m = new Map();
    dias.forEach((d) => m.set(d.fechaClase, d));
    return m;
  }, [dias]);

  const hayCambios = cambios.size > 0;

  /** Estado vigente de una celda: el cambio local si existe, si no el del backend. */
  const estadoCelda = useCallback(
    (matriculaMateriaId, fecha, estadoBackend) => {
      const clave = claveCelda(matriculaMateriaId, fecha);
      if (cambios.has(clave)) return cambios.get(clave);
      return estadoEfectivo(estadoBackend);
    },
    [cambios],
  );

  /** Cicla la celda (respeta editabilidad y modo corrección). */
  const toggleCelda = useCallback(
    (matriculaMateriaId, fecha, estadoBackend) => {
      if (!puedeEditar) return;
      const dia = diaPorFecha.get(fecha);
      const editable = celdaEditable({
        esDiaClase: dia?.esDiaClase,
        neutro: dia?.neutro,
        esFuturo: dia?.esFuturo,
        registroCerrado,
      });
      if (!editable) return;

      const clave = claveCelda(matriculaMateriaId, fecha);
      const actual = cambios.has(clave)
        ? cambios.get(clave)
        : estadoEfectivo(estadoBackend);
      // El atraso (TARDANZA) solo se habilita sobre una falta ya guardada o con el
      // registro reabierto en modo corrección.
      const proximo = siguienteEstado(actual, permiteAtraso(estadoBackend, modoCorreccion));

      setCambios((prev) => {
        const next = new Map(prev);
        const original = estadoEfectivo(estadoBackend);
        // Si vuelve al valor del backend, se retira de la caché de cambios.
        if (proximo === original) next.delete(clave);
        else next.set(clave, proximo);
        return next;
      });

      // Persistir automáticamente tras una breve pausa (celda por celda agrupada).
      programarRef.current?.();
    },
    [puedeEditar, diaPorFecha, registroCerrado, cambios, modoCorreccion],
  );

  const descartarCambios = useCallback(() => setCambios(new Map()), []);

  /** Arma el payload sparse agrupado por día a partir de las claves indicadas. */
  const construirPayloadDias = useCallback((claves) => {
    const porFecha = new Map();
    for (const clave of claves) {
      if (!cambiosRef.current.has(clave)) continue;
      const estado = cambiosRef.current.get(clave);
      const [matriculaMateriaIdStr, fecha] = clave.split('|');
      if (!porFecha.has(fecha)) porFecha.set(fecha, []);
      porFecha.get(fecha).push({
        matriculaMateriaId: Number(matriculaMateriaIdStr),
        // Una celda que vuelve a presente se envía con estado explícito (el backend borra la fila).
        estado: estado ?? ESTADO.PRESENTE,
      });
    }
    return [...porFecha.entries()].map(([fechaClase, marcas]) => ({
      fechaClase,
      marcas,
    }));
  }, []);

  /**
   * Persiste la caché de marcas (toda la caché viva o las `claves` indicadas).
   * Es el motor del autoguardado y del flush forzado:
   *   1. Envía las celdas sin persistir al endpoint de lote (sparse, celda por celda).
   *   2. Recarga la planilla para alinear `estadoBackend` (habilita el ciclo de atraso
   *      y deja la BD como verdad), y recarga el resumen del bimestre (KPIs).
   *   3. Poda de la caché SOLO las celdas cuyo valor no cambió durante el envío (las
   *      re-marcadas en vuelo quedan pendientes y se reintentan).
   * Es SILENCIOSO: no muestra notificación de éxito ni de error. Si falla, la caché
   * sobrevive y el `finally` reprograma un reintento con backoff. Devuelve `{ success }`
   * para que el flush forzado (cerrar día / salir) sí pueda avisar en su momento.
   */
  const enviarMarcas = useCallback(
    async (clavesInput) => {
      const claves = (clavesInput ?? [...cambiosRef.current.keys()]).filter((c) =>
        cambiosRef.current.has(c),
      );
      if (claves.length === 0) return { success: true };

      // Snapshot de lo enviado para podar luego solo lo confirmado.
      const enviado = new Map(claves.map((c) => [c, cambiosRef.current.get(c)]));
      const diasPayload = construirPayloadDias(claves);

      flushEnCursoRef.current = true;
      let ok = false;
      try {
        const res = await guardar(asignacionId, { dias: diasPayload });
        if (!res?.success) return res ?? { success: false };
        ok = true;
        // Alinear backend (estadoBackend) tras persistir: ciclo de atraso y BD == caché.
        await cargarPlanilla();
        setCambios((prev) => {
          const next = new Map(prev);
          for (const [clave, val] of enviado) {
            if (next.get(clave) === val) next.delete(clave);
          }
          return next;
        });
        recargarCalendario();
        return res;
      } catch (e) {
        return { success: false, error: e?.message };
      } finally {
        flushEnCursoRef.current = false;
        // Éxito → resetea el backoff; fallo → lo duplica (techo) para espaciar reintentos.
        backoffRef.current = ok
          ? AUTOGUARDADO_DELAY_MS
          : Math.min(backoffRef.current * 2, AUTOGUARDADO_BACKOFF_MAX_MS);
        // Si quedaron marcas (re-marcadas en vuelo o un envío fallido), reprogramar.
        if (cambiosRef.current.size > 0) programarRef.current?.(backoffRef.current);
      }
    },
    [asignacionId, guardar, construirPayloadDias, cargarPlanilla, recargarCalendario],
  );

  /** Programa el autoguardado con debounce; se reprograma si hay un envío en curso. */
  const programarAutoguardado = useCallback(
    (delayMs = AUTOGUARDADO_DELAY_MS) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        // Si hay un envío en curso, se reprogramará al terminar (en el finally de enviarMarcas).
        if (flushEnCursoRef.current) return;
        if (cambiosRef.current.size > 0) enviarMarcas();
      }, delayMs);
    },
    [enviarMarcas],
  );

  useEffect(() => {
    programarRef.current = programarAutoguardado;
  }, [programarAutoguardado]);

  /**
   * Fuerza el guardado inmediato de toda la caché y ESPERA a que termine. Se usa antes
   * de cerrar/reabrir un día o al salir: garantiza que la BD quede igual a lo marcado en
   * pantalla aunque algún autoguardado por celda no se hubiera completado. Devuelve `true`
   * si no quedan marcas sin persistir.
   */
  const flushPendientes = useCallback(async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    // Esperar a que termine un autoguardado en vuelo para no solapar envíos.
    for (let i = 0; i < 30 && flushEnCursoRef.current; i += 1) {
      await new Promise((r) => setTimeout(r, 100));
    }
    if (cambiosRef.current.size === 0) return true;
    const res = await enviarMarcas();
    return Boolean(res?.success) && cambiosRef.current.size === 0;
  }, [enviarMarcas]);

  /** Cierra la asistencia de UN día (su sesión → solo lectura). */
  const cerrarDia = useCallback(
    async (fecha) => {
      // Antes de cerrar, persistir la caché de marcas y verificar que la BD quede igual a
      // lo que se ve en pantalla: evita cerrar un día con marcas sin guardar (el conflicto
      // del botón de cierre presionado con registros pendientes).
      if (cambiosRef.current.size > 0) {
        const ok = await flushPendientes();
        if (!ok) {
          notification.error({
            title: 'No se cerró el día',
            description:
              'Quedaron marcas sin guardar. Reintentá en unos segundos y volvé a cerrar.',
          });
          return false;
        }
      }
      const res = await cerrar(asignacionId, { bimestre, fecha });
      if (!res?.success) {
        notification.error({
          title: 'No se pudo cerrar el día',
          description: res?.error || 'Reintentá en unos segundos.',
        });
        return false;
      }
      notification.success({
        title: 'Día cerrado',
        description: 'La asistencia de ese día quedó en solo lectura.',
      });
      cargarPlanilla();
      return true;
    },
    [cerrar, asignacionId, bimestre, notification, cargarPlanilla, flushPendientes],
  );

  /** Reabre la asistencia de UN día (modo corrección para ese día). */
  const reabrirDia = useCallback(
    async (fecha) => {
      // Persistir la caché antes de reabrir, para no perder marcas sin guardar.
      if (cambiosRef.current.size > 0) {
        const ok = await flushPendientes();
        if (!ok) {
          notification.error({
            title: 'No se reabrió el día',
            description:
              'Quedaron marcas sin guardar. Reintentá en unos segundos y volvé a reabrir.',
          });
          return false;
        }
      }
      const res = await reabrir(asignacionId, { bimestre, fecha });
      if (!res?.success) {
        notification.error({
          title: 'No se pudo reabrir el día',
          description: res?.error || 'Reintentá en unos segundos.',
        });
        return false;
      }
      setModoCorreccion(true);
      notification.success({
        title: 'Día reabierto',
        description: 'Modo corrección activo: tocá una falta para marcar atraso.',
      });
      cargarPlanilla();
      return true;
    },
    [reabrir, asignacionId, bimestre, notification, cargarPlanilla, flushPendientes],
  );

  /** Habilita una sesión especial (taller/recuperación) y salta a su semana. */
  const habilitarFechaEspecial = useCallback(
    async ({ fecha, motivo, horaInicio, horaFin }) => {
      const res = await crearSesion(asignacionId, { fecha, motivo, horaInicio, horaFin });
      if (!res?.success) {
        notification.error({
          title: 'No se pudo habilitar la fecha',
          description: res?.error || 'Reintentá en unos segundos.',
        });
        return false;
      }
      notification.success({
        title: 'Fecha especial habilitada',
        description: 'Ya podés tomar asistencia en ese día.',
      });
      // Saltar a la semana de la fecha habilitada (recarga implícita por el cambio de query).
      if (fecha && rangoBimestre) {
        setSearchParams(semanaDeFecha(fecha, rangoBimestre));
      } else {
        cargarPlanilla();
      }
      // La nueva sesión cambia el denominador del resumen → recargar calendario.
      recargarCalendario();
      return true;
    },
    [crearSesion, asignacionId, notification, rangoBimestre, setSearchParams, cargarPlanilla, recargarCalendario],
  );

  // Navegación de semanas dentro del bimestre.
  const semanaActual = useMemo(() => {
    if (rangoSemana) return rangoSemana;
    if (desdeQuery && hastaQuery) return { desde: desdeQuery, hasta: hastaQuery };
    return null;
  }, [rangoSemana, desdeQuery, hastaQuery]);

  const irASemana = useCallback(
    (semana) => {
      if (!semana) return;
      // Al cambiar de semana se descartan los cambios sin guardar de la semana previa.
      setCambios(new Map());
      setSearchParams({ desde: semana.desde, hasta: semana.hasta });
    },
    [setSearchParams],
  );

  /** Salta a la semana (lun–sáb) de una fecha puntual de la gestión, sin importar el bimestre. */
  const irAFecha = useCallback(
    (fechaIso) => {
      if (!fechaIso) return;
      irASemana(semanaLibreDeFecha(fechaIso));
    },
    [irASemana],
  );

  /** Reubica a la semana actual (hoy). */
  const irHoy = useCallback(() => {
    if (hoy) irAFecha(hoy);
  }, [hoy, irAFecha]);

  /** ¿La semana visible contiene el día de hoy? (estado del botón "Hoy"). */
  const esSemanaActual = useMemo(
    () =>
      Boolean(
        hoy &&
          semanaActual?.desde &&
          semanaActual?.hasta &&
          hoy >= semanaActual.desde &&
          hoy <= semanaActual.hasta,
      ),
    [hoy, semanaActual],
  );

  const semanaPrev = useMemo(
    () => (semanaActual && rangoGestion ? semanaAnterior(semanaActual, rangoGestion) : null),
    [semanaActual, rangoGestion],
  );
  const semanaSig = useMemo(
    () => (semanaActual && rangoGestion ? semanaSiguiente(semanaActual, rangoGestion) : null),
    [semanaActual, rangoGestion],
  );

  const irSemanaAnterior = useCallback(() => irASemana(semanaPrev), [irASemana, semanaPrev]);
  const irSemanaSiguiente = useCallback(() => irASemana(semanaSig), [irASemana, semanaSig]);

  const breadcrumbItems = useMemo(
    () =>
      createAsistenciaBreadcrumbItems('ACA-ASI-PLANILLA', 'ACA-ASI', null, {
        asignacionId,
      }),
    [asignacionId],
  );

  return {
    asignacionId,
    curso,
    cursoFicha,
    bimestre,
    bimestreNombre,
    bimestreColor,
    gestion,
    anioCalendario,
    resumen,
    horario,
    hoy,
    filas,
    dias,
    diasValidos,
    rangoSemana: semanaActual,
    rangoBimestre,
    registroEstado,
    registroCerrado,
    modoCorreccion,
    puedeEditar,
    isLoading: loading,
    error,
    refetch: cargarPlanilla,
    breadcrumbItems,
    volverPath: MIS_CURSOS_PATH,
    // estado de celdas
    estadoCelda,
    toggleCelda,
    hayCambios,
    descartarCambios,
    // autoguardado (silencioso): solo se expone el flush forzado para cerrar/salir
    flushPendientes,
    // acciones
    cerrarDia,
    reabrirDia,
    procesandoCierre,
    habilitarFechaEspecial,
    creandoSesion,
    // navegación
    semanaPrev,
    semanaSig,
    irSemanaAnterior,
    irSemanaSiguiente,
    irAFecha,
    irHoy,
    esSemanaActual,
    rangoGestion,
    semanaDeFecha,
  };
};
