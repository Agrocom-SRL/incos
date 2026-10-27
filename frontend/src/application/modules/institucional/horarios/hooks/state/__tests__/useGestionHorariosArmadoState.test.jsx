/**
 * useGestionHorariosArmadoState: plan semanal de un paralelo en gestión.
 * Las APIs y los cálculos puros (mappers, generación de bloques, diff bulk)
 * se simulan; aquí se prueba la orquestación y sus reglas de estado.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const R = vi.hoisted(() => ({
  navigate: vi.fn(),
  location: { state: null },
  search: new URLSearchParams(),
  setSearch: vi.fn(),
  notification: null,
  gestiones: [],
  oferta: null,
  publicar: vi.fn(),
  resolver: null,
  grilla: null,
  fetchGrilla: vi.fn(),
  legacy: null,
  bulk: null,
  validar: vi.fn(),
  meta: null,
  server: [],
  missing: [],
  bulkItems: { items: [], incomplete: false },
  horarioResuelto: 700,
  generar: vi.fn(),
  reajustar: vi.fn(),
}));

vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => R.navigate,
  useLocation: () => R.location,
  useSearchParams: () => [R.search, R.setSearch],
}));
vi.mock('@application-shared/hooks', async (orig) => ({
  ...(await orig()),
  useGestionesCatalogApi: () => ({ gestiones: R.gestiones }),
}));
vi.mock('@application-institucional/oferta', () => ({ useOfertaAcademicaApi: () => R.oferta }));
vi.mock('@application-academico/paralelos/hooks', () => ({ usePersistParaleloScheduleApi: () => R.legacy }));
vi.mock('../../api/useBulkAsignacionHorariosApi', () => ({ useBulkAsignacionHorariosApi: () => R.bulk }));
vi.mock('../../api/useValidarConflictoHorarioApi', () => ({ useValidarConflictoHorarioApi: () => ({ validar: R.validar }) }));
vi.mock('../../api/useParaleloGestionGrillaHorarioApi', () => ({ useParaleloGestionGrillaHorarioApi: () => R.grilla }));
vi.mock('../../api/usePublicarParaleloGestionApi', () => ({ usePublicarParaleloGestionApi: () => ({ publicar: R.publicar }) }));
vi.mock('../../useParaleloGestionVigenteResolver', () => ({ useParaleloGestionVigenteResolver: () => R.resolver }));

vi.mock('@application-institucional/common/utils/mapParaleloGestionContextModel', () => ({
  mapParaleloGestionContextModel: (m) => ({ ...m, aulaId: m.aulaId ?? null }),
}));
vi.mock('@application-institucional/horarios/utils/buildBulkAsignacionHorarioItems', () => ({
  buildBulkAsignacionHorarioItems: () => R.bulkItems,
}));
vi.mock('@application-institucional/horarios/utils/buildHorarioSlotIndex', () => ({
  buildHorarioSlotIndexFromGrilla: () => ({ origen: 'pg' }),
  resolveHorarioIdForBloque: () => R.horarioResuelto,
}));
vi.mock('@application-institucional/horarios/mappers/grillaHorarioMapper', () => ({
  extractGrillaHorarioMeta: () => R.meta,
  grillaHorarioToCourseSchedules: () => R.server,
  missingSubjectsFromGrillaCobertura: () => R.missing,
}));
vi.mock('@application-institucional/horarios/utils/generarBloquesAutomaticosCurso', () => ({
  generarBloquesAutomaticosCurso: (...a) => R.generar(...a),
  reajustarCoberturaCurso: (...a) => R.reajustar(...a),
}));

import { useGestionHorariosArmadoState } from '../useGestionHorariosArmadoState';

const BLOQUE = { cursoHorarioId: 11, dia: 'LUNES', horaInicio: '19:00', horaFin: '19:45', aulaId: 4 };
const CURSO = { cursoId: 70, asignacionDocenteId: 900, docente: 'Pérez', materiaNombre: 'Mat', bloques: [BLOQUE] };
const OTRO = { cursoId: 71, asignacionDocenteId: 901, docente: 'Gómez', bloques: [{ cursoHorarioId: 12, dia: 'MARTES', horaInicio: '20:00', horaFin: '20:45' }] };

const armar = () => {
  R.notification = { success: vi.fn(), warning: vi.fn(), error: vi.fn(), info: vi.fn() };
  R.gestiones = [{ id: 3, vigente: true }];
  R.oferta = {
    fetchParaleloGestionDetalleSilent: vi.fn().mockResolvedValue({
      success: true,
      data: { paralelo_gestion: { paraleloNombre: 'A', turno: 'TARDE', estado: 'BORRADOR', paralelo_id: 4, aulaId: 8 } },
    }),
    updateParaleloGestionEstado: vi.fn().mockResolvedValue({ success: true }),
  };
  R.resolver = { paraleloGestionId: null, meta: null, loading: false, error: null };
  R.grilla = { grillaHorario: { raw: true }, loading: false, error: null, fetchGrillaHorario: R.fetchGrilla };
  R.legacy = { result: null, loading: false, error: null, fetch: vi.fn() };
  R.bulk = { loading: false, error: null, ejecutarBulk: vi.fn().mockResolvedValue({ success: true, data: { ok: 1 } }) };
  R.meta = { turno: 'NOCHE', conflictos: [], cobertura: { completa: true } };
  R.server = [CURSO];
  R.missing = [];
  R.bulkItems = { items: [], incomplete: false };
  R.horarioResuelto = 700;
  R.publicar.mockResolvedValue({ success: true });
  R.fetchGrilla.mockResolvedValue({ success: true });
};

const montar = async (query = 'pg=20&tab=plan') => {
  R.search = new URLSearchParams(query);
  const hook = renderHook(() => useGestionHorariosArmadoState(R.notification));
  await waitFor(() => expect(hook.result.current.paraleloNombre).toBe('A'));
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
};

beforeEach(() => {
  vi.clearAllMocks();
  R.location = { state: null };
  armar();
});

describe('useGestionHorariosArmadoState - contexto', () => {
  it('carga el paralelo en gestión por ?pg= y su grilla', async () => {
    const { result } = await montar();
    expect(R.oferta.fetchParaleloGestionDetalleSilent).toHaveBeenCalledWith(20);
    expect(R.fetchGrilla).toHaveBeenCalledWith(20);
    expect(result.current).toMatchObject({
      paraleloGestionId: 20, tab: 'plan', turnoEfectivo: 'TARDE', paraleloGestionEstado: 'BORRADOR',
      hasParaleloSelected: true, gestionVigenteId: 3,
    });
    expect(result.current.pageTitle).toBe('Plan semanal — A · Turno TARDE');
    expect(result.current.breadcrumbItems.at(-1).title).toBe('Plan semanal');
    expect(result.current.paraleloGestionDetalle).toMatchObject({ id: 20, paraleloNombre: 'A', aulaId: 8 });
    expect(result.current.serverSchedules).toEqual([CURSO]);
  });

  it('reescribe la URL canónica sin el paralelo maestro legacy', async () => {
    await montar('pg=20&paralelo=4&tab=gestion');
    await waitFor(() => expect(R.setSearch).toHaveBeenCalled());
    const [updater, opts] = R.setSearch.mock.calls[0];
    expect(opts).toEqual({ replace: true });
    const next = updater(new URLSearchParams('pg=20&paralelo=4&tab=gestion'));
    expect(next.get('paralelo')).toBeNull();
    expect(next.get('tab')).toBe('plan');
    // si ya es canónica devuelve el mismo objeto (sin navegación)
    const canon = new URLSearchParams('pg=20&tab=plan');
    expect(updater(canon)).toBe(canon);
  });

  it('con ?paralelo= legacy usa el resolutor de paralelo en gestión vigente', async () => {
    R.resolver = { paraleloGestionId: 55, meta: { nombre: 'B', turno: 'MAÑANA', estado: 'OFERTADO' }, loading: false, error: null };
    R.search = new URLSearchParams('paralelo=4');
    const { result } = renderHook(() => useGestionHorariosArmadoState(R.notification));
    expect(result.current.paraleloGestionId).toBe(55);
    expect(result.current.paraleloNombre).toBe('B');
    expect(result.current.turnoEfectivo).toBe('MAÑANA');
    expect(R.oferta.fetchParaleloGestionDetalleSilent).not.toHaveBeenCalled();
  });

  it('sin paralelo seleccionado no consulta y muestra título genérico', async () => {
    R.search = new URLSearchParams('');
    const { result } = renderHook(() => useGestionHorariosArmadoState(R.notification));
    expect(result.current.hasParaleloSelected).toBe(false);
    expect(result.current.pageTitle).toBe('Plan semanal del paralelo');
    expect(R.fetchGrilla).not.toHaveBeenCalled();
    await expect(result.current.refetchSchedule()).resolves.toEqual({ success: false, error: 'Sin paralelo en gestión' });
    act(() => result.current.setTab('cobertura'));
    expect(R.setSearch).not.toHaveBeenCalled();
  });

  it('error al cargar el paralelo se expone y limpia el contexto', async () => {
    R.oferta.fetchParaleloGestionDetalleSilent.mockResolvedValue({ success: false });
    R.search = new URLSearchParams('pg=20');
    const { result } = renderHook(() => useGestionHorariosArmadoState(R.notification));
    await waitFor(() => expect(result.current.error).toBe('No se pudo cargar el paralelo en gestión'));
    expect(result.current.paraleloGestionDetalle).toBeNull();
  });

  it('setTab sincroniza la pestaña en la URL; refetchSchedule recarga la grilla', async () => {
    const { result } = await montar();
    R.setSearch.mockClear();
    act(() => result.current.setTab('cobertura'));
    const [updater] = R.setSearch.mock.calls[0];
    expect(updater(new URLSearchParams('pg=20&tab=plan')).get('tab')).toBe('cobertura');
    await act(async () => { await result.current.refetchSchedule(); });
    expect(R.fetchGrilla).toHaveBeenLastCalledWith(20);
  });

  it('handleVolver usa el origen o la gestión de horarios y conserva la clave del menú', async () => {
    R.location = { state: { returnListPath: ' /origen ', menuSidebarKey: 'INS' } };
    const { result, rerender } = await montar();
    act(() => result.current.handleVolver());
    expect(R.navigate).toHaveBeenLastCalledWith('/origen', { state: { menuSidebarKey: 'INS' } });
    R.location = { state: null };
    rerender();
    act(() => result.current.handleVolver());
    expect(R.navigate).toHaveBeenLastCalledWith('/institucional/horarios', { state: undefined });
  });

  it('el estado de carga combina grilla y errores de la API de grilla', async () => {
    R.grilla = { ...R.grilla, loading: true, error: 'grilla caída' };
    R.search = new URLSearchParams('pg=20');
    const { result } = renderHook(() => useGestionHorariosArmadoState(R.notification));
    await waitFor(() => expect(result.current.paraleloNombre).toBe('A'));
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe('grilla caída');
  });
});

describe('useGestionHorariosArmadoState - validatePlacement', () => {
  const mover = { cursoId: 70, cursoHorarioId: 11, targetDia: 'MARTES', targetSlotMinutes: 21 * 60 };
  const conBorrador = async (cursos = [CURSO]) => {
    const hook = await montar();
    act(() => hook.result.current.setDraftSchedules(cursos));
    return hook;
  };

  it('soltar sobre otro bloque de la misma materia es un no-op silencioso', async () => {
    const { result } = await conBorrador([{ ...CURSO, bloques: [BLOQUE, { cursoHorarioId: 13, dia: 'MARTES', horaInicio: '21:00', horaFin: '21:45' }] }]);
    let r;
    await act(async () => { r = await result.current.validatePlacement(mover); });
    expect(r).toEqual({ ok: false, silent: true });
  });

  it('intercambio con otra materia es válido sin llamar al backend', async () => {
    const { result } = await conBorrador([CURSO, OTRO]);
    let r;
    await act(async () => {
      r = await result.current.validatePlacement({ ...mover, targetDia: 'MARTES', targetSlotMinutes: 20 * 60, sourceDia: 'LUNES', sourceSlotMinutes: 19 * 60 });
    });
    expect(r).toEqual({ ok: true, swap: true });
    expect(R.validar).not.toHaveBeenCalled();
  });

  it('bloque inexistente es válido', async () => {
    const { result } = await conBorrador();
    let r;
    await act(async () => { r = await result.current.validatePlacement({ ...mover, cursoHorarioId: 'x' }); });
    expect(r).toEqual({ ok: true });
  });

  it('sin docente asignado indica ir a la oferta académica', async () => {
    const { result } = await conBorrador([{ ...CURSO, asignacionDocenteId: null }]);
    let r;
    await act(async () => { r = await result.current.validatePlacement(mover); });
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/Oferta académica/);
  });

  it('sin horario en el catálogo rechaza', async () => {
    R.horarioResuelto = null;
    const { result } = await conBorrador();
    let r;
    await act(async () => { r = await result.current.validatePlacement(mover); });
    expect(r.message).toMatch(/No se encontró el horario del catálogo/);
  });

  it('valida contra el backend y respeta el id de bloque a excluir', async () => {
    R.validar.mockResolvedValue({ valido: true });
    const { result } = await conBorrador();
    let r;
    await act(async () => { r = await result.current.validatePlacement(mover); });
    expect(r).toEqual({ ok: true });
    expect(R.validar).toHaveBeenCalledWith({ asignacion_docente_id: 900, horario_id: 700, aula_id: 4, asignacion_horario_id: 11 });
  });

  it('bloque de vista previa (alta) excluye ids temporales', async () => {
    R.validar.mockResolvedValue({ valido: true });
    const { result } = await conBorrador();
    await act(async () => {
      await result.current.validatePlacement({ cursoId: 70, cursoHorarioId: 'temp-1', targetDia: 'JUEVES', targetSlotMinutes: 1200, bloquePreview: { cursoHorarioId: 'temp-1', dia: 'JUEVES', horaInicio: '20:00', horaFin: '20:45' } });
    });
    expect(R.validar).toHaveBeenCalledWith(expect.objectContaining({ asignacion_horario_id: null }));
  });

  it('conflicto de paralelo explica la regla; otros conflictos juntan mensajes', async () => {
    const { result } = await conBorrador();
    R.validar.mockResolvedValueOnce({ valido: false, conflictos: [{ tipo: 'PARALELO', mensaje: 'Ocupado.' }] });
    let r;
    await act(async () => { r = await result.current.validatePlacement(mover); });
    expect(r.message).toContain('Ocupado.');
    expect(r.message).toContain('una sola clase');
    R.validar.mockResolvedValueOnce({ valido: false, conflictos: [{ tipo: 'DOCENTE', mensaje: 'A' }, { tipo: 'AULA', mensaje: 'B' }] });
    await act(async () => { r = await result.current.validatePlacement(mover); });
    expect(r.message).toBe('A B');
    R.validar.mockResolvedValueOnce({ valido: false, error: 'falló' });
    await act(async () => { r = await result.current.validatePlacement(mover); });
    expect(r.message).toBe('falló');
    R.validar.mockResolvedValueOnce({ valido: false });
    await act(async () => { r = await result.current.validatePlacement(mover); });
    expect(r.message).toBe('El bloque genera un conflicto de horario');
  });
});

describe('useGestionHorariosArmadoState - guardar plan', () => {
  it('paralelo CERRADO no permite guardar', async () => {
    R.oferta.fetchParaleloGestionDetalleSilent.mockResolvedValue({ success: true, data: { paraleloNombre: 'A', estado: 'CERRADO' } });
    const { result } = await montar();
    await act(async () => { await result.current.onRequestPersist(); });
    expect(R.notification.warning).toHaveBeenCalledWith(expect.objectContaining({ title: 'Plan no editable' }));
    expect(R.bulk.ejecutarBulk).not.toHaveBeenCalled();
  });

  it('sin cambios informa y no llama al backend', async () => {
    const { result } = await montar();
    await act(async () => { await result.current.onRequestPersist(); });
    expect(R.notification.info).toHaveBeenCalledWith(expect.objectContaining({ title: 'Sin cambios' }));
  });

  it('plan incompleto bloquea el guardado', async () => {
    R.bulkItems = { items: [{ op: 'create' }], incomplete: true };
    const { result } = await montar();
    await act(async () => { await result.current.onRequestPersist(); });
    expect(R.notification.warning).toHaveBeenCalledWith(expect.objectContaining({ title: 'Plan incompleto' }));
    expect(R.bulk.ejecutarBulk).not.toHaveBeenCalled();
  });

  it('guardado correcto notifica y recarga la grilla', async () => {
    R.bulkItems = { items: [{ op: 'create' }], incomplete: false };
    const { result } = await montar();
    R.fetchGrilla.mockClear();
    await act(async () => { await result.current.onRequestPersist(); });
    expect(R.bulk.ejecutarBulk).toHaveBeenCalledWith([{ op: 'create' }]);
    expect(R.notification.success).toHaveBeenCalledWith(expect.objectContaining({ title: 'Plan guardado' }));
    await waitFor(() => expect(R.fetchGrilla).toHaveBeenCalledWith(20));
  });

  it('error del backend se notifica', async () => {
    R.bulkItems = { items: [{ op: 'create' }], incomplete: false };
    R.bulk.ejecutarBulk.mockResolvedValue({ success: false, error: 'Rechazado' });
    const { result } = await montar();
    await act(async () => { await result.current.onRequestPersist(); });
    expect(R.notification.error).toHaveBeenCalledWith({ title: 'Error al guardar', description: 'Rechazado' });
  });

  describe('paralelo PUBLICADO', () => {
    beforeEach(() => {
      R.oferta.fetchParaleloGestionDetalleSilent.mockResolvedValue({ success: true, data: { paraleloNombre: 'A', estado: 'PUBLICADO' } });
    });

    it('solo altas/bajas: avisa y no guarda', async () => {
      R.bulkItems = { items: [{ op: 'create' }], incomplete: false };
      const { result } = await montar();
      expect(result.current.horarioEditable).toBe(false);
      expect(result.current.planSemanalEditable).toBe(true);
      await act(async () => { await result.current.onRequestPersist(); });
      expect(R.notification.warning).toHaveBeenCalledWith(expect.objectContaining({ title: 'Paralelo publicado' }));
      expect(R.bulk.ejecutarBulk).not.toHaveBeenCalled();
    });

    it('mezcla: guarda solo las reubicaciones', async () => {
      R.bulkItems = { items: [{ op: 'create' }, { op: 'UPDATE', id: 1 }], incomplete: false };
      const { result } = await montar();
      await act(async () => { await result.current.onRequestPersist(); });
      expect(R.bulk.ejecutarBulk).toHaveBeenCalledWith([{ op: 'UPDATE', id: 1 }]);
      expect(R.notification.info).toHaveBeenCalledWith(expect.objectContaining({ title: 'Paralelo publicado' }));
    });
  });

  it('planSemanalDirty refleja el diff pendiente', async () => {
    R.bulkItems = { items: [{ op: 'update' }], incomplete: false };
    const { result } = await montar();
    expect(result.current.planSemanalDirty).toBe(true);
    expect(result.current.puedePublicarDesdeArmado).toBe(false);
  });
});

describe('useGestionHorariosArmadoState - generar y reajustar', () => {
  it('generarBloquesCurso aplica el resultado al borrador y cambia a la pestaña plan', async () => {
    R.generar.mockReturnValue({ placed: 2, faltante: 0, schedules: [{ cursoId: 70, bloques: [] }] });
    const { result } = await montar();
    let r;
    act(() => { r = result.current.generarBloquesCurso(70, 4); });
    expect(R.generar).toHaveBeenCalledWith(expect.objectContaining({
      cursoId: 70, horasPlanOverride: 4, turnoLabel: 'TARDE', aulaMeta: expect.objectContaining({ aulaId: 8, paraleloNombre: 'A' }),
    }));
    expect(r).toMatchObject({ ok: true, placed: 2 });
    expect(result.current.draftSchedules).toEqual([{ cursoId: 70, bloques: [] }]);
    expect(R.notification.success).toHaveBeenCalledWith(expect.objectContaining({ title: 'Horario generado' }));
    expect(R.setSearch).toHaveBeenCalled();
  });

  it('generación parcial advierte; sin bloques colocados avisa que no se pudo', async () => {
    const { result } = await montar();
    R.generar.mockReturnValueOnce({ placed: 1, faltante: 2, schedules: [] });
    act(() => { result.current.generarBloquesCurso(70); });
    expect(R.notification.warning).toHaveBeenCalledWith(expect.objectContaining({ title: 'Horario parcial' }));
    R.generar.mockReturnValueOnce({ placed: 0, schedules: [], message: 'Sin franjas' });
    let r;
    act(() => { r = result.current.generarBloquesCurso(70); });
    expect(r.ok).toBe(false);
    expect(R.notification.warning).toHaveBeenCalledWith({ title: 'No se pudo generar', description: 'Sin franjas' });
  });

  it('generar en paralelo PUBLICADO no está permitido', async () => {
    R.oferta.fetchParaleloGestionDetalleSilent.mockResolvedValue({ success: true, data: { paraleloNombre: 'A', estado: 'PUBLICADO' } });
    const { result } = await montar();
    let r;
    act(() => { r = result.current.generarBloquesCurso(70); });
    expect(r).toEqual({ ok: false });
    expect(R.generar).not.toHaveBeenCalled();
  });

  it('reajustarBloquesCurso persiste con cobertura y actualiza el borrador', async () => {
    R.reajustar.mockReturnValue({ removed: 1, placed: 2, faltante: 0, schedules: [CURSO] });
    R.bulkItems = { items: [{ op: 'create' }], incomplete: false };
    const { result } = await montar();
    let r;
    await act(async () => { r = await result.current.reajustarBloquesCurso(70); });
    expect(R.bulk.ejecutarBulk).toHaveBeenCalledWith([{ op: 'create' }], { coberturaReajuste: true });
    expect(r.ok).toBe(true);
    expect(R.notification.success).toHaveBeenCalledWith(expect.objectContaining({ title: 'Cobertura reajustada' }));
  });

  it('reajuste sin efecto, con fallo al persistir o parcial', async () => {
    const { result } = await montar();
    R.reajustar.mockReturnValueOnce({ removed: 0, placed: 0, schedules: [] });
    await act(async () => { await result.current.reajustarBloquesCurso(70); });
    expect(R.notification.warning).toHaveBeenCalledWith(expect.objectContaining({ title: 'Sin cambios' }));

    R.reajustar.mockReturnValue({ removed: 1, placed: 0, faltante: 0, schedules: [CURSO] });
    R.bulkItems = { items: [{ op: 'create' }], incomplete: true };
    let r;
    await act(async () => { r = await result.current.reajustarBloquesCurso(70); });
    expect(r.ok).toBe(false);
    expect(R.notification.error).toHaveBeenCalledWith(expect.objectContaining({ title: 'No se pudo guardar' }));

    R.bulkItems = { items: [{ op: 'create' }], incomplete: false };
    R.reajustar.mockReturnValue({ removed: 1, placed: 1, faltante: 3, schedules: [CURSO] });
    await act(async () => { await result.current.reajustarBloquesCurso(70); });
    expect(R.notification.warning).toHaveBeenCalledWith(expect.objectContaining({ title: 'Cobertura parcial' }));
  });

  it('reajustar en paralelo CERRADO no está permitido', async () => {
    R.oferta.fetchParaleloGestionDetalleSilent.mockResolvedValue({ success: true, data: { paraleloNombre: 'A', estado: 'CERRADO' } });
    const { result } = await montar();
    let r;
    await act(async () => { r = await result.current.reajustarBloquesCurso(70); });
    expect(r).toEqual({ ok: false });
    await act(async () => { r = await result.current.reajustarCoberturaParalelo(); });
    expect(r).toEqual({ ok: false });
    expect(R.notification.warning).toHaveBeenCalledWith(expect.objectContaining({ title: 'Cobertura no editable' }));
  });

  it('reajustarCoberturaParalelo recorre las materias con docente y reporta las que no lo tienen', async () => {
    R.reajustar.mockImplementation(({ schedules }) => ({ schedules, removed: 1, placed: 2, faltante: 0 }));
    R.bulkItems = { items: [{ op: 'create' }], incomplete: false };
    const { result } = await montar();
    act(() => result.current.setDraftSchedules([CURSO, { cursoId: 72, materiaNombre: 'Sin docente', bloques: [] }]));
    let r;
    await act(async () => { r = await result.current.reajustarCoberturaParalelo(); });
    expect(R.reajustar).toHaveBeenCalledTimes(1);
    expect(r).toEqual({ ok: true, placed: 2, removed: 1, faltante: 0 });
    expect(R.notification.success).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Cobertura de la semana generada',
      description: expect.stringContaining('Sin docente'),
    }));
  });

  it('reajustarCoberturaParalelo sin cambios o con error de guardado', async () => {
    const { result } = await montar();
    act(() => result.current.setDraftSchedules([CURSO]));
    R.reajustar.mockReturnValue({ schedules: [CURSO], removed: 0, placed: 0, faltante: 0 });
    let r;
    await act(async () => { r = await result.current.reajustarCoberturaParalelo(); });
    expect(r).toEqual({ ok: false });
    expect(R.notification.warning).toHaveBeenCalledWith(expect.objectContaining({ title: 'Cobertura sin cambios' }));

    R.reajustar.mockReturnValue({ schedules: [CURSO], removed: 0, placed: 1, faltante: 2 });
    R.bulk.ejecutarBulk.mockResolvedValue({ success: false, error: 'conflicto' });
    R.bulkItems = { items: [{ op: 'create' }], incomplete: false };
    await act(async () => { r = await result.current.reajustarCoberturaParalelo(); });
    expect(r).toEqual({ ok: false });
    expect(R.notification.error).toHaveBeenCalledWith(expect.objectContaining({ description: 'conflicto' }));

    R.bulk.ejecutarBulk.mockResolvedValue({ success: true });
    await act(async () => { r = await result.current.reajustarCoberturaParalelo(); });
    expect(r).toMatchObject({ ok: true, faltante: 2 });
    expect(R.notification.warning).toHaveBeenCalledWith(expect.objectContaining({ title: 'Cobertura parcial de la semana' }));
  });
});

describe('useGestionHorariosArmadoState - publicar', () => {
  it('con armado completo y sin cambios se puede publicar', async () => {
    const { result } = await montar();
    expect(result.current.puedePublicarDesdeArmado).toBe(true);
  });

  it('no se puede publicar con conflictos, materias faltantes o ya publicado', async () => {
    R.meta = { conflictos: [{ id: 1 }], cobertura: { completa: true } };
    const a = await montar();
    expect(a.result.current.puedePublicarDesdeArmado).toBe(false);
    R.meta = { conflictos: [], cobertura: { completa: true } };
    R.missing = ['Física'];
    const b = await montar();
    expect(b.result.current.puedePublicarDesdeArmado).toBe(false);
  });

  it('en BORRADOR primero oferta y luego publica', async () => {
    const { result } = await montar();
    let r;
    await act(async () => { r = await result.current.publicarParalelo(); });
    expect(R.oferta.updateParaleloGestionEstado).toHaveBeenCalledWith(20, 'OFERTADO');
    expect(R.publicar).toHaveBeenCalledWith(20);
    expect(r).toEqual({ ok: true });
    expect(R.notification.success).toHaveBeenCalledWith(expect.objectContaining({ title: 'Paralelo publicado' }));
    expect(result.current.publicandoParalelo).toBe(false);
  });

  it('si no se puede ofertar no intenta publicar', async () => {
    R.oferta.updateParaleloGestionEstado.mockResolvedValue({ success: false, error: 'Sin aula' });
    const { result } = await montar();
    let r;
    await act(async () => { r = await result.current.publicarParalelo(); });
    expect(r).toEqual({ ok: false });
    expect(R.publicar).not.toHaveBeenCalled();
    expect(R.notification.error).toHaveBeenCalledWith(expect.objectContaining({ title: 'No se pudo ofertar el paralelo', description: 'Sin aula' }));
  });

  it('muestra las fallas de publicación del backend', async () => {
    R.oferta.fetchParaleloGestionDetalleSilent.mockResolvedValue({ success: true, data: { paraleloNombre: 'A', estado: 'OFERTADO' } });
    R.publicar.mockResolvedValue({ success: false, details: { fallas: [{ mensaje: 'Falta docente' }, { mensaje: 'Falta aula' }] } });
    const { result } = await montar();
    await act(async () => { await result.current.publicarParalelo(); });
    expect(R.oferta.updateParaleloGestionEstado).not.toHaveBeenCalled();
    expect(R.notification.error).toHaveBeenCalledWith({ title: 'No se pudo publicar', description: 'Falta docente Falta aula' });
  });

  it('con cambios sin guardar exige guardar primero', async () => {
    R.bulkItems = { items: [{ op: 'update' }], incomplete: false };
    const { result } = await montar();
    let r;
    await act(async () => { r = await result.current.publicarParalelo(); });
    expect(r).toEqual({ ok: false });
    expect(R.notification.warning).toHaveBeenCalledWith(expect.objectContaining({ title: 'Guarde los cambios' }));
    expect(R.publicar).not.toHaveBeenCalled();
  });

  it('sin paralelo no hace nada', async () => {
    R.search = new URLSearchParams('');
    const { result } = renderHook(() => useGestionHorariosArmadoState(R.notification));
    let r;
    await act(async () => { r = await result.current.publicarParalelo(); });
    expect(r).toEqual({ ok: false });
  });
});
