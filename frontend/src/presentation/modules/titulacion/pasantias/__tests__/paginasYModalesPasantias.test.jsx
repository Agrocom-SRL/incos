import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import InformePasantiaDrawer from '../components/modals/InformePasantiaDrawer';
import SeguimientoPasantiaDrawer from '../components/modals/SeguimientoPasantiaDrawer';
import TransicionPasantiaModal from '../components/modals/TransicionPasantiaModal';
import PasantiasList from '../pages/PasantiasList';
import PasantiaDetail from '../pages/PasantiaDetail';
import MiPasantiaPage from '../pages/MiPasantiaPage';
import PasantiasEmpresasList from '../pages/PasantiasEmpresasList';
import PasantiaEmpresaDetail from '../pages/PasantiaEmpresaDetail';
import PasantiaFormPage from '../pages/PasantiaFormPage';
import MisPasantiasSupervisadasPage from '../pages/MisPasantiasSupervisadasPage';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';

const mocks = vi.hoisted(() => ({
  lista: vi.fn(),
  detalle: vi.fn(),
  mia: vi.fn(),
  empresas: vi.fn(),
  empresaDetalle: vi.fn(),
  form: vi.fn(),
  supervisadas: vi.fn(),
}));
vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('@application-titulacion/pasantias/hooks/state/usePasantiasListPage', () => ({ usePasantiasListPage: mocks.lista }));
vi.mock('@application-titulacion/pasantias/hooks/state/usePasantiaDetailPage', () => ({ usePasantiaDetailPage: mocks.detalle }));
vi.mock('@application-titulacion/pasantias/hooks/state/useMiPasantiaPage', () => ({ useMiPasantiaPage: mocks.mia }));
vi.mock('@application-titulacion/pasantias/hooks/state/usePasantiasEmpresasListPage', () => ({ usePasantiasEmpresasListPage: mocks.empresas }));
vi.mock('@application-titulacion/pasantias/hooks/state/usePasantiaEmpresaDetailPage', () => ({ usePasantiaEmpresaDetailPage: mocks.empresaDetalle }));
vi.mock('@application-titulacion/pasantias/hooks/state/usePasantiaFormPage', () => ({ usePasantiaFormPage: mocks.form }));
vi.mock('@application-titulacion/pasantias/hooks/state/useMisPasantiasSupervisadasPage', () => ({ useMisPasantiasSupervisadasPage: mocks.supervisadas }));

const bc = [{ title: 'Titulación' }];
const pasantia = { id: 1, tipo: 'PASANTIA', estado: 'EN_CURSO', estudianteNombre: 'Pérez Ana', empresaNombre: 'Tigo', horasLabel: '10 / 300', totalInformes: 0, totalSeguimientos: 0 };

describe('InformePasantiaDrawer', () => {
  it('exige memo y resultado y no envía incompleto', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<InformePasantiaDrawer open onClose={vi.fn()} onSubmit={onSubmit} tipoPasantia="CONVALIDACION" />);
    await userEvent.click(screen.getByRole('button', { name: /Emitir informe/ }));
    expect(await screen.findByText('Registre el número de memo')).toBeInTheDocument();
    expect(document.querySelector('.ant-form-item-explain-error')).not.toBeNull();
    expect(screen.getAllByText('Seleccione el resultado').length).toBeGreaterThan(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('verificación: pide fecha de verificación y envía el memo con prefijo', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(
      <InformePasantiaDrawer open onClose={vi.fn()} onSubmit={onSubmit} tipoPasantia="PASANTIA" areaDepartamento="Sistemas" estudianteNombre="Pérez Ana" />,
    );
    expect(screen.getByText('Fecha de verificación')).toBeInTheDocument();
    expect(screen.getByText(/Área relacionada: Sistemas/)).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText(new RegExp(`…/${new Date().getFullYear()}`)), '15/2026');
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('Viable', { selector: '.ant-select-item-option-content' }));
    await userEvent.click(screen.getByRole('button', { name: /Emitir informe/ }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.numeroMemo).toBe('MEMO/INCOS/DA/N°15/2026');
    expect(payload.resultado).toBe('VIABLE');
    expect(payload.fechaVerificacion).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('edición precarga el memo sin prefijo', async () => {
    renderWithProviders(
      <InformePasantiaDrawer open onClose={vi.fn()} onSubmit={vi.fn()} informe={{ tipo: 'CONVALIDACION', numeroMemo: 'MEMO/INCOS/DA/N°7/2026', resultado: 'VIABLE' }} />,
    );
    expect(screen.getByText('Editar informe')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByDisplayValue('7/2026')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Guardar informe/ })).toBeInTheDocument();
  });
});

describe('SeguimientoPasantiaDrawer', () => {
  it('guarda con la fecha por defecto (hoy) y textos recortados', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<SeguimientoPasantiaDrawer open onClose={vi.fn()} onSubmit={onSubmit} estudianteNombre="Pérez Ana" />);
    expect(screen.getByText('Estudiante: Pérez Ana')).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText('Descripción del trabajo que desempeña el estudiante'), '  Soporte  ');
    await userEvent.click(screen.getByRole('button', { name: /Guardar seguimiento/ }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.descripcionTrabajo).toBe('Soporte');
    expect(payload.fortalezas).toBeNull();
    expect(payload.fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('volver cierra', async () => {
    const onClose = vi.fn();
    renderWithProviders(<SeguimientoPasantiaDrawer open onClose={onClose} onSubmit={vi.fn()} seguimiento={{ fecha: '2026-03-05' }} />);
    expect(screen.getByText('Editar seguimiento')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Volver' }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('TransicionPasantiaModal', () => {
  it('sin transiciones informa que el estado es terminal', () => {
    renderWithProviders(<TransicionPasantiaModal open onCancel={vi.fn()} onSubmit={vi.fn()} estadoActual="CANCELADA" />);
    expect(screen.getByText(/no admite más transiciones/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar transición' })).toBeDisabled();
  });

  it('exige elegir el estado destino', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<TransicionPasantiaModal open onCancel={vi.fn()} onSubmit={onSubmit} transiciones={['EN_CURSO']} estadoActual="SOLICITADA" avisoInforme="Falta el informe" />);
    expect(screen.getByText('Falta el informe')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Registrar transición' }));
    expect(await screen.findByText('Seleccione el estado destino')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('transición reversible se registra directamente', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<TransicionPasantiaModal open onCancel={vi.fn()} onSubmit={onSubmit} transiciones={['EN_CURSO']} estadoActual="SOLICITADA" />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('En curso', { selector: '.ant-select-item-option-content' }));
    await userEvent.type(screen.getByPlaceholderText(/Registre observaciones/), ' ok ');
    await userEvent.click(screen.getByRole('button', { name: 'Registrar transición' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ estado: 'EN_CURSO', observaciones: 'ok' }));
  });

  it('transición irreversible pide confirmación antes de registrar', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<TransicionPasantiaModal open onCancel={vi.fn()} onSubmit={onSubmit} transiciones={['RECHAZADA']} estadoActual="SOLICITADA" />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('Rechazada', { selector: '.ant-select-item-option-content' }));
    await userEvent.click(screen.getByRole('button', { name: 'Registrar transición' }));
    expect((await screen.findAllByText('¿Confirma rechazar el trámite?')).length).toBeGreaterThan(0);
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Sí, rechazar' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ estado: 'RECHAZADA', observaciones: undefined }));
  });

  it('finalizar con horas insuficientes bloquea el botón', async () => {
    renderWithProviders(
      <TransicionPasantiaModal open onCancel={vi.fn()} onSubmit={vi.fn()} transiciones={['FINALIZADA']} estadoActual="EN_CURSO" horasCumplidas={100} horasRequeridas={300} />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('Finalizada', { selector: '.ant-select-item-option-content' }));
    expect(await screen.findByText(/Aún no alcanza el mínimo para finalizar/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar transición' })).toBeDisabled();
  });
});

describe('PasantiasList', () => {
  const state = (extra = {}) => ({
    pasantias: [pasantia],
    loading: false,
    error: null,
    searchText: '',
    filtros: {},
    setFiltro: vi.fn(),
    gestionOptions: [],
    carreraOptions: [],
    tipoOptions: [],
    estadoOptions: [{ value: 'EN_CURSO', label: 'En curso' }],
    tableColumns: [{ title: 'Estudiante', dataIndex: 'estudianteNombre' }],
    breadcrumbItems: bc,
    handleRegistrar: vi.fn(),
    handleVerEmpresas: vi.fn(),
    handleSearchChange: vi.fn(),
    tablePagination: undefined,
    ...extra,
  });

  it('acciones por permiso: registrar trámite y catálogo de empresas', async () => {
    const s = state();
    mocks.lista.mockReturnValue(s);
    const auth = { permisos: [permiso(TITULACION_PERMISOS.pasantia, 'CREAR'), permiso(TITULACION_PERMISOS.pasantiaEmpresa, 'LISTAR')] };
    const { unmount } = renderWithProviders(<PasantiasList />, { auth });
    expect(screen.getByText('Pérez Ana')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Registrar trámite/ }));
    await userEvent.click(screen.getByRole('button', { name: /Catálogo de empresas/ }));
    expect(s.handleRegistrar).toHaveBeenCalled();
    expect(s.handleVerEmpresas).toHaveBeenCalled();
    unmount();
    renderWithProviders(<PasantiasList />);
    expect(screen.queryByRole('button', { name: /Registrar trámite/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Catálogo de empresas/ })).not.toBeInTheDocument();
  });

  it('error y filtros', () => {
    mocks.lista.mockReturnValue(state({ pasantias: [], error: 'Falla de red' }));
    renderWithProviders(<PasantiasList />);
    expect(screen.getByText(/Falla de red/)).toBeInTheDocument();
    expect(screen.getAllByLabelText('Filtrar por estado').length).toBeGreaterThan(0);
  });
});

describe('PasantiaDetail', () => {
  const state = (extra = {}) => ({
    pasantia,
    loading: false,
    error: null,
    refetch: vi.fn(),
    breadcrumbItems: bc,
    handleVolver: vi.fn(),
    handleEditar: vi.fn(),
    informeVerificacion: { informe: null, descargando: false, onDescargar: vi.fn(), onEmitir: vi.fn() },
    transicionModal: { open: false, abrir: vi.fn(), cerrar: vi.fn(), submit: vi.fn(), saving: false, transiciones: ['FINALIZADA'], avisoInforme: null },
    informes: { items: [], loading: false, error: null, descargandoId: null, abrirEditar: vi.fn(), descargar: vi.fn(), drawer: { open: false, informe: null }, cerrarDrawer: vi.fn(), guardar: vi.fn(), guardando: false },
    seguimientos: { items: [], loading: false, error: null, descargandoId: null, abrirNuevo: vi.fn(), abrirEditar: vi.fn(), descargar: vi.fn(), drawer: { open: false, seguimiento: null }, cerrarDrawer: vi.fn(), guardar: vi.fn(), guardando: false },
    ...extra,
  });

  it('sin informe ofrece emitirlo (con permiso) y con informe ofrece descargarlo', async () => {
    const s = state();
    mocks.detalle.mockReturnValue(s);
    const auth = { permisos: [permiso(TITULACION_PERMISOS.pasantiaInforme, 'CREAR'), permiso(TITULACION_PERMISOS.pasantia, 'EXPORTAR', 'APROBAR', 'EDITAR')] };
    const { unmount } = renderWithProviders(<PasantiaDetail />, { auth });
    await userEvent.click(screen.getByRole('button', { name: /Emitir informe de verificación/ }));
    expect(s.informeVerificacion.onEmitir).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Transición de estado/ }));
    expect(s.transicionModal.abrir).toHaveBeenCalled();
    unmount();

    mocks.detalle.mockReturnValue(state({ informeVerificacion: { ...s.informeVerificacion, informe: { id: 1 } }, pasantia: { ...pasantia, tipo: 'CONVALIDACION' } }));
    renderWithProviders(<PasantiaDetail />, { auth });
    expect(screen.getByRole('button', { name: /Descargar informe de convalidación/ })).toBeInTheDocument();
  });

  it('sin transiciones posibles el botón queda deshabilitado', () => {
    const base = state();
    mocks.detalle.mockReturnValue(state({ transicionModal: { ...base.transicionModal, transiciones: [] } }));
    renderWithProviders(<PasantiaDetail />, { auth: { permisos: [permiso(TITULACION_PERMISOS.pasantia, 'APROBAR')] } });
    expect(screen.getByRole('button', { name: /Transición de estado/ })).toBeDisabled();
  });

  it('pestañas de empresa, informes y seguimientos con contador', async () => {
    mocks.detalle.mockReturnValue(state());
    renderWithProviders(<PasantiaDetail />);
    expect(screen.getByRole('tab', { name: /Informes \(0\)/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: /Seguimientos \(0\)/ }));
    expect(await screen.findByText('El trámite aún no tiene seguimientos registrados.')).toBeInTheDocument();
  });

  it('error con reintento y no encontrado', async () => {
    const s = state({ pasantia: null, error: 'Falla' });
    mocks.detalle.mockReturnValue(s);
    const { unmount } = renderWithProviders(<PasantiaDetail />);
    expect(screen.getByText(/Falla/)).toBeInTheDocument();
    unmount();
    mocks.detalle.mockReturnValue(state({ pasantia: null }));
    renderWithProviders(<PasantiaDetail />);
    expect(screen.getByText('No se encontró el trámite solicitado.')).toBeInTheDocument();
  });
});

describe('MiPasantiaPage', () => {
  it('sin trámite muestra la guía; con trámite todo en solo lectura', () => {
    mocks.mia.mockReturnValue({ pasantia: null, informes: [], seguimientos: [], sinPasantia: true, loading: false, error: null, refetch: vi.fn(), breadcrumbItems: bc });
    const { unmount } = renderWithProviders(<MiPasantiaPage />);
    expect(screen.getByText(/Aún no tiene un trámite de pasantía registrado/)).toBeInTheDocument();
    unmount();
    mocks.mia.mockReturnValue({ pasantia, informes: [], seguimientos: [], sinPasantia: false, loading: false, error: null, refetch: vi.fn(), breadcrumbItems: bc });
    renderWithProviders(<MiPasantiaPage />, { auth: { permisos: [permiso(TITULACION_PERMISOS.pasantiaSeguimiento, 'CREAR')] } });
    expect(screen.getByText('Datos del trámite')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Registrar seguimiento/ })).not.toBeInTheDocument();
  });
});

describe('empresas de pasantía', () => {
  it('listado: nueva empresa por permiso y volver', async () => {
    const s = { empresas: [{ id: 1, nombre: 'Tigo' }], loading: false, error: null, searchText: '', handleSearchChange: vi.fn(), tableColumns: [{ title: 'Empresa', dataIndex: 'nombre' }], breadcrumbItems: bc, handleRegistrar: vi.fn(), handleVolver: vi.fn() };
    mocks.empresas.mockReturnValue(s);
    const { unmount } = renderWithProviders(<PasantiasEmpresasList />);
    expect(screen.getByText('Tigo')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Nueva empresa/ })).not.toBeInTheDocument();
    unmount();
    renderWithProviders(<PasantiasEmpresasList />, { auth: { permisos: [permiso(TITULACION_PERMISOS.pasantiaEmpresa, 'CREAR')] } });
    await userEvent.click(screen.getByRole('button', { name: /Nueva empresa/ }));
    expect(s.handleRegistrar).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Volver a pasantías/ }));
    expect(s.handleVolver).toHaveBeenCalled();
  });

  it('detalle: ficha, eliminar por permiso, error y no encontrado', async () => {
    const estado = (extra = {}) => ({ empresa: { nombre: 'Tigo SA', nombreComercial: 'Tigo', activo: true }, loading: false, error: null, breadcrumbItems: bc, handleVolver: vi.fn(), handleEditar: vi.fn(), handleEliminar: vi.fn(), eliminando: false, ...extra });
    const s = estado();
    mocks.empresaDetalle.mockReturnValue(s);
    const { unmount } = renderWithProviders(<PasantiaEmpresaDetail />, { auth: { permisos: [permiso(TITULACION_PERMISOS.pasantiaEmpresa, 'ELIMINAR', 'EDITAR')] } });
    expect(screen.getByRole('heading', { name: 'Tigo' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Eliminar empresa/ }));
    expect(s.handleEliminar).toHaveBeenCalled();
    unmount();
    mocks.empresaDetalle.mockReturnValue(estado({ empresa: null, error: 'Falla' }));
    const { unmount: u2 } = renderWithProviders(<PasantiaEmpresaDetail />);
    expect(screen.getByText('No se pudo cargar la ficha')).toBeInTheDocument();
    u2();
    mocks.empresaDetalle.mockReturnValue(estado({ empresa: null }));
    renderWithProviders(<PasantiaEmpresaDetail />);
    expect(screen.getByText('No se encontró la empresa solicitada.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Eliminar empresa/ })).not.toBeInTheDocument();
  });
});

describe('PasantiaFormPage', () => {
  const Montar = (props) => {
    const [form] = Form.useForm();
    mocks.form.mockReturnValue({
      form,
      pageTitle: 'Registrar trámite',
      breadcrumbItems: bc,
      permisoAccion: 'CREAR',
      loading: false,
      submitLoading: false,
      error: null,
      formSections: { datosTramite: { title: 'Datos del trámite', fields: [{ name: 'observaciones', label: 'Observaciones', type: 'input' }] } },
      estudianteOptions: [{ value: 1, label: 'Pérez Ana' }],
      buscandoEstudiantes: false,
      onBuscarEstudiantes: vi.fn(),
      onEstudianteChange: vi.fn(),
      handleVolver: vi.fn(),
      handleSubmit: vi.fn(),
      isInvalidEditId: false,
      ...props,
    });
    return <PasantiaFormPage />;
  };

  it('muestra el selector de estudiante y guarda con el permiso de la acción', async () => {
    const handleSubmit = vi.fn();
    const auth = { permisos: [permiso(TITULACION_PERMISOS.pasantia, 'CREAR')] };
    const { unmount } = renderWithProviders(<Montar handleSubmit={handleSubmit} />, { auth });
    expect(screen.getByText('Busque por nombre o C.I.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Guardar trámite/ }));
    expect(handleSubmit).toHaveBeenCalled();
    unmount();
    renderWithProviders(<Montar />);
    expect(screen.queryByRole('button', { name: /Guardar trámite/ })).not.toBeInTheDocument();
  });

  it('id inválido y error', () => {
    const { unmount } = renderWithProviders(<Montar isInvalidEditId />);
    expect(screen.getByText('Identificador de trámite inválido')).toBeInTheDocument();
    unmount();
    renderWithProviders(<Montar error="No se pudo cargar" />);
    expect(screen.getByText('No se pudo cargar')).toBeInTheDocument();
  });
});

describe('MisPasantiasSupervisadasPage', () => {
  const state = (extra = {}) => ({
    pasantias: [pasantia],
    loading: false,
    error: null,
    searchText: '',
    handleSearchChange: vi.fn(),
    tableColumns: [{ title: 'Estudiante', dataIndex: 'estudianteNombre' }],
    breadcrumbItems: bc,
    seguimientoDrawer: { open: false, seguimiento: null, pasantia: null },
    cerrarSeguimiento: vi.fn(),
    handleGuardarSeguimiento: vi.fn(),
    guardandoSeguimiento: false,
    ...extra,
  });
  beforeEach(() => mocks.supervisadas.mockReset());

  it('lista, vacío y error', () => {
    mocks.supervisadas.mockReturnValue(state());
    const { unmount } = renderWithProviders(<MisPasantiasSupervisadasPage />);
    expect(screen.getByText('Pérez Ana')).toBeInTheDocument();
    unmount();
    mocks.supervisadas.mockReturnValue(state({ pasantias: [] }));
    const { unmount: u2 } = renderWithProviders(<MisPasantiasSupervisadasPage />);
    expect(screen.getByText('Aún no tiene trámites de pasantía bajo su supervisión.')).toBeInTheDocument();
    u2();
    mocks.supervisadas.mockReturnValue(state({ error: 'Falla' }));
    renderWithProviders(<MisPasantiasSupervisadasPage />);
    expect(screen.getByText('No se pudo cargar su lista de pasantías')).toBeInTheDocument();
  });
});
