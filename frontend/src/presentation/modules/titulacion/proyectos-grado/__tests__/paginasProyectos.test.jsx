import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import ProyectosGradoList from '../pages/ProyectosGradoList';
import ProyectoGradoDetail from '../pages/ProyectoGradoDetail';
import ProyectoGradoFormPage from '../pages/ProyectoGradoFormPage';
import MiProyectoGradoPage from '../pages/MiProyectoGradoPage';
import MisTutoradosPage from '../pages/MisTutoradosPage';
import RegistrarActaDefensaPage from '../pages/RegistrarActaDefensaPage';
import SeguimientoTutoriaDocentesPage from '../pages/SeguimientoTutoriaDocentesPage';
import SeguimientoTutoriaDocentesTablero from '../components/organisms/SeguimientoTutoriaDocentesTablero';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';

const mocks = vi.hoisted(() => ({
  lista: vi.fn(),
  detalle: vi.fn(),
  form: vi.fn(),
  mi: vi.fn(),
  tutorados: vi.fn(),
  acta: vi.fn(),
  seguimiento: vi.fn(),
}));
vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('@application-titulacion/proyectos-grado/hooks/state/useProyectosGradoListPage', () => ({ useProyectosGradoListPage: mocks.lista }));
vi.mock('@application-titulacion/proyectos-grado/hooks/state/useProyectoGradoDetailPage', () => ({ useProyectoGradoDetailPage: mocks.detalle }));
vi.mock('@application-titulacion/proyectos-grado/hooks/state/useProyectoGradoFormPage', () => ({ useProyectoGradoFormPage: mocks.form }));
vi.mock('@application-titulacion/proyectos-grado/hooks/state/useMiProyectoGradoPage', async (orig) => ({ ...(await orig()), useMiProyectoGradoPage: mocks.mi }));
vi.mock('@application-titulacion/proyectos-grado/hooks/state/useMisTutoradosPage', () => ({ useMisTutoradosPage: mocks.tutorados }));
vi.mock('@application-titulacion/proyectos-grado/hooks/state/useRegistrarActaDefensaPage', () => ({ useRegistrarActaDefensaPage: mocks.acta }));
vi.mock('@application-titulacion/proyectos-grado/hooks/state/useSeguimientoTutoriaDocentesPage', () => ({ useSeguimientoTutoriaDocentesPage: mocks.seguimiento }));
vi.mock('@application-titulacion/proyectos-grado/hooks/api/useBuscarEstudiantesTit', () => ({
  useBuscarEstudiantesTit: () => ({ estudiantes: [], loading: false, buscar: vi.fn(), limpiar: vi.fn() }),
}));

const bc = [{ title: 'Titulación' }];
const proyecto = { id: 5, titulo: 'Sistema de inventarios', estado: 'DESARROLLO', modalidadCodigo: 'TESIS', carreraNombre: 'Sistemas', tutorId: 3, tutorNombre: 'Ing. Luna', cantidadIntegrantes: 1, porcentajeAvance: 40, observacionesPendientes: 0, bitacoraTotal: 0, activo: true, integrantes: [{ id: 1, estudianteId: 11, nombreCompleto: 'Pérez Ana', rol: 'TITULAR', estado: 'ACTIVO' }] };
const todos = (...acciones) => ({ auth: { permisos: [permiso(TITULACION_PERMISOS.proyecto, ...acciones)] } });

describe('ProyectosGradoList', () => {
  const state = (extra = {}) => ({
    proyectos: [proyecto],
    loading: false,
    error: null,
    searchText: '',
    filtros: {},
    setFiltro: vi.fn(),
    carreraOptions: [],
    modalidadOptions: [],
    loadingModalidades: false,
    estadoOptions: [],
    tableColumns: [{ title: 'Proyecto', dataIndex: 'titulo' }],
    breadcrumbItems: bc,
    handleRegistrar: vi.fn(),
    handleExportarAvanceCarrera: vi.fn(),
    exportandoAvanceCarrera: false,
    handleIrSeguimientoTutoriaDocentes: vi.fn(),
    handleSearchChange: vi.fn(),
    tablePagination: undefined,
    ...extra,
  });

  it('cada acción de cabecera depende de su permiso', async () => {
    const s = state();
    mocks.lista.mockReturnValue(s);
    const { unmount } = renderWithProviders(<ProyectosGradoList />);
    ['Exportar avance por carrera', 'Seguimiento a docentes', 'Nuevo proyecto'].forEach((n) => expect(screen.queryByRole('button', { name: new RegExp(n) })).not.toBeInTheDocument());
    unmount();
    renderWithProviders(<ProyectosGradoList />, todos('EXPORTAR', 'LISTAR', 'CREAR'));
    expect(screen.getByText('Sistema de inventarios')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Nuevo proyecto/ }));
    await userEvent.click(screen.getByRole('button', { name: /Exportar avance por carrera/ }));
    await userEvent.click(screen.getByRole('button', { name: /Seguimiento a docentes/ }));
    expect(s.handleRegistrar).toHaveBeenCalled();
    expect(s.handleExportarAvanceCarrera).toHaveBeenCalled();
    expect(s.handleIrSeguimientoTutoriaDocentes).toHaveBeenCalled();
  });

  it('error del listado', () => {
    mocks.lista.mockReturnValue(state({ proyectos: [], error: 'Falla' }));
    renderWithProviders(<ProyectosGradoList />);
    expect(screen.getByText(/Falla/)).toBeInTheDocument();
  });
});

describe('ProyectoGradoDetail', () => {
  const base = () => ({
    proyecto,
    loading: false,
    error: null,
    refetch: vi.fn(),
    breadcrumbItems: bc,
    handleVolver: vi.fn(),
    handleEditar: vi.fn(),
    tutorModal: { open: false, abrir: vi.fn(), cerrar: vi.fn(), submit: vi.fn(), saving: false, docentes: [], loadingDocentes: false, docentesDisponible: true },
    etapaModal: { open: false, abrir: vi.fn(), cerrar: vi.fn(), submit: vi.fn(), saving: false, transiciones: ['SUFICIENCIA'], proyecto, bitacoraCount: 0 },
    cancelarModal: { open: false, abrir: vi.fn(), cerrar: vi.fn(), submit: vi.fn(), saving: false, puedeCancelar: true },
    exencionDefensa: { puede: false, confirmar: vi.fn(), declarando: false },
    integrantes: { modalOpen: false, abrirModal: vi.fn(), cerrarModal: vi.fn(), agregar: vi.fn(), guardando: false, toggleEstado: vi.fn() },
    bitacora: { entradas: [], loading: false, error: null, abrirNuevaEntrada: vi.fn(), abrirEditarEntrada: vi.fn(), drawer: { open: false, entrada: null, avance: null }, cerrarDrawer: vi.fn(), guardar: vi.fn(), guardando: false },
    avances: { items: [], loading: false, error: null, descargandoId: null, descargar: vi.fn(), revisar: vi.fn(), subirModal: { open: false, abrir: vi.fn(), cerrar: vi.fn(), submit: vi.fn(), subiendo: false } },
    dictamenes: { items: [], loading: false, error: null, descargandoId: null, descargar: vi.fn() },
    formularioModalidad: { descargando: false, exportar: vi.fn() },
    actaDefensa: { items: [], loading: false, error: null, puedeRegistrar: true, descargandoId: null, abrirTab: vi.fn(), irARegistrar: vi.fn(), exportarPdf: vi.fn(), anular: vi.fn(), anularModal: { open: false, acta: null, anulando: false, submit: vi.fn(), cerrar: vi.fn() } },
  });
  const auth = todos('APROBAR', 'EXPORTAR', 'EDITAR');

  it('acciones de cabecera y de etapa para un proyecto en desarrollo', async () => {
    const s = base();
    mocks.detalle.mockReturnValue(s);
    renderWithProviders(<ProyectoGradoDetail />, auth);
    expect(screen.getByRole('button', { name: /Cambiar tutor/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Cambiar tutor/ }));
    expect(s.tutorModal.abrir).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Exportar formulario FMDG-1/ }));
    expect(s.formularioModalidad.exportar).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Continuar etapa/ }));
    expect(s.etapaModal.abrir).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Cancelar proyecto/ }));
    expect(s.cancelarModal.abrir).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /Declarar exento/ })).not.toBeInTheDocument();
  });

  it('en defensa el botón de etapa pasa a registrar el acta', async () => {
    const s = base();
    s.proyecto = { ...proyecto, estado: 'DEFENSA' };
    mocks.detalle.mockReturnValue(s);
    renderWithProviders(<ProyectoGradoDetail />, auth);
    await userEvent.click(screen.getByRole('button', { name: /Registrar acta de defensa/ }));
    expect(s.actaDefensa.irARegistrar).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /Continuar etapa/ })).not.toBeInTheDocument();
  });

  it('exención de defensa visible solo si el hook la habilita', async () => {
    const s = base();
    s.exencionDefensa.puede = true;
    mocks.detalle.mockReturnValue(s);
    renderWithProviders(<ProyectoGradoDetail />, auth);
    await userEvent.click(screen.getByRole('button', { name: /Declarar exento de defensa/ }));
    expect(s.exencionDefensa.confirmar).toHaveBeenCalled();
  });

  it('proyecto cancelado: sin acciones de modificación', () => {
    const s = base();
    s.proyecto = { ...proyecto, estado: 'CANCELADO' };
    mocks.detalle.mockReturnValue(s);
    renderWithProviders(<ProyectoGradoDetail />, auth);
    ['Cambiar tutor', 'Exportar formulario FMDG-1', 'Continuar etapa'].forEach((n) => expect(screen.queryByRole('button', { name: new RegExp(n) })).not.toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Editar datos del proyecto de grado' })).not.toBeInTheDocument();
  });

  it('abrir la pestaña de acta de defensa carga las actas; error y no encontrado', async () => {
    const s = base();
    mocks.detalle.mockReturnValue(s);
    const { unmount } = renderWithProviders(<ProyectoGradoDetail />, auth);
    await userEvent.click(screen.getByRole('tab', { name: /Acta de defensa/ }));
    expect(s.actaDefensa.abrirTab).toHaveBeenCalled();
    unmount();
    mocks.detalle.mockReturnValue({ ...base(), proyecto: null, error: 'Falla' });
    const { unmount: u2 } = renderWithProviders(<ProyectoGradoDetail />);
    expect(screen.getByText(/Falla/)).toBeInTheDocument();
    u2();
    mocks.detalle.mockReturnValue({ ...base(), proyecto: null });
    renderWithProviders(<ProyectoGradoDetail />);
    expect(screen.getByText('No se encontró el proyecto solicitado.')).toBeInTheDocument();
  });
});

describe('ProyectoGradoFormPage', () => {
  const Montar = (props) => {
    const [form] = Form.useForm();
    mocks.form.mockReturnValue({
      form,
      pageTitle: 'Nuevo proyecto',
      breadcrumbItems: bc,
      permisoAccion: 'CREAR',
      loading: false,
      submitLoading: false,
      error: null,
      formSections: { datosProyecto: { description: 'Datos', fields: [{ name: 'titulo', label: 'Título', type: 'input' }] } },
      modalidadGrupal: false,
      estudianteOptions: [],
      buscandoEstudiantes: false,
      buscarEstudiantes: vi.fn(),
      handleEstudianteChange: vi.fn(),
      handleVolver: vi.fn(),
      handleSubmit: vi.fn(),
      isInvalidEditId: false,
      ...props,
    });
    return <ProyectoGradoFormPage />;
  };

  it('titular siempre; integrantes solo en modalidad grupal', () => {
    const { unmount } = renderWithProviders(<Montar />);
    expect(screen.getByText('Estudiante titular')).toBeInTheDocument();
    expect(screen.queryByText('Integrantes del grupo')).not.toBeInTheDocument();
    unmount();
    renderWithProviders(<Montar modalidadGrupal />);
    expect(screen.getByText('Integrantes del grupo')).toBeInTheDocument();
  });

  it('guardar según permiso; id inválido', async () => {
    const handleSubmit = vi.fn();
    const { unmount } = renderWithProviders(<Montar handleSubmit={handleSubmit} />, todos('CREAR'));
    await userEvent.click(screen.getByRole('button', { name: /Guardar proyecto/ }));
    expect(handleSubmit).toHaveBeenCalled();
    unmount();
    const { unmount: u2 } = renderWithProviders(<Montar />);
    expect(screen.queryByRole('button', { name: /Guardar proyecto/ })).not.toBeInTheDocument();
    u2();
    renderWithProviders(<Montar isInvalidEditId />);
    expect(screen.getByText('Identificador de proyecto inválido')).toBeInTheDocument();
  });
});

describe('MiProyectoGradoPage', () => {
  const Montar = (props) => {
    const [form] = Form.useForm();
    mocks.mi.mockReturnValue({
      proyecto: null,
      sinProyecto: false,
      loading: false,
      error: null,
      refetch: vi.fn(),
      breadcrumbItems: bc,
      avances: [],
      loadingAvances: false,
      descargandoId: null,
      subiendoAvance: false,
      uploadOpen: false,
      setUploadOpen: vi.fn(),
      handleSubirAvance: vi.fn(),
      handleDescargarAvance: vi.fn(),
      bitacoraEntradas: [],
      loadingBitacora: false,
      confirmandoId: null,
      handleConfirmarEntrada: vi.fn(),
      registro: { form, submit: vi.fn(), modalidadOptions: [{ value: 1, label: 'Tesis' }], loadingModalidades: false, registrando: false },
      formularioModalidad: { descargando: false, exportar: vi.fn() },
      actaDefensa: { items: [], loading: false, error: null },
      ...props,
    });
    return <MiProyectoGradoPage />;
  };

  it('sin proyecto permite registrar la modalidad validando el título', async () => {
    const submit = vi.fn();
    const registro = (form) => ({ form, submit, modalidadOptions: [], loadingModalidades: false, registrando: false });
    const Wrapper = () => {
      const [form] = Form.useForm();
      return <Montar sinProyecto registro={registro(form)} />;
    };
    renderWithProviders(<Wrapper />, todos('CREAR'));
    expect(screen.getByText(/Aún no tiene un proyecto de grado registrado/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Registrar mi modalidad de grado/ }));
    expect(await screen.findByText('Indique el título de su proyecto')).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });

  it('con proyecto muestra ficha, cronograma vacío y las acciones del estudiante', async () => {
    const setUploadOpen = vi.fn();
    renderWithProviders(<Montar proyecto={proyecto} setUploadOpen={setUploadOpen} />, {
      auth: { permisos: [permiso(TITULACION_PERMISOS.avance, 'CREAR'), permiso(TITULACION_PERMISOS.proyecto, 'EXPORTAR')] },
    });
    expect(screen.getByText('Su tutor aún no registró entradas de cronograma de progreso.')).toBeInTheDocument();
    expect(screen.getByText(/Aún no subió avances/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Subir avance/ }));
    expect(setUploadOpen).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: /Descargar formulario FMDG-1/ })).toBeInTheDocument();
  });

  it('proyecto cancelado oculta las acciones', () => {
    renderWithProviders(<Montar proyecto={{ ...proyecto, estado: 'CANCELADO' }} />, { auth: { permisos: [permiso(TITULACION_PERMISOS.avance, 'CREAR')] } });
    expect(screen.queryByRole('button', { name: /Subir avance/ })).not.toBeInTheDocument();
  });
});

describe('MisTutoradosPage', () => {
  const state = (extra = {}) => ({
    proyectos: [proyecto],
    loading: false,
    error: null,
    searchText: '',
    handleSearchChange: vi.fn(),
    tableColumns: [{ title: 'Proyecto', dataIndex: 'titulo' }],
    breadcrumbItems: bc,
    bitacoraDrawer: { open: false, proyecto: null },
    cerrarBitacora: vi.fn(),
    handleGuardarBitacora: vi.fn(),
    guardandoBitacora: false,
    ...extra,
  });
  beforeEach(() => mocks.tutorados.mockReset());

  it('lista, vacío y error', () => {
    mocks.tutorados.mockReturnValue(state());
    const { unmount } = renderWithProviders(<MisTutoradosPage />);
    expect(screen.getByText('Sistema de inventarios')).toBeInTheDocument();
    unmount();
    mocks.tutorados.mockReturnValue(state({ proyectos: [] }));
    const { unmount: u2 } = renderWithProviders(<MisTutoradosPage />);
    expect(screen.getByText('Aún no tiene proyectos de grado bajo su tutoría.')).toBeInTheDocument();
    u2();
    mocks.tutorados.mockReturnValue(state({ error: 'Falla' }));
    renderWithProviders(<MisTutoradosPage />);
    expect(screen.getByText('No se pudo cargar su lista de tutorados')).toBeInTheDocument();
  });
});

describe('RegistrarActaDefensaPage', () => {
  const Montar = (props) => {
    const [form] = Form.useForm();
    mocks.acta.mockReturnValue({
      form,
      proyecto,
      loading: false,
      error: null,
      breadcrumbItems: bc,
      integrantesActivos: [{ estudianteId: 11, nombreCompleto: 'Pérez Ana', ci: '123' }],
      docentes: [{ value: 3, label: 'Ing. Luna' }],
      loadingDocentes: false,
      docentesDisponible: true,
      saving: false,
      submitError: null,
      handleVolver: vi.fn(),
      handleSubmit: vi.fn(),
      ...props,
    });
    return <RegistrarActaDefensaPage />;
  };

  it('muestra el proyecto, la nota por integrante con vista previa del resultado y registra con permiso', async () => {
    const handleSubmit = vi.fn();
    renderWithProviders(<Montar handleSubmit={handleSubmit} />, todos('APROBAR'));
    expect(screen.getByText('Sistema de inventarios')).toBeInTheDocument();
    expect(screen.getByText(/Pérez Ana · C\.I\. 123/)).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText('0 a 100'), '80');
    expect(await screen.findByText('Aprueba')).toBeInTheDocument();
    await userEvent.clear(screen.getByPlaceholderText('0 a 100'));
    await userEvent.type(screen.getByPlaceholderText('0 a 100'), '40');
    expect(await screen.findByText('Reprueba')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Registrar acta/ }));
    expect(handleSubmit).toHaveBeenCalled();
  });

  it('sin docentes disponibles o sin integrantes activos advierte y bloquea', () => {
    const { unmount } = renderWithProviders(<Montar docentesDisponible={false} />, todos('APROBAR'));
    expect(screen.getByText('Catálogo de docentes no disponible para su rol')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Registrar acta/ })).not.toBeInTheDocument();
    unmount();
    renderWithProviders(<Montar integrantesActivos={[]} />, todos('APROBAR'));
    expect(screen.getByText('El proyecto no tiene integrantes activos')).toBeInTheDocument();
  });

  it('muestra errores de carga y de envío; sin permiso no hay botón', () => {
    renderWithProviders(<Montar error="No se cargó" submitError="El acta ya existe" />);
    expect(screen.getByText('No se cargó')).toBeInTheDocument();
    expect(screen.getByText('El acta ya existe')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Registrar acta/ })).not.toBeInTheDocument();
  });
});

describe('seguimiento de tutorías a docentes', () => {
  const docente = {
    docenteId: 1,
    docenteNombre: 'Ing. Luna',
    carreras: [{ carreraNombre: 'Sistemas' }],
    tutoriasEjecutadasMes: 3,
    tutoriados: [
      { estudianteId: 1, nombreCompleto: 'Pérez Ana', ci: '123', proyectoTitulo: 'Inventarios', tutoriasEjecutadasMes: 1, porcentajeAvance: 50, ultimaActividad: 'Reunión', ultimaObservacion: 'Avanzar' },
      { estudianteId: 2, nombreCompleto: 'Soto Luis', tutoriasEjecutadasMes: 0 },
    ],
  };

  it('tablero: una hoja por docente con pluralización y valores por defecto', () => {
    renderWithProviders(<SeguimientoTutoriaDocentesTablero docentes={[docente]} />);
    expect(screen.getByText('Ing. Luna')).toBeInTheDocument();
    expect(screen.getByText('1 tutoría')).toBeInTheDocument();
    expect(screen.getByText('Sin tutoría este mes')).toBeInTheDocument();
    expect(screen.getByText('Sin registrar')).toBeInTheDocument();
    expect(screen.getByText('Sin observaciones')).toBeInTheDocument();
    expect(screen.getByText('Firma del docente tutor')).toBeInTheDocument();
  });

  const state = (extra = {}) => ({
    seguimiento: { anio: 2026, mes: 3, docentes: [docente] },
    loading: false,
    error: null,
    handleExportar: vi.fn(),
    exportando: false,
    handleVolver: vi.fn(),
    breadcrumbItems: bc,
    carreraOptions: [],
    loadingCarreras: false,
    docentes: [],
    loadingDocentes: false,
    docenteId: undefined,
    setDocenteId: vi.fn(),
    carreraId: undefined,
    setCarreraId: vi.fn(),
    periodo: null,
    setPeriodo: vi.fn(),
    ...extra,
  });

  it('página: muestra el periodo, exporta con permiso, y estados vacío/error', async () => {
    const s = state();
    mocks.seguimiento.mockReturnValue(s);
    const { unmount } = renderWithProviders(<SeguimientoTutoriaDocentesPage />, todos('EXPORTAR'));
    expect(screen.getByText(/Mostrando el seguimiento de/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Exportar Excel/ }));
    expect(s.handleExportar).toHaveBeenCalled();
    unmount();

    mocks.seguimiento.mockReturnValue(state({ seguimiento: { anio: 2026, mes: 3, docentes: [] } }));
    const { unmount: u2 } = renderWithProviders(<SeguimientoTutoriaDocentesPage />);
    expect(screen.getByText(/No hay docentes-tutores con tutoriados activos/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Exportar Excel/ })).not.toBeInTheDocument();
    u2();

    mocks.seguimiento.mockReturnValue(state({ seguimiento: null, error: 'Falla' }));
    renderWithProviders(<SeguimientoTutoriaDocentesPage />);
    expect(screen.getByText('No se pudo cargar el seguimiento de tutorías a docentes')).toBeInTheDocument();
  });
});
