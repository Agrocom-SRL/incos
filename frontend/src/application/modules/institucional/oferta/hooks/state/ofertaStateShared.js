/** Utilidades compartidas entre pantallas de oferta (sin fetch). */

export const OFERTA_TURNOS = ['MAÑANA', 'TARDE', 'NOCHE'];

export function gestionLabel(gestion) {
  if (!gestion) return '—';
  return (
    gestion.codigo ??
    gestion.nombre ??
    gestion.name ??
    `Gestión ${gestion.id}`
  );
}

/**
 * Etiqueta corta de plan habilitado (tabs, breadcrumbs). Una carrera puede
 * tener más de un plan habilitado a la vez (vigente + históricos con
 * estudiantes en curso, ver `planesCatalogoPendientesHabilitar`): la sola
 * sigla de carrera no alcanza para diferenciar los tabs entre sí, por eso se
 * suma la RM (o el nombre del plan si no hay RM) del plan de estudios.
 */
export function planTabLabel(plan) {
  if (!plan) return 'Plan';
  const carrera = plan.carreraCodigo ?? plan.carreraNombre;
  const detalle = plan.planResolucion ?? plan.planNombre;
  if (carrera && detalle) return `${carrera} · ${detalle}`;
  return (
    carrera ??
    plan.nombre ??
    (plan.planEstudioId ? `Plan #${plan.planEstudioId}` : `Plan #${plan.id}`)
  );
}

/** Etiqueta larga de plan (listas, hints). */
export function planDisplayLabel(plan) {
  if (!plan) return '—';
  if (plan.carreraNombre && plan.nombre) {
    return `${plan.carreraNombre} · ${plan.nombre}`;
  }
  return planTabLabel(plan);
}

export function filterGestionesBySearch(gestiones, searchText) {
  const items = Array.isArray(gestiones) ? gestiones : [];
  const q = String(searchText ?? '').trim().toLowerCase();
  if (!q) return items;
  return items.filter((g) => {
    const codigo = (g.codigo ?? '').toLowerCase();
    const nombre = (g.nombre ?? g.name ?? '').toLowerCase();
    const anio = String(g.anio ?? '');
    return codigo.includes(q) || nombre.includes(q) || anio.includes(q);
  });
}

/** Paralelos de gestión sin filas en oferta_cursos (ofertaActual = 0). */
export function paralelosSinOfertaCursos(paralelos = []) {
  return (Array.isArray(paralelos) ? paralelos : []).filter(
    (pg) => Number(pg?.ofertaActual ?? 0) === 0
  );
}

/** Instancias con oferta o estado avanzado (p. ej. listados que ocultan plantillas vacías). */
export function filterParalelosGestionVisibles(paralelos = []) {
  return (Array.isArray(paralelos) ? paralelos : []).filter((pg) => {
    const estado = String(pg?.estado ?? '').toUpperCase();
    const oferta = Number(pg?.ofertaActual ?? 0);
    if (estado === 'OFERTADO' || estado === 'PUBLICADO' || estado === 'CERRADO') return true;
    return oferta > 0;
  });
}

export function buildSetupKpis({ planesHabilitados, planesHabilitadosLoaded, gestionSeleccionada }) {
  const planesCount = planesHabilitados.length;
  const sinPlanesReal =
    planesHabilitadosLoaded && gestionSeleccionada && planesCount === 0 ? 1 : 0;
  return {
    phase: 'setup',
    total: planesCount,
    planesHabilitados: planesCount,
    planesHabilitadosLoaded,
    sinPlanes: sinPlanesReal,
    gestionVigente: gestionSeleccionada?.vigente ? 1 : 0,
  };
}

export function buildParalelosKpis(paralelosGestion, validacionPorId) {
  const total = paralelosGestion.length || 1;
  let sinAula = 0;
  let ofertaIncompleta = 0;
  let listosOfertado = 0;
  let ofertados = 0;
  let publicados = 0;
  let borrador = 0;

  for (const pg of paralelosGestion) {
    if (!pg.aulaId) sinAula += 1;
    const v = validacionPorId[pg.id];
    if (v && !v.valido) ofertaIncompleta += 1;
    const est = String(pg.estado || '').toUpperCase();
    if (est === 'BORRADOR') borrador += 1;
    if (est === 'OFERTADO') ofertados += 1;
    if (est === 'PUBLICADO') publicados += 1;
    if (est === 'BORRADOR' && pg.aulaId && v?.valido) listosOfertado += 1;
  }

  const avanceOferta = ofertados + publicados;

  return {
    phase: 'paralelos',
    total: paralelosGestion.length,
    sinAula,
    ofertaIncompleta,
    listosOfertado,
    ofertados,
    publicados,
    borrador,
    completosPct: total > 0 ? Math.round((avanceOferta / total) * 100) : 0,
  };
}

export async function refreshValidacionesParalelos(validarOferta, items) {
  const rows = Array.isArray(items) ? items : [];
  if (!rows.length) return {};
  const entries = await Promise.all(
    rows.map(async (pg) => {
      const res = await validarOferta(pg.id);
      if (!res.success) return [pg.id, null];
      return [pg.id, res.data?.validacion ?? res.data];
    })
  );
  return Object.fromEntries(entries);
}

/** Etiqueta de plan del catálogo académico (API planes-estudios). */
export function planCatalogoLabel(plan) {
  if (!plan) return '—';
  const nombre = plan.nombre_plan ?? plan.nombrePlan ?? plan.nombre;
  const resolucion = plan.resolucion_ministerial ?? plan.resolucionMinisterial;
  if (nombre && resolucion) return `${nombre} · ${resolucion}`;
  return nombre ?? resolucion ?? `Plan #${plan.id}`;
}

/**
 * Planes del catálogo (activos; ya no solo el vigente — una carrera puede
 * tener también históricos activos con estudiantes en curso, ver
 * `CreateGestionPlanUseCase`) aún no habilitados en la gestión.
 */
export function planesCatalogoPendientesHabilitar(planesVigentes, planesHabilitados) {
  const habilitadosIds = new Set(
    (planesHabilitados ?? [])
      .map((p) => Number(p.planEstudioId))
      .filter((id) => Number.isFinite(id) && id > 0)
  );
  return (planesVigentes ?? []).filter((p) => {
    if (p.activo === false || p.activo === 0) return false;
    const id = Number(p.id);
    return Number.isFinite(id) && id > 0 && !habilitadosIds.has(id);
  });
}

/**
 * Habilita en lote todos los planes vigentes del catálogo aún no vinculados a la gestión.
 * @returns {{ success: boolean, habilitados: number, total: number, errores: string[], yaCompletos?: boolean, catalogo?: object[], error?: string }}
 */
export async function habilitarTodosPlanesPendientesEnGestion({
  gestionId,
  habilitarPlan,
  fetchPlanesHabilitados,
  fetchPlanesVigentesCatalogo,
  planesVigentes = [],
}) {
  if (!gestionId) {
    return { success: false, habilitados: 0, total: 0, errores: [], error: 'Gestión no válida' };
  }

  let catalogo = Array.isArray(planesVigentes) ? planesVigentes : [];
  if (!catalogo.length) {
    const catRes = await fetchPlanesVigentesCatalogo();
    if (!catRes.success) {
      return {
        success: false,
        habilitados: 0,
        total: 0,
        errores: [],
        error: catRes.error,
      };
    }
    const raw = catRes.data?.planes_estudios ?? catRes.data;
    catalogo = Array.isArray(raw) ? raw : [];
  }

  const habRes = await fetchPlanesHabilitados(gestionId);
  const habilitados = habRes.success ? (habRes.data?.planesHabilitados ?? []) : [];
  const pendientes = planesCatalogoPendientesHabilitar(catalogo, habilitados);

  if (!pendientes.length) {
    return {
      success: true,
      habilitados: 0,
      total: 0,
      errores: [],
      yaCompletos: true,
      catalogo,
    };
  }

  let ok = 0;
  const errores = [];
  for (const plan of pendientes) {
    const res = await habilitarPlan({
      gestion_id: gestionId,
      plan_estudio_id: plan.id,
    });
    if (res.success) {
      ok += 1;
    } else {
      errores.push(planCatalogoLabel(plan));
    }
  }

  return {
    success: errores.length === 0,
    habilitados: ok,
    total: pendientes.length,
    errores,
    catalogo,
  };
}

/** Payload GET /paralelos-gestion/:id/cobertura-docente → data.cobertura_docente */
export function normalizeCoberturaDocentePayload(data) {
  if (!data || typeof data !== 'object') return null;
  return data.cobertura_docente ?? data.cobertura ?? data;
}

export async function refreshCoberturaParalelos(fetchCoberturaDocente, items) {
  const rows = Array.isArray(items) ? items : [];
  if (!rows.length) return {};
  const entries = await Promise.all(
    rows.map(async (pg) => {
      const res = await fetchCoberturaDocente(pg.id);
      if (!res.success) return [pg.id, null];
      return [pg.id, normalizeCoberturaDocentePayload(res.data)];
    })
  );
  return Object.fromEntries(entries);
}
