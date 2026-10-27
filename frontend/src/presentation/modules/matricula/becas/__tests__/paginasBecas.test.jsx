import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import BecasList from '../pages/BecasList';
import BecaAsignacionDetail from '../pages/BecaAsignacionDetail';
import BecasAsignarSeleccion from '../pages/BecasAsignarSeleccion';
import EstudiantesAsignarBeca from '../pages/EstudiantesAsignarBeca';
import AsignarBecaConnector from '../connectors/AsignarBecaConnector';
import BecaAsignacionDetailConnector from '../connectors/BecaAsignacionDetailConnector';
import BecasAsignarSeleccionConnector from '../connectors/BecasAsignarSeleccionConnector';
import BecasListConnector from '../connectors/BecasListConnector';

const mocks = vi.hoisted(() => ({
  lista: vi.fn(),
  obtener: vi.fn(),
  eliminar: vi.fn(),
  estado: vi.fn(),
  buscar: vi.fn(),
  estudiante: vi.fn(),
  asignar: vi.fn(),
}));
const navigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@container', () => ({
  useContainer: () => ({ resolve: vi.fn() }),
  useCasesFactory: {
    obtenerBecaAsignadaPorId: () => ({ ejecutar: (...a) => mocks.obtener(...a) }),
    buscarEstudiantesAsignacionBeca: () => ({ ejecutar: (...a) => mocks.buscar(...a) }),
  },
}));
vi.mock('@application-matricula/becas/hooks/context/useBecasListContext', () => ({ useBecasListContext: mocks.lista }));
vi.mock('@application-matricula/becas/hooks/context/useAsignarBecaContext', () => ({ useAsignarBecaContext: mocks.asignar }));
vi.mock('@application-matricula/admision/hooks', async (orig) => ({
  ...(await orig()),
  useDeleteBecaAsignada: () => ({ deleteBecaAsignada: mocks.eliminar, loading: false }),
  useStudentDetailContext: mocks.estudiante,
}));
vi.mock('@application-pagos/hooks', async (orig) => ({ ...(await orig()), useEstadoAporteRegistro: mocks.estado }));
vi.mock('@application-matricula/becas/providers/BecasListProvider', () => ({ BecasListProvider: ({ children }) => <div data-testid="prov-lista">{children}</div> }));
vi.mock('@application-matricula/becas/providers/AsignarBecaProvider', () => ({
  AsignarBecaProvider: ({ children, studentId, studentName, editBecaAsignada }) => (
    <div data-testid="prov-asignar" data-student={studentId} data-name={studentName} data-edit={editBecaAsignada?.id ?? ''}>{children}</div>
  ),
}));
vi.mock('@application-matricula/admision/providers', () => ({
  StudentProvider: ({ children }) => <div>{children}</div>,
  StudentDetailProvider: ({ children }) => <div>{children}</div>,
}));

const matchMediaOriginal = window.matchMedia;
beforeEach(() => {
  navigate.mockClear();
  Object.values(mocks).forEach((m) => m.mockReset());
  window.matchMedia = (query) => ({ matches: true, media: query, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(() => {
  window.matchMedia = matchMediaOriginal;
});

describe('BecasList', () => {
  const beca = { id: 4, studentId: 3, student: { nombreCompleto: 'Pérez Ana', codigoEstudiante: 'E-1' }, scholarship: { nombre: 'Excelencia', porcentaje: 50 }, management: { codigo: 'G-26' }, carrera: { nombre: 'Sistemas', colorHex: '#123456' }, paralelo: { id: 1, nombre: 'A', turno: 'NOCHE' } };
  const lista = (extra = {}) => ({ becas: [beca], loading: false, error: null, searchText: '', setSearchText: vi.fn(), refetch: vi.fn(), deleteBeca: vi.fn(), tablePagination: false, ...extra });

  it('lista las becas por carrera con filtro de paralelo y alta protegida por CREAR', async () => {
    mocks.lista.mockReturnValue(lista());
    const { unmount } = renderWithProviders(<BecasList />, { route: '/estudiantes/becas/listar', auth: { permisos: [permiso('matricula.beca.asignar', 'CREAR')] } });
    expect(screen.getAllByText('Lista de becas').length).toBeGreaterThan(0);
    expect(screen.getByText('A · NOCHE')).toBeInTheDocument();
    expect(await screen.findByText('PÉREZ ANA')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Nueva Asignación de Beca/ }));
    expect(navigate).toHaveBeenCalledWith('/estudiantes/becas/asignar/seleccionar-estudiante', { state: { returnListPath: '/estudiantes/becas/listar', menuSidebarKey: 'MAT-BEC-LISTAR' } });
    unmount();
    mocks.lista.mockReturnValue(lista());
    renderWithProviders(<BecasList />);
    expect(screen.queryByRole('button', { name: /Nueva Asignación de Beca/ })).not.toBeInTheDocument();
  });

  it('buscar delega en el contexto', async () => {
    const s = lista();
    mocks.lista.mockReturnValue(s);
    renderWithProviders(<BecasList />);
    await userEvent.type(screen.getByPlaceholderText(/Buscar por nombre, tipo/), 'e');
    expect(s.setSearchText).toHaveBeenCalledWith('e');
  });

  it('vista propia del estudiante: "Mi beca" y vacío propio', () => {
    mocks.lista.mockReturnValue(lista({ becas: [] }));
    renderWithProviders(<BecasList />, { auth: { usuario: { id: 1, username: 'e', rol: { codigo: 'ESTUDIANTE' } } } });
    expect(screen.getAllByText('Mi beca').length).toBeGreaterThan(0);
    expect(screen.getByText(/Su beca asignada/)).toBeInTheDocument();
    expect(screen.getByText('Aún no tiene una beca asignada.')).toBeInTheDocument();
  });

  it('vacío y error de administración', () => {
    mocks.lista.mockReturnValue(lista({ becas: [], error: 'No se pudo cargar' }));
    renderWithProviders(<BecasList />);
    expect(screen.getByText(/No se pudo cargar/)).toBeInTheDocument();
  });
});

describe('BecaAsignacionDetail', () => {
  const asignacion = (extra = {}) => ({
    id: 4, studentId: 3, state: 'ACTIVA', observations: 'Buen promedio', requestDate: '2026-03-05T12:00:00',
    scholarship: { id: 2, codigo: 'B-1', nombre: 'Excelencia', porcentaje: 50, descripcion: 'Mejores promedios' },
    student: { nombreCompleto: 'Pérez Ana', codigoEstudiante: 'E-1', ci: '123', expedicion: 'LP' },
    management: { id: 9, codigo: 'G-26' }, payment: { id: 31, state: 'PARCIAL', scholarshipDiscount: 10 }, ...extra,
  });
  const montar = ({ data = asignacion(), result, auth, state, ruta = '/estudiantes/becas/asignacion/4', estado } = {}) => {
    mocks.obtener.mockResolvedValue(result ?? { success: true, data });
    mocks.estado.mockReturnValue({ estadoAporte: estado ?? null, loading: false });
    return renderWithProviders(
      <Routes>
        <Route path="/estudiantes/becas/asignacion/:id" element={<BecaAsignacionDetail />} />
        <Route path="*" element={<BecaAsignacionDetail />} />
      </Routes>,
      { route: state ? { pathname: ruta, state } : ruta, auth },
    );
  };
  const todos = { permisos: [permiso('matricula.beca.asignar', 'EDITAR', 'ELIMINAR'), permiso('matricula.admision.ver', 'DETALLE'), permiso('finanzas.pago.ver', 'DETALLE')] };

  it('carga la asignación por id y muestra perfil y datos de la beca', async () => {
    montar();
    expect(screen.getByText('Cargando asignación…')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Excelencia' })).toBeInTheDocument();
    expect(mocks.obtener).toHaveBeenCalledWith(4);
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('G-26')).toBeInTheDocument();
    expect(screen.getByText('05/03/2026')).toBeInTheDocument();
    expect(screen.getByText('Mejores promedios')).toBeInTheDocument();
    expect(screen.getByText('Buen promedio')).toBeInTheDocument();
  });

  it('identificador inválido, error del servidor, excepción y no encontrada', async () => {
    const a = montar({ ruta: '/estudiantes/becas/asignacion/abc' });
    expect(await screen.findByText('Identificador de asignación no válido')).toBeInTheDocument();
    a.unmount();
    const b = montar({ result: { success: false, error: { message: 'Sin permiso' } } });
    expect(await screen.findByText('Sin permiso')).toBeInTheDocument();
    b.unmount();
    mocks.obtener.mockRejectedValue(new Error('Caída'));
    mocks.estado.mockReturnValue({ estadoAporte: null, loading: false });
    const c = renderWithProviders(<Routes><Route path="/x/:id" element={<BecaAsignacionDetail />} /></Routes>, { route: '/x/4' });
    expect(await screen.findByText('Caída')).toBeInTheDocument();
    c.unmount();
    montar({ result: { success: true, data: null } });
    expect(await screen.findByText('Asignación no encontrada')).toBeInTheDocument();
  });

  it('RBAC del perfil: editar y eliminar solo con permisos', async () => {
    const { unmount } = montar({ auth: todos, state: { returnListPath: '/lista' } });
    await screen.findByRole('heading', { name: 'Excelencia' });
    await userEvent.click(screen.getByRole('button', { name: 'Editar asignación de beca' }));
    expect(navigate).toHaveBeenCalledWith('/estudiantes/becas/asignar', {
      state: expect.objectContaining({ studentId: 3, returnListPath: '/lista', editBecaAsignada: { id: 4, scholarshipId: 2, observations: 'Buen promedio' } }),
    });
    expect(screen.getByRole('button', { name: /Eliminar asignación/ })).toBeInTheDocument();
    unmount();
    montar();
    await screen.findByRole('heading', { name: 'Excelencia' });
    expect(screen.queryByRole('button', { name: 'Editar asignación de beca' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Eliminar asignación/ })).not.toBeInTheDocument();
  });

  it('volver regresa al listado de origen', async () => {
    montar({ state: { returnListPath: '/lista' } });
    await screen.findByRole('heading', { name: 'Excelencia' });
    await userEvent.click(screen.getByRole('button', { name: /Volver/ }));
    expect(navigate).toHaveBeenCalledWith('/lista');
  });

  it('eliminar confirma, borra y regresa; el error muestra el motivo', async () => {
    mocks.eliminar.mockResolvedValueOnce({ success: false, error: 'Vinculada a un pago' }).mockResolvedValueOnce({ success: true });
    montar({ auth: todos });
    await screen.findByRole('heading', { name: 'Excelencia' });
    await userEvent.click(screen.getByRole('button', { name: /Eliminar asignación/ }));
    let dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }));
    expect(await screen.findByText('Vinculada a un pago')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Eliminar asignación/ }));
    dialog = (await screen.findAllByRole('dialog')).pop();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(mocks.eliminar).toHaveBeenCalledWith(4));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/estudiantes/becas/listar'));
  });

  it('tab Estudiante: datos y enlace a la ficha con permiso', async () => {
    montar({ auth: todos });
    await screen.findByRole('heading', { name: 'Excelencia' });
    await userEvent.click(screen.getByRole('tab', { name: /Estudiante/ }));
    expect(await screen.findByText('Datos del beneficiario')).toBeInTheDocument();
    expect(screen.getByText(/123/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Ver ficha del estudiante/ }));
    expect(navigate).toHaveBeenCalledWith('/estudiantes/3');
  });

  it('tab Pago: cuotas registradas con enlace al pago', async () => {
    montar({
      auth: todos,
      estado: { cabecera: { id: 31, descuento_beca: 100, estado: 'PARCIAL' }, cuotas: [{ id: 1, numero_recibo: 'R-1', fecha_pago: '2026-03-05T12:00:00', monto: 250 }, { monto: 0 }] },
    });
    await screen.findByRole('heading', { name: 'Excelencia' });
    await userEvent.click(screen.getByRole('tab', { name: /Pago de aporte/ }));
    expect(await screen.findByText('R-1')).toBeInTheDocument();
    expect(screen.getByText(/Sí \(Bs\./)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Ver pago/ }));
    expect(navigate).toHaveBeenCalledWith('/pagos/31');
  });

  it('tab Pago: sin cuotas usa el pago ligado o informa el vacío', async () => {
    const a = montar();
    await screen.findByRole('heading', { name: 'Excelencia' });
    await userEvent.click(screen.getByRole('tab', { name: /Pago de aporte/ }));
    expect(await screen.findByText('Sí')).toBeInTheDocument();
    a.unmount();
    montar({ data: asignacion({ payment: null }) });
    await screen.findByRole('heading', { name: 'Excelencia' });
    await userEvent.click(screen.getByRole('tab', { name: /Pago de aporte/ }));
    expect(await screen.findByText('Esta asignación aún no tiene cuotas registradas en pago de aporte.')).toBeInTheDocument();
  });
});

describe('BecasAsignarSeleccion', () => {
  const fila = (id, extra = {}) => ({ id, codigoEstudiante: `E-${id}`, nombreCompleto: `Estudiante ${id}`, ci: '55', emailPersonal: 'a@x', celular: '7', carreraNombre: 'Sistemas', createdAt: '2026-03-02T10:30:00', ...extra });
  const auth = { permisos: [permiso('matricula.beca.asignar', 'CREAR')] };

  it('muestra la muestra preliminar y asigna beca al estudiante elegido', async () => {
    mocks.buscar.mockResolvedValue({ success: true, data: [fila(1), fila(2, { ci: null, emailPersonal: null, celular: null })] });
    renderWithProviders(<BecasAsignarSeleccion />, { auth, route: '/estudiantes/becas/asignar/seleccionar-estudiante' });
    expect(await screen.findByText('Estudiante 1')).toBeInTheDocument();
    expect(mocks.buscar).toHaveBeenCalledWith({ preliminar: true, limit: 10 });
    expect(screen.getAllByText('02/03/2026 10:30')).toHaveLength(2);
    await userEvent.click(screen.getAllByRole('button', { name: /Asignar beca/ })[0]);
    expect(navigate).toHaveBeenCalledWith('/estudiantes/becas/asignar', {
      state: { studentId: 1, studentName: 'Estudiante 1', returnListPath: '/estudiantes/becas/listar', returnSelectionPath: '/estudiantes/becas/asignar/seleccionar-estudiante' },
    });
  });

  it('sin permiso CREAR no hay botón de asignar', async () => {
    mocks.buscar.mockResolvedValue({ success: true, data: [fila(1)] });
    renderWithProviders(<BecasAsignarSeleccion />);
    await screen.findByText('Estudiante 1');
    expect(screen.queryByRole('button', { name: /Asignar beca/ })).not.toBeInTheDocument();
  });

  it('busca por similitud desde 2 caracteres', async () => {
    mocks.buscar.mockResolvedValue({ success: true, data: [fila(3)] });
    renderWithProviders(<BecasAsignarSeleccion />, { auth });
    await screen.findByText('Estudiante 3');
    await userEvent.type(screen.getByPlaceholderText(/Email, teléfono, código/), 'ana');
    await waitFor(() => expect(mocks.buscar).toHaveBeenCalledWith({ q: 'ana', limit: 50 }), { timeout: 3000 });
  });

  it('error del servidor y volver / ir a estudiantes conservan el origen', async () => {
    mocks.buscar.mockResolvedValue({ success: false, error: 'Sin permiso' });
    renderWithProviders(<BecasAsignarSeleccion />, { route: { pathname: '/x', state: { returnListPath: '/lista', menuSidebarKey: 'MAT' } } });
    expect((await screen.findAllByText('Sin permiso')).length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole('button', { name: /Volver al listado/ }));
    expect(navigate).toHaveBeenLastCalledWith('/lista', { state: { menuSidebarKey: 'MAT' } });
    await userEvent.click(screen.getByRole('button', { name: 'Lista de estudiantes' }));
    expect(navigate).toHaveBeenLastCalledWith('/estudiantes/listar', { state: { menuSidebarKey: 'MAT', returnListPath: '/lista' } });
  });

  it('excepción de red se informa', async () => {
    mocks.buscar.mockRejectedValue(new Error('Caída de red'));
    renderWithProviders(<BecasAsignarSeleccion />);
    expect((await screen.findAllByText('Caída de red')).length).toBeGreaterThan(0);
  });
});

describe('EstudiantesAsignarBeca', () => {
  const becas = [{ id: 1, nombre: 'Excelencia', porcentaje: 50 }, { id: 2, nombre: 'Social', porcentaje: 100 }];
  const auth = { permisos: [permiso('matricula.beca.asignar', 'CREAR', 'EDITAR')] };

  /** Monta la página con un form real y el contexto simulado; `ctx` se puede sobrescribir. */
  const Montar = ({ ctx = {}, estudiante = {} }) => {
    const [form] = Form.useForm();
    mocks.estudiante.mockReturnValue({ student: { student: { codigoEstudiante: 'E-1', nombreCompleto: 'Pérez Ana', ciCompleto: '123' } }, loading: false, ...estudiante });
    mocks.asignar.mockReturnValue({
      pageTitle: 'Asignar beca a Pérez Ana', breadcrumbItems: [{ title: 'Becas' }], handleVolver: vi.fn(), form, handleFinish: vi.fn(), loading: false, error: null, isEditMode: false,
      becasDescuentosData: { becasDescuentos: becas, selectedBecaDescuento: null, loading: false, error: null, handleSelectBeca: vi.fn() },
      ...ctx,
    });
    return <EstudiantesAsignarBeca />;
  };
  const route = { pathname: '/estudiantes/becas/asignar', state: { studentId: 3 } };

  it('sin estudiante explica y permite volver', async () => {
    const volver = vi.fn();
    renderWithProviders(<Montar ctx={{ handleVolver: volver }} />, { auth });
    expect(screen.getByText('Estudiante no especificado')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Ir a la lista de estudiantes/ }));
    expect(volver).toHaveBeenCalled();
  });

  it('RBAC: sin permiso muestra el aviso en lugar del asistente', () => {
    renderWithProviders(<Montar />, { auth: { permisos: [] }, route });
    expect(screen.getByText('No tiene permiso para asignar becas.')).toBeInTheDocument();
  });

  it('muestra las becas y no deja avanzar sin elegir una', async () => {
    renderWithProviders(<Montar />, { auth, route });
    expect(screen.getByText('Seleccione la beca o el descuento')).toBeInTheDocument();
    expect(screen.getByText('Excelencia')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    expect(await screen.findByText('Seleccione una beca o descuento antes de continuar.')).toBeInTheDocument();
    expect(screen.queryByText('Confirme la asignación')).not.toBeInTheDocument();
  });

  it('elegir una beca la notifica y avanza sola a la confirmación tras una pausa', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const handleSelectBeca = vi.fn();
    renderWithProviders(
      <Montar ctx={{ becasDescuentosData: { becasDescuentos: becas, selectedBecaDescuento: becas[0], loading: false, error: null, handleSelectBeca } }} />,
      { auth, route },
    );
    await userEvent.click(screen.getByText('Social'));
    expect(handleSelectBeca).toHaveBeenCalledWith(becas[1]);
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    vi.useRealTimers();
    expect(await screen.findByText('Confirme la asignación')).toBeInTheDocument();
    expect(screen.getByText('Resumen de la asignación')).toBeInTheDocument();
  });

  it('confirmar exige el motivo y envía los valores del formulario', async () => {
    const handleFinish = vi.fn();
    renderWithProviders(
      <Montar ctx={{ handleFinish, becasDescuentosData: { becasDescuentos: becas, selectedBecaDescuento: becas[0], loading: false, error: null, handleSelectBeca: vi.fn() } }} />,
      { auth, route },
    );
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    await screen.findByText('Confirme la asignación');
    await userEvent.click(screen.getByRole('button', { name: /Asignar beca/ }));
    expect(await screen.findByText('Por favor ingrese el motivo de la solicitud')).toBeInTheDocument();
    expect(handleFinish).not.toHaveBeenCalled();
    await userEvent.type(screen.getByPlaceholderText(/motivo de la solicitud/), 'Escasos recursos');
    await userEvent.click(screen.getByRole('button', { name: /Asignar beca/ }));
    await waitFor(() => expect(handleFinish).toHaveBeenCalledWith(expect.objectContaining({ observaciones: 'Escasos recursos' })));
  });

  it('en edición abre en la confirmación con el texto de guardar y muestra el error de envío', async () => {
    renderWithProviders(
      <Montar ctx={{ isEditMode: true, error: 'Ya tiene beca activa', becasDescuentosData: { becasDescuentos: becas, selectedBecaDescuento: becas[0], loading: false, error: null, handleSelectBeca: vi.fn() } }} />,
      { auth, route },
    );
    expect(await screen.findByText('Confirme la asignación')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar cambios/ })).toBeInTheDocument();
    expect(screen.getByText('Ya tiene beca activa')).toBeInTheDocument();
    expect(screen.queryByText(/Solicitud:/)).not.toBeInTheDocument();
  });

  it('error al cargar las becas y carga del estudiante', () => {
    renderWithProviders(
      <Montar estudiante={{ loading: true }} ctx={{ becasDescuentosData: { becasDescuentos: [], selectedBecaDescuento: null, loading: false, error: 'Falla del catálogo', handleSelectBeca: vi.fn() } }} />,
      { auth, route },
    );
    expect(screen.getByText('Falla del catálogo')).toBeInTheDocument();
    expect(screen.getByText('Cargando datos del estudiante…')).toBeInTheDocument();
  });
});

describe('conectores de becas', () => {
  it('lista y selección montan su página', async () => {
    mocks.lista.mockReturnValue({ becas: [], loading: false, error: null, searchText: '', setSearchText: vi.fn(), tablePagination: false });
    const a = renderWithProviders(<BecasListConnector />);
    expect(screen.getByTestId('prov-lista')).toBeInTheDocument();
    a.unmount();
    mocks.buscar.mockResolvedValue({ success: true, data: [] });
    renderWithProviders(<BecasAsignarSeleccionConnector />);
    expect(await screen.findByText('Asignar beca — elegir estudiante')).toBeInTheDocument();
  });

  it('asignar pasa estudiante, nombre y edición del estado de navegación al provider', () => {
    mocks.estudiante.mockReturnValue({ student: null, loading: false });
    mocks.asignar.mockReturnValue({
      pageTitle: 'Asignar', breadcrumbItems: [], handleVolver: vi.fn(), form: undefined, handleFinish: vi.fn(), loading: false, error: null, isEditMode: false,
      becasDescuentosData: { becasDescuentos: [], handleSelectBeca: vi.fn() },
    });
    renderWithProviders(<AsignarBecaConnector />, { route: { pathname: '/x', state: { studentId: 7, studentName: 'Luna', editBecaAsignada: { id: 9 } } } });
    const prov = screen.getByTestId('prov-asignar');
    expect(prov).toHaveAttribute('data-student', '7');
    expect(prov).toHaveAttribute('data-name', 'Luna');
    expect(prov).toHaveAttribute('data-edit', '9');
  });

  it('el conector de detalle monta la página de detalle', async () => {
    mocks.obtener.mockResolvedValue({ success: true, data: null });
    mocks.estado.mockReturnValue({ estadoAporte: null, loading: false });
    renderWithProviders(<BecaAsignacionDetailConnector />);
    expect(await screen.findByText(/Identificador de asignación no válido|Asignación no encontrada/)).toBeInTheDocument();
  });
});
