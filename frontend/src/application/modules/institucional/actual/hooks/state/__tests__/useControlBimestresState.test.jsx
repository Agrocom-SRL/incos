import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const R = vi.hoisted(() => ({
  navigate: vi.fn(),
  app: null,
  act: null,
  per: null,
}));

vi.mock('antd', async (orig) => {
  const real = await orig();
  real.App.useApp = () => R.app;
  return real;
});
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => R.navigate }));
vi.mock('../../api/useGestionActivacionApi.js', () => ({ useGestionActivacionApi: () => R.act }));
vi.mock('../../api/usePeriodosGestionApi.js', () => ({ usePeriodosGestionApi: () => R.per }));

import { useControlBimestresState } from '../useControlBimestresState';

const periodosPayload = {
  success: true,
  data: {
    gestion: { anio: 2026 },
    periodos: [{ id: 1, nombre: 'Bimestre 1', fechaInicio: '2026-02-01', fechaFin: '2026-03-31' }, { id: 2, nombre: 'Bimestre 2' }],
  },
};
const estadoPayload = {
  success: true,
  data: { gestionIniciada: true, bimestreVigente: 1, bimestres: [{ numero: 1, estado: 'EN_CURSO' }, { numero: 2, estado: 'PENDIENTE' }] },
};

const montar = async () => {
  const hook = renderHook(() => useControlBimestresState());
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
};

beforeEach(() => {
  vi.clearAllMocks();
  R.app = {
    modal: { confirm: vi.fn() },
    message: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
  };
  R.act = {
    iniciando: false,
    fetchEstadoActivacion: vi.fn().mockResolvedValue(estadoPayload),
    iniciarGestionAcademica: vi.fn(),
    validarCierreBimestre: vi.fn(),
    cerrarBimestreGestion: vi.fn(),
    abrirBimestreGestion: vi.fn(),
  };
  R.per = {
    fetchPeriodos: vi.fn().mockResolvedValue(periodosPayload),
    actualizarFechasPeriodo: vi.fn(),
    crearEtapaPeriodo: vi.fn(),
    eliminarEtapaPeriodo: vi.fn(),
  };
});

describe('useControlBimestresState', () => {
  it('carga el estado de activación y los periodos al montar', async () => {
    const { result } = await montar();
    expect(R.act.fetchEstadoActivacion).toHaveBeenCalled();
    expect(result.current).toMatchObject({ iniciada: true, bimestreVigente: 1, pageTitle: 'Control de bimestres', dirtyCount: 0 });
    expect(result.current.periodos).toHaveLength(2);
    expect(result.current.gestion).toEqual({ anio: 2026 });
    expect(result.current.anioCalendario).toBeDefined();
    expect(result.current.bimestresApertura).toBeDefined();
    expect(result.current.breadcrumbItems).toHaveLength(4);
    act(() => result.current.goToPanel());
    expect(R.navigate).toHaveBeenCalled();
  });

  it('si la carga no trae periodos conserva lo anterior y tolera estados vacíos', async () => {
    R.act.fetchEstadoActivacion.mockResolvedValue(undefined);
    R.per.fetchPeriodos.mockResolvedValue({ success: false });
    const { result } = await montar();
    expect(result.current.periodos).toEqual([]);
    expect(result.current.bimestreVigente).toBeNull();
    R.act.fetchEstadoActivacion.mockResolvedValue({ success: false, data: { gestionIniciada: false } });
    const b = await montar();
    expect(b.result.current.iniciada).toBe(false);
  });

  it('edición de fechas: marca cambios y guarda solo los modificados', async () => {
    const { result } = await montar();
    act(() => result.current.setRangoPeriodo(1, '2026-02-02', '2026-04-01'));
    expect(result.current.dirtyCount).toBe(1);
    expect(result.current.periodos[0]).toMatchObject({ fechaInicio: '2026-02-02', fechaFin: '2026-04-01' });
    R.per.actualizarFechasPeriodo.mockResolvedValueOnce({ success: false, error: 'Se solapan' });
    await act(async () => result.current.guardarFechas());
    expect(R.app.message.error).toHaveBeenCalledWith('Se solapan');
    expect(R.per.actualizarFechasPeriodo).toHaveBeenCalledWith(1, { fechaInicio: '2026-02-02', fechaFin: '2026-04-01' });
    R.per.actualizarFechasPeriodo.mockResolvedValueOnce({ success: false });
    await act(async () => result.current.guardarFechas());
    expect(R.app.message.error).toHaveBeenLastCalledWith('No se pudieron guardar todas las fechas.');
    R.per.actualizarFechasPeriodo.mockResolvedValueOnce({ success: true });
    await act(async () => result.current.guardarFechas());
    expect(R.app.message.success).toHaveBeenCalledWith('Fechas actualizadas correctamente.');
    await waitFor(() => expect(result.current.dirtyCount).toBe(0));
    R.per.actualizarFechasPeriodo.mockClear();
    await act(async () => result.current.guardarFechas());
    expect(R.per.actualizarFechasPeriodo).not.toHaveBeenCalled();
  });

  it('crear y eliminar etapas', async () => {
    const { result } = await montar();
    R.per.crearEtapaPeriodo.mockResolvedValueOnce({ success: true });
    let ok;
    await act(async () => {
      ok = await result.current.crearEtapa({ nombre: 'E' });
    });
    expect(ok).toBe(true);
    expect(R.app.message.success).toHaveBeenCalledWith('Etapa creada.');
    R.per.crearEtapaPeriodo.mockResolvedValueOnce({ success: false, error: 'Duplicada' });
    await act(async () => {
      ok = await result.current.crearEtapa({});
    });
    expect(ok).toBe(false);
    expect(R.app.message.error).toHaveBeenLastCalledWith('Duplicada');
    R.per.crearEtapaPeriodo.mockResolvedValueOnce({ success: false });
    await act(async () => result.current.crearEtapa({}));
    expect(R.app.message.error).toHaveBeenLastCalledWith('No se pudo crear la etapa.');
    R.per.eliminarEtapaPeriodo.mockResolvedValueOnce({ success: true });
    const calls = R.per.fetchPeriodos.mock.calls.length;
    await act(async () => result.current.eliminarEtapa({ id: 3 }));
    expect(R.per.eliminarEtapaPeriodo).toHaveBeenCalledWith(3);
    expect(R.per.fetchPeriodos.mock.calls.length).toBeGreaterThan(calls);
    R.per.eliminarEtapaPeriodo.mockResolvedValueOnce({ success: false });
    const antes = R.per.fetchPeriodos.mock.calls.length;
    await act(async () => result.current.eliminarEtapa({ id: 4 }));
    expect(R.per.fetchPeriodos.mock.calls.length).toBe(antes);
  });

  it('iniciar gestión: éxito, ya iniciada, error o ya activa', async () => {
    const { result } = await montar();
    act(() => result.current.handleIniciarGestion());
    expect(R.act.iniciarGestionAcademica).not.toHaveBeenCalled();

    R.act.fetchEstadoActivacion.mockResolvedValue({ success: true, data: { gestionIniciada: false, bimestres: [] } });
    const b = await montar();
    R.act.iniciarGestionAcademica.mockResolvedValueOnce({ success: true });
    await act(async () => b.result.current.handleIniciarGestion());
    await waitFor(() => expect(R.app.message.success).toHaveBeenCalledWith(expect.stringMatching(/iniciada/)));
    R.act.iniciarGestionAcademica.mockResolvedValueOnce({ success: false, code: 'GESTION_YA_INICIADA' });
    await act(async () => b.result.current.handleIniciarGestion());
    await waitFor(() => expect(R.app.message.info).toHaveBeenCalled());
    R.act.iniciarGestionAcademica.mockResolvedValueOnce({ success: false, error: 'Sin fechas' });
    await act(async () => b.result.current.handleIniciarGestion());
    await waitFor(() => expect(R.app.message.error).toHaveBeenCalledWith('Sin fechas'));
    R.act.iniciarGestionAcademica.mockResolvedValueOnce({ success: false });
    await act(async () => b.result.current.handleIniciarGestion());
    await waitFor(() => expect(R.app.message.error).toHaveBeenLastCalledWith('No se pudo iniciar la gestión académica.'));
  });

  it('validar el cierre guarda el resultado por bimestre o avisa del error', async () => {
    const { result } = await montar();
    R.act.validarCierreBimestre.mockResolvedValueOnce({ success: true, data: { cursosPendientes: 2 } });
    await act(async () => result.current.handleValidarCierre());
    expect(R.act.validarCierreBimestre).toHaveBeenCalledWith(1);
    expect(result.current.validacion).toEqual({ cursosPendientes: 2 });
    expect(result.current.validacionPorBimestre[1]).toEqual({ cursosPendientes: 2 });
    R.act.validarCierreBimestre.mockResolvedValueOnce({ success: false });
    await act(async () => result.current.handleValidarCierre(2));
    expect(R.app.message.error).toHaveBeenCalledWith('No se pudo validar el cierre del bimestre.');
    R.act.validarCierreBimestre.mockClear();
    await act(async () => result.current.handleValidarCierre(0));
    expect(R.act.validarCierreBimestre).not.toHaveBeenCalled();
  });

  it('cerrar bimestre pide confirmación y distingue éxito, bloqueo y error', async () => {
    const { result } = await montar();
    act(() => result.current.handleCerrarBimestre(0));
    expect(R.app.modal.confirm).not.toHaveBeenCalled();
    act(() => result.current.handleCerrarBimestre());
    const { onOk, title } = R.app.modal.confirm.mock.calls[0][0];
    expect(title).toBe('Cerrar bimestre 1');
    R.act.cerrarBimestreGestion.mockResolvedValueOnce({ success: true, data: { cerrados: 4 } });
    await act(async () => onOk());
    expect(R.app.message.success).toHaveBeenCalledWith('Bimestre 1 cerrado (4 cursos).');
    expect(result.current.validacion).toBeNull();
    R.act.cerrarBimestreGestion.mockResolvedValueOnce({ success: false, code: 'CIERRE_BLOQUEADO', validacion: { pendientes: 1 } });
    await act(async () => onOk());
    expect(result.current.validacionPorBimestre[1]).toEqual({ pendientes: 1 });
    expect(R.app.message.error).toHaveBeenLastCalledWith(expect.stringMatching(/notas pendientes/));
    R.act.cerrarBimestreGestion.mockResolvedValueOnce({ success: false, code: 'CIERRE_BLOQUEADO' });
    await act(async () => onOk());
    expect(result.current.validacion).toBeNull();
    R.act.cerrarBimestreGestion.mockResolvedValueOnce({ success: false, error: 'Mal' });
    await act(async () => onOk());
    expect(R.app.message.error).toHaveBeenLastCalledWith('Mal');
    R.act.cerrarBimestreGestion.mockResolvedValueOnce({ success: true, data: {} });
    await act(async () => onOk());
    expect(R.app.message.success).toHaveBeenLastCalledWith('Bimestre 1 cerrado (0 cursos).');
    expect(result.current.cerrando).toBe(false);
  });

  it('abrir bimestre: éxito, bimestre futuro y error', async () => {
    const { result } = await montar();
    act(() => result.current.handleAbrirBimestre(null));
    expect(R.app.modal.confirm).not.toHaveBeenCalled();
    act(() => result.current.handleAbrirBimestre(2));
    const { onOk } = R.app.modal.confirm.mock.calls[0][0];
    R.act.abrirBimestreGestion.mockResolvedValueOnce({ success: true, data: { abiertos: 3 } });
    await act(async () => onOk());
    expect(R.app.message.success).toHaveBeenCalledWith('Bimestre 2 abierto (3 cursos).');
    R.act.abrirBimestreGestion.mockResolvedValueOnce({ success: false, code: 'BIMESTRE_FUTURO', error: 'Aún no inicia' });
    await act(async () => onOk());
    expect(R.app.message.warning).toHaveBeenCalledWith('Aún no inicia');
    R.act.abrirBimestreGestion.mockResolvedValueOnce({ success: false, code: 'BIMESTRE_FUTURO' });
    await act(async () => onOk());
    expect(R.app.message.warning).toHaveBeenLastCalledWith(expect.stringMatching(/aún no inicia/));
    R.act.abrirBimestreGestion.mockResolvedValueOnce({ success: false });
    await act(async () => onOk());
    expect(R.app.message.error).toHaveBeenCalledWith('No se pudo abrir el bimestre.');
    R.act.abrirBimestreGestion.mockResolvedValueOnce({ success: true });
    await act(async () => onOk());
    expect(result.current.abriendo).toBe(false);
    expect(result.current.bimestreEnAccion).toBeNull();
  });
});
