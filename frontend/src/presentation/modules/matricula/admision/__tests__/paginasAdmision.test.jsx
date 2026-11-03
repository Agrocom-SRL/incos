import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import EstudiantesDetail from '../pages/EstudiantesDetail';
import EstudiantesList from '../pages/EstudiantesList';
import ListConnector from '../connectors/ListConnector';
import DetailConnector from '../connectors/DetailConnector';
import EstudianteAdmisionRedirect from '../connectors/EstudianteAdmisionRedirect';

const mocks = vi.hoisted(() => ({
  detalle: vi.fn(),
  deleteBeca: vi.fn(),
  lista: vi.fn(),
  exportar: vi.fn(),
  misDatos: vi.fn(),
}));
const navigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('@application-matricula/admision/hooks', async (orig) => ({
  ...(await orig()),
  useStudentDetailContext: mocks.detalle,
  useDeleteBecaAsignada: () => ({ deleteBecaAsignada: mocks.deleteBeca }),
}));
vi.mock('@application-matricula/admision/hooks/context/useStudentListContext', () => ({ useStudentListContext: mocks.lista }));
vi.mock('@application-matricula/admision/hooks/features/useExportEstadisticaInscritosExcel', () => ({ useExportEstadisticaInscritosExcel: () => mocks.exportar() }));
vi.mock('@application-pagos/hooks', async (orig) => ({ ...(await orig()), usePagosContextOptional: () => null }));
vi.mock('@/application/modules/perfil/hooks/state/useMisDatosEstudiante.js', () => ({ useMisDatosEstudiante: mocks.misDatos }));
vi.mock('@application-matricula/admision/providers/StudentListProvider', () => ({ StudentListProvider: ({ children }) => <div data-testid="prov-lista">{children}</div> }));
vi.mock('@application-matricula/admision/providers', () => ({
  StudentProvider: ({ children }) => <div>{children}</div>,
  StudentDetailProvider: ({ children, studentId }) => <div data-testid={`prov-detalle-${studentId}`}>{children}</div>,
}));

const handlers = () => ({
  handleRegistrarPago: vi.fn(), handleVerDetallePago: vi.fn(), handleGenerateActaCompromiso: vi.fn(), handleGenerateDeclaracionJurada: vi.fn(),
  handleDownloadActaCompromiso: vi.fn(), handleVerInscripcion: vi.fn(), handleNuevaInscripcion: vi.fn(), refetch: vi.fn(),
});

const detalleBase = (extra = {}) => ({
  loading: false, error: null, student: { student: { id: 3 } },
  studentData: {
    id: 3, codigoEstudiante: 'E-3', nombreCompleto: 'Pérez Luna Ana', ciCompleto: '123 LP', celular: '70000000', emailPersonal: 'ana@x.bo', tipoAdmision: 'NUEVO',
    nombres: 'Ana', municipioResidenciaName: 'La Paz', observaciones: 'Obs',
  },
  guardians: [{ id: 1, firstName: 'María', lastName: 'Luna', cellphone1: '7111' }], documentDeliveries: [{ id: 1, documentacionName: 'Cédula', entregado: true }],
  scholarships: [{ id: 7, scholarshipName: 'Excelencia', state: 'ACTIVA' }], inscripcion: null,
  origins: [{ originType: 'BOLIVIANA', isPrincipal: true, countryName: 'Bolivia', motherTongueName: 'Aymara', birthCity: 'La Paz' }],
  transitability: null, transfer: null, academicData: { tipoAdmision: 'NUEVO', careerId: 4, managementId: 9 }, catalogs: { managements: { 9: { name: 'Gestión', year: 2026 } } },
  access: { tieneAcceso: false }, breadcrumbItems: [{ title: 'Estudiantes' }], avatarInitials: 'PA', profileSubtitle: 'Sistemas · 2026',
  tieneDocumentosFaltantesFlag: false, actaCompromisoData: null, loadingActa: false, loadingDeclaracion: false, hasInscripcion: false,
  estadoAporte: null, loadingEstadoAporte: false, ...handlers(), ...extra,
});

const rol = (codigo) => ({ id: 1, username: 'u', rol: { codigo, nombre: codigo } });

describe('EstudiantesDetail', () => {
  beforeEach(() => {
    navigate.mockClear();
    mocks.deleteBeca.mockReset();
  });

  it('carga, error y estudiante inexistente', () => {
    mocks.detalle.mockReturnValue(detalleBase({ loading: true }));
    const { unmount } = renderWithProviders(<EstudiantesDetail />);
    expect(screen.getByText('Cargando datos del estudiante…')).toBeInTheDocument();
    unmount();
    mocks.detalle.mockReturnValue(detalleBase({ error: 'Falla del servidor' }));
    const e = renderWithProviders(<EstudiantesDetail />);
    expect(screen.getByText('Error al cargar el estudiante')).toBeInTheDocument();
    expect(screen.getByText('Falla del servidor')).toBeInTheDocument();
    e.unmount();
    mocks.detalle.mockReturnValue(detalleBase({ student: null }));
    renderWithProviders(<EstudiantesDetail />);
    expect(screen.getByText('No se encontró información del estudiante')).toBeInTheDocument();
  });

  it('perfil: identidad, contacto y tab de información con datos, nacionalidad y contactos', () => {
    mocks.detalle.mockReturnValue(detalleBase());
    renderWithProviders(<EstudiantesDetail />);
    expect(screen.getByRole('heading', { name: 'Pérez Luna Ana' })).toBeInTheDocument();
    expect(screen.getByText('PA')).toBeInTheDocument();
    expect(screen.getByText('Sistemas · 2026')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'ana@x.bo' }).length).toBeGreaterThan(0);
    expect(screen.getByText('Boliviano')).toBeInTheDocument();
    expect(screen.getByText('Aymara')).toBeInTheDocument();
    expect(screen.getByText('Contactos de emergencia')).toBeInTheDocument();
    expect(screen.getByText('Observaciones')).toBeInTheDocument();
  });

  it('doble nacionalidad junta los países', () => {
    mocks.detalle.mockReturnValue(detalleBase({ origins: [{ isPrincipal: true, countryName: 'Bolivia' }, { countryName: 'Perú' }] }));
    renderWithProviders(<EstudiantesDetail />);
    expect(screen.getByText('Doble nacionalidad')).toBeInTheDocument();
    expect(screen.getByText('Bolivia / Perú')).toBeInTheDocument();
  });

  it('RBAC: acciones del perfil según permisos', async () => {
    const s = detalleBase();
    mocks.detalle.mockReturnValue(s);
    const { unmount } = renderWithProviders(<EstudiantesDetail />, {
      auth: { permisos: [permiso('finanzas.pago.registrar', 'CREAR'), permiso('matricula.inscribir', 'CREAR'), permiso('matricula.admision.editar', 'EDITAR')] },
    });
    await userEvent.click(screen.getByRole('button', { name: /Registrar Pago/ }));
    expect(s.handleRegistrarPago).toHaveBeenCalled();
    await userEvent.click(screen.getAllByRole('button', { name: /Nueva Inscripción/ })[0]);
    expect(s.handleNuevaInscripcion).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Editar estudiante' }));
    expect(navigate).toHaveBeenCalledWith('/estudiantes/3/editar');
    unmount();
    mocks.detalle.mockReturnValue(detalleBase());
    renderWithProviders(<EstudiantesDetail />);
    expect(screen.queryByRole('button', { name: /Registrar Pago/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Nueva Inscripción/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar estudiante' })).not.toBeInTheDocument();
  });

  it('con inscripción el botón principal es Ver Inscripción y el tab Académico detalla la matrícula', async () => {
    const s = detalleBase({
      hasInscripcion: true,
      inscripcion: {
        enrollment: { id: 55, enrollmentType: 'REGULAR', managementId: 9 }, management: { name: 'Gestión Regular', year: 2026 }, career: { code: 'SIS', name: 'Sistemas' },
        studentAcademicData: { registrationStatus: 'ADMITIDO', careerId: 4 }, subjectEnrollments: [{}, {}],
      },
    });
    mocks.detalle.mockReturnValue(s);
    renderWithProviders(<EstudiantesDetail />, { auth: { permisos: [permiso('matricula.inscribir', 'DETALLE')] } });
    await userEvent.click(screen.getByRole('button', { name: /Ver Inscripción/ }));
    expect(s.handleVerInscripcion).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('tab', { name: /Académico/ }));
    expect(await screen.findByText('Inscripción actual')).toBeInTheDocument();
    expect(screen.getAllByText('SIS — Sistemas').length).toBeGreaterThan(0);
    expect(screen.getByText('2 materia(s)')).toBeInTheDocument();
    expect(screen.getByText('ADMITIDO')).toBeInTheDocument();
    expect(screen.getByText('Gestión Regular (2026)')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Ver Detalle/ }));
    expect(s.handleVerInscripcion).toHaveBeenCalledTimes(2);
  });

  it('tab Académico sin inscripción ofrece crearla con permiso y resuelve gestión/carrera por catálogo', async () => {
    const s = detalleBase();
    mocks.detalle.mockReturnValue(s);
    renderWithProviders(<EstudiantesDetail />, { auth: { permisos: [permiso('matricula.inscribir', 'CREAR')] } });
    await userEvent.click(screen.getByRole('tab', { name: /Académico/ }));
    expect(await screen.findByText('Sin inscripción registrada')).toBeInTheDocument();
    expect(screen.getByText('Gestión (2026)')).toBeInTheDocument();
    expect(screen.getByText('ID: 4')).toBeInTheDocument();
    const nueva = screen.getAllByRole('button', { name: /Nueva Inscripción/ });
    await userEvent.click(nueva[nueva.length - 1]);
    expect(s.handleNuevaInscripcion).toHaveBeenCalled();
  });

  it('tab de Transitabilidad o Traspaso aparece solo con esos datos', async () => {
    mocks.detalle.mockReturnValue(detalleBase({ transitability: { institucionNombre: 'Colegio X', estado: 'PROCEDENTE', motivoNoProcedente: 'Ninguno', departamentoId: 2 } }));
    const { unmount } = renderWithProviders(<EstudiantesDetail />);
    await userEvent.click(screen.getByRole('tab', { name: /Transitabilidad/ }));
    expect(await screen.findByText('Colegio X')).toBeInTheDocument();
    expect(screen.getByText('ID: 2')).toBeInTheDocument();
    unmount();
    mocks.detalle.mockReturnValue(detalleBase({ transfer: { institucionNombre: 'Instituto Y', estado: 'NO_PROCEDENTE', motivoNoProcedente: 'Falta documento' } }));
    renderWithProviders(<EstudiantesDetail />);
    await userEvent.click(screen.getByRole('tab', { name: /Traspaso/ }));
    expect(await screen.findByText('Instituto Y')).toBeInTheDocument();
    expect(screen.getByText('Falta documento')).toBeInTheDocument();
  });

  it('tab Pago: resumen del aporte con enlace al detalle o registro según exista cabecera', async () => {
    const aporte = { gestion: { nombre: '2026' }, monto_base: 1500, total_pagado: 500, saldo_pendiente: 1000, cabecera: { id: 4 } };
    const s = detalleBase({ estadoAporte: aporte });
    mocks.detalle.mockReturnValue(s);
    const { unmount } = renderWithProviders(<EstudiantesDetail />, { auth: { permisos: [permiso('finanzas.pago.ver', 'DETALLE')] } });
    await userEvent.click(screen.getByRole('tab', { name: /Pago/ }));
    expect(await screen.findByText('Aporte académico - Gestión 2026')).toBeInTheDocument();
    expect(screen.getByText(/Bs\.\s*1\.?500,00|Bs\.\s*1,500\.00|Bs\.\s*1500/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Ver detalle del pago/ }));
    expect(s.handleVerDetallePago).toHaveBeenCalled();
    unmount();
    mocks.detalle.mockReturnValue(detalleBase({ estadoAporte: { ...aporte, cabecera: null, saldo_pendiente: 0 } }));
    renderWithProviders(<EstudiantesDetail />, { auth: { permisos: [permiso('finanzas.pago.registrar', 'CREAR')] } });
    await userEvent.click(screen.getByRole('tab', { name: /Pago/ }));
    const registrar = await screen.findAllByRole('button', { name: /Registrar pago/i });
    expect(registrar.length).toBeGreaterThan(0);
  });

  it('tab Pago: carga, vacío y becas con eliminación protegida por RBAC', async () => {
    mocks.detalle.mockReturnValue(detalleBase({ loadingEstadoAporte: true }));
    const { unmount } = renderWithProviders(<EstudiantesDetail />);
    await userEvent.click(screen.getByRole('tab', { name: /Pago/ }));
    expect(await screen.findByText('Cargando estado del aporte…')).toBeInTheDocument();
    unmount();

    const s = detalleBase();
    mocks.detalle.mockReturnValue(s);
    mocks.deleteBeca.mockResolvedValue({ success: true });
    const r = renderWithProviders(<EstudiantesDetail />, { auth: { permisos: [permiso('matricula.beca.asignar', 'ELIMINAR')] } });
    await userEvent.click(screen.getByRole('tab', { name: /Pago/ }));
    expect(await screen.findByText('Sin datos de aporte para la gestión vigente.')).toBeInTheDocument();
    expect(screen.getByText('Excelencia')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument();
    r.unmount();
    mocks.detalle.mockReturnValue(detalleBase());
    renderWithProviders(<EstudiantesDetail />);
    await userEvent.click(screen.getByRole('tab', { name: /Pago/ }));
    expect(await screen.findByText('Excelencia')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'delete' })).not.toBeInTheDocument();
  });

  it('tab Documentación y Acceso al sistema solo con datos / permiso', async () => {
    mocks.detalle.mockReturnValue(detalleBase({ documentDeliveries: [] }));
    const { unmount } = renderWithProviders(<EstudiantesDetail />);
    expect(screen.queryByRole('tab', { name: /Documentación/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Acceso al sistema/ })).not.toBeInTheDocument();
    unmount();
    mocks.detalle.mockReturnValue(detalleBase());
    renderWithProviders(<EstudiantesDetail />, { auth: { permisos: [permiso('seguridad.usuario.crear', 'CREAR')] } });
    await userEvent.click(screen.getByRole('tab', { name: /Documentación/ }));
    expect(await screen.findByText('Documentos entregados')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: /Acceso al sistema/ }));
    expect(await screen.findByRole('button', { name: /Crear usuario de acceso/ })).toBeInTheDocument();
  });

  it('actas y declaración requieren GENERAR_PDF', async () => {
    const s = detalleBase({ studentData: { id: 3, nombreCompleto: 'Ana', tipoAdmision: 'TRASPASO' }, tieneDocumentosFaltantesFlag: true });
    mocks.detalle.mockReturnValue(s);
    const { unmount } = renderWithProviders(<EstudiantesDetail />, { auth: { permisos: [permiso('matricula.documento.ver', 'GENERAR_PDF')] } });
    await userEvent.click(screen.getByRole('button', { name: /Declaración Jurada/ }));
    expect(s.handleGenerateDeclaracionJurada).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Generar Acta/ }));
    expect(s.handleGenerateActaCompromiso).toHaveBeenCalled();
    unmount();
    mocks.detalle.mockReturnValue(detalleBase({ actaCompromisoData: { id: 1 } }));
    const conActa = renderWithProviders(<EstudiantesDetail />, { auth: { permisos: [permiso('matricula.documento.ver', 'GENERAR_PDF')] } });
    expect(screen.getByRole('button', { name: /Descargar Acta/ })).toBeInTheDocument();
    conActa.unmount();
    mocks.detalle.mockReturnValue(detalleBase({ tieneDocumentosFaltantesFlag: true }));
    renderWithProviders(<EstudiantesDetail />);
    expect(screen.queryByRole('button', { name: /Generar Acta/ })).not.toBeInTheDocument();
  });

  it('vista propia del estudiante: título "Mis datos" y sin botón Volver', () => {
    mocks.detalle.mockReturnValue(detalleBase());
    renderWithProviders(<EstudiantesDetail />, { auth: { usuario: rol('ESTUDIANTE') } });
    expect(screen.getByRole('heading', { name: 'Mis datos' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Volver/ })).not.toBeInTheDocument();
  });

  it('rama docente: Volver regresa a su roster; admin al listado administrativo', async () => {
    mocks.detalle.mockReturnValue(detalleBase());
    const d = renderWithProviders(<EstudiantesDetail />, { auth: { usuario: rol('DOCENTE') } });
    await userEvent.click(screen.getByRole('button', { name: /Volver/ }));
    expect(navigate).toHaveBeenLastCalledWith('/matricula/listar');
    d.unmount();
    renderWithProviders(<EstudiantesDetail />);
    await userEvent.click(screen.getByRole('button', { name: /Volver/ }));
    expect(navigate).toHaveBeenLastCalledWith('/estudiantes/listar');
  });
});

describe('EstudiantesList', () => {
  const lista = (extra = {}) => ({
    estudiantes: [
      { id: 1, codigoEstudiante: 'E-1', nombreCompleto: 'Pérez Ana', carreraNombre: 'Sistemas', carreraCodigo: 'SIS', carreraColorHex: '#336699', estadoAcademico: 'ACTIVO' },
      { id: 2, codigoEstudiante: 'E-2', nombreCompleto: 'Rojas Beto', carreraNombre: 'Contaduría', carreraCodigo: 'CON' },
    ],
    loading: false, error: null, searchText: '', setSearchText: vi.fn(), refetch: vi.fn(), deleteStudent: vi.fn(), tablePagination: false, ...extra,
  });

  const matchMediaOriginal = window.matchMedia;
  beforeEach(() => {
    navigate.mockClear();
    mocks.exportar.mockReturnValue({ exportar: vi.fn().mockResolvedValue({ success: true }), loading: false });
    // Pantalla ancha: AntD oculta las columnas `responsive` cuando ningún breakpoint coincide.
    window.matchMedia = (query) => ({ matches: true, media: query, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });
  afterEach(() => {
    window.matchMedia = matchMediaOriginal;
  });

  it('lista estudiantes por carrera y alta protegida por CREAR', async () => {
    mocks.lista.mockReturnValue(lista());
    const { unmount } = renderWithProviders(<EstudiantesList />, { auth: { permisos: [permiso('matricula.admision.crear', 'CREAR')] } });
    expect(screen.getAllByText('Lista de estudiantes').length).toBeGreaterThan(0);
    expect(screen.getByRole('tab', { name: /Contaduría/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: /Sistemas/ }));
    expect(await screen.findByText('PÉREZ ANA')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Nuevo Estudiante/ }));
    expect(navigate).toHaveBeenCalledWith('/estudiantes/registrar');
    unmount();
    mocks.lista.mockReturnValue(lista());
    renderWithProviders(<EstudiantesList />);
    expect(screen.queryByRole('button', { name: /Nuevo Estudiante/ })).not.toBeInTheDocument();
  });

  it('el buscador delega en el contexto', async () => {
    const s = lista();
    mocks.lista.mockReturnValue(s);
    renderWithProviders(<EstudiantesList />);
    await userEvent.type(screen.getByPlaceholderText(/Buscar por código, nombre/), 'a');
    expect(s.setSearchText).toHaveBeenCalledWith('a');
  });

  it('exportar la estadística exige EXPORTAR y notifica el resultado', async () => {
    mocks.lista.mockReturnValue(lista());
    const exportar = vi.fn().mockResolvedValue({ success: true });
    mocks.exportar.mockReturnValue({ exportar, loading: false });
    renderWithProviders(<EstudiantesList />, { auth: { permisos: [permiso('matricula.admision.ver', 'EXPORTAR')] } });
    await userEvent.click(screen.getByRole('button', { name: /Exportar estadística inscritos/ }));
    expect(exportar).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Archivo descargado')).toBeInTheDocument();
  });

  it('un fallo de exportación muestra el motivo', async () => {
    mocks.lista.mockReturnValue(lista());
    mocks.exportar.mockReturnValue({ exportar: vi.fn().mockResolvedValue({ success: false, error: 'Sin datos' }), loading: false });
    renderWithProviders(<EstudiantesList />, { auth: { permisos: [permiso('matricula.admision.ver', 'EXPORTAR')] } });
    await userEvent.click(screen.getByRole('button', { name: /Exportar estadística inscritos/ }));
    expect(await screen.findByText('Sin datos')).toBeInTheDocument();
  });

  it('sin permiso de exportar no hay botón; error y vacío se muestran', () => {
    mocks.lista.mockReturnValue(lista({ estudiantes: [], error: 'No se pudo cargar' }));
    renderWithProviders(<EstudiantesList />);
    expect(screen.queryByRole('button', { name: /Exportar/ })).not.toBeInTheDocument();
    expect(screen.getByText(/No se pudo cargar/)).toBeInTheDocument();
  });
});

describe('conectores de admisión', () => {
  beforeEach(() => {
    mocks.lista.mockReturnValue({ estudiantes: [], loading: false, error: null, searchText: '', setSearchText: vi.fn(), tablePagination: false });
    mocks.exportar.mockReturnValue({ exportar: vi.fn(), loading: false });
    mocks.misDatos.mockReturnValue({ misDatos: null, loadingMisDatos: false, errorMisDatos: null });
  });

  it('ListConnector: un estudiante es redirigido a su ficha; el resto ve el listado', () => {
    const e = renderWithProviders(<ListConnector />, { auth: { usuario: { ...rol('ESTUDIANTE'), vinculo_perfil: { referencia_id: 41 } } } });
    expect(screen.queryByTestId('prov-lista')).not.toBeInTheDocument();
    e.unmount();
    renderWithProviders(<ListConnector />);
    expect(screen.getByTestId('prov-lista')).toBeInTheDocument();
  });

  it('DetailConnector pasa el id de la ruta al provider', () => {
    mocks.detalle.mockReturnValue(detalleBase());
    renderWithProviders(<DetailConnector />);
    expect(screen.getByTestId('prov-detalle-undefined')).toBeInTheDocument();
  });

  it('redirect: usa el id de sesión', () => {
    renderWithProviders(<EstudianteAdmisionRedirect />, { auth: { usuario: { ...rol('ESTUDIANTE'), vinculo_perfil: { referencia_id: 41 } } } });
    expect(screen.queryByText('No se pudieron abrir sus datos')).not.toBeInTheDocument();
  });

  it('redirect: sin id de sesión consulta mis datos y muestra la espera', () => {
    mocks.misDatos.mockReturnValue({ misDatos: null, loadingMisDatos: true, errorMisDatos: null });
    renderWithProviders(<EstudianteAdmisionRedirect />);
    expect(screen.getByText('Abriendo sus datos…')).toBeInTheDocument();
  });

  it('redirect: error o usuario sin vínculo muestra la alerta', () => {
    mocks.misDatos.mockReturnValue({ misDatos: null, loadingMisDatos: false, errorMisDatos: 'Falla del servidor' });
    const e = renderWithProviders(<EstudianteAdmisionRedirect />);
    expect(within(e.container).getByText('No se pudieron abrir sus datos')).toBeInTheDocument();
    expect(screen.getByText('Falla del servidor')).toBeInTheDocument();
  });

  it('redirect: el id de mis datos también sirve', () => {
    mocks.misDatos.mockReturnValue({ misDatos: { student: { id: 77 } }, loadingMisDatos: false, errorMisDatos: null });
    renderWithProviders(<EstudianteAdmisionRedirect />);
    expect(screen.queryByText('No se pudieron abrir sus datos')).not.toBeInTheDocument();
  });
});
