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
import { ASISTENCIA_PERMISOS } from '../../utils/asistenciaPermisos.js';
import { createAsistenciaBreadcrumbItems } from '../../utils/asistenciaBreadcrumbs.js';
import { calendarioCursoPath } from '../../utils/asistenciaPaths.js';
import { ESTADOS_REGISTRO } from '../../utils/asistenciaEstados.js';
import {
  semanaDeFecha,
  semanaAnterior,
  semanaSiguiente,
} from '../../utils/asistenciaSemanas.js';
import {
  ESTADO,
  estadoEfectivo,
  siguienteEstado,
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
  const { reabrir, procesando: reabriendo } = useRegistroCierreApi();

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

  const cargarPlanilla = useCallback(() => {
    if (!asignacionId) return;
    fetch(asignacionId, { desde: desdeQuery, hasta: hastaQuery });
  }, [asignacionId, desdeQuery, hastaQuery, fetch]);

  // El calendario se carga una vez (límites de navegación + bimestre activo).
  useEffect(() => {
    if (asignacionId) fetchCalendario(asignacionId, {});
  }, [asignacionId, fetchCalendario]);

  useEffect(() => {
    cargarPlanilla();
    // Al cambiar de semana se descartan cambios sin guardar de la semana previa.
    setCambios(new Map());
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
      const proximo = siguienteEstado(actual, modoCorreccion);

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
  }, [hayCambios, construirPayloadDias, guardar, asignacionId, notification, cargarPlanilla]);

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

  // Navegación de semanas dentro del bimestre.
  const semanaActual = useMemo(() => {
    if (rangoSemana) return rangoSemana;
    if (desdeQuery && hastaQuery) return { desde: desdeQuery, hasta: hastaQuery };
    return null;
  }, [rangoSemana, desdeQuery, hastaQuery]);

  const irASemana = useCallback(
    (semana) => {
      if (!semana) return;
      setSearchParams({ desde: semana.desde, hasta: semana.hasta });
    },
    [setSearchParams],
  );

  const semanaPrev = useMemo(
    () => (semanaActual && rangoBimestre ? semanaAnterior(semanaActual, rangoBimestre) : null),
    [semanaActual, rangoBimestre],
  );
  const semanaSig = useMemo(
    () => (semanaActual && rangoBimestre ? semanaSiguiente(semanaActual, rangoBimestre) : null),
    [semanaActual, rangoBimestre],
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
    bimestre,
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
    volverPath: calendarioCursoPath(asignacionId),
    // estado de celdas
    estadoCelda,
    toggleCelda,
    hayCambios,
    descartarCambios,
    // acciones
    guardarPlanilla,
    guardando,
    reabrirYcorregir,
    reabriendo,
    // navegación
    semanaPrev,
    semanaSig,
    irSemanaAnterior,
    irSemanaSiguiente,
    semanaDeFecha,
  };
};
