/**
 * Estado de la página «Renovación de oferta académica»
 * (/institucional/oferta/renovar).
 *
 * Orquesta TODO el flujo: carga de gestiones + planes habilitados de la
 * gestión origen (default: la vigente), selección origen/destino (el alta de
 * gestión vive en su propia página — /institucional/oferta/gestiones/nueva —
 * que regresa con location.state.gestionCreadaId para preseleccionar el
 * destino), alcance de la copia (planes seleccionados + flags
 * asignaciones/horarios — horarios fuerza asignaciones), el POST de
 * renovación (resumen por plan) y el cierre del flujo (marcar vigente la
 * nueva gestión). Nada se publica hasta marcar vigente.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { App } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { ofertaPaths } from '../../config/paths.js';
import { gestionLabel, planDisplayLabel } from './ofertaStateShared.js';
import { useOfertaAcademicaApi } from '../api/useOfertaAcademicaApi.js';

/** Etiqueta de opción del Select de gestiones: `codigo — nombre (vigente)`. */
function gestionOptionLabel(gestion) {
  const codigo = gestionLabel(gestion);
  const nombre = gestion?.nombre ?? gestion?.name ?? null;
  const base = nombre && nombre !== codigo ? `${codigo} — ${nombre}` : codigo;
  return gestion?.vigente ? `${base} (vigente)` : base;
}

export function useRenovarOfertaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { message, notification } = App.useApp();

  const {
    error: apiError,
    fetchGestionesSilent,
    fetchPlanesHabilitadosSilent,
    marcarGestionVigente,
    renovarOferta,
  } = useOfertaAcademicaApi();

  const planesFetchSeq = useRef(0);

  const [gestiones, setGestiones] = useState([]);
  const [gestionesLoaded, setGestionesLoaded] = useState(false);
  const [origenId, setOrigenId] = useState(null);
  const [destinoId, setDestinoId] = useState(null);
  const [planesOrigen, setPlanesOrigen] = useState([]);
  const [planesLoaded, setPlanesLoaded] = useState(false);
  const [seleccionPlanes, setSeleccionPlanes] = useState([]);
  // Renovar = copiar la oferta COMPLETA (decisión de producto 2026-07-13):
  // paralelos + cursos + docentes + horarios, siempre. El endpoint conserva
  // los flags por si algún día hace falta un alcance parcial.
  const incluirAsignaciones = true;
  const incluirHorarios = true;
  const [renovando, setRenovando] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [marcandoVigente, setMarcandoVigente] = useState(false);
  const [vigenteMarcada, setVigenteMarcada] = useState(false);

  const gestionOrigen = useMemo(
    () => gestiones.find((g) => Number(g.id) === Number(origenId)) ?? null,
    [gestiones, origenId]
  );

  const gestionDestino = useMemo(
    () => gestiones.find((g) => Number(g.id) === Number(destinoId)) ?? null,
    [gestiones, destinoId]
  );

  const opcionesOrigen = useMemo(
    () => gestiones.map((g) => ({ value: Number(g.id), label: gestionOptionLabel(g) })),
    [gestiones]
  );

  /** El destino nunca puede ser la misma gestión origen. */
  const opcionesDestino = useMemo(
    () =>
      gestiones
        .filter((g) => Number(g.id) !== Number(origenId))
        .map((g) => ({ value: Number(g.id), label: gestionOptionLabel(g) })),
    [gestiones, origenId]
  );

  const loadGestiones = useCallback(async () => {
    const res = await fetchGestionesSilent();
    if (!res.success) {
      setGestionesLoaded(true);
      return [];
    }
    const raw = res.data?.gestiones ?? res.data?.managements ?? res.data;
    const items = Array.isArray(raw) ? raw : [];
    setGestiones(items);
    setGestionesLoaded(true);
    return items;
  }, [fetchGestionesSilent]);

  // Carga inicial (una sola vez): gestiones + origen por defecto (la vigente)
  // + destino preseleccionado al volver del alta de gestión
  // (location.state.gestionCreadaId, ya presente en la lista recién cargada).
  const defaultsAplicados = useRef(false);
  useEffect(() => {
    (async () => {
      const items = await loadGestiones();
      if (defaultsAplicados.current) return;
      defaultsAplicados.current = true;
      const vigente = items.find((g) => g.vigente);
      if (vigente?.id != null) setOrigenId(Number(vigente.id));
      const creadaId = Number(location.state?.gestionCreadaId);
      if (Number.isFinite(creadaId) && creadaId > 0) setDestinoId(creadaId);
    })();
  }, [loadGestiones, location.state]);

  // Planes habilitados de la gestión origen; al cambiar de origen se reinicia
  // la selección (default: todos) y se descarta el resumen anterior.
  useEffect(() => {
    if (!Number.isFinite(Number(origenId)) || Number(origenId) < 1) {
      setPlanesOrigen([]);
      setPlanesLoaded(false);
      setSeleccionPlanes([]);
      return;
    }
    const seq = ++planesFetchSeq.current;
    setPlanesLoaded(false);
    setResumen(null);
    setVigenteMarcada(false);
    (async () => {
      const res = await fetchPlanesHabilitadosSilent(Number(origenId));
      if (seq !== planesFetchSeq.current) return;
      const planes = res.success ? (res.data?.planesHabilitados ?? []) : [];
      setPlanesOrigen(planes);
      setSeleccionPlanes(planes.map((p) => Number(p.id)));
      setPlanesLoaded(true);
    })();
  }, [origenId, fetchPlanesHabilitadosSilent]);

  const sinPlanesOrigen = planesLoaded && planesOrigen.length === 0;

  const puedeRenovar =
    Number.isFinite(Number(origenId)) &&
    Number.isFinite(Number(destinoId)) &&
    Number(origenId) !== Number(destinoId) &&
    seleccionPlanes.length > 0 &&
    planesLoaded &&
    !renovando;

  const onOrigenChange = useCallback((value) => {
    const id = Number(value);
    setOrigenId(id);
    // El destino no puede coincidir con el nuevo origen.
    setDestinoId((prev) => (Number(prev) === id ? null : prev));
  }, []);

  const onDestinoChange = useCallback((value) => {
    setDestinoId(value != null ? Number(value) : null);
    setResumen(null);
    setVigenteMarcada(false);
  }, []);

  /** El alta de gestión es una página propia; vuelve con gestionCreadaId. */
  const navigateNuevaGestion = useCallback(
    () => navigate(ofertaPaths.nuevaGestion()),
    [navigate]
  );

  /** Horarios requiere asignaciones: al activarlo, asignaciones queda fijo en true. */
  /** POST /gestiones/:idDestino/renovar-oferta → resumen por plan. */
  const onRenovar = useCallback(async () => {
    if (!puedeRenovar) return;

    setRenovando(true);
    try {
      const res = await renovarOferta(Number(destinoId), {
        gestion_origen_id: Number(origenId),
        incluir_asignaciones: incluirAsignaciones,
        incluir_horarios: incluirHorarios,
        gestiones_planes: seleccionPlanes.map((id) => ({
          gestion_plan_origen_id: Number(id),
        })),
      });
      if (!res.success) {
        notification.error({
          title: 'No se pudo renovar la oferta',
          description: res.error || 'Intente nuevamente o revise la gestión destino.',
        });
        return;
      }
      setResumen(res.data?.resumen ?? null);
      setVigenteMarcada(false);
      notification.success({
        title: 'Oferta renovada en la gestión destino',
        description:
          'Revise el resumen por plan. Nada se publica hasta marcar vigente la nueva gestión.',
      });
    } finally {
      setRenovando(false);
    }
  }, [
    puedeRenovar,
    renovarOferta,
    destinoId,
    origenId,
    incluirAsignaciones,
    incluirHorarios,
    seleccionPlanes,
    notification,
  ]);

  /** Abre la nueva gestión y cierra la anterior (POST marcar-vigente). */
  const onMarcarVigente = useCallback(async () => {
    if (!Number.isFinite(Number(destinoId))) return;
    setMarcandoVigente(true);
    try {
      const res = await marcarGestionVigente(Number(destinoId));
      if (!res.success) {
        message.error(res.error || 'No se pudo marcar la gestión como vigente');
        return;
      }
      message.success('La nueva gestión quedó vigente.');
      setVigenteMarcada(true);
      await loadGestiones();
    } finally {
      setMarcandoVigente(false);
    }
  }, [destinoId, marcarGestionVigente, loadGestiones, message]);

  // ---- Resumen (respuesta del POST) mapeado a filas con etiqueta de plan ----

  const resumenPlanes = useMemo(() => {
    const planes = resumen?.planes ?? [];
    return planes.map((p) => {
      const origen = planesOrigen.find(
        (po) => Number(po.id) === Number(p.gestion_plan_origen_id)
      );
      return {
        key: Number(p.gestion_plan_origen_id),
        carreraCodigo: origen?.carreraCodigo ?? null,
        label: origen ? planDisplayLabel(origen) : `Plan #${p.plan_estudio_id}`,
        creado: p.gestion_plan_destino_id != null,
        paralelos: Number(p.paralelos ?? 0),
        ofertas: Number(p.ofertas ?? 0),
        asignaciones: Number(p.asignaciones ?? 0),
        bloques: Number(p.bloques ?? 0),
        advertencias: Array.isArray(p.advertencias) ? p.advertencias : [],
      };
    });
  }, [resumen, planesOrigen]);

  /** Advertencias agregadas del resumen, prefijadas con el plan de origen. */
  const advertenciasResumen = useMemo(
    () =>
      resumenPlanes.flatMap((p) => p.advertencias.map((texto) => `${p.label}: ${texto}`)),
    [resumenPlanes]
  );

  const navigatePlanesDestino = useCallback(() => {
    if (Number.isFinite(Number(destinoId))) {
      navigate(ofertaPaths.gestionPlanes(Number(destinoId)));
    }
  }, [navigate, destinoId]);

  const navigateBack = useCallback(() => navigate(ofertaPaths.dashboard()), [navigate]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Institucional', href: '/institucional' },
      { title: 'Oferta académica', href: ofertaPaths.dashboard() },
      { title: 'Renovación de oferta' },
    ],
    []
  );

  return {
    // catálogos y selección
    cargandoGestiones: !gestionesLoaded,
    apiError,
    gestiones,
    gestionOrigen,
    gestionDestino,
    origenId,
    destinoId,
    opcionesOrigen,
    opcionesDestino,
    onOrigenChange,
    onDestinoChange,
    navigateNuevaGestion,
    // qué renovar
    planesOrigen,
    planesLoading: origenId != null && !planesLoaded,
    sinPlanesOrigen,
    seleccionPlanes,
    setSeleccionPlanes,
    incluirAsignaciones,
    incluirHorarios,
    // submit + resultado
    puedeRenovar,
    renovando,
    onRenovar,
    resumen,
    resumenPlanes,
    advertenciasResumen,
    marcandoVigente,
    vigenteMarcada,
    onMarcarVigente,
    navigatePlanesDestino,
    // shell
    pageTitle: 'Renovación de oferta académica',
    breadcrumbItems,
    navigateBack,
  };
}
