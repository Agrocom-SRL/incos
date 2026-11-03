import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import ConcurrenciaCell from '../components/atoms/ConcurrenciaCell';
import CuentaContactoCell from '../components/atoms/CuentaContactoCell';
import CuentaTitularCell from '../components/atoms/CuentaTitularCell';
import AporteFormSections from '../components/organisms/AporteFormSections';
import BancosTabPanel from '../components/BancosTabPanel';
import CuentasTabPanel from '../components/CuentasTabPanel';
import MetodosTabPanel from '../components/MetodosTabPanel';
import { createBancosColumns, createCuentasColumns, createMetodosColumns } from '../config/configPagosColumns';
import { CONFIG_PAGOS_PERMISO } from '../config/configPagosPermisos';
import ConfigPagosPage from '../pages/ConfigPagosPage';
import AporteConfigPage from '../pages/AporteConfigPage';
import BancoFormPage from '../pages/BancoFormPage';
import CuentaDetailPage from '../pages/CuentaDetailPage';
import BancoDetailPage from '../pages/BancoDetailPage';
import MetodoDetailPage from '../pages/MetodoDetailPage';

const mocks = vi.hoisted(() => ({
  ctx: vi.fn(),
  toggle: vi.fn(),
  page: vi.fn(),
  aporte: vi.fn(),
  bancoForm: vi.fn(),
  cuentaDetalle: vi.fn(),
  bancoDetalle: vi.fn(),
  metodoDetalle: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => mocks.navigate }));
vi.mock('@application-finanzas/hooks/context/useConfigPagosContext', () => ({ useConfigPagosContext: mocks.ctx }));
vi.mock('@application-shared/hooks', async (orig) => ({ ...(await orig()), useToggleEstadoCatalogo: mocks.toggle }));
vi.mock('@application-finanzas/hooks/state/useConfigPagosPage', () => ({ useConfigPagosPage: mocks.page }));
vi.mock('@application-finanzas/aportes/hooks/state/useAportePage', () => ({ useAportePage: mocks.aporte }));
vi.mock('@application-finanzas/hooks/state/useBancoForm', () => ({ useBancoForm: mocks.bancoForm }));
vi.mock('@application-finanzas/hooks/state/useCuentaDetailPage', () => ({ useCuentaDetailPage: mocks.cuentaDetalle }));
vi.mock('@application-finanzas/hooks/state/useBancoDetailPage', () => ({ useBancoDetailPage: mocks.bancoDetalle }));
vi.mock('@application-finanzas/hooks/state/useMetodoDetailPage', () => ({ useMetodoDetailPage: mocks.metodoDetalle }));

const conPermisos = (...acciones) => ({ auth: { permisos: [permiso(CONFIG_PAGOS_PERMISO, ...acciones)] } });

beforeEach(() => {
  mocks.navigate.mockReset();
  mocks.ctx.mockReturnValue({ refetch: vi.fn(), eliminarBanco: vi.fn(), eliminarCuenta: vi.fn() });
  mocks.toggle.mockReturnValue(vi.fn());
});

describe('celdas de configuración de pagos', () => {
  it('ConcurrenciaCell descarta cantidades en cero y pluraliza', () => {
    const { rerender } = renderWithProviders(<ConcurrenciaCell lineas={[{ key: 'a', cantidad: 0, singular: 'pago', plural: 'pagos' }]} />);
    expect(screen.getByText('Sin registros')).toBeInTheDocument();
    rerender(<ConcurrenciaCell lineas={[{ key: 'a', cantidad: 1, singular: 'pago', plural: 'pagos' }, { key: 'b', cantidad: 3, singular: 'cuenta', plural: 'cuentas' }]} />);
    expect(screen.getByText('1 pago')).toBeInTheDocument();
    expect(screen.getByText('3 cuentas')).toBeInTheDocument();
  });

  it('CuentaContactoCell muestra celular y QR', () => {
    render(<CuentaContactoCell numeroCelular="7000" tieneQr />);
    expect(screen.getByText('7000')).toBeInTheDocument();
    expect(screen.getByText('QR disponible')).toBeInTheDocument();
  });

  it('CuentaTitularCell con fallback "Sin titular" y método', () => {
    render(<CuentaTitularCell titular={null} metodoNombre="Transferencia" />);
    expect(screen.getByText('SIN TITULAR')).toBeInTheDocument();
    expect(screen.getByText('Transferencia')).toBeInTheDocument();
  });

  it('AporteFormSections: sin campos no renderiza; con campos muestra gestión y estado', () => {
    const Host = ({ activo, formSections }) => {
      const [form] = Form.useForm();
      return (
        <Form form={form}>
          <AporteFormSections form={form} formSections={formSections} gestionLabel="2026" activo={activo} footer={<button>Guardar</button>} />
        </Form>
      );
    };
    const { unmount } = render(<Host formSections={{}} activo />);
    expect(screen.queryByText('Activo')).not.toBeInTheDocument();
    unmount();
    render(<Host activo={false} formSections={{ datosAporte: { title: 'Aporte', fields: [{ name: 'monto', label: 'Monto', type: 'input' }] } }} />);
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });
});

describe('columnas de configuración de pagos', () => {
  const banco = { id: 1, codigo: 'BNB', nombre: 'Banco Nacional', metodoPagoId: 2, cantidadPagos: 3, cantidadCuentas: 1 };

  it('bancos: método aceptado, transacciones, orden y acciones', async () => {
    const onVer = vi.fn();
    const cols = createBancosColumns({ onVer, onEditar: vi.fn(), puedeEditar: false, metodoNombrePorId: () => 'Transferencia' });
    expect(cols.map((c) => c.title)).toEqual(['#', 'Identidad', 'Método aceptado', 'Transacciones', 'Acciones']);
    const celdas = renderWithProviders(<>{cols[2].render(2, banco)}{cols[3].render(null, banco)}</>);
    expect(screen.getByText('Transferencia')).toBeInTheDocument();
    expect(screen.getByText('3 pagos')).toBeInTheDocument();
    celdas.unmount();
    expect(cols[1].sortCompare({ nombre: 'A' }, { nombre: 'B' })).toBeLessThan(0);
    expect(cols[3].sortCompare({ cantidadPagos: 5 }, {})).toBe(5);

    renderWithProviders(cols[4].render(null, banco), { ...conPermisos('DETALLE', 'EDITAR') });
    await userEvent.click(screen.getByRole('button', { name: 'eye' }));
    expect(onVer).toHaveBeenCalledWith(banco);
    // Sin puedeEditar el botón de editar queda deshabilitado
    expect(screen.getByRole('button', { name: 'edit' })).toBeDisabled();
  });

  it('cuentas: titular, contacto y sin método asociado', () => {
    const cols = createCuentasColumns({ metodoNombrePorId: () => null });
    expect(cols.map((c) => c.title)).toEqual(['#', 'Cuenta', 'Titular', 'Contacto', 'Pagos recibidos', 'Acciones']);
    renderWithProviders(<>{cols[1].render(null, { numeroCuenta: '123' })}{cols[2].render(null, {})}</>);
    expect(screen.getByText('SIN BANCO')).toBeInTheDocument();
    expect(screen.getByText('SIN TITULAR')).toBeInTheDocument();
  });

  it('métodos: la columna de estado aparece solo con onToggleEstado', () => {
    expect(createMetodosColumns({}).map((c) => c.title)).toEqual(['#', 'Identidad', 'Pagos registrados', 'Acciones']);
    expect(createMetodosColumns({ onToggleEstado: vi.fn() })).toHaveLength(5);
  });
});

describe('paneles de pestaña', () => {
  it('BancosTabPanel filtra sin distinguir acentos ni mayúsculas, incluso por método', async () => {
    const bancos = [
      { id: 1, codigo: 'BNB', nombre: 'Banco Nacional', metodoPagoId: 1 },
      { id: 2, codigo: 'BME', nombre: 'Mercantil', metodoPagoId: 2 },
    ];
    renderWithProviders(<BancosTabPanel bancos={bancos} metodoNombrePorId={(id) => (id === 2 ? 'Depósito' : 'Transferencia')} />);
    expect(screen.getByText('BANCO NACIONAL')).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText('Buscar por código, nombre o método…'), 'depósito');
    expect(screen.queryByText('BANCO NACIONAL')).not.toBeInTheDocument();
    expect(screen.getByText('MERCANTIL')).toBeInTheDocument();
  });

  it('CuentasTabPanel busca por titular', async () => {
    const cuentas = [
      { id: 1, nombreTitular: 'Ana Pérez', numeroCuenta: '1', bancoNombre: 'BNB' },
      { id: 2, nombreTitular: 'Luis Soto', numeroCuenta: '2', bancoNombre: 'BME' },
    ];
    renderWithProviders(<CuentasTabPanel cuentas={cuentas} />);
    await userEvent.type(screen.getByPlaceholderText(/Buscar por titular/), 'perez');
    expect(screen.getByText('ANA PÉREZ')).toBeInTheDocument();
    expect(screen.queryByText('LUIS SOTO')).not.toBeInTheDocument();
  });

  it('MetodosTabPanel con error y filtro', async () => {
    const { unmount } = renderWithProviders(<MetodosTabPanel metodos={[]} error="Falla" />);
    expect(screen.getByText(/Falla/)).toBeInTheDocument();
    unmount();
    renderWithProviders(<MetodosTabPanel metodos={[{ id: 1, codigo: 'QR', nombre: 'Pago QR' }, { id: 2, codigo: 'EFECTIVO', nombre: 'Efectivo' }]} />);
    await userEvent.type(screen.getByPlaceholderText('Buscar por código o nombre…'), 'qr');
    expect(screen.getByText('PAGO QR')).toBeInTheDocument();
    expect(screen.queryByText('EFECTIVO')).not.toBeInTheDocument();
  });
});

describe('ConfigPagosPage', () => {
  const state = (extra = {}) => ({
    breadcrumbItems: [{ title: 'Finanzas' }],
    metodos: [{ id: 1, codigo: 'QR', nombre: 'Pago QR' }],
    bancos: [{ id: 1, codigo: 'BNB', nombre: 'Banco Nacional', metodoPagoId: 1 }],
    cuentas: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
    saving: false,
    ...extra,
  });

  it('abre en Métodos y el botón de aportes depende del permiso', () => {
    mocks.page.mockReturnValue(state());
    const { unmount } = renderWithProviders(<ConfigPagosPage />);
    expect(screen.getByText('PAGO QR')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Configuración de aportes/ })).not.toBeInTheDocument();
    unmount();
    renderWithProviders(<ConfigPagosPage />, { auth: { permisos: [permiso('finanzas.aporte', 'LISTAR')] } });
    expect(screen.getByRole('button', { name: /Configuración de aportes/ })).toBeInTheDocument();
  });

  it('la pestaña de la URL manda y "Agregar banco" exige CREAR', async () => {
    mocks.page.mockReturnValue(state());
    renderWithProviders(<ConfigPagosPage />, { ...conPermisos('CREAR'), route: '/finanzas/configuracion?tab=bancos' });
    expect((await screen.findAllByText('Bancos autorizados')).length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole('button', { name: /Agregar banco/ }));
    expect(mocks.navigate).toHaveBeenCalled();
  });

  it('pestaña desconocida cae en Métodos; sin CREAR no hay botón', () => {
    mocks.page.mockReturnValue(state());
    renderWithProviders(<ConfigPagosPage />, { route: '/x?tab=zzz' });
    expect(screen.getByText('PAGO QR')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Agregar/ })).not.toBeInTheDocument();
  });

  it('error general con reintento', async () => {
    const s = state({ error: 'Servidor' });
    mocks.page.mockReturnValue(s);
    renderWithProviders(<ConfigPagosPage />);
    expect(screen.getByText('No se pudo cargar la configuración de pagos')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(s.refetch).toHaveBeenCalled();
  });
});

describe('AporteConfigPage', () => {
  const Montar = (props) => {
    const [form] = Form.useForm();
    mocks.aporte.mockReturnValue({
      form,
      gestionVigente: { nombre: 'Gestión 2026' },
      aporteVigente: { id: 1, aporteActivo: true },
      breadcrumbItems: [{ title: 'Finanzas' }],
      loading: false,
      error: null,
      refetch: vi.fn(),
      saving: false,
      formSections: {
        datosAporte: {
          title: 'Aporte',
          fields: [{ name: 'monto', label: 'Monto', type: 'input', rules: [{ required: true, message: 'Ingrese el monto' }] }],
        },
      },
      handleVolver: vi.fn(),
      guardarAporte: vi.fn(),
      ...props,
    });
    return <AporteConfigPage />;
  };
  const editar = { auth: { permisos: [permiso('finanzas.aporte', 'EDITAR')] } };

  it('carga, error con reintento y sin gestión vigente', () => {
    const { unmount } = renderWithProviders(<Montar loading />);
    expect(screen.getByText('Cargando aporte de la gestión...')).toBeInTheDocument();
    unmount();
    const { unmount: u2 } = renderWithProviders(<Montar error="Falla" />);
    expect(screen.getByText('No se pudo cargar el aporte de la gestión')).toBeInTheDocument();
    u2();
    renderWithProviders(<Montar gestionVigente={null} />);
    expect(screen.getByText('No hay una gestión vigente para configurar el aporte')).toBeInTheDocument();
  });

  it('guardar con el formulario inválido no llama a la API y no deja rechazos sin manejar', async () => {
    const guardarAporte = vi.fn();
    renderWithProviders(<Montar guardarAporte={guardarAporte} />, editar);
    await userEvent.click(screen.getByRole('button', { name: 'Guardar aporte' }));
    expect(await screen.findByText('Ingrese el monto')).toBeInTheDocument();
    expect(guardarAporte).not.toHaveBeenCalled();
  });

  it('guardar válido envía los valores', async () => {
    const guardarAporte = vi.fn();
    renderWithProviders(<Montar guardarAporte={guardarAporte} />, editar);
    await userEvent.type(screen.getByRole('textbox'), '500');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar aporte' }));
    await waitFor(() => expect(guardarAporte).toHaveBeenCalledWith({ monto: '500' }));
  });

  it('el botón guardar exige permiso EDITAR si ya hay aporte', () => {
    renderWithProviders(<Montar />);
    expect(screen.queryByRole('button', { name: 'Guardar aporte' })).not.toBeInTheDocument();
  });
});

describe('BancoFormPage', () => {
  const Montar = (props) => {
    const [form] = Form.useForm();
    mocks.bancoForm.mockReturnValue({
      form,
      pageTitle: 'Nuevo banco',
      breadcrumbItems: [],
      permisoAccion: 'CREAR',
      loading: false,
      submitLoading: false,
      error: null,
      initialValues: {},
      formSections: { datosBanco: { title: 'Datos del banco', fields: [{ name: 'nombre', label: 'Nombre', type: 'input' }] } },
      handleVolver: vi.fn(),
      handleSubmit: vi.fn(),
      isInvalidEditId: false,
      ...props,
    });
    return <BancoFormPage />;
  };

  it('guarda solo con el permiso de la acción; id inválido muestra alerta', async () => {
    const handleSubmit = vi.fn();
    const { unmount } = renderWithProviders(<Montar handleSubmit={handleSubmit} />, conPermisos('CREAR'));
    await userEvent.click(screen.getByRole('button', { name: 'Guardar banco' }));
    expect(handleSubmit).toHaveBeenCalled();
    unmount();
    const { unmount: u2 } = renderWithProviders(<Montar />);
    expect(screen.queryByRole('button', { name: 'Guardar banco' })).not.toBeInTheDocument();
    u2();
    renderWithProviders(<Montar isInvalidEditId />);
    expect(screen.getByText('Identificador de banco inválido')).toBeInTheDocument();
  });
});

describe('fichas de configuración de pagos', () => {
  const base = { loading: false, error: null, isInvalidId: false, avatarInitials: 'XX', breadcrumbItems: [], eliminando: false, handleEliminar: vi.fn(), handleVolver: vi.fn(), refetch: vi.fn() };

  it('cuenta: enlaces a banco y método solo con DETALLE; eliminar con permiso', async () => {
    mocks.cuentaDetalle.mockReturnValue({
      ...base,
      cuenta: { id: 5, nombreTitular: 'Ana Pérez', numeroCuenta: '123', bancoId: 1, bancoNombre: 'BNB', metodoPagoId: 2, qrImagenUrl: '/qr.png', activo: true },
      metodoNombre: 'Transferencia',
    });
    const { unmount } = renderWithProviders(<CuentaDetailPage />);
    expect(screen.getByText('ANA PÉREZ')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Eliminar/ })).not.toBeInTheDocument();
    expect(screen.getByText('BNB').closest('a')).toBeNull();
    unmount();

    renderWithProviders(<CuentaDetailPage />, conPermisos('DETALLE', 'ELIMINAR'));
    await userEvent.click(screen.getByText('BNB'));
    expect(mocks.navigate).toHaveBeenCalledWith(expect.stringContaining('1'));
    await userEvent.click(screen.getByRole('button', { name: /Eliminar/ }));
    expect(mocks.cuentaDetalle().handleEliminar).toHaveBeenCalled();
  });

  it('cuenta: inválido, vacío y error', () => {
    mocks.cuentaDetalle.mockReturnValue({ ...base, cuenta: null, isInvalidId: true });
    const { unmount } = renderWithProviders(<CuentaDetailPage />);
    expect(screen.getByText('Identificador de cuenta inválido')).toBeInTheDocument();
    unmount();
    mocks.cuentaDetalle.mockReturnValue({ ...base, cuenta: null });
    renderWithProviders(<CuentaDetailPage />);
    expect(screen.getByText('No se encontró la cuenta solicitada')).toBeInTheDocument();
  });

  it('banco: lista las cuentas relacionadas', () => {
    mocks.bancoDetalle.mockReturnValue({
      ...base,
      banco: { id: 1, codigo: 'BNB', nombre: 'Banco Nacional', metodoPagoId: 2, activo: true },
      metodoNombre: 'Transferencia',
      cuentasDelBanco: [{ id: 9, numeroCuenta: '555', nombreTitular: 'Ana Pérez' }],
    });
    renderWithProviders(<BancoDetailPage />);
    expect(screen.getByText('555')).toBeInTheDocument();
    expect(screen.getByText('Cuentas de este banco')).toBeInTheDocument();
  });

  it('método: relaciones y estado inválido', () => {
    mocks.metodoDetalle.mockReturnValue({
      ...base,
      metodo: { id: 2, codigo: 'QR', nombre: 'Pago QR', activo: true },
      bancosDelMetodo: [{ id: 1, nombre: 'Banco Nacional', codigo: 'BNB' }],
      cuentasDelMetodo: [],
    });
    const { unmount } = renderWithProviders(<MetodoDetailPage />);
    expect(screen.getByText('Banco Nacional')).toBeInTheDocument();
    unmount();
    mocks.metodoDetalle.mockReturnValue({ ...base, metodo: null, isInvalidId: true });
    renderWithProviders(<MetodoDetailPage />);
    expect(screen.getByText('Identificador de método de pago inválido')).toBeInTheDocument();
  });
});
