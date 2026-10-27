import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import PagosDetail from '../pages/PagosDetail';

const mocks = vi.hoisted(() => ({
  detalle: vi.fn(),
  estado: vi.fn(),
  eliminarPago: vi.fn(),
  recibo: vi.fn(),
  eliminarCuota: vi.fn(),
  guardarCompromiso: vi.fn(),
  descargar: vi.fn(),
}));
const navigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@container', () => ({
  useContainer: () => ({ resolve: vi.fn() }),
  useCasesFactory: {
    generarReciboPago: () => ({ ejecutar: (...a) => mocks.recibo(...a) }),
    eliminarCuotaPagoAporte: () => ({ ejecutar: (...a) => mocks.eliminarCuota(...a) }),
    actualizarCuotaPagoAporte: () => ({ ejecutar: vi.fn() }),
  },
}));
vi.mock('@application-pagos/hooks', async (orig) => ({
  ...(await orig()),
  usePagosDetailContext: mocks.detalle,
  useEstadoAporteRegistro: mocks.estado,
  useDeletePagoAporte: () => ({ deletePagoAporte: mocks.eliminarPago, loading: false }),
}));
vi.mock('@application-finanzas/hooks/api/useGuardarCompromiso', () => ({ useGuardarCompromiso: () => ({ guardar: mocks.guardarCompromiso, loading: false }) }));
vi.mock('@application/utils', async (orig) => ({ ...(await orig()), downloadFile: (...a) => mocks.descargar(...a) }));

const pagoBase = (extra = {}) => ({
  id: 8, estado: 'PARCIAL', monto_base: 1000, descuento_beca: 100, monto_obligatorio: 900,
  estudiante: { id: 3, codigoEstudiante: 'E-3', nombreCompleto: 'Pérez Ana', ci: '123', expedicion: 'lp' },
  gestion: { id: 2, codigo: 'G-26', nombre: 'Gestión 2026', anio: 2026 },
  compromiso: null, beca: null, inscripcion: null, ...extra,
});
const estadoBase = (extra = {}) => ({
  gestion: { nombre: '2026' }, monto_base: 1000, monto_obligatorio: 900, total_pagado: 300, saldo_pendiente: 600,
  cuotas: [
    { id: 11, numero_recibo: 'R-2', fecha_pago: '2026-03-05T12:00:00', monto: 100, metodo_pago: { nombre: 'Efectivo' }, observacion: 'Pago parcial', numero_transaccion: 'TX1', codigo_comprobante: 'C1', cuenta_pago: { nombre_titular: 'INCOS', numero_cuenta: '99', numero_celular: '70' } },
    { id: 12, numero_recibo: 'R-1', fecha_pago: '2026-02-01T12:00:00', monto: 200, metodo_pago: null },
  ],
  ...extra,
});
const montar = (opts = {}) => {
  mocks.detalle.mockReturnValue({ pago: pagoBase(opts.pago), loading: false, error: null, refetch: vi.fn(), ...opts.ctx });
  mocks.estado.mockReturnValue({ estadoAporte: estadoBase(opts.estado), loading: false, refetch: vi.fn(), ...opts.estCtx });
  return renderWithProviders(<PagosDetail />, { route: opts.route ?? '/pagos/8', auth: opts.auth });
};
const todos = [
  permiso('finanzas.pago.registrar', 'CREAR'), permiso('finanzas.pago.ver', 'EXPORTAR'), permiso('finanzas.pago.editar', 'EDITAR', 'ELIMINAR'),
  permiso('finanzas.compromiso.gestionar', 'CREAR', 'EDITAR'),
];

beforeEach(() => {
  navigate.mockClear();
  Object.values(mocks).forEach((m) => m.mockReset());
  mocks.guardarCompromiso.mockResolvedValue({ success: true });
});

describe('PagosDetail', () => {
  it('carga, error y pago inexistente', async () => {
    mocks.detalle.mockReturnValue({ pago: null, loading: true });
    mocks.estado.mockReturnValue({ estadoAporte: null, loading: false, refetch: vi.fn() });
    const a = renderWithProviders(<PagosDetail />);
    expect(screen.getByText('Cargando datos del pago…')).toBeInTheDocument();
    a.unmount();
    mocks.detalle.mockReturnValue({ pago: null, loading: false, error: 'Falla del servidor' });
    const b = renderWithProviders(<PagosDetail />);
    expect(screen.getByText('Error al cargar el pago')).toBeInTheDocument();
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/pagos', { replace: true }));
    b.unmount();
    mocks.detalle.mockReturnValue({ pago: null, loading: false, error: null });
    renderWithProviders(<PagosDetail />);
    expect(screen.getByText('No se encontró información del pago')).toBeInTheDocument();
  });

  it('perfil: recibos, monto obligatorio, estado y subtítulo', () => {
    montar();
    expect(screen.getByRole('heading', { name: 'Recibos R-1, R-2' })).toBeInTheDocument();
    expect(screen.getByText('Pérez Ana · Gestión 2026')).toBeInTheDocument();
    expect(screen.getByText('Bs. 900.00')).toBeInTheDocument();
    expect(screen.getByText('PARCIAL')).toBeInTheDocument();
  });

  it('resumen: datos del estudiante, gestión y estado del aporte', () => {
    montar();
    expect(screen.getByText('Estudiante y gestión académica')).toBeInTheDocument();
    expect(screen.getByText('123 LP')).toBeInTheDocument();
    expect(screen.getByText('Aporte académico - Gestión 2026')).toBeInTheDocument();
    expect(screen.getByText(/Bs\.\s*600[.,]00/)).toBeInTheDocument();
    expect(screen.getByText('Este aporte no tiene un compromiso de pago registrado.')).toBeInTheDocument();
  });

  it('RBAC del perfil: registrar siguiente pago, eliminar pago y volver', async () => {
    montar({ auth: { permisos: todos } });
    await userEvent.click(screen.getByRole('button', { name: /Registrar siguiente pago/ }));
    expect(navigate).toHaveBeenCalledWith('/pagos/registrar', { state: { studentId: 3 } });
    await userEvent.click(screen.getByRole('button', { name: /Volver/ }));
    expect(navigate).toHaveBeenLastCalledWith('/pagos');
  });

  it('sin permisos no se ofrecen registrar, eliminar ni compromiso', () => {
    montar();
    expect(screen.queryByRole('button', { name: /Registrar siguiente pago/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Eliminar pago/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Registrar compromiso/ })).not.toBeInTheDocument();
  });

  it('con saldo cero o con inscripción no se ofrece registrar ni eliminar', () => {
    montar({ auth: { permisos: todos }, estado: { saldo_pendiente: 0 }, pago: { inscripcion: { codigo: 'INS-1', estado: 'ACTIVA', fechaInscripcion: '2026-01-01T12:00:00' } } });
    expect(screen.queryByRole('button', { name: /Registrar siguiente pago/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Eliminar pago/ })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Inscripción/ })).toBeInTheDocument();
  });

  it('desde la ficha del estudiante vuelve a ella', async () => {
    montar({ route: { pathname: '/pagos/8', state: { studentId: 3 } } });
    await userEvent.click(screen.getByRole('button', { name: /Volver/ }));
    expect(navigate).toHaveBeenLastCalledWith('/estudiantes/3');
  });

  it('eliminar el pago confirma y vuelve al listado', async () => {
    mocks.eliminarPago.mockResolvedValue({ success: true });
    montar({ auth: { permisos: todos } });
    await userEvent.click(screen.getByRole('button', { name: /Eliminar pago/ }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(mocks.eliminarPago).toHaveBeenCalledWith(8));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/pagos', { replace: true }));
    expect(await screen.findByText('Pago eliminado correctamente')).toBeInTheDocument();
  });

  it('un fallo al eliminar el pago muestra el motivo y no navega', async () => {
    mocks.eliminarPago.mockResolvedValue({ success: false, error: 'Tiene cuotas' });
    montar({ auth: { permisos: todos } });
    await userEvent.click(screen.getByRole('button', { name: /Eliminar pago/ }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }));
    expect(await screen.findByText('Tiene cuotas')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalledWith('/pagos', { replace: true });
  });

  it('compromiso existente: estado, días y avisos de vencimiento', () => {
    montar({ pago: { compromiso: { id: 4, fechaCompromiso: '2026-03-01', observacion: 'Pagará el lunes', estado: 'VIGENTE', alerta: 'VENCIDA', diasAtraso: 5 } }, auth: { permisos: todos } });
    expect(screen.getByText('5 de atraso')).toBeInTheDocument();
    expect(screen.getByText('Compromiso de pago vencido')).toBeInTheDocument();
    expect(screen.getByText('Pagará el lunes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Editar compromiso/ })).toBeInTheDocument();
  });

  it('compromiso próximo y compromiso cumplido sin aviso', () => {
    const { unmount } = montar({ pago: { compromiso: { id: 4, fechaCompromiso: '2026-03-10', estado: 'VIGENTE', alerta: 'PROXIMA', diasAtraso: -3 } } });
    expect(screen.getByText('Compromiso próximo a vencer')).toBeInTheDocument();
    expect(screen.getByText('Faltan 3')).toBeInTheDocument();
    unmount();
    montar({ pago: { compromiso: { id: 4, fechaCompromiso: '2026-03-10', estado: 'CUMPLIDO', alerta: 'VENCIDA', diasAtraso: null } } });
    expect(screen.queryByText('Compromiso de pago vencido')).not.toBeInTheDocument();
  });

  it('registrar un compromiso: valida la fecha, guarda y refresca', async () => {
    const refetch = vi.fn();
    montar({ auth: { permisos: todos }, ctx: { refetch } });
    await userEvent.click(screen.getAllByRole('button', { name: /Registrar compromiso/ })[0]);
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Registrar' }));
    expect(await within(dialog).findByText('Seleccione la fecha del compromiso de pago')).toBeInTheDocument();
    expect(mocks.guardarCompromiso).not.toHaveBeenCalled();
    await userEvent.type(within(dialog).getAllByRole('textbox')[0], '15/04/2099{enter}');
    await userEvent.type(within(dialog).getByPlaceholderText(/Detalle del acuerdo/), ' Pagará en efectivo ');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Registrar' }));
    await waitFor(() => expect(mocks.guardarCompromiso).toHaveBeenCalledWith({ pagoAporteId: 8, compromisoId: null, values: { fechaCompromiso: '2099-04-15', observacion: 'Pagará en efectivo' } }));
    await waitFor(() => expect(refetch).toHaveBeenCalled());
    expect(await screen.findByText('Compromiso registrado')).toBeInTheDocument();
  });

  it('un error al guardar el compromiso lo informa', async () => {
    mocks.guardarCompromiso.mockResolvedValue({ success: false, error: 'Fecha anterior a hoy' });
    montar({ auth: { permisos: todos }, pago: { compromiso: { id: 4, fechaCompromiso: '2099-03-10', estado: 'VIGENTE', alerta: 'AL_DIA', diasAtraso: -9 } } });
    await userEvent.click(screen.getByRole('button', { name: /Editar compromiso/ }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Actualizar' }));
    expect(await screen.findByText('Fecha anterior a hoy')).toBeInTheDocument();
  });

  it('cuotas: tabla con recibos, métodos y datos adicionales expandibles', async () => {
    montar({ auth: { permisos: todos } });
    await userEvent.click(screen.getByRole('tab', { name: /Cuotas/ }));
    expect(await screen.findByText('Cuotas registradas (2)')).toBeInTheDocument();
    expect(screen.getByText('Datos del aporte')).toBeInTheDocument();
    expect(screen.getByText('Efectivo')).toBeInTheDocument();
    const filaR2 = screen.getByText('R-2').closest('tr');
    await userEvent.click(within(filaR2).getByRole('button', { name: /expand/i }));
    expect(await screen.findByText('INCOS · Cuenta: 99 · Cel: 70')).toBeInTheDocument();
    expect(screen.getByText('Pago parcial')).toBeInTheDocument();
    const filaR1 = screen.getByText('R-1').closest('tr');
    await userEvent.click(within(filaR1).getByRole('button', { name: /expand/i }));
    expect(await screen.findByText('Sin datos adicionales')).toBeInTheDocument();
  });

  it('cuotas: editar navega a la edición de esa cuota', async () => {
    montar({ auth: { permisos: todos }, route: { pathname: '/pagos/8', state: { menuSidebarKey: 'MAT-APORTES' } } });
    await userEvent.click(screen.getByRole('tab', { name: /Cuotas/ }));
    const fila = (await screen.findByText('R-2')).closest('tr');
    await userEvent.click(within(fila).getByRole('button', { name: /Editar/ }));
    expect(navigate).toHaveBeenCalledWith('/pagos/8/editar', { state: { menuSidebarKey: 'MAT-APORTES', returnListPath: '/pagos/8', selectedCuotaId: 11 } });
  });

  it('cuotas: descargar recibo con permiso EXPORTAR', async () => {
    mocks.recibo.mockResolvedValue({ success: true, data: { filePath: '/uploads/r.pdf', fileName: 'r.pdf' } });
    montar({ auth: { permisos: todos } });
    await userEvent.click(screen.getByRole('tab', { name: /Cuotas/ }));
    const fila = (await screen.findByText('R-2')).closest('tr');
    await userEvent.click(within(fila).getByRole('button', { name: /Descargar recibo/ }));
    await waitFor(() => expect(mocks.recibo).toHaveBeenCalledWith(11));
    await waitFor(() => expect(mocks.descargar).toHaveBeenCalledWith('/uploads/r.pdf', 'r.pdf'));
    expect(await screen.findByText('Recibo descargado')).toBeInTheDocument();
  });

  it('cuotas: errores de descarga se informan', async () => {
    mocks.recibo.mockResolvedValueOnce({ success: false, error: 'Sin plantilla' }).mockResolvedValueOnce({ success: true, data: {} });
    montar({ auth: { permisos: todos } });
    await userEvent.click(screen.getByRole('tab', { name: /Cuotas/ }));
    const fila = (await screen.findByText('R-2')).closest('tr');
    await userEvent.click(within(fila).getByRole('button', { name: /Descargar recibo/ }));
    expect(await screen.findByText('Sin plantilla')).toBeInTheDocument();
    await userEvent.click(within(fila).getByRole('button', { name: /Descargar recibo/ }));
    expect(await screen.findByText('No se pudo obtener el recibo')).toBeInTheDocument();
  });

  it('cuotas: eliminar una cuota confirma, elimina y refresca', async () => {
    mocks.eliminarCuota.mockResolvedValue({ success: true });
    const refetch = vi.fn();
    const refetchEstado = vi.fn();
    montar({ auth: { permisos: todos }, ctx: { refetch }, estCtx: { refetch: refetchEstado } });
    await userEvent.click(screen.getByRole('tab', { name: /Cuotas/ }));
    const fila = (await screen.findByText('R-2')).closest('tr');
    await userEvent.click(within(fila).getByRole('button', { name: 'Eliminar cuota' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(mocks.eliminarCuota).toHaveBeenCalledWith(11));
    await waitFor(() => expect(refetchEstado).toHaveBeenCalled());
    expect(refetch).toHaveBeenCalled();
    expect(await screen.findByText('Cuota eliminada correctamente')).toBeInTheDocument();
  });

  it('cuotas sin permisos: no hay editar, eliminar ni descargar', async () => {
    montar();
    await userEvent.click(screen.getByRole('tab', { name: /Cuotas/ }));
    const fila = (await screen.findByText('R-2')).closest('tr');
    expect(within(fila).queryByRole('button', { name: /Editar/ })).not.toBeInTheDocument();
    expect(within(fila).queryByRole('button', { name: 'Eliminar cuota' })).not.toBeInTheDocument();
    expect(within(fila).queryByRole('button', { name: /Descargar recibo/ })).not.toBeInTheDocument();
  });

  it('cuotas: carga y sin estado de aporte', async () => {
    montar({ estCtx: { estadoAporte: null, loading: true } });
    await userEvent.click(screen.getByRole('tab', { name: /Cuotas/ }));
    expect(await screen.findByText('Cargando detalle del aporte…')).toBeInTheDocument();
  });

  it('cuotas: sin estado disponible informa el vacío', async () => {
    montar({ estCtx: { estadoAporte: null, loading: false } });
    await userEvent.click(screen.getByRole('tab', { name: /Cuotas/ }));
    expect(await screen.findByText('No hay estado de aporte disponible para esta gestión.')).toBeInTheDocument();
  });

  it('abre directamente en Cuotas cuando el estado de navegación lo pide', async () => {
    montar({ route: { pathname: '/pagos/8', state: { pagosTab: 'cuotas' } } });
    expect(await screen.findByText('Datos del aporte')).toBeInTheDocument();
  });

  it('tab Beca con descuento y tipo', async () => {
    montar({ pago: { beca: { estado: 'ACTIVA', fechaSolicitud: '2026-01-10T12:00:00', tipoBeca: { nombre: 'Excelencia', porcentaje: 25, descripcion: 'Mejores' } } } });
    await userEvent.click(screen.getByRole('tab', { name: /Beca/ }));
    expect(await screen.findByText('Excelencia')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('Mejores')).toBeInTheDocument();
  });

  it('desde beca 100% se ofrece descargar el recibo de la primera cuota', async () => {
    mocks.recibo.mockResolvedValue({ success: true, data: { filePath: '/r.pdf' } });
    montar({ auth: { permisos: todos }, route: { pathname: '/pagos/8', state: { fromBeca100: true } } });
    await userEvent.click(screen.getByRole('button', { name: /Descargar recibo de beca 100%/ }));
    await waitFor(() => expect(mocks.descargar).toHaveBeenCalledWith('/r.pdf', 'recibo_cuota.pdf'));
  });

  it('vista propia del estudiante: título "Mis aportes" y sin volver', () => {
    montar({ auth: { usuario: { id: 1, username: 'e', rol: { codigo: 'ESTUDIANTE' } } } });
    expect(screen.getByRole('heading', { name: 'Mis aportes' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Volver/ })).not.toBeInTheDocument();
  });
});
