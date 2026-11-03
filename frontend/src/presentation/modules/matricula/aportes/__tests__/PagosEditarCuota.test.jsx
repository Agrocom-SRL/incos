import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import PagosEditarCuota from '../pages/PagosEditarCuota';

const mocks = vi.hoisted(() => ({
  detalle: vi.fn(),
  estado: vi.fn(),
  actualizar: vi.fn(),
  recibo: vi.fn(),
  metodos: vi.fn(),
  cuentas: vi.fn(),
  bancos: vi.fn(),
  descargar: vi.fn(),
}));
const navigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@container', () => ({
  useContainer: () => ({ resolve: vi.fn() }),
  useCasesFactory: {
    listarMetodosPago: () => ({ ejecutar: (...a) => mocks.metodos(...a) }),
    listarCuentasPago: () => ({ ejecutar: (...a) => mocks.cuentas(...a) }),
    listarBancosAutorizados: () => ({ ejecutar: (...a) => mocks.bancos(...a) }),
    actualizarCuotaPagoAporte: () => ({ ejecutar: (...a) => mocks.actualizar(...a) }),
    generarReciboPago: () => ({ ejecutar: (...a) => mocks.recibo(...a) }),
  },
}));
vi.mock('@application-pagos/hooks', async (orig) => ({ ...(await orig()), usePagosDetailContext: mocks.detalle, useEstadoAporteRegistro: mocks.estado }));
vi.mock('@application/utils', async (orig) => ({ ...(await orig()), downloadFile: (...a) => mocks.descargar(...a) }));

const auth = { permisos: [permiso('finanzas.pago.editar', 'EDITAR')] };
const pago = { id: 8, monto_base: 1000, descuento_beca: 100, monto_obligatorio: 900, estudiante: { id: 3, codigoEstudiante: 'E-3', nombreCompleto: 'Pérez Ana', ci: '123', expedicion: 'lp' }, gestion: { id: 2, nombre: '2026' } };
const cuota = (id, monto, extra = {}) => ({ id, numero_recibo: `R-${id}`, monto, fecha_pago: '2026-03-05T12:00:00', metodo_pago_id: 1, ...extra });

const montar = ({ cuotas = [cuota(11, 400), cuota(12, 200)], state, ctx, est, authOpts = auth, path = '/pagos/8/editar' } = {}) => {
  mocks.detalle.mockReturnValue({ pago, loading: false, error: null, refetch: vi.fn(), ...ctx });
  mocks.estado.mockReturnValue({ estadoAporte: { saldo_pendiente: 300, cuotas }, loading: false, error: null, refetch: vi.fn(), ...est });
  return renderWithProviders(
    <Routes>
      <Route path="/pagos/:id/editar" element={<PagosEditarCuota />} />
      <Route path="*" element={<PagosEditarCuota />} />
    </Routes>,
    { route: state ? { pathname: path, state } : path, auth: authOpts },
  );
};

beforeEach(() => {
  navigate.mockClear();
  Object.values(mocks).forEach((m) => m.mockReset());
  mocks.metodos.mockResolvedValue({ success: true, data: [{ id: 1, codigo: 'EFECTIVO', nombre: 'Efectivo' }, { id: 3, codigo: 'TRANSFERENCIA', nombre: 'Transferencia' }] });
  mocks.cuentas.mockResolvedValue({ success: true, data: [{ id: 5, nombreTitular: 'INCOS', numeroCuenta: '99' }] });
  mocks.bancos.mockResolvedValue({ success: true, data: [] });
  mocks.actualizar.mockResolvedValue({ success: true });
  mocks.recibo.mockResolvedValue({ success: true, data: { filePath: '/r.pdf', fileName: 'r.pdf' } });
});

describe('PagosEditarCuota', () => {
  it('identificador inválido, carga y pago no encontrado', () => {
    const a = montar({ path: '/pagos/abc/editar' });
    expect(screen.getByText('Identificador de pago no válido')).toBeInTheDocument();
    a.unmount();
    const b = montar({ ctx: { loading: true } });
    expect(b.container.querySelector('.ant-spin')).not.toBeNull();
    b.unmount();
    montar({ ctx: { pago: null, error: 'Falla del servidor' } });
    expect(screen.getByText('No se pudo cargar el pago')).toBeInTheDocument();
    expect(screen.getByText('Falla del servidor')).toBeInTheDocument();
  });

  it('RBAC: sin permiso de editar avisa y regresa al listado', async () => {
    montar({ authOpts: { permisos: [] }, state: { returnListPath: '/pagos/8' } });
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/pagos/8', { replace: true }));
    expect(await screen.findByText('No tiene permiso para editar cuotas de aporte')).toBeInTheDocument();
  });

  it('con varias cuotas pide elegir una y precarga la seleccionada del estado de navegación', async () => {
    montar({ state: { selectedCuotaId: 12 } });
    expect(screen.getByText('Seleccionar cuota/recibo a editar')).toBeInTheDocument();
    expect(screen.getByText('Recibo R-11')).toBeInTheDocument();
    expect(await screen.findByText('Detalle del aporte')).toBeInTheDocument();
    expect(screen.getByText('Total a pagar (después del descuento)')).toBeInTheDocument();
    expect(screen.getByText('−Bs. 100,00', { exact: false })).toBeInTheDocument();
  });

  it('sin cuota elegida (varias) muestra el aviso y al elegir una aparece el detalle', async () => {
    montar();
    expect(screen.getByText('Seleccione una cuota para editar')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Recibo R-11'));
    expect(await screen.findByText('Detalle del aporte')).toBeInTheDocument();
    expect(screen.getByText('Monto máximo para este recibo')).toBeInTheDocument();
  });

  it('con una sola cuota se selecciona sola y muestra el estudiante', async () => {
    montar({ cuotas: [cuota(11, 400)] });
    expect(await screen.findByText('Detalle del aporte')).toBeInTheDocument();
    expect(screen.queryByText('Seleccionar cuota/recibo a editar')).not.toBeInTheDocument();
    expect(screen.getByText('Pérez Ana')).toBeInTheDocument();
    expect(screen.getByText('123 LP')).toBeInTheDocument();
  });

  it('guarda la cuota con el payload correcto, descarga el recibo y vuelve al detalle', async () => {
    montar({ cuotas: [cuota(11, 400, { observacion: 'Nota previa' })] });
    await screen.findByText('Completar información del pago');
    await userEvent.click(screen.getByRole('button', { name: /Guardar cambios/ }));
    await waitFor(() => expect(mocks.actualizar).toHaveBeenCalledWith(11, {
      amount: 400, payment_method_id: 1, payment_account_id: null, payment_date: '2026-03-05', transaction_number: null, codigo_comprobante: null, descripcion: 'Nota previa',
    }));
    await waitFor(() => expect(mocks.descargar).toHaveBeenCalledWith('/r.pdf', 'r.pdf'));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/pagos/8', { state: { pagosTab: 'cuotas' } }));
    expect(await screen.findByText('Cuota actualizada correctamente')).toBeInTheDocument();
  });

  it('si el recibo no se puede generar la cuota queda guardada con una advertencia', async () => {
    mocks.recibo.mockResolvedValue({ success: false });
    montar({ cuotas: [cuota(11, 400)] });
    await screen.findByText('Completar información del pago');
    await userEvent.click(screen.getByRole('button', { name: /Guardar cambios/ }));
    expect(await screen.findByText('La cuota se actualizó, pero no se pudo descargar el recibo automáticamente')).toBeInTheDocument();
  });

  it('un error del servidor al guardar se informa y no navega', async () => {
    mocks.actualizar.mockResolvedValue({ success: false, error: 'Recibo bloqueado' });
    montar({ cuotas: [cuota(11, 400)] });
    await screen.findByText('Completar información del pago');
    await userEvent.click(screen.getByRole('button', { name: /Guardar cambios/ }));
    expect(await screen.findByText('Recibo bloqueado')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalledWith('/pagos/8', expect.anything());
  });

  it('el monto no puede superar el total menos las demás cuotas y bloquea el guardado', async () => {
    montar({ cuotas: [cuota(11, 400), cuota(12, 300)], state: { selectedCuotaId: 11 } });
    await screen.findByText('Completar información del pago');
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '700' } });
    expect(await screen.findByText('El monto ingresado supera el máximo permitido para esta cuota.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar cambios/ })).toBeDisabled();
    expect(mocks.actualizar).not.toHaveBeenCalled();
  });

  it('Volver y Cancelar regresan al listado de origen', async () => {
    montar({ cuotas: [cuota(11, 400)], state: { returnListPath: '/pagos/listar', menuSidebarKey: 'MAT' } });
    await screen.findByText('Completar información del pago');
    await userEvent.click(screen.getByRole('button', { name: /Cancelar/ }));
    expect(navigate).toHaveBeenLastCalledWith('/pagos/listar', { state: { menuSidebarKey: 'MAT' } });
    await userEvent.click(screen.getByRole('button', { name: /Volver al listado/ }));
    expect(navigate).toHaveBeenCalledTimes(2);
  });

  it('muestra una advertencia si el estado del aporte no cargó y un error de catálogos', async () => {
    mocks.metodos.mockRejectedValue(new Error('caída'));
    montar({ est: { error: 'sin estado' } });
    expect(screen.getByText('No se pudo cargar el estado del aporte')).toBeInTheDocument();
    expect(await screen.findByText('No se pudieron cargar catálogos de pago')).toBeInTheDocument();
  });

  it('un método con cuenta (transferencia) pide cuenta y muestra los campos del comprobante', async () => {
    montar({ cuotas: [cuota(11, 400, { metodo_pago_id: 3, cuenta_pago_id: 5, numero_transaccion: 'TX', codigo_comprobante: 'C1' })] });
    expect(await screen.findByText('Cuenta de pago')).toBeInTheDocument();
    expect(screen.getByText('Número de transacción')).toBeInTheDocument();
    expect(screen.getByText('Código del comprobante')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Guardar cambios/ }));
    await waitFor(() => expect(mocks.actualizar).toHaveBeenCalledWith(11, expect.objectContaining({ payment_method_id: 3, payment_account_id: 5, transaction_number: 'TX', codigo_comprobante: 'C1' })));
  });
});
