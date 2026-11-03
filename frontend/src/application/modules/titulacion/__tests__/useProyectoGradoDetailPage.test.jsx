import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const app = vi.hoisted(() => ({
  api: { notification: { success: vi.fn(), error: vi.fn() }, modal: { confirm: vi.fn() } },
}));
vi.mock('antd', async (orig) => {
  const actual = await orig();
  return { ...actual, App: Object.assign(({ children }) => children, { useApp: () => app.api }) };
});

const router = vi.hoisted(() => ({ navigate: vi.fn(), location: { pathname: '/', state: null } }));
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => router.navigate,
  useLocation: () => router.location,
}));

const permiso = vi.hoisted(() => ({ value: true }));
vi.mock('@application-auth', async (orig) => ({ ...(await orig()), usePermiso: () => permiso.value }));

const ctx = vi.hoisted(() => ({ value: {} }));
vi.mock('@application-titulacion/proyectos-grado/hooks/context/useProyectoGradoDetailContext', () => ({
  useProyectoGradoDetailContext: () => ctx.value,
}));

import { useProyectoGradoDetailPage } from '../proyectos-grado/hooks/state/useProyectoGradoDetailPage';

const ok = { success: true };
const fail = { success: false, error: 'Mal' };

const armarContexto = (over = {}) => ({
  proyectoId: 5,
  proyecto: { id: 5, estado: 'APROBADO_PREDEFENSA', notaPredefensa: 95 },
  loading: false,
  error: null,
  refetch: vi.fn(),
  mutations: {
    asignarTutor: vi.fn().mockResolvedValue(ok),
    aprobarEtapa: vi.fn().mockResolvedValue(ok),
    agregarIntegrante: vi.fn().mockResolvedValue(ok),
    actualizarIntegrante: vi.fn().mockResolvedValue(ok),
  },
  bitacora: { entradas: [1, 2], loading: false, error: null, crearEntrada: vi.fn().mockResolvedValue(ok), actualizarEntrada: vi.fn().mockResolvedValue(ok) },
  avances: { avances: [], loading: false, error: null, descargandoId: null, subiendo: false, subirAvance: vi.fn().mockResolvedValue(ok), descargarArchivo: vi.fn().mockResolvedValue(ok) },
  dictamenes: { dictamenes: [], loading: false, error: null, descargandoId: null, descargarDictamen: vi.fn().mockResolvedValue(ok) },
  docentesCatalogo: { docentes: [{ value: 1 }], loading: false, disponible: true },
  formularioModalidad: { descargando: false, exportarPdf: vi.fn().mockResolvedValue(ok) },
  actaDefensa: { actas: [], loading: false, error: null, cargado: false, cargar: vi.fn().mockResolvedValue(ok) },
  exportActaDefensaPdf: { descargandoId: null, exportarPdf: vi.fn().mockResolvedValue(ok) },
  anularActaDefensa: { anulando: false, anular: vi.fn().mockResolvedValue(ok) },
  ...over,
});

const montar = (over) => {
  ctx.value = armarContexto(over);
  return renderHook(() => useProyectoGradoDetailPage());
};

beforeEach(() => {
  vi.clearAllMocks();
  permiso.value = true;
  router.location = { pathname: '/', state: null };
});

describe('useProyectoGradoDetailPage', () => {
  it('navegación y datos derivados', () => {
    router.location = { pathname: '/', state: { returnListPath: '/lista', menuSidebarKey: 'K' } };
    const { result } = montar();
    act(() => result.current.handleVolver());
    expect(router.navigate).toHaveBeenCalledWith('/lista', { state: { menuSidebarKey: 'K' } });
    act(() => result.current.handleEditar());
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('5/editar'), { state: { returnListPath: '/lista', menuSidebarKey: 'K' } });
    expect(result.current.etapaModal.transiciones).toEqual(['DEFENSA', 'APROBADO', 'CANCELADO']);
    expect(result.current.etapaModal.bitacoraCount).toBe(2);
    expect(result.current.cancelarModal.puedeCancelar).toBe(true);
    expect(result.current.exencionDefensa.puede).toBe(true);
    expect(result.current.actaDefensa.puedeRegistrar).toBe(false);
    act(() => result.current.actaDefensa.irARegistrar());
    expect(router.navigate).toHaveBeenLastCalledWith(expect.stringContaining('acta-defensa'), expect.any(Object));
    expect(result.current.tutorModal.docentes).toHaveLength(1);
  });

  it('sin proyecto no navega ni muta', () => {
    const { result } = montar({ proyectoId: null, proyecto: null });
    act(() => result.current.handleEditar());
    act(() => result.current.actaDefensa.irARegistrar());
    expect(router.navigate).not.toHaveBeenCalled();
    expect(result.current.etapaModal.transiciones).toEqual([]);
    expect(result.current.exencionDefensa.puede).toBe(false);
  });

  it('asigna tutor: éxito, error y datos faltantes', async () => {
    const { result } = montar();
    act(() => result.current.tutorModal.abrir());
    expect(result.current.tutorModal.open).toBe(true);
    await act(async () => {
      await result.current.tutorModal.submit();
      await result.current.tutorModal.submit({ tutorId: 3, observaciones: 'o' });
    });
    expect(ctx.value.mutations.asignarTutor).toHaveBeenCalledTimes(1);
    expect(ctx.value.mutations.asignarTutor).toHaveBeenCalledWith(5, { tutorId: 3, observaciones: 'o' });
    expect(result.current.tutorModal.open).toBe(false);
    ctx.value.mutations.asignarTutor.mockResolvedValue(fail);
    await act(async () => {
      await result.current.tutorModal.submit({ tutorId: 3 });
    });
    expect(app.api.notification.error).toHaveBeenCalledWith(expect.objectContaining({ description: 'Mal' }));
  });

  it('transiciones de etapa, cancelación y exención', async () => {
    const { result } = montar();
    act(() => {
      result.current.etapaModal.abrir();
      result.current.cancelarModal.abrir();
    });
    await act(async () => {
      await result.current.etapaModal.submit({});
      await result.current.etapaModal.submit({ estado: 'DEFENSA' });
      await result.current.cancelarModal.submit('motivo');
    });
    const llamadas = ctx.value.mutations.aprobarEtapa.mock.calls.map((c) => c[1]);
    expect(llamadas).toEqual([{ estado: 'DEFENSA' }, { estado: 'CANCELADO', observaciones: 'motivo' }]);
    expect(result.current.etapaModal.open).toBe(false);
    expect(result.current.cancelarModal.open).toBe(false);
    ctx.value.mutations.aprobarEtapa.mockResolvedValue(fail);
    await act(async () => {
      await result.current.etapaModal.submit({ estado: 'DEFENSA' });
      await result.current.cancelarModal.submit('m');
    });
    expect(app.api.notification.error).toHaveBeenCalledTimes(2);
    act(() => result.current.exencionDefensa.confirmar());
    const opts = app.api.modal.confirm.mock.calls[0][0];
    await act(async () => {
      await opts.onOk();
    });
    expect(ctx.value.mutations.aprobarEtapa).toHaveBeenLastCalledWith(5, { estado: 'APROBADO' });
    ctx.value.mutations.aprobarEtapa.mockResolvedValue(ok);
    await act(async () => {
      await opts.onOk();
    });
    expect(app.api.notification.success).toHaveBeenCalledWith(expect.objectContaining({ title: 'Exención de defensa registrada' }));
  });

  it('integrantes: agregar, retirar y reincorporar', async () => {
    const { result } = montar();
    act(() => result.current.integrantes.abrirModal());
    expect(result.current.integrantes.modalOpen).toBe(true);
    await act(async () => {
      await result.current.integrantes.agregar(null);
      await result.current.integrantes.agregar(7);
    });
    expect(ctx.value.mutations.agregarIntegrante).toHaveBeenCalledWith(5, { estudianteId: 7, rol: 'INTEGRANTE' });
    ctx.value.mutations.agregarIntegrante.mockResolvedValue(fail);
    await act(async () => {
      await result.current.integrantes.agregar(8);
    });
    expect(app.api.notification.error).toHaveBeenCalled();
    act(() => result.current.integrantes.toggleEstado({}));
    expect(app.api.modal.confirm).not.toHaveBeenCalled();
    act(() => result.current.integrantes.toggleEstado({ id: 1, estado: 'ACTIVO', nombreCompleto: 'Ana' }));
    act(() => result.current.integrantes.toggleEstado({ id: 2, estado: 'RETIRADO', nombreCompleto: 'Beto' }));
    const [retirar, reincorporar] = app.api.modal.confirm.mock.calls.map((c) => c[0]);
    expect(retirar.okText).toBe('Retirar');
    expect(reincorporar.okText).toBe('Reincorporar');
    await act(async () => {
      await retirar.onOk();
    });
    expect(ctx.value.mutations.actualizarIntegrante).toHaveBeenCalledWith(5, 1, { estado: 'RETIRADO' });
    ctx.value.mutations.actualizarIntegrante.mockResolvedValue(fail);
    await act(async () => {
      await reincorporar.onOk();
    });
    expect(ctx.value.mutations.actualizarIntegrante).toHaveBeenLastCalledWith(5, 2, { estado: 'ACTIVO' });
    expect(app.api.notification.error).toHaveBeenCalledWith(expect.objectContaining({ title: 'No se pudo actualizar el integrante' }));
  });

  it('bitácora: crear, editar, revisar avance y error', async () => {
    const { result } = montar();
    act(() => result.current.bitacora.abrirNuevaEntrada());
    expect(result.current.bitacora.drawer).toEqual({ open: true, entrada: null, avance: null });
    await act(async () => {
      await result.current.bitacora.guardar({ a: 1 });
    });
    expect(ctx.value.bitacora.crearEntrada).toHaveBeenCalledWith(5, { a: 1 });
    expect(result.current.bitacora.drawer.open).toBe(false);
    act(() => result.current.bitacora.abrirEditarEntrada({ id: 9 }));
    await act(async () => {
      await result.current.bitacora.guardar({ b: 1 });
    });
    expect(ctx.value.bitacora.actualizarEntrada).toHaveBeenCalledWith(5, 9, { b: 1 });
    act(() => result.current.avances.revisar({ id: 3 }));
    expect(result.current.bitacora.drawer.avance).toEqual({ id: 3 });
    ctx.value.bitacora.crearEntrada.mockResolvedValue(fail);
    await act(async () => {
      await result.current.bitacora.guardar({});
    });
    expect(app.api.notification.error).toHaveBeenCalled();
    act(() => result.current.bitacora.cerrarDrawer());
    expect(result.current.bitacora.drawer.open).toBe(false);
  });

  it('avances, dictámenes y formulario: descargas con aviso de error', async () => {
    const { result } = montar();
    act(() => result.current.avances.subirModal.abrir());
    await act(async () => {
      await result.current.avances.subirModal.submit({});
      await result.current.avances.subirModal.submit({ file: 'f', titulo: 't' });
    });
    expect(ctx.value.avances.subirAvance).toHaveBeenCalledTimes(1);
    expect(result.current.avances.subirModal.open).toBe(false);
    ctx.value.avances.subirAvance.mockResolvedValue(fail);
    ctx.value.avances.descargarArchivo.mockResolvedValue(fail);
    ctx.value.dictamenes.descargarDictamen.mockResolvedValue(fail);
    ctx.value.formularioModalidad.exportarPdf.mockResolvedValue(fail);
    await act(async () => {
      await result.current.avances.subirModal.submit({ file: 'f' });
      await result.current.avances.descargar({ id: 1 });
      await result.current.dictamenes.descargar({ id: 1 });
      await result.current.formularioModalidad.exportar();
    });
    expect(app.api.notification.error).toHaveBeenCalledTimes(4);
    ctx.value.avances.descargarArchivo.mockResolvedValue(ok);
    ctx.value.dictamenes.descargarDictamen.mockResolvedValue(ok);
    ctx.value.formularioModalidad.exportarPdf.mockResolvedValue(ok);
    app.api.notification.error.mockClear();
    await act(async () => {
      await result.current.avances.descargar({ id: 1 });
      await result.current.dictamenes.descargar({ id: 1 });
      await result.current.formularioModalidad.exportar();
    });
    expect(app.api.notification.error).not.toHaveBeenCalled();
  });

  it('acta de defensa: pestaña, exportar y anular', async () => {
    const { result } = montar({ proyecto: { id: 5, estado: 'DEFENSA' } });
    expect(result.current.actaDefensa.puedeRegistrar).toBe(true);
    act(() => result.current.actaDefensa.abrirTab());
    expect(ctx.value.actaDefensa.cargar).toHaveBeenCalledWith(5);
    ctx.value.actaDefensa.cargado = true;
    act(() => result.current.actaDefensa.abrirTab());
    expect(ctx.value.actaDefensa.cargar).toHaveBeenCalledTimes(1);
    ctx.value.exportActaDefensaPdf.exportarPdf.mockResolvedValue(fail);
    await act(async () => {
      await result.current.actaDefensa.exportarPdf({ id: 1 });
    });
    expect(app.api.notification.error).toHaveBeenCalled();
    await act(async () => {
      await result.current.actaDefensa.anularModal.submit('m');
    });
    expect(ctx.value.anularActaDefensa.anular).not.toHaveBeenCalled();
    act(() => result.current.actaDefensa.anular({ id: 11 }));
    expect(result.current.actaDefensa.anularModal.open).toBe(true);
    await act(async () => {
      await result.current.actaDefensa.anularModal.submit('error de digitación');
    });
    expect(ctx.value.anularActaDefensa.anular).toHaveBeenCalledWith(5, 11, 'error de digitación');
    expect(ctx.value.actaDefensa.cargar).toHaveBeenCalledTimes(2);
    expect(result.current.actaDefensa.anularModal.open).toBe(false);
    ctx.value.anularActaDefensa.anular.mockResolvedValue(fail);
    act(() => result.current.actaDefensa.anular({ id: 12 }));
    await act(async () => {
      await result.current.actaDefensa.anularModal.submit('m');
    });
    act(() => result.current.actaDefensa.anularModal.cerrar());
    expect(result.current.actaDefensa.anularModal.acta).toBeNull();
    permiso.value = false;
    expect(renderHook(() => useProyectoGradoDetailPage()).result.current.actaDefensa.puedeRegistrar).toBe(false);
  });
});
