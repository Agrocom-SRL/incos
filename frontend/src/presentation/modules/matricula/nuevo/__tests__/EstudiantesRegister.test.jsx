import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '@/test/renderWithProviders';
import EstudiantesRegister from '../pages/EstudiantesRegister';
import RegisterConnector from '../connectors/RegisterConnector';
import EditConnector from '../connectors/EditConnector';
import { StudentDetailContext } from '@application-matricula/admision/context/StudentDetailContext';

const mocks = vi.hoisted(() => ({ registro: vi.fn(), estudiantes: vi.fn(), geografico: vi.fn() }));
const navigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('@application-matricula/admision/hooks', async (orig) => ({ ...(await orig()), useStudentContext: mocks.estudiantes }));
vi.mock('@application-matricula/nuevo/hooks/context/useStudentRegisterContext', () => ({ useStudentRegisterContext: mocks.registro }));
vi.mock('@application-matricula/nuevo/hooks/features/useEstudianteGeographicFormLogic', () => ({ useEstudianteGeographicFormLogic: mocks.geografico }));
vi.mock('@application-matricula/nuevo/providers/StudentRegisterProvider', () => ({
  StudentRegisterProvider: ({ children, mode, studentId }) => <div data-testid="prov-registro" data-mode={mode ?? 'create'} data-student={studentId ?? ''}>{children}</div>,
}));
vi.mock('@application-matricula/admision/providers', () => ({
  StudentProvider: ({ children }) => <div>{children}</div>,
  StudentDetailProvider: ({ children }) => <div>{children}</div>,
}));
const contexto = (extra = {}) => ({
  loading: false, error: null, registrationResult: null,
  resolveOptions: vi.fn(() => []), minAge: 15, handleFinish: vi.fn(), handleSave: vi.fn(), registerForm: vi.fn(), saveStep0Values: vi.fn(), getStep0Values: vi.fn(() => ({})),
  paises: [], departamentos: [], provinciasResidencia: [], municipiosResidencia: [], provincias: [], municipios: [], segundaProvincias: [], segundaMunicipios: [],
  gestiones: [{ id: 1, nombre: 'G1', vigente: true }], carreras: [{ id: 1, nombre: 'Sistemas', codigo: 'SIS' }], carrerasLoading: false, gestionesLoading: false, carrerasError: null, gestionesError: null,
  cargarGestiones: vi.fn(), contactosIndices: [0], agregarContacto: vi.fn(), eliminarContacto: vi.fn(),
  documentacionProcesada: [], documentacionTraspasoProcesada: [], documentacionRaw: [], documentacionTraspasoRaw: [],
  loadDiscapacidades: vi.fn(), loadDepartamentos: vi.fn(), loadProvincias: vi.fn(() => Promise.resolve()), loadMunicipios: vi.fn(() => Promise.resolve()), ...extra,
});

beforeEach(() => {
  navigate.mockClear();
  Object.values(mocks).forEach((m) => m.mockReset());
  mocks.estudiantes.mockReturnValue({ addStudent: vi.fn() });
});

/** Texto de las pestañas sin el número de paso que antepone el wizard. */
const tabs = () => screen.getAllByRole('tab').map((t) => t.textContent.replace(/^\d+/, ''));

describe('EstudiantesRegister (modo crear)', () => {
  it('abre en el paso de tipo de admisión con el título de alta y registra el formulario en el contexto', () => {
    const ctx = contexto();
    mocks.registro.mockReturnValue(ctx);
    renderWithProviders(<EstudiantesRegister />);
    expect(screen.getByRole('heading', { name: 'Registrar nueva admisión' })).toBeInTheDocument();
    expect(screen.getByText('Seleccione el tipo de admisión')).toBeInTheDocument();
    expect(ctx.registerForm).toHaveBeenCalledWith(expect.objectContaining({ getFieldValue: expect.any(Function) }));
    expect(tabs()).toEqual(['Tipo de admisión', 'Datos generales', 'Contacto de emergencia', 'Documentación']);
  });

  it('modo completar cambia el título', () => {
    mocks.registro.mockReturnValue(contexto());
    renderWithProviders(<EstudiantesRegister />, { route: '/estudiantes/registrar?completar=true' });
    expect(screen.getByRole('heading', { name: 'Completar registro de admisión' })).toBeInTheDocument();
  });

  it('elegir ANTIGUO carga gestiones, preserva el paso y pide gestión; TRASPASO suma su paso', async () => {
    const ctx = contexto();
    mocks.registro.mockReturnValue(ctx);
    renderWithProviders(<EstudiantesRegister />);
    await userEvent.click(screen.getByText('Antiguo'));
    expect(ctx.cargarGestiones).toHaveBeenCalledWith('ANTIGUO');
    expect(ctx.saveStep0Values).toHaveBeenCalledWith(expect.objectContaining({ tipoAdmision: 'ANTIGUO' }));
    expect(await screen.findByText('Gestión de ingreso')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Traspaso'));
    expect(ctx.cargarGestiones).toHaveBeenCalledWith('TRASPASO');
    await waitFor(() => expect(tabs()).toContain('Datos de traspaso'));
    await userEvent.click(screen.getByText('Transitabilidad'));
    await waitFor(() => expect(tabs()).toContain('Datos de transitabilidad'));
    expect(tabs()).not.toContain('Datos de traspaso');
  });

  it('TRASPASO preselecciona la gestión vigente una sola vez', async () => {
    mocks.registro.mockReturnValue(contexto());
    renderWithProviders(<EstudiantesRegister />);
    await userEvent.click(screen.getByText('Traspaso'));
    await waitFor(() => expect(screen.getByRole('radio', { name: /G1/ })).toBeChecked());
  });

  it('Siguiente con NUEVO avanza a datos generales y guarda el paso inicial', async () => {
    const ctx = contexto();
    mocks.registro.mockReturnValue(ctx);
    renderWithProviders(<EstudiantesRegister />);
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    expect(await screen.findByText('Información personal del estudiante')).toBeInTheDocument();
    expect(ctx.saveStep0Values).toHaveBeenCalledWith({ tipoAdmision: 'NUEVO', gestionIngresoId: undefined, carreraId: undefined });
  });

  it('con ANTIGUO exige la carrera antes de avanzar (la gestión vigente se preselecciona)', async () => {
    mocks.registro.mockReturnValue(contexto());
    renderWithProviders(<EstudiantesRegister />);
    await userEvent.click(screen.getByText('Antiguo'));
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    expect(await screen.findByText('Por favor seleccione una carrera')).toBeInTheDocument();
    expect(screen.getByText('Seleccione el tipo de admisión')).toBeInTheDocument();
  });

  it('volver restaura los valores del paso inicial', async () => {
    const ctx = contexto({ getStep0Values: vi.fn(() => ({ tipoAdmision: 'NUEVO' })) });
    mocks.registro.mockReturnValue(ctx);
    renderWithProviders(<EstudiantesRegister />, { route: { pathname: '/estudiantes/registrar', state: { initialStep: 2 } } });
    expect(await screen.findByText('Información personal del estudiante')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Anterior/ }));
    await waitFor(() => expect(ctx.getStep0Values).toHaveBeenCalled());
    expect(await screen.findByText('Seleccione el tipo de admisión')).toBeInTheDocument();
  });

  it('muestra el error del registro y el botón Volver regresa a la lista', async () => {
    mocks.registro.mockReturnValue(contexto({ error: 'CI duplicado' }));
    renderWithProviders(<EstudiantesRegister />);
    expect(screen.getByText('CI duplicado')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Volver/ }));
    expect(navigate).toHaveBeenCalledWith('/estudiantes/listar');
  });

  it('registro exitoso agrega al estudiante y abre su ficha', async () => {
    const addStudent = vi.fn();
    mocks.estudiantes.mockReturnValue({ addStudent });
    const data = { id: 91, nombres: 'Ana' };
    mocks.registro.mockReturnValue(contexto({ registrationResult: { success: true, data } }));
    renderWithProviders(<EstudiantesRegister />);
    await waitFor(() => expect(addStudent).toHaveBeenCalledWith(data));
    expect(navigate).toHaveBeenCalledWith('/estudiantes/91');
  });

  it('registro exitoso con el id anidado o sin id', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.registro.mockReturnValue(contexto({ registrationResult: { success: true, data: { student: { id: 5 } } } }));
    const a = renderWithProviders(<EstudiantesRegister />);
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/estudiantes/5'));
    a.unmount();
    navigate.mockClear();
    mocks.registro.mockReturnValue(contexto({ registrationResult: { success: true, data: { nombres: 'sin id' } } }));
    renderWithProviders(<EstudiantesRegister />);
    await waitFor(() => expect(error).toHaveBeenCalled());
    expect(navigate).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('un resultado fallido o repetido no vuelve a navegar', async () => {
    const addStudent = vi.fn();
    mocks.estudiantes.mockReturnValue({ addStudent });
    mocks.registro.mockReturnValue(contexto({ registrationResult: { success: false, error: 'x' } }));
    renderWithProviders(<EstudiantesRegister />);
    await Promise.resolve();
    expect(addStudent).not.toHaveBeenCalled();
  });
});

describe('EstudiantesRegister (modo editar)', () => {
  const detalle = {
    student: { id: 7, ci: '123', nombres: 'Ana', apellidoPaterno: 'Pérez', tieneDiscapacidad: true, residenceDepartmentId: 7, residenceProvinceId: 70, residenceMunicipalityId: 700 },
    guardians: [], disabilities: [{ disabilityTypeId: 2 }], origins: [{ isPrincipal: true, originType: 'BOLIVIANA', departmentId: 3, provinceId: 30, municipalityId: 300 }],
    documentDeliveries: [], academicData: { tipoAdmision: 'ANTIGUO', gestionIngresoId: 1, carreraId: 1 }, transitability: null, transfer: null,
  };
  const montar = (ctx, student = detalle, loading = false) =>
    renderWithProviders(
      <StudentDetailContext.Provider value={{ student, loading }}>
        <EstudiantesRegister mode="edit" studentId={7} />
      </StudentDetailContext.Provider>,
    );

  it('título de edición, carga la jerarquía geográfica y preserva el paso inicial', async () => {
    const ctx = contexto();
    mocks.registro.mockReturnValue(ctx);
    montar(ctx);
    expect(screen.getByRole('heading', { name: 'Editar estudiante' })).toBeInTheDocument();
    await waitFor(() => expect(ctx.saveStep0Values).toHaveBeenCalledWith({ tipoAdmision: 'ANTIGUO', gestionIngresoId: 1, carreraId: 1 }));
    expect(ctx.loadProvincias).toHaveBeenCalledWith(7, 'residencia');
    expect(ctx.cargarGestiones).toHaveBeenCalledWith('ANTIGUO');
    expect(ctx.loadDiscapacidades).toHaveBeenCalled();
  });

  it('en edición el registro exitoso vuelve a la ficha del mismo estudiante', async () => {
    mocks.registro.mockReturnValue(contexto({ registrationResult: { success: true, data: { id: 7 } } }));
    montar();
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/estudiantes/7'));
  });

  it('mientras carga el detalle muestra el aviso', () => {
    mocks.registro.mockReturnValue(contexto());
    montar(undefined, null, true);
    expect(screen.getByText('Cargando estudiante…')).toBeInTheDocument();
  });

  it('un fallo al cargar provincias no rompe la pantalla', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const ctx = contexto({ loadProvincias: vi.fn(() => Promise.reject(new Error('red'))) });
    mocks.registro.mockReturnValue(ctx);
    montar(ctx);
    await waitFor(() => expect(warn).toHaveBeenCalled());
    expect(screen.getByRole('heading', { name: 'Editar estudiante' })).toBeInTheDocument();
    warn.mockRestore();
  });
});

describe('conectores de registro', () => {
  it('registrar monta el provider de alta con la página', () => {
    mocks.registro.mockReturnValue(contexto());
    renderWithProviders(<RegisterConnector />);
    expect(screen.getByTestId('prov-registro')).toHaveAttribute('data-mode', 'create');
    expect(screen.getByRole('heading', { name: 'Registrar nueva admisión' })).toBeInTheDocument();
  });

  it('editar pasa el id de la ruta al provider', () => {
    mocks.registro.mockReturnValue(contexto());
    renderWithProviders(
      <Routes><Route path="/estudiantes/:id/editar" element={<EditConnector />} /></Routes>,
      { route: '/estudiantes/12/editar' },
    );
    const prov = screen.getByTestId('prov-registro');
    expect(prov).toHaveAttribute('data-mode', 'edit');
    expect(prov).toHaveAttribute('data-student', '12');
    expect(screen.getByRole('heading', { name: 'Editar estudiante' })).toBeInTheDocument();
  });
});
