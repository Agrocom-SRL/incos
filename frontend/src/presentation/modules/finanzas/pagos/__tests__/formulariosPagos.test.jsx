import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import dayjs from 'dayjs';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import AbonoForm from '../components/organisms/AbonoForm';
import EditarCuotaModal from '../components/organisms/EditarCuotaModal';
import CompromisoForm from '../components/organisms/CompromisoForm';
import CompromisoPage from '../pages/CompromisoPage';
import PagosDetail from '../pages/PagosDetail';
import PagosList from '../pages/PagosList';
import { FINANZAS_PERMISOS } from '@application-finanzas/utils/finanzasPermisos';

const mocks = vi.hoisted(() => ({ compromiso: vi.fn(), detalle: vi.fn(), ingresos: vi.fn() }));
vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('@application-finanzas/hooks/state/useCompromisoPage', () => ({ useCompromisoPage: mocks.compromiso }));
vi.mock('@application-finanzas/hooks/state/usePagosDetailPage', () => ({ usePagosDetailPage: mocks.detalle }));
vi.mock('@application-finanzas/hooks/state/useIngresosListPage', () => ({ useIngresosListPage: mocks.ingresos }));

const registrar = { auth: { permisos: [permiso(FINANZAS_PERMISOS.pagoRegistrar, 'CREAR')] } };

describe('AbonoForm', () => {
  const metodos = [
    { id: 1, nombre: 'Efectivo', codigo: 'EFECTIVO' },
    { id: 2, nombre: 'Transferencia', codigo: 'TRANSFERENCIA' },
  ];
  const Montar = ({ onFinish = vi.fn(), ...props }) => {
    const [form] = Form.useForm();
    return (
      <AbonoForm
        form={form}
        metodosPago={metodos}
        cuentasPago={[{ id: 5, label: 'BNB 123' }]}
        saldoPendiente={300}
        onFinish={onFinish}
        onCancel={vi.fn()}
        {...props}
      />
    );
  };

  it('sin método invita a elegirlo y no muestra campos de comprobante', () => {
    renderWithProviders(<Montar />, registrar);
    expect(screen.getByText('Los campos del comprobante se ajustan según el método elegido.')).toBeInTheDocument();
    expect(screen.queryByText('Cuenta de pago')).not.toBeInTheDocument();
    expect(screen.getByText(/Saldo pendiente: Bs\s*300,00/)).toBeInTheDocument();
  });

  it('transferencia exige cuenta y código de comprobante', () => {
    renderWithProviders(<Montar metodoPagoId={2} reglasMetodo={{ cuentaVisible: true, cuentaRequerida: true, comprobanteVisible: true, comprobanteRequerido: true }} />, registrar);
    expect(screen.getByText('Cuenta de pago')).toBeInTheDocument();
    expect(screen.getByText('Código de comprobante')).toBeInTheDocument();
    expect(screen.getByText('Número de transacción (opcional)')).toBeInTheDocument();
  });

  it('enviar vacío muestra errores de monto, fecha y método y no llama a onFinish', async () => {
    const onFinish = vi.fn();
    renderWithProviders(<Montar onFinish={onFinish} />, registrar);
    await userEvent.click(screen.getByRole('button', { name: /Registrar pago/ }));
    expect(await screen.findByText('Ingrese el monto del abono')).toBeInTheDocument();
    expect(screen.getByText('Seleccione la fecha del pago')).toBeInTheDocument();
    expect(screen.getByText('Seleccione un método de pago', { selector: '.ant-form-item-explain-error' })).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('un monto mayor al saldo es rechazado', async () => {
    renderWithProviders(<Montar />, registrar);
    const monto = screen.getByPlaceholderText('0.00');
    await userEvent.type(monto, '500');
    await userEvent.click(screen.getByRole('button', { name: /Registrar pago/ }));
    // InputNumber con max recorta al saldo; no puede enviarse más que el pendiente.
    await waitFor(() => expect(monto).toHaveValue('300'));
  });

  it('"Registrar pago" requiere permiso CREAR en finanzas.pago.registrar', () => {
    renderWithProviders(<Montar />);
    expect(screen.queryByRole('button', { name: /Registrar pago/ })).not.toBeInTheDocument();
  });

  it('avisa el saldo que quedará al abonar parcialmente', async () => {
    renderWithProviders(<Montar />, registrar);
    await userEvent.type(screen.getByPlaceholderText('0.00'), '100');
    expect(await screen.findByText(/Quedará un saldo de Bs\s*200,00/)).toBeInTheDocument();
  });
});

describe('EditarCuotaModal', () => {
  const metodos = [{ id: 1, nombre: 'Efectivo', codigo: 'EFECTIVO' }];
  const cuota = { monto: 150, fechaPago: '2026-03-05', metodoPagoId: 1, numeroRecibo: 'R-001', descripcion: 'Parcial' };

  it('precarga los datos de la cuota y titula con el recibo', async () => {
    renderWithProviders(<EditarCuotaModal open cuota={cuota} metodosPago={metodos} onGuardar={vi.fn()} onCancelar={vi.fn()} />);
    expect(screen.getByText('Editar cuota · Recibo R-001')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByPlaceholderText('0.00')).toHaveValue('150'));
    expect(screen.getByDisplayValue('Parcial')).toBeInTheDocument();
  });

  it('guarda con los valores del formulario', async () => {
    const onGuardar = vi.fn();
    renderWithProviders(<EditarCuotaModal open cuota={cuota} metodosPago={metodos} onGuardar={onGuardar} onCancelar={vi.fn()} />);
    await waitFor(() => expect(screen.getByPlaceholderText('0.00')).toHaveValue('150'));
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(onGuardar).toHaveBeenCalled());
    const valores = onGuardar.mock.calls[0][0];
    expect(valores.monto).toBe(150);
    expect(valores.metodoPagoId).toBe(1);
    expect(dayjs(valores.fechaPago).format('YYYY-MM-DD')).toBe('2026-03-05');
  });

  it('sin monto no guarda', async () => {
    const onGuardar = vi.fn();
    renderWithProviders(<EditarCuotaModal open cuota={cuota} metodosPago={metodos} onGuardar={onGuardar} onCancelar={vi.fn()} />);
    const monto = screen.getByPlaceholderText('0.00');
    await waitFor(() => expect(monto).toHaveValue('150'));
    await userEvent.clear(monto);
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('Ingrese el monto de la cuota')).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it('cancelar cierra', async () => {
    const onCancelar = vi.fn();
    renderWithProviders(<EditarCuotaModal open cuota={cuota} metodosPago={metodos} onGuardar={vi.fn()} onCancelar={onCancelar} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancelar).toHaveBeenCalled();
  });
});

describe('CompromisoForm', () => {
  const Montar = (props) => {
    const [form] = Form.useForm();
    return <CompromisoForm form={form} onGuardar={vi.fn()} onEliminar={vi.fn()} {...props} />;
  };
  const gestionar = { auth: { permisos: [permiso(FINANZAS_PERMISOS.compromisoGestionar, 'CREAR', 'EDITAR', 'ELIMINAR')] } };

  it('alta: exige la fecha y no muestra eliminar', async () => {
    const onGuardar = vi.fn();
    renderWithProviders(<Montar onGuardar={onGuardar} />, gestionar);
    expect(screen.queryByRole('button', { name: /Eliminar compromiso/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Registrar compromiso/ }));
    expect(await screen.findByText('Seleccione la fecha del compromiso de pago')).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it('con compromiso vigente permite actualizar (fecha ISO y observación recortada) y eliminar con confirmación', async () => {
    const onGuardar = vi.fn();
    const onEliminar = vi.fn();
    renderWithProviders(
      <Montar onGuardar={onGuardar} onEliminar={onEliminar} compromiso={{ id: 4, fechaCompromiso: '2026-05-10', observacion: '  acuerdo  ' }} />,
      gestionar,
    );
    await userEvent.click(screen.getByRole('button', { name: /Actualizar compromiso/ }));
    await waitFor(() => expect(onGuardar).toHaveBeenCalledWith({ fechaCompromiso: '2026-05-10', observacion: 'acuerdo' }));

    await userEvent.click(screen.getByRole('button', { name: /Eliminar compromiso/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Eliminar' }));
    expect(onEliminar).toHaveBeenCalled();
  });

  it('sin permiso no ofrece guardar', () => {
    renderWithProviders(<Montar />);
    expect(screen.queryByRole('button', { name: /Registrar compromiso/ })).not.toBeInTheDocument();
  });
});

describe('CompromisoPage', () => {
  const estado = (extra = {}) => ({
    breadcrumbItems: [{ title: 'Finanzas' }],
    handleVolver: vi.fn(),
    estudiantes: [],
    loadingBusqueda: false,
    errorBusqueda: null,
    buscarEstudiantes: vi.fn(),
    estudianteSeleccionado: null,
    handleSeleccionarEstudiante: vi.fn(),
    handleCambiarEstudiante: vi.fn(),
    estado: null,
    loadingEstado: false,
    errorEstado: null,
    cabeceraId: null,
    compromiso: null,
    loadingCompromiso: false,
    errorCompromiso: null,
    handleGuardar: vi.fn(),
    guardando: false,
    handleEliminar: vi.fn(),
    eliminando: false,
    ...extra,
  });

  it('sin estudiante invita a seleccionar y no muestra pasos posteriores', () => {
    mocks.compromiso.mockReturnValue(estado());
    renderWithProviders(<CompromisoPage />);
    expect(screen.getByText('Seleccione un estudiante para comenzar')).toBeInTheDocument();
    expect(screen.queryByText('Estado del aporte')).not.toBeInTheDocument();
  });

  it('estudiante sin cabecera de aporte: advertencia y sin formulario', () => {
    mocks.compromiso.mockReturnValue(
      estado({ estudianteSeleccionado: { nombreCompleto: 'Pérez Ana' }, estado: { montoObligatorio: 100, totalPagado: 0, saldoPendiente: 100 } }),
    );
    renderWithProviders(<CompromisoPage />);
    expect(screen.getByText('El estudiante no tiene un aporte registrado')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Registrar compromiso/ })).not.toBeInTheDocument();
  });

  it('con cabecera muestra el formulario de compromiso', () => {
    mocks.compromiso.mockReturnValue(
      estado({ estudianteSeleccionado: { nombreCompleto: 'Pérez Ana' }, estado: { montoObligatorio: 100, totalPagado: 0, saldoPendiente: 100 }, cabeceraId: 9 }),
    );
    renderWithProviders(<CompromisoPage />, { auth: { permisos: [permiso(FINANZAS_PERMISOS.compromisoGestionar, 'CREAR')] } });
    expect(screen.getByRole('button', { name: /Registrar compromiso/ })).toBeInTheDocument();
  });

  it('error al cargar el compromiso se informa', () => {
    mocks.compromiso.mockReturnValue(
      estado({ estudianteSeleccionado: { nombreCompleto: 'Pérez Ana' }, estado: { montoObligatorio: 1 }, cabeceraId: 9, errorCompromiso: 'Falla API' }),
    );
    renderWithProviders(<CompromisoPage />);
    expect(screen.getByText('No se pudo cargar el compromiso de pago')).toBeInTheDocument();
  });
});

describe('PagosDetail', () => {
  const detalle = (extra = {}) => ({
    pago: {
      profile: { nombreCompleto: 'Pérez Ana', codigoEstudiante: 'E-1' },
      gestion: { anio: 2026 },
      montoBase: 1000,
      descuentoBeca: 0,
      montoObligatorio: 1000,
      totalPagado: 300,
      saldoPendiente: 700,
      cantidadPagos: 1,
      cuotas: [{ id: 1, numeroRecibo: 'R-1', fechaPago: '2026-03-01', monto: 300 }],
    },
    loading: false,
    error: null,
    breadcrumbItems: [{ title: 'Finanzas' }],
    refetch: vi.fn(),
    reciboCuotaId: null,
    descargandoRecibo: false,
    handleVolver: vi.fn(),
    handleGenerarRecibo: vi.fn(),
    eliminarCuota: vi.fn(),
    cuotaEnEdicion: null,
    abrirEditarCuota: vi.fn(),
    cerrarEditarCuota: vi.fn(),
    guardarEditarCuota: vi.fn(),
    actualizandoCuota: false,
    metodosPago: [],
    cuentasPago: [],
    loadingCatalogos: false,
    ...extra,
  });
  beforeEach(() => mocks.detalle.mockReset());

  it('muestra la ficha y las cuotas', () => {
    mocks.detalle.mockReturnValue(detalle());
    renderWithProviders(<PagosDetail />);
    expect(screen.getByRole('heading', { name: 'Pérez Ana' })).toBeInTheDocument();
    expect(screen.getByText('R-1')).toBeInTheDocument();
  });

  it('error y no encontrado', () => {
    mocks.detalle.mockReturnValue(detalle({ pago: null, error: 'Falla' }));
    const { unmount } = renderWithProviders(<PagosDetail />);
    expect(screen.getByText('No se pudo cargar la ficha')).toBeInTheDocument();
    unmount();
    mocks.detalle.mockReturnValue(detalle({ pago: null }));
    renderWithProviders(<PagosDetail />);
    expect(screen.getByText('No se encontró el pago solicitado.')).toBeInTheDocument();
  });

  it('las acciones de la cuota respetan los permisos del usuario', async () => {
    const state = detalle();
    mocks.detalle.mockReturnValue(state);
    renderWithProviders(<PagosDetail />, {
      auth: { permisos: [permiso(FINANZAS_PERMISOS.pagoEditar, 'EDITAR'), permiso(FINANZAS_PERMISOS.pagoVer, 'EXPORTAR')] },
    });
    await userEvent.click(screen.getByRole('button', { name: 'edit' }));
    expect(state.abrirEditarCuota).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'delete' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'file-pdf' })).toBeInTheDocument();
  });
});

describe('PagosList (registro de ingresos)', () => {
  it('lista ingresos y refleja el error del listado', () => {
    mocks.ingresos.mockReturnValue({
      ingresos: [{ id: 1, concepto: 'Aporte marzo' }],
      loading: false,
      error: null,
      searchText: '',
      tableColumns: [{ title: 'Concepto', dataIndex: 'concepto' }],
      breadcrumbItems: [{ title: 'Finanzas' }],
      handleSearchChange: vi.fn(),
      tablePagination: undefined,
    });
    const { unmount } = renderWithProviders(<PagosList />);
    expect(screen.getByText('Aporte marzo')).toBeInTheDocument();
    unmount();

    mocks.ingresos.mockReturnValue({
      ingresos: [], loading: false, error: 'Falla de red', searchText: '', tableColumns: [],
      breadcrumbItems: [], handleSearchChange: vi.fn(), tablePagination: undefined,
    });
    renderWithProviders(<PagosList />);
    expect(screen.getByText(/Falla de red/)).toBeInTheDocument();
  });
});
