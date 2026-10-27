import { describe, it, expect, vi } from 'vitest';
import {
  buildParalelosKpis,
  buildSetupKpis,
  filterGestionesBySearch,
  filterParalelosGestionVisibles,
  gestionLabel,
  habilitarTodosPlanesPendientesEnGestion,
  normalizeCoberturaDocentePayload,
  paralelosSinOfertaCursos,
  planCatalogoLabel,
  planDisplayLabel,
  planTabLabel,
  planesCatalogoPendientesHabilitar,
  refreshCoberturaParalelos,
  refreshValidacionesParalelos,
} from '../ofertaStateShared';

describe('etiquetas de gestión y planes', () => {
  it('gestionLabel prioriza código, nombre y cae en el id', () => {
    expect(gestionLabel(null)).toBe('—');
    expect(gestionLabel({ codigo: 'G26', nombre: 'N' })).toBe('G26');
    expect(gestionLabel({ nombre: 'N' })).toBe('N');
    expect(gestionLabel({ name: 'Name' })).toBe('Name');
    expect(gestionLabel({ id: 4 })).toBe('Gestión 4');
  });

  it('planTabLabel combina carrera y detalle o usa alternativas', () => {
    expect(planTabLabel(null)).toBe('Plan');
    expect(planTabLabel({ carreraCodigo: 'SIS', planResolucion: 'R1' })).toBe('SIS · R1');
    expect(planTabLabel({ carreraNombre: 'Sistemas', planNombre: 'P' })).toBe('Sistemas · P');
    expect(planTabLabel({ carreraCodigo: 'SIS' })).toBe('SIS');
    expect(planTabLabel({ nombre: 'Plan A' })).toBe('Plan A');
    expect(planTabLabel({ planEstudioId: 8 })).toBe('Plan #8');
    expect(planTabLabel({ id: 3 })).toBe('Plan #3');
  });

  it('planDisplayLabel y planCatalogoLabel', () => {
    expect(planDisplayLabel(null)).toBe('—');
    expect(planDisplayLabel({ carreraNombre: 'Sistemas', nombre: 'Plan 2020' })).toBe('Sistemas · Plan 2020');
    expect(planDisplayLabel({ id: 2 })).toBe('Plan #2');
    expect(planCatalogoLabel(null)).toBe('—');
    expect(planCatalogoLabel({ nombre_plan: 'P', resolucion_ministerial: 'RM' })).toBe('P · RM');
    expect(planCatalogoLabel({ nombrePlan: 'P' })).toBe('P');
    expect(planCatalogoLabel({ resolucionMinisterial: 'RM' })).toBe('RM');
    expect(planCatalogoLabel({ id: 9 })).toBe('Plan #9');
  });
});

describe('filtros de listas', () => {
  it('filtra gestiones por código, nombre o año', () => {
    const g = [{ codigo: 'G26', nombre: 'Primera', anio: 2026 }, { name: 'Otra', anio: 2025 }];
    expect(filterGestionesBySearch(g, '  ')).toBe(g);
    expect(filterGestionesBySearch(g, 'g26')).toHaveLength(1);
    expect(filterGestionesBySearch(g, 'otra')).toHaveLength(1);
    expect(filterGestionesBySearch(g, '2025')).toHaveLength(1);
    expect(filterGestionesBySearch(null, 'x')).toEqual([]);
    expect(filterGestionesBySearch(undefined, undefined)).toEqual([]);
  });

  it('paralelos sin oferta y visibles', () => {
    const p = [{ id: 1, ofertaActual: 0 }, { id: 2, ofertaActual: 3, estado: 'BORRADOR' }, { id: 3, estado: 'publicado' }, { id: 4, estado: 'BORRADOR' }, { id: 5, estado: 'CERRADO' }, { id: 6, estado: 'OFERTADO' }];
    expect(paralelosSinOfertaCursos(p).map((x) => x.id)).toEqual([1, 3, 4, 5, 6]);
    expect(paralelosSinOfertaCursos()).toEqual([]);
    expect(paralelosSinOfertaCursos(null)).toEqual([]);
    expect(filterParalelosGestionVisibles(p).map((x) => x.id)).toEqual([2, 3, 5, 6]);
    expect(filterParalelosGestionVisibles()).toEqual([]);
    expect(filterParalelosGestionVisibles('x')).toEqual([]);
  });

  it('planes del catálogo pendientes de habilitar', () => {
    const vigentes = [{ id: 1 }, { id: 2 }, { id: 3, activo: false }, { id: 4, activo: 0 }, { id: 'x' }, { id: 5 }];
    expect(planesCatalogoPendientesHabilitar(vigentes, [{ planEstudioId: 2 }, { planEstudioId: 'z' }]).map((p) => p.id)).toEqual([1, 5]);
    expect(planesCatalogoPendientesHabilitar(null, null)).toEqual([]);
  });
});

describe('indicadores', () => {
  it('KPIs del paso de preparación', () => {
    expect(buildSetupKpis({ planesHabilitados: [], planesHabilitadosLoaded: true, gestionSeleccionada: { vigente: true } })).toMatchObject({ phase: 'setup', total: 0, sinPlanes: 1, gestionVigente: 1 });
    expect(buildSetupKpis({ planesHabilitados: [1], planesHabilitadosLoaded: true, gestionSeleccionada: null })).toMatchObject({ total: 1, sinPlanes: 0, gestionVigente: 0 });
    expect(buildSetupKpis({ planesHabilitados: [], planesHabilitadosLoaded: false, gestionSeleccionada: {} }).sinPlanes).toBe(0);
  });

  it('KPIs de paralelos con validación y avance', () => {
    const pgs = [
      { id: 1, aulaId: 5, estado: 'BORRADOR' },
      { id: 2, estado: 'OFERTADO' },
      { id: 3, aulaId: 1, estado: 'publicado' },
      { id: 4, aulaId: 1, estado: 'BORRADOR' },
    ];
    const k = buildParalelosKpis(pgs, { 1: { valido: true }, 2: { valido: false }, 4: { valido: false } });
    expect(k).toMatchObject({ phase: 'paralelos', total: 4, sinAula: 1, ofertaIncompleta: 2, listosOfertado: 1, ofertados: 1, publicados: 1, borrador: 2, completosPct: 50 });
    expect(buildParalelosKpis([], {})).toMatchObject({ total: 0, completosPct: 0 });
  });
});

describe('refrescos en lote', () => {
  it('validaciones: devuelve datos por id y null en errores', async () => {
    const validar = vi.fn(async (id) => (id === 2 ? { success: false } : { success: true, data: id === 1 ? { validacion: { valido: true } } : { valido: false } }));
    expect(await refreshValidacionesParalelos(validar, [{ id: 1 }, { id: 2 }, { id: 3 }])).toEqual({ 1: { valido: true }, 2: null, 3: { valido: false } });
    expect(await refreshValidacionesParalelos(validar, [])).toEqual({});
    expect(await refreshValidacionesParalelos(validar, null)).toEqual({});
  });

  it('cobertura docente normalizada', async () => {
    expect(normalizeCoberturaDocentePayload(null)).toBeNull();
    expect(normalizeCoberturaDocentePayload('x')).toBeNull();
    expect(normalizeCoberturaDocentePayload({ cobertura_docente: { a: 1 } })).toEqual({ a: 1 });
    expect(normalizeCoberturaDocentePayload({ cobertura: { b: 1 } })).toEqual({ b: 1 });
    expect(normalizeCoberturaDocentePayload({ c: 1 })).toEqual({ c: 1 });
    const fetchCobertura = vi.fn(async (id) => (id === 1 ? { success: true, data: { cobertura: { ok: 1 } } } : { success: false }));
    expect(await refreshCoberturaParalelos(fetchCobertura, [{ id: 1 }, { id: 2 }])).toEqual({ 1: { ok: 1 }, 2: null });
    expect(await refreshCoberturaParalelos(fetchCobertura, undefined)).toEqual({});
  });
});

describe('habilitarTodosPlanesPendientesEnGestion', () => {
  const base = () => ({
    gestionId: 7,
    habilitarPlan: vi.fn().mockResolvedValue({ success: true }),
    fetchPlanesHabilitados: vi.fn().mockResolvedValue({ success: true, data: { planesHabilitados: [{ planEstudioId: 1 }] } }),
    fetchPlanesVigentesCatalogo: vi.fn().mockResolvedValue({ success: true, data: { planes_estudios: [{ id: 1 }, { id: 2, nombre: 'P2' }, { id: 3, nombre: 'P3' }] } }),
  });

  it('rechaza una gestión inválida', async () => {
    expect((await habilitarTodosPlanesPendientesEnGestion({ ...base(), gestionId: null })).error).toBe('Gestión no válida');
  });

  it('habilita los pendientes del catálogo', async () => {
    const args = base();
    const r = await habilitarTodosPlanesPendientesEnGestion(args);
    expect(args.habilitarPlan).toHaveBeenCalledTimes(2);
    expect(args.habilitarPlan).toHaveBeenCalledWith({ gestion_id: 7, plan_estudio_id: 2 });
    expect(r).toMatchObject({ success: true, habilitados: 2, total: 2, errores: [] });
  });

  it('reporta los que fallan y usa el catálogo recibido sin consultarlo', async () => {
    const args = base();
    args.habilitarPlan.mockResolvedValueOnce({ success: false }).mockResolvedValueOnce({ success: true });
    const r = await habilitarTodosPlanesPendientesEnGestion({ ...args, planesVigentes: [{ id: 2, nombre: 'P2' }, { id: 3, nombre: 'P3' }] });
    expect(args.fetchPlanesVigentesCatalogo).not.toHaveBeenCalled();
    expect(r).toMatchObject({ success: false, habilitados: 1, total: 2, errores: ['P2'] });
  });

  it('sin pendientes avisa que ya estaba completo; errores del catálogo y de habilitados', async () => {
    const args = base();
    args.fetchPlanesHabilitados.mockResolvedValue({ success: true, data: { planesHabilitados: [{ planEstudioId: 1 }, { planEstudioId: 2 }, { planEstudioId: 3 }] } });
    expect(await habilitarTodosPlanesPendientesEnGestion(args)).toMatchObject({ success: true, yaCompletos: true, habilitados: 0 });
    const c = base();
    c.fetchPlanesVigentesCatalogo.mockResolvedValue({ success: false, error: 'Sin catálogo' });
    expect(await habilitarTodosPlanesPendientesEnGestion(c)).toMatchObject({ success: false, error: 'Sin catálogo' });
    const d = base();
    d.fetchPlanesVigentesCatalogo.mockResolvedValue({ success: true, data: [{ id: 9 }] });
    d.fetchPlanesHabilitados.mockResolvedValue({ success: false });
    const r = await habilitarTodosPlanesPendientesEnGestion(d);
    expect(d.habilitarPlan).toHaveBeenCalledWith({ gestion_id: 7, plan_estudio_id: 9 });
    expect(r.habilitados).toBe(1);
    const e = base();
    e.fetchPlanesVigentesCatalogo.mockResolvedValue({ success: true, data: 'raro' });
    expect((await habilitarTodosPlanesPendientesEnGestion(e)).yaCompletos).toBe(true);
  });
});
