import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { App } from 'antd';

const router = vi.hoisted(() => ({ params: {}, navigate: vi.fn(), location: { pathname: '/', state: null } }));
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useParams: () => router.params,
  useNavigate: () => router.navigate,
  useLocation: () => router.location,
}));

const ctx = vi.hoisted(() => ({ config: {}, becas: {}, compromiso: {} }));
vi.mock('@application-finanzas/hooks/context/useConfigPagosContext', () => ({ useConfigPagosContext: () => ctx.config }));
vi.mock('@application-finanzas/hooks/context/useBecasReporteContext', () => ({ useBecasReporteContext: () => ctx.becas }));
vi.mock('@application-finanzas/hooks/context/useCompromisoContext', () => ({ useCompromisoContext: () => ctx.compromiso }));

const del = vi.hoisted(() => ({ deleteItem: vi.fn(), opts: null }));
vi.mock('@application/utils/useDeleteItem', () => ({
  useDeleteItem: (opts) => {
    del.opts = opts;
    return { deleteItem: del.deleteItem, loading: false };
  },
}));

import { useBancoDetailPage } from '../useBancoDetailPage';
import { useCuentaDetailPage } from '../useCuentaDetailPage';
import { useBancoForm } from '../useBancoForm';
import { useBecasReportePage } from '../useBecasReportePage';
import { useCompromisoPage } from '../useCompromisoPage';
import { useConfigPagosPage } from '../useConfigPagosPage';

const wrapper = ({ children }) => <App>{children}</App>;

beforeEach(() => {
  vi.clearAllMocks();
  router.params = {};
  router.location = { pathname: '/', state: null };
  ctx.config = {
    bancos: [{ id: 3, nombre: 'BNB', metodoPagoId: 1 }],
    metodos: [{ id: 1, nombre: 'Transferencia' }],
    cuentas: [{ id: 9, bancoId: 3, nombreTitular: 'Ana', metodoPagoId: 1 }],
    loading: false,
    error: null,
    saving: false,
    refetch: vi.fn(),
    eliminarBanco: vi.fn(),
    eliminarCuenta: vi.fn(),
    guardarBanco: vi.fn(),
  };
});

describe('fichas de banco y cuenta', () => {
  it('banco: resuelve datos relacionados, iniciales y eliminación', () => {
    router.params = { id: '3' };
    const { result } = renderHook(() => useBancoDetailPage());
    expect(result.current.banco.nombre).toBe('BNB');
    expect(result.current.metodoNombre).toBe('Transferencia');
    expect(result.current.cuentasDelBanco).toHaveLength(1);
    expect(result.current.avatarInitials).toBe('BN');
    expect(del.opts.itemName).toBe('el banco BNB');
    result.current.handleEliminar();
    expect(del.deleteItem).toHaveBeenCalledWith(3);
    result.current.handleVolver();
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('tab=bancos'));
  });
  it('banco: id inválido o inexistente', () => {
    router.params = { id: 'x' };
    const a = renderHook(() => useBancoDetailPage());
    expect(a.result.current).toMatchObject({ isInvalidId: true, banco: null, avatarInitials: '?' });
    expect(del.opts.itemName).toBe('este banco');
    router.params = { id: '99' };
    const b = renderHook(() => useBancoDetailPage());
    expect(b.result.current.banco).toBeNull();
    expect(b.result.current.cuentasDelBanco).toEqual([]);
  });
  it('cuenta: resuelve método e iniciales', () => {
    router.params = { id: '9' };
    const { result } = renderHook(() => useCuentaDetailPage());
    expect(result.current.cuenta.nombreTitular).toBe('Ana');
    expect(result.current.metodoNombre).toBe('Transferencia');
    expect(result.current.avatarInitials).toBe('AN');
    expect(del.opts.itemName).toBe('la cuenta de Ana');
    result.current.handleEliminar();
    expect(del.deleteItem).toHaveBeenCalledWith(9);
    result.current.handleVolver();
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('tab=cuentas'));
    router.params = { id: '0' };
    const b = renderHook(() => useCuentaDetailPage());
    expect(b.result.current.isInvalidId).toBe(true);
    expect(del.opts.itemName).toBe('esta cuenta');
  });
});

describe('useBancoForm', () => {
  it('alta: guarda y navega al detalle', async () => {
    ctx.config.guardarBanco.mockResolvedValue({ success: true, data: { bancoAutorizado: { id: 12 } } });
    const { result } = renderHook(() => useBancoForm('create'), { wrapper });
    expect(result.current.pageTitle).toBe('Nuevo banco');
    expect(result.current.formSections.datosBanco.fields.map((f) => f.name)).toEqual(['codigo', 'nombre', 'metodoPagoId']);
    result.current.form.validateFields = vi.fn().mockResolvedValue({ codigo: ' B ', nombre: 'N' });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(ctx.config.guardarBanco).toHaveBeenCalledWith({ id: null, payload: expect.objectContaining({ codigo: 'B', activo: true }) });
    expect(ctx.config.refetch).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('12'), { replace: true });
  });
  it('edición: carga el banco del catálogo y agrega el switch de estado', async () => {
    router.params = { id: '3' };
    const { result } = renderHook(() => useBancoForm('edit'), { wrapper });
    expect(result.current.formSections.datosBanco.fields.map((f) => f.name)).toContain('activo');
    expect(result.current.permisoAccion).toBe('EDITAR');
    await waitFor(() => expect(result.current.form.getFieldValue('nombre')).toBe('BNB'));
    expect(result.current.error).toBeNull();
  });
  it('edición: banco inexistente o id inválido', () => {
    router.params = { id: '77' };
    const a = renderHook(() => useBancoForm('edit'), { wrapper });
    expect(a.result.current.error).toBe('No se pudo cargar el banco');
    router.params = { id: 'x' };
    const b = renderHook(() => useBancoForm('edit'), { wrapper });
    expect(b.result.current.isInvalidEditId).toBe(true);
    expect(b.result.current.loading).toBe(false);
  });
  it('errores de guardado y validación', async () => {
    ctx.config.guardarBanco.mockResolvedValue({ success: false, error: 'Duplicado' });
    const { result } = renderHook(() => useBancoForm('create'), { wrapper });
    result.current.form.validateFields = vi.fn().mockResolvedValue({});
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.error).toBe('Duplicado');
    result.current.form.validateFields = vi.fn().mockRejectedValue({ errorFields: [] });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.error).toBe('Revise los campos obligatorios');
    ctx.config.guardarBanco.mockResolvedValue({ success: true, data: {} });
    result.current.form.validateFields = vi.fn().mockResolvedValue({});
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('tab=bancos'));
  });
});

describe('useBecasReportePage', () => {
  const reporte = {
    porcentajes: [50, 100],
    gestion: { id: 1 },
    distribucion: [{ porcentaje: 50 }],
    resumen: { totalConBeca: 5 },
    catalogo: [1],
    catalogoResumen: { totalTipos: 2 },
    filas: [
      {
        id: 'c1', nivel: 'carrera', label: 'Sistemas', carreraId: 1, carreraNombre: 'Sistemas Informáticos', totalMatriculados: 100, totalConBeca: 20, porcentajeCobertura: 20,
        becasPorPorcentaje: { beca_50: 15, beca_100: 5 },
        children: [
          { id: 'p1', nivel: 'periodo', periodoNumero: 1, periodoNombre: 'Primero', totalMatriculados: 60, totalConBeca: 10, becasPorPorcentaje: { beca_50: 10, beca_100: 0 },
            children: [{ id: 'pa1', nivel: 'paralelo', paraleloNombre: 'A', carreraId: 1, carreraNombre: 'Sistemas Informáticos', totalMatriculados: 30, totalConBeca: 6 }] },
          { id: 'p2', nivel: 'periodo', periodoNumero: 2, totalMatriculados: 40, totalConBeca: 10, becasPorPorcentaje: { beca_50: 5, beca_100: 5 },
            children: [{ id: 'pa2', nivel: 'paralelo', paraleloNombre: 'á', carreraId: 2, carreraNombre: 'Contaduría', totalMatriculados: 0, totalConBeca: 0 }, { id: 'pa3', nivel: 'paralelo', paraleloNombre: 'A', carreraId: 1, carreraNombre: 'Sistemas Informáticos', totalMatriculados: 10, totalConBeca: 4 }] },
        ],
      },
    ],
  };
  it('deriva carreras, tramos, cobertura y destacados', () => {
    ctx.becas = { reporte, loading: false, error: null, gestionId: 1, refetch: vi.fn() };
    const { result } = renderHook(() => useBecasReportePage());
    expect(result.current.carreras[0].color).toBe('#FF5733');
    const { carrera, periodo } = result.current.distribucionTramosPorScope;
    expect(carrera[0].tramos.map((t) => t.beneficiados)).toEqual([15, 5]);
    expect(carrera[0].tramos[0].porcentajeDelTotalConBeca).toBe(75);
    expect(periodo.map((p) => p.label)).toEqual(['Primero', 'Periodo 2']);
    expect(periodo[1].tramos[1].beneficiados).toBe(5);
    const cob = result.current.coberturaPorNivelAgrupado;
    expect(cob.carrera[0].porcentajeCobertura).toBe(20);
    expect(cob.periodo.map((p) => Math.round(p.porcentajeCobertura))).toEqual([17, 25]);
    expect(cob.paralelo).toHaveLength(1);
    expect(cob.paralelo[0]).toMatchObject({ totalMatriculados: 40, totalConBeca: 10 });
    expect(cob.paralelo[0].carreras.map((c) => c.carreraNombre)).toEqual(['Contaduría', 'Sistemas Informáticos']);
    expect(result.current.destacados).toMatchObject({
      carreraTopBecados: { label: 'Sistemas', valor: 20 },
      periodoMayorCobertura: { label: 'Periodo 2' },
      paraleloTopBecados: { valor: 10 },
    });
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.resumen.totalConBeca).toBe(5);
    expect(result.current.breadcrumbItems).toHaveLength(3);
  });
  it('sin reporte: vacío y destacados nulos', () => {
    ctx.becas = { reporte: null, loading: false, error: null, gestionId: null, refetch: vi.fn() };
    const { result } = renderHook(() => useBecasReportePage());
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.destacados).toEqual({ carreraTopBecados: null, periodoMayorCobertura: null, paraleloTopBecados: null });
    expect(result.current.resumen).toBeNull();
    ctx.becas = { reporte: null, loading: true, error: null };
    expect(renderHook(() => useBecasReportePage()).result.current.isEmpty).toBe(false);
  });
});

describe('useCompromisoPage', () => {
  const base = () => ({
    estudiantes: [], loadingBusqueda: false, errorBusqueda: null, buscarEstudiantes: vi.fn(), cargarEstudiantesPreliminar: vi.fn(),
    estado: { cabeceraId: 5 }, loadingEstado: false, errorEstado: null, cargarEstado: vi.fn(), limpiarEstado: vi.fn(),
    compromiso: { id: 2 }, loadingCompromiso: false, errorCompromiso: null, cargarCompromiso: vi.fn().mockResolvedValue({}), limpiarCompromiso: vi.fn(),
    guardarCompromiso: vi.fn(), guardando: false, eliminarCompromiso: vi.fn(), eliminando: false,
  });
  it('carga lo preliminar y el compromiso de la cabecera', () => {
    ctx.compromiso = base();
    renderHook(() => useCompromisoPage(), { wrapper });
    expect(ctx.compromiso.cargarEstudiantesPreliminar).toHaveBeenCalled();
    expect(ctx.compromiso.cargarCompromiso).toHaveBeenCalledWith(5);
    ctx.compromiso = { ...base(), estado: null };
    renderHook(() => useCompromisoPage(), { wrapper });
    expect(ctx.compromiso.limpiarCompromiso).toHaveBeenCalled();
  });
  it('selecciona y cambia de estudiante, y vuelve', () => {
    ctx.compromiso = base();
    router.location = { pathname: '/', state: { returnListPath: '/pagos', menuSidebarKey: 'K' } };
    const { result } = renderHook(() => useCompromisoPage(), { wrapper });
    act(() => result.current.handleSeleccionarEstudiante({}));
    expect(ctx.compromiso.cargarEstado).not.toHaveBeenCalled();
    act(() => result.current.handleSeleccionarEstudiante({ id: 4 }));
    expect(ctx.compromiso.cargarEstado).toHaveBeenCalledWith(4);
    expect(result.current.estudianteSeleccionado.id).toBe(4);
    act(() => result.current.handleCambiarEstudiante());
    expect(result.current.estudianteSeleccionado).toBeNull();
    expect(ctx.compromiso.limpiarEstado).toHaveBeenCalled();
    act(() => result.current.handleVolver());
    expect(router.navigate).toHaveBeenCalledWith('/pagos', { state: { menuSidebarKey: 'K' } });
  });
  it('guarda: actualiza, registra y reporta error', async () => {
    ctx.compromiso = base();
    ctx.compromiso.guardarCompromiso.mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false, error: 'Mal' });
    const { result } = renderHook(() => useCompromisoPage(), { wrapper });
    await act(async () => {
      await result.current.handleGuardar({ a: 1 });
    });
    expect(ctx.compromiso.guardarCompromiso).toHaveBeenCalledWith({ pagoAporteId: 5, compromisoId: 2, values: { a: 1 } });
    await act(async () => {
      await result.current.handleGuardar({});
    });
    expect(ctx.compromiso.cargarCompromiso).toHaveBeenCalledTimes(2);
    ctx.compromiso = { ...base(), estado: null };
    const sin = renderHook(() => useCompromisoPage(), { wrapper });
    await act(async () => {
      await sin.result.current.handleGuardar({});
    });
    expect(ctx.compromiso.guardarCompromiso).not.toHaveBeenCalled();
  });
  it('elimina el compromiso vigente', async () => {
    ctx.compromiso = base();
    ctx.compromiso.eliminarCompromiso.mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false });
    const { result } = renderHook(() => useCompromisoPage(), { wrapper });
    await act(async () => {
      await result.current.handleEliminar();
    });
    expect(ctx.compromiso.eliminarCompromiso).toHaveBeenCalledWith(2);
    await act(async () => {
      await result.current.handleEliminar();
    });
    ctx.compromiso = { ...base(), compromiso: null };
    const sin = renderHook(() => useCompromisoPage(), { wrapper });
    await act(async () => {
      await sin.result.current.handleEliminar();
    });
    expect(ctx.compromiso.eliminarCompromiso).not.toHaveBeenCalled();
    ctx.compromiso = { ...base(), estado: null };
    ctx.compromiso.eliminarCompromiso.mockResolvedValue({ success: true });
    const sinCab = renderHook(() => useCompromisoPage(), { wrapper });
    await act(async () => {
      await sinCab.result.current.handleEliminar();
    });
    expect(ctx.compromiso.limpiarCompromiso).toHaveBeenCalled();
  });
});

describe('useConfigPagosPage', () => {
  it('expone el contexto y migas', () => {
    const { result } = renderHook(() => useConfigPagosPage());
    expect(result.current.bancos).toHaveLength(1);
    expect(Array.isArray(result.current.breadcrumbItems)).toBe(true);
  });
});
