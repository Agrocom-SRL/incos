/**
 * Estado de la pantalla GRILLA SEMANAL de asistencia.
 *
 * Orquesta: semana activa (desde query o vigente), navegación semana ant/sig dentro
 * del bimestre, mapa de celdas modificadas (sparse), modo corrección (registro reabierto)
 * y guardado del lote. La página y la grilla solo consumen este contrato.
 *
 * Reglas de marcado en `asistenciaMarcas.js`. El orden de filas viene del backend.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
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

export const usePlanillaAsistenciaState = () => {
  const { asignacionId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { notification } = App.useApp();
  const { hasPermiso } = useAuth();

  const { planilla, loading, error, fetch } = usePlanillaAsistenciaApi();
  const { calendario, fetch: fetchCalendario } = useCalendarioAsistenciaApi();
  const { guardar, guardando } = useBulkAsistenciaApi();
  const { cerrar, reabrir, procesando: procesandoCierre } = useRegistroCierreApi();
  const { crear: crearSesion, creando: creandoSesion } = useSesionEspecialApi();

  const puedeEditar = hasPermiso(ASISTENCIA_PERMISOS.registroCuaderno, 'EDITAR');

  // Mapa de celdas modificadas en memoria: clave → estado destino (PRESENTE|AUSENTE|TARDANZA).
  const [cambios, setCambios] = useState(() => new Map());
  // Modo corrección: se activa al reabrir; habilita el ciclo con TARDANZA.
  const [modoCorreccion, setModoCorreccion] = useState(false);

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
    if (!asignacionId) return;
    fetch(asignacionId, { desde: desdeQuery, hasta: hastaQuery });
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
        // Si vuelve al valor del backend, se retira del mapa de cambios.
        if (proximo === original) next.delete(clave);
        else next.set(clave, proximo);
        return next;
      });
    },
    [puedeEditar, diaPorFecha, registroCerrado, cambios, modoCorreccion],
  );

  const descartarCambios = useCallback(() => setCambios(new Map()), []);

  /** Arma el payload sparse agrupado por día (solo días con celdas modificadas). */
  const construirPayloadDias = useCallback(() => {
    const porFecha = new Map();
    for (const [clave, estado] of cambios.entries()) {
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
  }, [cambios]);

  const guardarPlanilla = useCallback(async () => {
    if (!hayCambios) return;
    const diasPayload = construirPayloadDias();
    const res = await guardar(asignacionId, { dias: diasPayload });
    if (!res?.success) {
      notification.error({
        title: 'No se pudo guardar la asistencia',
        description: res?.error || 'Reintentá en unos segundos.',
      });
      return;
    }
    const m = res.data?.marcas ?? {};
    notification.success({
      title: 'Asistencia guardada',
      description: `Faltas registradas: creadas ${m.creadas ?? 0}, actualizadas ${m.actualizadas ?? 0}, quitadas ${m.borradas ?? 0}.`,
    });
    setCambios(new Map());
    cargarPlanilla();
    recargarCalendario();
  }, [hayCambios, construirPayloadDias, guardar, asignacionId, notification, cargarPlanilla, recargarCalendario]);

  const cerrarRegistro = useCallback(async () => {
    const res = await cerrar(asignacionId, { bimestre });
    if (!res?.success) {
      notification.error({
        title: 'No se pudo cerrar el registro',
        description: res?.error || 'Reintentá en unos segundos.',
      });
      return false;
    }
    setModoCorreccion(false);
    notification.success({
      title: 'Registro cerrado',
      description: 'La asistencia del bimestre quedó en solo lectura.',
    });
    cargarPlanilla();
    return true;
  }, [cerrar, asignacionId, bimestre, notification, cargarPlanilla]);

  const reabrirYcorregir = useCallback(async () => {
    const res = await reabrir(asignacionId, { bimestre });
    if (!res?.success) {
      notification.error({
        title: 'No se pudo reabrir el registro',
        description: res?.error || 'Reintentá en unos segundos.',
      });
      return;
    }
    setModoCorreccion(true);
    notification.success({
      title: 'Registro reabierto',
      description: 'Modo corrección activo: tocá una falta para marcar atraso.',
    });
    cargarPlanilla();
  }, [reabrir, asignacionId, bimestre, notification, cargarPlanilla]);

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
    // acciones
    guardarPlanilla,
    guardando,
    cerrarRegistro,
    reabrirYcorregir,
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
