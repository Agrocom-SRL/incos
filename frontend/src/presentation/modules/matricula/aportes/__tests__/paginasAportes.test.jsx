import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import PagosList from '../pages/PagosList';
import PagosRegistrarSeleccion from '../pages/PagosRegistrarSeleccion';
import AportesRedirect from '../connectors/AportesRedirect';
import ListConnector from '../connectors/ListConnector';
import DetailConnector from '../connectors/DetailConnector';
import PagosEditarCuotaConnector from '../connectors/PagosEditarCuotaConnector';
import PagosRegistrarConnector from '../connectors/PagosRegistrarConnector';
import PagosRegistrarSeleccionConnector from '../connectors/PagosRegistrarSeleccionConnector';

const mocks = vi.hoisted(() => ({
  lista: vi.fn(),
  exportar: vi.fn(),
  carreras: vi.fn(),
  buscar: vi.fn(),
  misAportes: vi.fn(),
}));
const navigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@container', () => ({
  useContainer: () => ({ resolve: vi.fn() }),
  useCasesFactory: { buscarEstudiantesRegistroAporte: () => ({ ejecutar: (...a) => mocks.buscar(...a) }) },
}));
vi.mock('@application-pagos/hooks', async (orig) => ({
  ...(await orig()),
  usePagosListContext: mocks.lista,
  useExportListaAportesPorCarreraExcel: () => mocks.exportar(),
}));
vi.mock('@application-shared/hooks', async (orig) => ({ ...(await orig()), useCarrerasCatalogApi: () => mocks.carreras() }));
vi.mock('@infrastructure/repositories/PagoAporteRepository.js', () => ({ default: { obtenerMisAportes: (...a) => mocks.misAportes(...a) } }));
vi.mock('@application-pagos/providers', () => ({
  PagosListProvider: ({ children }) => <div data-testid="prov-lista">{children}</div>,
  PagosProvider: ({ children }) => <div>{children}</div>,
  PagosDetailProvider: ({ children, pagoId }) => <div data-testid={`prov-detalle-${pagoId}`}>{children}</div>,
  PagosRegistrarProvider: ({ children, studentId }) => <div data-testid={`prov-registrar-${studentId}`}>{children}</div>,
}));
vi.mock('@application-matricula/admision/providers', () => ({
  StudentProvider: ({ children }) => <div>{children}</div>,
  StudentDetailProvider: ({ children }) => <div>{children}</div>,
}));
vi.mock('@pagos/pages/PagosDetail', () => ({ default: () => <p>pagina-detalle</p> }));
vi.mock('../pages/PagosEditarCuota', () => ({ default: () => <p>pagina-editar</p> }));
vi.mock('../pages/PagosRegistrar', () => ({ default: () => <p>pagina-registrar</p> }));

const matchMediaOriginal = window.matchMedia;
beforeEach(() => {
  navigate.mockClear();
  Object.values(mocks).forEach((m) => m.mockReset());
  mocks.carreras.mockReturnValue({ carreras: [{ id: 1, nombre: 'Sistemas', codigo: 'SIS', colorHex: '#123456' }, { id: 2, nombre: 'Contaduría' }], loading: false });
  mocks.exportar.mockReturnValue({ exportar: vi.fn().mockResolvedValue({ success: true }), loading: false });
  window.matchMedia = (query) => ({ matches: true, media: query, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(() => {
  window.matchMedia = matchMediaOriginal;
});

describe('PagosList', () => {
  const pago = { id: 8, estudiante: { nombreCompleto: 'Pérez Ana', codigoEstudiante: 'E-1' }, monto_base: 500, monto_obligatorio: 500, saldo_pendiente: 500, cantidad_pagos: 0, total_pagado: 0 };
  const lista = (extra = {}) => ({ pagos: [pago], loading: false, error: null, searchText: '', setSearchText: vi.fn(), refetch: vi.fn(), deletePago: vi.fn(), tablePagination: false, ...extra });

  it('lista los pagos y el alta exige CREAR; navega al selector con el estado del menú', async () => {
    mocks.lista.mockReturnValue(lista());
    const { unmount } = renderWithProviders(<PagosList />, { route: '/matricula/aportes/listar', auth: { permisos: [permiso('finanzas.pago.registrar', 'CREAR')] } });
    expect(screen.getByText('PÉREZ ANA')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Nuevo pago/ }));
    expect(navigate).toHaveBeenCalledWith('/pagos/registrar/seleccionar-estudiante', { state: expect.objectContaining({ returnListPath: '/matricula/aportes/listar', menuSidebarKey: expect.anything() }) });
    unmount();
    renderWithProviders(<PagosList />);
    expect(screen.queryByRole('button', { name: /Nuevo pago/ })).not.toBeInTheDocument();
  });

  it('buscar delega en el contexto', async () => {
    const s = lista();
    mocks.lista.mockReturnValue(s);
    renderWithProviders(<PagosList />);
    await userEvent.type(screen.getByPlaceholderText(/Buscar por estudiante/), 'p');
    expect(s.setSearchText).toHaveBeenCalledWith('p');
  });

  it('fuera de matrícula (finanzas legacy) no envía el estado del menú', async () => {
    mocks.lista.mockReturnValue(lista());
    renderWithProviders(<PagosList />, { route: '/pagos/listar', auth: { permisos: [permiso('finanzas.pago.registrar', 'CREAR')] } });
    await userEvent.click(screen.getByRole('button', { name: /Nuevo pago/ }));
    expect(navigate.mock.calls[0][1].state).toEqual({ returnListPath: '/pagos/listar' });
  });

  it('sin permiso de exportar no aparece el selector de carrera', () => {
    mocks.lista.mockReturnValue(lista());
    renderWithProviders(<PagosList />);
    expect(screen.queryByText('Seleccione carrera')).not.toBeInTheDocument();
  });

  it('exportar: se exige carrera y el resultado se informa', async () => {
    mocks.lista.mockReturnValue(lista());
    const exportar = vi.fn().mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false, error: 'Sin datos' });
    mocks.exportar.mockReturnValue({ exportar, loading: false });
    renderWithProviders(<PagosList />, { auth: { permisos: [permiso('matricula.pago.aporte.ver', 'EXPORTAR')] } });
    expect(screen.getByRole('button', { name: /Seleccione carrera/ })).toBeDisabled();
    await userEvent.click(within(document.querySelector('.pagos-carrera-select')).getByRole('combobox'));
    await userEvent.click(await screen.findByText('Sistemas'));
    const boton = await screen.findByRole('button', { name: /Excel aportes \(SIS\)/ });
    await userEvent.click(boton);
    expect(exportar).toHaveBeenCalledWith({ carreraId: 1 });
    expect(await screen.findByText('Archivo generado')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Excel aportes/ }));
    expect(await screen.findByText('Sin datos')).toBeInTheDocument();
  });

  it('error y vacío', () => {
    mocks.lista.mockReturnValue(lista({ pagos: [], error: 'No se pudo cargar' }));
    renderWithProviders(<PagosList />);
    expect(screen.getByText(/No se pudo cargar/)).toBeInTheDocument();
  });
});

describe('PagosRegistrarSeleccion', () => {
  const fila = (id, extra = {}) => ({ id, codigoEstudiante: `E-${id}`, nombreCompleto: `Estudiante ${id}`, carreraNombre: 'Sistemas', aporteRegistro: { tieneCabeceraAporte: true, saldoPendienteTotal: 100 }, ...extra });
  const auth = { permisos: [permiso('finanzas.pago.registrar', 'CREAR')] };

  it('carga la muestra preliminar con saldo y registra el pago del estudiante elegido', async () => {
    mocks.buscar.mockResolvedValue({ success: true, data: [fila(1), fila(2)] });
    renderWithProviders(<PagosRegistrarSeleccion />, { auth, route: '/pagos/registrar/seleccionar-estudiante' });
    expect(await screen.findByText('ESTUDIANTE 1')).toBeInTheDocument();
    expect(mocks.buscar).toHaveBeenCalledWith({ preliminar: true, limit: 10 });
    expect(screen.getByText(/Muestra de hasta 10 estudiantes con saldo pendiente/)).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole('button', { name: /Registrar pago/ })[1]);
    expect(navigate).toHaveBeenCalledWith('/pagos/registrar', { state: { studentId: 2, returnListPath: '/pagos/listar' } });
  });

  it('buscar con 2+ caracteres consulta por similitud (con debounce)', async () => {
    mocks.buscar.mockResolvedValue({ success: true, data: [fila(3)] });
    renderWithProviders(<PagosRegistrarSeleccion />, { auth });
    await screen.findByText('ESTUDIANTE 3');
    await userEvent.type(screen.getByPlaceholderText(/Email, teléfono, código/), 'ana');
    await waitFor(() => expect(mocks.buscar).toHaveBeenCalledWith({ q: 'ana', limit: 50 }), { timeout: 3000 });
    expect(await screen.findByText(/Búsqueda por similitud/)).toBeInTheDocument();
  });

  it('error del caso de uso o excepción se muestran', async () => {
    mocks.buscar.mockResolvedValueOnce({ success: false, error: 'Sin permiso' });
    const { unmount } = renderWithProviders(<PagosRegistrarSeleccion />);
    expect(await screen.findByText('No se pudo cargar la lista de estudiantes')).toBeInTheDocument();
    unmount();
    mocks.buscar.mockRejectedValueOnce(new Error('Caída de red'));
    renderWithProviders(<PagosRegistrarSeleccion />);
    expect((await screen.findAllByText('Caída de red')).length).toBeGreaterThan(0);
  });

  it('avisa si algún aporte ya está cubierto y oculta su botón', async () => {
    mocks.buscar.mockResolvedValue({ success: true, data: [fila(4, { aporteRegistro: { aporteTotalmenteCubierto: true } })] });
    renderWithProviders(<PagosRegistrarSeleccion />, { auth });
    expect(await screen.findByText('Aporte ya cubierto')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Registrar pago/ })).not.toBeInTheDocument();
  });

  it('sin resultados, volver y buscar en la lista de estudiantes conservan el origen', async () => {
    mocks.buscar.mockResolvedValue({ success: true, data: [] });
    renderWithProviders(<PagosRegistrarSeleccion />, { route: '/x' });
    expect(await screen.findByText('Sin resultados.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Volver/ }));
    expect(navigate).toHaveBeenLastCalledWith('/pagos/listar', { state: undefined });
    await userEvent.click(screen.getByRole('button', { name: /Ir a la lista de estudiantes/ }));
    expect(navigate).toHaveBeenLastCalledWith('/estudiantes/listar', { state: { returnListPath: '/pagos/listar' } });
  });

  it('sin permiso CREAR no hay botón de registro', async () => {
    mocks.buscar.mockResolvedValue({ success: true, data: [fila(5)] });
    renderWithProviders(<PagosRegistrarSeleccion />);
    await screen.findByText('ESTUDIANTE 5');
    expect(screen.queryByRole('button', { name: /Registrar pago/ })).not.toBeInTheDocument();
  });
});

describe('AportesRedirect', () => {
  const Destino = () => {
    const l = useLocation();
    return <output data-testid="loc">{l.pathname}</output>;
  };
  const montar = () =>
    renderWithProviders(
      <Routes>
        <Route path="/" element={<AportesRedirect />} />
        <Route path="*" element={<Destino />} />
      </Routes>,
    );

  it('redirige al aporte propio del estudiante', async () => {
    mocks.misAportes.mockResolvedValue({ success: true, data: { aportes: [{ id: 31 }] } });
    montar();
    expect(screen.getByText('Abriendo sus aportes…')).toBeInTheDocument();
    expect(await screen.findByTestId('loc')).toHaveTextContent('/pagos/31');
  });

  it('acepta la forma alternativa de la respuesta', async () => {
    mocks.misAportes.mockResolvedValue({ success: true, aportes: [{ id: 5 }] });
    montar();
    expect(await screen.findByTestId('loc')).toHaveTextContent('/pagos/5');
  });

  it('sin aportes muestra el vacío', async () => {
    mocks.misAportes.mockResolvedValue({ success: true, data: { aportes: [] } });
    montar();
    expect(await screen.findByText('Aún no tiene aportes registrados en la gestión vigente.')).toBeInTheDocument();
  });

  it('error del servidor o excepción muestran la alerta', async () => {
    mocks.misAportes.mockResolvedValueOnce({ success: false, error: 'Sin sesión' });
    const { unmount } = montar();
    expect(await screen.findByText('No se pudieron abrir sus aportes')).toBeInTheDocument();
    expect(screen.getByText('Sin sesión')).toBeInTheDocument();
    unmount();
    mocks.misAportes.mockRejectedValueOnce(new Error('Caída'));
    montar();
    expect(await screen.findByText('Caída')).toBeInTheDocument();
  });
});

describe('conectores de aportes', () => {
  it('ListConnector: el estudiante va a su aporte; el resto ve el listado dentro de su provider', async () => {
    mocks.misAportes.mockResolvedValue({ success: true, data: { aportes: [] } });
    mocks.lista.mockReturnValue({ pagos: [], loading: false, error: null, searchText: '', setSearchText: vi.fn(), tablePagination: false });
    const e = renderWithProviders(<ListConnector />, { auth: { usuario: { id: 1, username: 'u', rol: { codigo: 'ESTUDIANTE' } } } });
    expect(screen.queryByTestId('prov-lista')).not.toBeInTheDocument();
    await screen.findByText('Aún no tiene aportes registrados en la gestión vigente.');
    e.unmount();
    renderWithProviders(<ListConnector />);
    expect(screen.getByTestId('prov-lista')).toBeInTheDocument();
  });

  it('detalle y edición convierten el id de la ruta a número', () => {
    const d = renderWithProviders(
      <Routes><Route path="/pagos/:id" element={<DetailConnector />} /></Routes>,
      { route: '/pagos/42' },
    );
    expect(screen.getByTestId('prov-detalle-42')).toContainElement(screen.getByText('pagina-detalle'));
    d.unmount();
    renderWithProviders(
      <Routes><Route path="/pagos/:id/editar" element={<PagosEditarCuotaConnector />} /></Routes>,
      { route: '/pagos/7/editar' },
    );
    expect(screen.getByTestId('prov-detalle-7')).toContainElement(screen.getByText('pagina-editar'));
  });

  it('registrar toma el estudiante del estado de navegación', () => {
    const { unmount } = renderWithProviders(<PagosRegistrarConnector />, { route: { pathname: '/pagos/registrar', state: { studentId: 9 } } });
    unmount();
    renderWithProviders(<PagosRegistrarConnector />);
    expect(screen.getByTestId('prov-registrar-null')).toContainElement(screen.getByText('pagina-registrar'));
  });

  it('selección de estudiante monta la página sin provider propio', async () => {
    mocks.buscar.mockResolvedValue({ success: true, data: [] });
    renderWithProviders(<PagosRegistrarSeleccionConnector />);
    expect(await screen.findByText('Registrar pago de aporte')).toBeInTheDocument();
  });
});
