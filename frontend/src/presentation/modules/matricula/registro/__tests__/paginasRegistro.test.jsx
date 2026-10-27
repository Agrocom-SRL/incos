import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import InscripcionesDetail from '../pages/InscripcionesDetail';
import InscripcionesList from '../pages/InscripcionesList';
import MisEstudiantesDocentePage from '../pages/MisEstudiantesDocentePage';
import InscripcionesNueva from '../pages/InscripcionesNueva';
import DetailConnector from '../connectors/DetailConnector';
import ListConnector from '../connectors/ListConnector';
import MatriculaRedirect from '../connectors/MatriculaRedirect';
import InscripcionesNuevaConnector from '../connectors/InscripcionesNuevaConnector';
import InscripcionesEditarConnector from '../connectors/InscripcionesEditarConnector';
import { createInscripcionNuevaWizardSteps } from '../config/inscripcionNuevaWizardSteps';
import { getStep1Fields } from '../config/steps/step1BuscarEstudiante';
import { getStep2Fields } from '../config/steps/step2SeleccionarCarrera';
import { getStep3Fields } from '../config/steps/step3PeriodoYMaterias';
import { getStep4Fields } from '../config/steps/step4Paralelo';
import { getStepHistorialPrevioFields } from '../config/steps/step5HistorialPrevio';
import { createBreadcrumbItems, createDetailBreadcrumbItems } from '../config/breadcrumbs';

const mocks = vi.hoisted(() => ({
  detalle: vi.fn(),
  lista: vi.fn(),
  docente: vi.fn(),
  wizard: vi.fn(),
  misDatos: vi.fn(),
  nuevaProvider: vi.fn(),
}));
const navigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('@application-matricula/registro/hooks', async (orig) => ({
  ...(await orig()),
  useInscripcionDetailContext: mocks.detalle,
  useMatriculaListPage: mocks.lista,
  useMisEstudiantesDocente: mocks.docente,
  useMatriculaWizardPage: mocks.wizard,
}));
vi.mock('@/application/modules/perfil/hooks/state/useMisDatosEstudiante.js', () => ({ useMisDatosEstudiante: mocks.misDatos }));
vi.mock('@application-matricula/registro/providers', () => ({
  InscripcionesListProvider: ({ children }) => <div data-testid="prov-lista">{children}</div>,
  InscripcionesProvider: ({ children }) => <div>{children}</div>,
  InscripcionDetailProvider: ({ children, inscripcionId }) => <div data-testid={`prov-detalle-${inscripcionId}`}>{children}</div>,
  InscripcionesNuevaProvider: (props) => {
    mocks.nuevaProvider(props);
    return <div data-testid="prov-nueva" data-mode={props.mode} data-student={props.studentId ?? ''}>{props.children}</div>;
  },
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

const rol = (codigo) => ({ id: 1, username: 'u', rol: { codigo, nombre: codigo } });

describe('configuración del wizard de inscripción', () => {
  it('los pasos siguen el orden de la meta y cada sección declarada tiene configuración', () => {
    const steps = createInscripcionNuevaWizardSteps({ order: ['buscar', 'carrera', 'periodo', 'historial', 'paralelo'] });
    expect(steps.map((s) => s.title)).toEqual(['Buscar estudiante', 'Carrera y plan', 'Periodo y materias', 'Historial de notas', 'Paralelo']);
    steps.forEach((s) => s.sections.forEach((sec) => expect(s.config[sec], `${s.title}/${sec}`).toBeDefined()));
    expect(steps[4].sections).toEqual(['resumen', 'paralelos']);
  });

  it('sin meta usa el orden básico', () => {
    expect(createInscripcionNuevaWizardSteps().map((s) => s.title)).toEqual(['Buscar estudiante', 'Carrera y plan', 'Periodo y materias', 'Paralelo']);
  });

  it('las secciones sueltas de los pasos exponen título y descripción', () => {
    [getStep2Fields().carrera, getStep3Fields().periodoYMaterias, getStep4Fields().resumen, getStep4Fields().paralelos, Object.values(getStepHistorialPrevioFields())[0]].forEach((s) => {
      expect(s.title).toBeTruthy();
      expect(s.description).toBeTruthy();
    });
    expect(getStep4Fields().paralelos.fields[0]).toMatchObject({ name: 'listaParalelos', type: 'cards' });
  });

  it('breadcrumbs de matrícula', () => {
    expect(JSON.stringify(createDetailBreadcrumbItems())).toContain('Detalle de la inscripción');
    expect(createBreadcrumbItems('MAT-LISTA', 'Mis estudiantes').length).toBeGreaterThan(0);
  });

  it('la lista de resultados del buscador pinta elegible, ya matriculado y nuevo', () => {
    const lista = getStep1Fields().buscarEstudiante.fields.find((f) => f.name === 'resultadosEstudiantes');
    const buscador = getStep1Fields().buscarEstudiante.fields[0];
    expect(buscador).toMatchObject({ type: 'search', required: false });
    const elegible = lista.renderItem({ nombreCompleto: 'Pérez Ana', ciCompleto: '123', codigoEstudiante: 'E-1', carreraNombre: 'Sistemas' });
    expect(elegible.blocked).toBe(false);
    const bloqueado = lista.renderItem({ nombreCompleto: 'Luna', yaMatriculadoGestionActual: true, gestionActualAnio: 2026 });
    expect(bloqueado.blocked).toBe(true);
    const { container } = renderWithProviders(<div>{elegible.title}{elegible.caption}{elegible.extra}{bloqueado.title}{bloqueado.caption}{bloqueado.extra}{lista.renderItem({ destacarNuevo: true }).title}{lista.renderItem({}).caption}</div>);
    const texto = container.textContent;
    expect(texto).toContain('Pérez Ana');
    expect(texto).toContain('C.I. 123');
    expect(texto).toContain('Código E-1');
    expect(texto).toContain('Sistemas');
    expect(texto).toContain('Seleccionar');
    expect(texto).toContain('Ya matriculado · 2026');
    expect(texto).toContain('Ya tiene matrícula en gestión 2026');
    expect(texto).toContain('No disponible');
    expect(texto).toContain('Nuevo en el sistema');
    expect(texto).toContain('Sin nombre');
  });
});

describe('InscripcionesDetail', () => {
  const base = (extra = {}) => ({
    inscripcion: { enrollment: { id: 5 } }, loading: false, error: null, generatingBoleta: false, boletaInscripcion: null, studentId: 3,
    handleDownloadOrGenerateBoleta: vi.fn(), handleVolverAtras: vi.fn(), handleEditar: vi.fn(), breadcrumbItems: [{ title: 'Matrícula' }], tipoInscripcion: 'ANTIGUO',
    canEdit: true, enrollment: { tipoInscripcion: 'ANTIGUO' }, studentAcademicData: {}, management: { nombre: 'G26', anio: 2026 }, student: { codigoEstudiante: 'E-1' }, career: { nombre: 'Sistemas' },
    subjectEnrollments: [{ id: 1, materiaSigla: 'MAT', materiaNombre: 'Mat' }], priorEnrollmentHistories: [], requiereHistorialPrevio: false, cantidadHistorialPrevio: 0,
    historialEstadoInfo: { color: 'default', text: 'No aplica' }, nombreCompleto: 'Pérez Ana', avatarText: 'PA', courseSchedules: [], gridRangeInscripcion: null, sabadoRangeInscripcion: null,
    estadoCursado: null, puedeActivar: true, activating: false, handleActivarCursado: vi.fn(), ...extra,
  });

  it('carga, error y sin inscripción', () => {
    mocks.detalle.mockReturnValue(base({ loading: true }));
    const a = renderWithProviders(<InscripcionesDetail />);
    expect(screen.getByText('Cargando datos de la inscripción…')).toBeInTheDocument();
    a.unmount();
    mocks.detalle.mockReturnValue(base({ error: 'Falla del servidor' }));
    const b = renderWithProviders(<InscripcionesDetail />);
    expect(screen.getByText('Error al cargar la inscripción')).toBeInTheDocument();
    b.unmount();
    mocks.detalle.mockReturnValue(base({ inscripcion: null }));
    renderWithProviders(<InscripcionesDetail />);
    expect(screen.getByText('No se encontró información de la inscripción')).toBeInTheDocument();
  });

  it('muestra la ficha con sus pestañas y vuelve', async () => {
    const s = base();
    mocks.detalle.mockReturnValue(s);
    renderWithProviders(<InscripcionesDetail />);
    expect(screen.getByRole('heading', { name: 'Pérez Ana' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(4);
    await userEvent.click(screen.getByRole('button', { name: /Volver/ }));
    expect(s.handleVolverAtras).toHaveBeenCalled();
  });

  it('RBAC: editar, activar cursado y boleta según permisos', async () => {
    const s = base();
    mocks.detalle.mockReturnValue(s);
    const { unmount } = renderWithProviders(<InscripcionesDetail />, {
      auth: { permisos: [permiso('matricula.inscripcion.editar', 'EDITAR'), permiso('matricula.documento.ver', 'GENERAR_PDF')] },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Editar inscripción' }));
    expect(s.handleEditar).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Activar cursado/ }));
    expect(s.handleActivarCursado).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Generar boleta/ }));
    expect(s.handleDownloadOrGenerateBoleta).toHaveBeenCalled();
    unmount();
    renderWithProviders(<InscripcionesDetail />);
    expect(screen.queryByRole('button', { name: 'Editar inscripción' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Activar cursado/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Generar boleta/ })).not.toBeInTheDocument();
  });

  it('vista propia del estudiante: "Mi matrícula" sin volver', () => {
    mocks.detalle.mockReturnValue(base());
    renderWithProviders(<InscripcionesDetail />, { auth: { usuario: rol('ESTUDIANTE') } });
    expect(screen.getByRole('heading', { name: 'Mi matrícula' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Volver/ })).not.toBeInTheDocument();
  });
});

describe('InscripcionesList', () => {
  const insc = { id: 3, estudiante: { nombreCompleto: 'Pérez Ana', codigoEstudiante: 'E-1' }, carrera: { nombre: 'Sistemas', colorHex: '#123456' }, paralelo: { id: 1, nombre: 'A', turno: 'NOCHE' } };
  const lista = (extra = {}) => ({
    isSmall: false, puedeExportarLista: false, selectedCarreraId: null, setSelectedCarreraId: vi.fn(), carrerasLoading: false, exportLoading: false, selectedCarrera: null, carreraColor: '#1677ff',
    carreraSelectOptions: [{ value: 1, nombre: 'Sistemas', codigo: 'SIS', color: '#123456' }], inscripciones: [insc], loading: false, error: null, searchText: '', setSearchText: vi.fn(),
    handleNuevaInscripcion: vi.fn(), handleExportLista: vi.fn(), tableColumns: [{ title: 'Estudiante', key: 'e', render: (_, r) => r.estudiante?.nombreCompleto }], breadcrumbItems: [{ title: 'Matrícula' }], tablePagination: false, ...extra,
  });

  it('lista por carrera con filtro de paralelo y alta protegida por CREAR', async () => {
    const s = lista();
    mocks.lista.mockReturnValue(s);
    const { unmount } = renderWithProviders(<InscripcionesList />, { auth: { permisos: [permiso('matricula.inscribir', 'CREAR')] } });
    expect(screen.getAllByText('Lista de inscripciones').length).toBeGreaterThan(0);
    expect(screen.getByText('A · NOCHE')).toBeInTheDocument();
    expect(await screen.findByText('Pérez Ana')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Nueva inscripción/ }));
    expect(s.handleNuevaInscripcion).toHaveBeenCalled();
    unmount();
    mocks.lista.mockReturnValue(lista());
    renderWithProviders(<InscripcionesList />);
    expect(screen.queryByRole('button', { name: /Nueva inscripción/ })).not.toBeInTheDocument();
  });

  it('buscar delega en el contexto', async () => {
    const s = lista();
    mocks.lista.mockReturnValue(s);
    renderWithProviders(<InscripcionesList />);
    await userEvent.type(screen.getByPlaceholderText(/Buscar por estudiante, código/), 'a');
    expect(s.setSearchText).toHaveBeenCalledWith('a');
  });

  it('exportar: solo con permiso; exige carrera y descarga con el código', async () => {
    const s = lista({ puedeExportarLista: true });
    mocks.lista.mockReturnValue(s);
    const { unmount } = renderWithProviders(<InscripcionesList />);
    expect(screen.getByRole('button', { name: /Seleccione carrera/ })).toBeDisabled();
    await userEvent.click(within(document.querySelector('.inscripciones-carrera-select')).getByRole('combobox'));
    await userEvent.click(await screen.findByText('Sistemas', { selector: '.ant-select-item-option-content *' }));
    expect(s.setSelectedCarreraId).toHaveBeenCalledWith(1);
    unmount();
    const conCarrera = lista({ puedeExportarLista: true, selectedCarreraId: 1, selectedCarrera: { codigo: 'SIS' } });
    mocks.lista.mockReturnValue(conCarrera);
    renderWithProviders(<InscripcionesList />);
    await userEvent.click(screen.getByRole('button', { name: /Descargar Excel \(SIS\)/ }));
    expect(conCarrera.handleExportLista).toHaveBeenCalled();
  });

  it('error y vacío', () => {
    mocks.lista.mockReturnValue(lista({ inscripciones: [], error: 'No se pudo cargar' }));
    renderWithProviders(<InscripcionesList />);
    expect(screen.getByText(/No se pudo cargar/)).toBeInTheDocument();
  });
});

describe('MisEstudiantesDocentePage', () => {
  const alumno = { rowKey: 'a-1', id: 4, codigoEstudiante: 'E-4', nombreCompleto: 'Rojas Beto', ci: '99', estadoMatricula: 'INSCRITO', carreraNombre: 'Sistemas', carreraCodigo: 'SIS', carreraColorHex: '#123456', ofertaCursoId: 12, materiaSigla: 'MAT-101', paraleloNombre: 'A' };
  const docente = (extra = {}) => ({ estudiantes: [alumno], totalEstudiantes: 1, gestion: { nombre: 'Gestión 2026' }, loading: false, error: null, searchText: '', setSearchText: vi.fn(), refetch: vi.fn(), ...extra });

  it('lista el roster con el chip del curso y abre la ficha del estudiante', async () => {
    mocks.docente.mockReturnValue(docente());
    renderWithProviders(<MisEstudiantesDocentePage />, { auth: { permisos: [permiso('matricula.admision.ver', 'DETALLE')] } });
    expect(screen.getAllByText('Mis estudiantes').length).toBeGreaterThan(0);
    expect(screen.getByText(/de la Gestión 2026/)).toBeInTheDocument();
    expect(screen.getByText('MAT-101 · A')).toBeInTheDocument();
    expect(await screen.findByText('ROJAS BETO')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'eye' }));
    expect(navigate).toHaveBeenCalledWith('/estudiantes/4', undefined);
  });

  it('sin gestión informa la vigente; el buscador delega', async () => {
    const s = docente({ gestion: {} });
    mocks.docente.mockReturnValue(s);
    renderWithProviders(<MisEstudiantesDocentePage />);
    expect(screen.getByText(/de la gestión vigente/)).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText(/Buscar por estudiante, código, C\.I\./), 'r');
    expect(s.setSearchText).toHaveBeenCalledWith('r');
  });

  it('roster vacío y error con reintento', async () => {
    mocks.docente.mockReturnValue(docente({ estudiantes: [], totalEstudiantes: 0 }));
    const a = renderWithProviders(<MisEstudiantesDocentePage />);
    expect(screen.getByText('Aún no tiene estudiantes en la gestión vigente.')).toBeInTheDocument();
    a.unmount();
    const s = docente({ error: 'Falla del servidor' });
    mocks.docente.mockReturnValue(s);
    renderWithProviders(<MisEstudiantesDocentePage />);
    expect(screen.getByText('No se pudo cargar su lista de estudiantes')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(s.refetch).toHaveBeenCalled();
  });
});

describe('InscripcionesNueva (wizard)', () => {
  const Montar = ({ ctx = {}, ruta = ['buscar', 'carrera', 'periodo', 'paralelo'] }) => {
    const [form] = Form.useForm();
    mocks.wizard.mockReturnValue({
      editData: null, pageTitle: 'Nueva inscripción', breadcrumbItems: [{ title: 'Matrícula' }], wizardSteps: createInscripcionNuevaWizardSteps({ order: ruta }), form, loading: false, error: null,
      handleFinish: vi.fn(), handleSave: vi.fn(), paymentRequiredStudentId: null, clearPaymentRequiredDialog: vi.fn(), handleGoToRegistrarPago: vi.fn(), handleVolver: vi.fn(),
      studentSearch: { selectedStudent: null }, carrerasData: { carreras: [], selectedCarrera: null }, periodosData: { periodos: [], selectedPeriodIds: [] }, paralelosData: { paralelos: [] },
      selectedMateriaIdsByPeriod: {}, onToggleMaterias: vi.fn(), onSelectParalelo: vi.fn(), historialPrevioData: { hasRows: false }, onSelectCarrera: vi.fn(), tipoAdmision: 'NUEVO',
      anioCursadoTraspaso: null, isNuevoEstudiante: true, isTraspasoOrTransitabilidad: false, initialStep: 0, initialValues: {}, handleValidateBeforeNext: vi.fn(() => Promise.resolve()),
      wizardStepMeta: null, materiasStepInvalid: false, setMateriasStepInvalid: vi.fn(), matriculaContexto: null, ...ctx,
    });
    return <InscripcionesNueva />;
  };

  it('muestra el título y los pasos del asistente', () => {
    renderWithProviders(<Montar />);
    expect(screen.getByRole('heading', { name: 'Nueva inscripción' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab').map((t) => t.textContent.replace(/^\d+/, ''))).toEqual(['Buscar estudiante', 'Carrera y plan', 'Periodo y materias', 'Paralelo']);
  });

  it('Volver delega en el hook', async () => {
    const handleVolver = vi.fn();
    renderWithProviders(<Montar ctx={{ handleVolver }} />);
    await userEvent.click(screen.getByRole('button', { name: /Volver/ }));
    expect(handleVolver).toHaveBeenCalled();
  });

  it('avanzar valida el paso con el hook y muestra la carrera y plan', async () => {
    const handleValidateBeforeNext = vi.fn(() => Promise.resolve());
    renderWithProviders(<Montar ctx={{ handleValidateBeforeNext, carrerasData: { carreras: [{ id: 1, nombre: 'Sistemas', codigo: 'SIS' }], selectedCarrera: null } }} />);
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    await waitFor(() => expect(handleValidateBeforeNext).toHaveBeenCalled());
    expect((await screen.findAllByText('Carrera y plan de estudio')).length).toBeGreaterThan(0);
    expect(screen.getByText('Sistemas')).toBeInTheDocument();
  });

  it('si el paso no valida (rechazo del hook) no avanza', async () => {
    renderWithProviders(<Montar ctx={{ handleValidateBeforeNext: vi.fn(() => Promise.reject(new Error('Seleccione un estudiante'))) }} />);
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: /Siguiente/ })).toBeEnabled());
    expect(screen.queryAllByText('Carrera y plan de estudio')).toHaveLength(0);
  });

  it('abre en el paso inicial indicado y muestra el error del envío', async () => {
    renderWithProviders(<Montar ctx={{ initialStep: 2, error: 'Sin docente asignado', matriculaContexto: { contexto: { periodos: [{ id: 1, numero: 1, nombre: 'Primer año', asignaturas: [{ materiaId: 1, sigla: 'MAT', nombre: 'Mat' }] }] }, esNuevoSistema: true }, tipoAdmision: 'ANTIGUO' }} />);
    expect(await screen.findByText('Periodos y materias a cursar')).toBeInTheDocument();
    expect(screen.getByText('PRIMER AÑO')).toBeInTheDocument();
    expect(screen.getByText('Sin docente asignado')).toBeInTheDocument();
  });

  it('el diálogo de pago requerido ofrece ir a registrar el pago', async () => {
    const handleGoToRegistrarPago = vi.fn();
    const clearPaymentRequiredDialog = vi.fn();
    renderWithProviders(<Montar ctx={{ paymentRequiredStudentId: 3, handleGoToRegistrarPago, clearPaymentRequiredDialog }} />);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Pago de aporte requerido')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Ir a registrar pago' }));
    expect(handleGoToRegistrarPago).toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
    expect(clearPaymentRequiredDialog).toHaveBeenCalled();
  });

  it('con el paso de historial incluido lo muestra y el índice dinámico lo ubica', async () => {
    renderWithProviders(
      <Montar
        ruta={['buscar', 'periodo', 'historial', 'paralelo']}
        ctx={{ initialStep: 2, wizardStepMeta: { indices: { buscar: 0, carrera: null, periodo: 1, paralelo: 3, historial: 2 } }, historialPrevioData: { hasRows: false } }}
      />,
    );
    expect(await screen.findByText(/No hay materias pendientes de registrar/)).toBeInTheDocument();
  });
});

describe('conectores de registro de matrícula', () => {
  it('detalle pasa el id de la ruta al provider', () => {
    mocks.detalle.mockReturnValue({ inscripcion: null, loading: true, breadcrumbItems: [] });
    renderWithProviders(<Routes><Route path="/inscripciones/:id" element={<DetailConnector />} /></Routes>, { route: '/inscripciones/17' });
    expect(screen.getByTestId('prov-detalle-17')).toBeInTheDocument();
  });

  it('lista: estudiante a su matrícula, docente a su roster y el resto al listado administrativo', () => {
    mocks.misDatos.mockReturnValue({ misDatos: null, loadingMisDatos: true, errorMisDatos: null });
    mocks.docente.mockReturnValue({ estudiantes: [], totalEstudiantes: 0, gestion: {}, loading: false, error: null, searchText: '', setSearchText: vi.fn(), refetch: vi.fn() });
    mocks.lista.mockReturnValue({ isSmall: false, puedeExportarLista: false, inscripciones: [], tableColumns: [], breadcrumbItems: [], carreraSelectOptions: [], setSearchText: vi.fn(), tablePagination: false });
    const a = renderWithProviders(<ListConnector />, { auth: { usuario: rol('ESTUDIANTE') } });
    expect(screen.getByText('Abriendo su matrícula…')).toBeInTheDocument();
    a.unmount();
    const b = renderWithProviders(<ListConnector />, { auth: { usuario: rol('DOCENTE') } });
    expect(screen.getAllByText('Mis estudiantes').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('prov-lista')).not.toBeInTheDocument();
    b.unmount();
    renderWithProviders(<ListConnector />);
    expect(screen.getByTestId('prov-lista')).toBeInTheDocument();
  });

  it('MatriculaRedirect: carga, error y sin matrícula', () => {
    mocks.misDatos.mockReturnValue({ misDatos: null, loadingMisDatos: true, errorMisDatos: null });
    const a = renderWithProviders(<MatriculaRedirect />);
    expect(screen.getByText('Abriendo su matrícula…')).toBeInTheDocument();
    a.unmount();
    mocks.misDatos.mockReturnValue({ misDatos: null, loadingMisDatos: false, errorMisDatos: 'Sin sesión' });
    const b = renderWithProviders(<MatriculaRedirect />);
    expect(screen.getByText('No se pudo abrir su matrícula')).toBeInTheDocument();
    b.unmount();
    mocks.misDatos.mockReturnValue({ misDatos: {}, loadingMisDatos: false, errorMisDatos: null });
    const c = renderWithProviders(<MatriculaRedirect />);
    expect(screen.getByText('Aún no tiene una matrícula registrada en la gestión vigente.')).toBeInTheDocument();
    c.unmount();
    mocks.misDatos.mockReturnValue({ misDatos: { inscripcion: { enrollment: { id: 8 } } }, loadingMisDatos: false, errorMisDatos: null });
    renderWithProviders(<MatriculaRedirect />);
    expect(screen.queryByText('Aún no tiene una matrícula registrada en la gestión vigente.')).not.toBeInTheDocument();
  });

  it('nueva: arma editData solo en modo editar con el estado de navegación', () => {
    mocks.wizard.mockReturnValue({ editData: null, pageTitle: 'x', breadcrumbItems: [], wizardSteps: [], form: undefined, handleFinish: vi.fn(), studentSearch: {}, carrerasData: {}, periodosData: {}, paralelosData: {}, wizardStepMeta: null, handleValidateBeforeNext: vi.fn() });
    const a = renderWithProviders(<InscripcionesNuevaConnector />, { route: { pathname: '/inscripciones/nueva', state: { studentId: 5 } } });
    expect(mocks.nuevaProvider).toHaveBeenLastCalledWith(expect.objectContaining({ studentId: 5, editData: null, mode: 'nuevo' }));
    a.unmount();
    renderWithProviders(<InscripcionesNuevaConnector />, { route: { pathname: '/x', state: { mode: 'editar', inscripcionId: 9, studentId: 5, carreraId: 1, tipoInscripcion: 'ANTIGUO' } } });
    expect(mocks.nuevaProvider).toHaveBeenLastCalledWith(expect.objectContaining({ mode: 'editar', editData: expect.objectContaining({ inscripcionId: 9, carreraId: 1, selectedPeriodIds: null }) }));
  });

  describe('editar', () => {
    const montar = (ctx) => {
      mocks.detalle.mockReturnValue(ctx);
      mocks.wizard.mockReturnValue({ editData: null, pageTitle: 'x', breadcrumbItems: [], wizardSteps: [], form: undefined, handleFinish: vi.fn(), studentSearch: {}, carrerasData: {}, periodosData: {}, paralelosData: {}, wizardStepMeta: null, handleValidateBeforeNext: vi.fn() });
      return renderWithProviders(<Routes><Route path="/inscripciones/:id/editar" element={<InscripcionesEditarConnector />} /></Routes>, { route: '/inscripciones/9/editar' });
    };

    it('carga, error y no encontrada', () => {
      const a = montar({ inscripcion: null, loading: true, error: null });
      expect(a.container.querySelector('.ant-skeleton')).not.toBeNull();
      a.unmount();
      const b = montar({ inscripcion: null, loading: false, error: 'Falla' });
      expect(screen.getByText('Error al cargar la inscripción')).toBeInTheDocument();
      b.unmount();
      montar({ inscripcion: null, loading: false, error: null });
      expect(screen.getByText('No se encontró la inscripción')).toBeInTheDocument();
    });

    it('deriva periodos, materias y paralelos de las materias inscritas', () => {
      montar({
        loading: false, error: null,
        inscripcion: {
          enrollment: { id: 9, tipoInscripcion: 'ANTIGUO' }, student: { id: 5 }, career: { id: 2 },
          subjectEnrollments: [{ periodoId: 1, paraleloId: 11, materiaId: 100 }, { periodoId: 1, paraleloId: 11, materiaId: 101 }, { periodoId: 2, paraleloId: 12, materiaId: 200 }, { periodoId: null, materiaId: 1 }],
          historialPrevioEstado: 'PENDIENTE', cantidadHistorialPrevio: 0,
        },
      });
      expect(screen.getByTestId('prov-nueva')).toHaveAttribute('data-mode', 'editar');
      const { editData } = mocks.nuevaProvider.mock.calls.at(-1)[0];
      expect(editData).toMatchObject({
        inscripcionId: 9, studentId: 5, carreraId: 2, tipoInscripcion: 'ANTIGUO', tipoAdmision: 'ANTIGUO', periodoId: 1, paraleloId: 11, selectedPeriodIds: [1, 2],
        materiaIdsByPeriod: { 1: [100, 101], 2: [200] }, parallelIdsByPeriod: { 1: 11, 2: 12 }, completarSoloHistorialPrevio: true,
      });
    });

    it('usa lo que ya devuelve la API cuando viene completo', () => {
      montar({
        loading: false, error: null,
        inscripcion: {
          enrollment: { id: 9, tipoInscripcion: 'NUEVO' }, student: { id: 5, tipoAdmision: 'NUEVO' }, selectedPeriodIds: [3], materiaIdsByPeriod: { 3: [1] }, parallelIdsByPeriod: { 3: 30 },
          studentAcademicData: { carreraId: 4 }, priorEnrollmentHistories: [{ id: 1 }], historialPrevioEstado: 'REGISTRADO', cantidadHistorialPrevio: 2,
        },
      });
      const { editData } = mocks.nuevaProvider.mock.calls.at(-1)[0];
      expect(editData).toMatchObject({ periodoId: 3, paraleloId: 30, carreraId: 4, completarSoloHistorialPrevio: false, priorEnrollmentHistories: [{ id: 1 }] });
    });
  });
});
