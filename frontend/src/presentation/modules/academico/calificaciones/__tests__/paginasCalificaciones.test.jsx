/**
 * Páginas de Calificaciones: coordinación, mis cursos, mi boletín, registro académico
 * (consolidado), bimestre cerrado y conectores. Los hooks de estado se simulan.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '../../../../../test/renderWithProviders.jsx';

const mocks = vi.hoisted(() => ({
  vistaAdmin: vi.fn(),
  misCursos: vi.fn(),
  miBoletin: vi.fn(),
  consolidado: vi.fn(),
  bimestreCons: vi.fn(),
  exportar: vi.fn(),
  navegacion: vi.fn(),
  teclado: vi.fn(),
  viewMode: vi.fn(),
}));
const navigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@application-academico/calificaciones/hooks/useVistaAdminDocentes.js', () => ({
  useVistaAdminDocentes: mocks.vistaAdmin,
}));
vi.mock('@application-academico/calificaciones/hooks/useMisCursosCalificaciones.js', () => ({
  useMisCursosCalificaciones: mocks.misCursos,
}));
vi.mock('@application-academico/calificaciones/hooks/state/useMiBoletin.js', () => ({
  useMiBoletin: mocks.miBoletin,
}));
vi.mock('@application-academico/calificaciones/hooks/useConsolidadoCurso.js', () => ({
  useConsolidadoCurso: mocks.consolidado,
}));
vi.mock('@application-academico/calificaciones/hooks/useBimestreConsolidado.js', () => ({
  useBimestreConsolidado: mocks.bimestreCons,
}));
vi.mock('@application-academico/calificaciones/hooks/useExportRegistroPedagogicoExcel.js', () => ({
  useExportRegistroPedagogicoExcel: () => mocks.exportar(),
}));
vi.mock('@application-academico/calificaciones/hooks/useNavegacionBimestres.js', () => ({
  useNavegacionBimestres: () => mocks.navegacion(),
}));
vi.mock('@application-academico/calificaciones/hooks/useBimestrePagerTeclado.js', () => ({
  useBimestrePagerTeclado: (args) => mocks.teclado(args),
}));
vi.mock('@navigation/hooks/useRouteViewMode.js', () => ({
  useRouteViewMode: () => mocks.viewMode(),
}));
vi.mock('@navigation/components/ModuleEntryConnector.jsx', () => ({
  default: ({ menuKey, inlineElement }) => <div data-testid={`entrada-${menuKey}`}>{inlineElement}</div>,
}));

import CoordinacionPage from '../pages/CoordinacionPage.jsx';
import MisCursosPage from '../pages/MisCursosPage.jsx';
import MiBoletinPage from '../pages/MiBoletinPage.jsx';
import ConsolidadoPage from '../pages/ConsolidadoPage.jsx';
import BimestreConsolidadoPage from '../pages/BimestreConsolidadoPage.jsx';
import CalificacionesEntradaConnector from '../connectors/CalificacionesEntradaConnector.jsx';
import MiBoletinConnector from '../connectors/MiBoletinConnector.jsx';
import MisCursosConnector from '../connectors/MisCursosConnector.jsx';
import ConsolidadoConnector from '../connectors/ConsolidadoConnector.jsx';
import BimestreConsolidadoConnector from '../connectors/BimestreConsolidadoConnector.jsx';
import BimestreConsolidadoSeparador from '../components/BimestreConsolidadoSeparador.jsx';
import CuadernoGrillaSeparador from '../components/CuadernoGrillaSeparador.jsx';
import { render } from '@testing-library/react';

const matchMediaOriginal = window.matchMedia;
beforeEach(() => {
  navigate.mockClear();
  Object.values(mocks).forEach((m) => m.mockReset());
  mocks.viewMode.mockReturnValue({ contextName: null });
  mocks.exportar.mockReturnValue({ exportar: vi.fn(), loading: false });
  mocks.navegacion.mockReturnValue({
    puedeAnterior: true,
    puedeSiguiente: true,
    irAnterior: vi.fn(),
    irSiguiente: vi.fn(),
  });
  window.matchMedia = (query) => ({
    matches: true,
    media: query,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});
afterEach(() => {
  window.matchMedia = matchMediaOriginal;
});

describe('CoordinacionPage', () => {
  const vista = (extra = {}) => ({
    breadcrumbItems: [{ title: 'Calificaciones' }],
    gestionVigente: '2026',
    docentes: [
      { id: 3, nombre: 'Luna Pérez', especialidad: 'Matemática', carreras: [], cantidadMaterias: 2, cantidadCursos: 3, cantidadEstudiantes: 40 },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    busquedaInput: '',
    setBusquedaInput: vi.fn(),
    esBusquedaActiva: false,
    busquedaMinChars: 2,
    prelimLimit: 10,
    ...extra,
  });

  it('lista docentes y navega a mis cursos con el docente elegido', async () => {
    mocks.vistaAdmin.mockReturnValue(vista());
    renderWithProviders(<CoordinacionPage />, {
      auth: { permisos: [permiso('academico.calificacion.coordinacion', 'LISTAR')] },
    });
    expect(screen.getByText('Luna Pérez')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Ver cursos' }));
    expect(navigate).toHaveBeenCalledWith(expect.any(String), {
      state: { docenteId: 3, docenteNombre: 'Luna Pérez' },
    });
  });

  it('RBAC: configuración de notas solo con LISTAR de política', async () => {
    mocks.vistaAdmin.mockReturnValue(vista());
    const { unmount } = renderWithProviders(<CoordinacionPage />);
    expect(screen.queryByRole('button', { name: 'Configuración de notas' })).not.toBeInTheDocument();
    unmount();
    mocks.vistaAdmin.mockReturnValue(vista());
    renderWithProviders(<CoordinacionPage />, {
      auth: { permisos: [permiso('academico.calificacion.politica', 'LISTAR')] },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Configuración de notas' }));
    expect(navigate).toHaveBeenCalledWith(expect.any(String));
  });

  it('sin gestión vigente muestra un guion', () => {
    mocks.vistaAdmin.mockReturnValue(vista({ gestionVigente: null, docentes: [] }));
    renderWithProviders(<CoordinacionPage />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('MisCursosPage', () => {
  const cursos = (extra = {}) => ({
    titulo: 'Mis cursos',
    subtitulo: 'Cursos asignados',
    contextoLinea: 'Docente: Ana',
    cursos: [
      {
        id: 7,
        materia: 'Matemática',
        carrera: 'Sistemas',
        paralelo: 'A',
        turno: 'NOCHE',
        periodo: '1° año',
        estudiantes: 30,
        bimestres: [{ numero: 1, estado: { tipo: 'cerrado', etiqueta: 'Cerrado' }, progreso: 100, aprobados: 20, reprobados: 5 }],
      },
    ],
    docente: { gestionVigente: '2026', bimestreVigente: 1 },
    esVistaCoordinacion: false,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    breadcrumbItems: [{ title: 'Calificaciones' }],
    cursoPath: (id) => `/curso/${id}`,
    periodoLectivoLabel: '1er semestre',
    ...extra,
  });

  it('lista cursos con progreso por bimestre y abre el curso', async () => {
    mocks.misCursos.mockReturnValue(cursos());
    renderWithProviders(<MisCursosPage />);
    expect(screen.getByText('Matemática')).toBeInTheDocument();
    expect(screen.getByText('Progreso por bimestre')).toBeInTheDocument();
    expect(screen.getByText(/Periodo lectivo según calendario académico/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Abrir curso' }));
    expect(navigate).toHaveBeenCalledWith('/curso/7');
  });

  it('volver solo en vista coordinación o con permiso de coordinación', async () => {
    mocks.misCursos.mockReturnValue(cursos());
    const a = renderWithProviders(<MisCursosPage />);
    expect(a.container.querySelector('.ant-btn .anticon-arrow-left')).toBeNull();
    a.unmount();

    mocks.misCursos.mockReturnValue(cursos({ esVistaCoordinacion: true }));
    const b = renderWithProviders(<MisCursosPage />);
    expect(screen.getByText('Cursos del docente')).toBeInTheDocument();
    await userEvent.click(b.container.querySelector('.anticon-arrow-left').closest('button'));
    expect(navigate).toHaveBeenCalled();
    b.unmount();

    mocks.misCursos.mockReturnValue(cursos());
    const c = renderWithProviders(<MisCursosPage />, {
      auth: { permisos: [permiso('academico.calificacion.coordinacion', 'LISTAR')] },
    });
    expect(c.container.querySelector('.anticon-arrow-left')).not.toBeNull();
  });

  it('vacío, error con reintento y carga', async () => {
    mocks.misCursos.mockReturnValue(cursos({ cursos: [] }));
    const a = renderWithProviders(<MisCursosPage />);
    expect(screen.getByText('No tiene cursos asignados en la gestión vigente.')).toBeInTheDocument();
    a.unmount();

    mocks.misCursos.mockReturnValue(cursos({ cursos: [], esVistaCoordinacion: true }));
    const b = renderWithProviders(<MisCursosPage />);
    expect(screen.getByText('Este docente no tiene cursos asignados en la gestión.')).toBeInTheDocument();
    b.unmount();

    const s = cursos({ cursos: [], error: 'Falla' });
    mocks.misCursos.mockReturnValue(s);
    const c = renderWithProviders(<MisCursosPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(s.refetch).toHaveBeenCalled();
    c.unmount();

    mocks.misCursos.mockReturnValue(cursos({ cursos: [], isLoading: true }));
    const d = renderWithProviders(<MisCursosPage />);
    expect(d.container.querySelector('.ant-spin-spinning, .ant-skeleton')).not.toBeNull();
  });
});

describe('MiBoletinPage', () => {
  const boletin = {
    estudiante: { nombreCompleto: 'Juan Pérez Gómez', codigo: 'E-1', ci: '123' },
    carrera: { nombre: 'Sistemas' },
    gestion: { nombre: '2026' },
    promedioGeneral: 72,
  };
  const estado = (extra = {}) => ({
    boletin,
    asignaturas: [
      { asignaturaSigla: 'MAT', asignaturaNombre: 'Algebra', docenteNombre: 'Ana', bim1: 60, bim2: 70, promedioAnual: 65, notaFinal: 65, estado: 'APROBADO' },
    ],
    loading: false,
    error: null,
    descargando: false,
    descargarPdf: vi.fn().mockResolvedValue({ success: true }),
    breadcrumbItems: [{ title: 'Mi boletín' }],
    ...extra,
  });

  it('muestra la ficha del estudiante y la tabla de notas', () => {
    mocks.miBoletin.mockReturnValue(estado());
    renderWithProviders(<MiBoletinPage />);
    expect(screen.getByText('Juan Pérez Gómez')).toBeInTheDocument();
    expect(screen.getByText('Sistemas · 2026')).toBeInTheDocument();
    expect(screen.getByText('Gestión 2026')).toBeInTheDocument();
    expect(screen.getByText('Algebra')).toBeInTheDocument();
    expect(screen.getByText('APROBADO')).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();
  });

  it('descarga anual y por bimestre desde el menú', async () => {
    const s = estado();
    mocks.miBoletin.mockReturnValue(s);
    renderWithProviders(<MiBoletinPage />);
    await userEvent.click(screen.getByRole('button', { name: /Descargar PDF/ }));
    await userEvent.click(await screen.findByText('Boletín anual'));
    expect(s.descargarPdf).toHaveBeenLastCalledWith(undefined);
    await userEvent.click(screen.getByRole('button', { name: /Descargar PDF/ }));
    await userEvent.click(await screen.findByText('Boletín del 3º bimestre'));
    expect(s.descargarPdf).toHaveBeenLastCalledWith({ bimestre: 3 });
  });

  it('un fallo de descarga se notifica', async () => {
    const s = estado({ descargarPdf: vi.fn().mockResolvedValue({ success: false, error: 'Sin conexión' }) });
    mocks.miBoletin.mockReturnValue(s);
    renderWithProviders(<MiBoletinPage />);
    await userEvent.click(screen.getByRole('button', { name: /Descargar PDF/ }));
    await userEvent.click(await screen.findByText('Boletín anual'));
    expect(await screen.findByText('Sin conexión')).toBeInTheDocument();
  });

  it('sin notas, sin boletín, carga y error', () => {
    mocks.miBoletin.mockReturnValue(estado({ asignaturas: [] }));
    const a = renderWithProviders(<MiBoletinPage />);
    expect(screen.getByText('Aún no hay notas registradas.')).toBeInTheDocument();
    a.unmount();

    mocks.miBoletin.mockReturnValue(estado({ boletin: null, asignaturas: [] }));
    const b = renderWithProviders(<MiBoletinPage />);
    expect(screen.getByText('No se encontró su boletín.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Descargar PDF/ })).not.toBeInTheDocument();
    b.unmount();

    mocks.miBoletin.mockReturnValue(estado({ boletin: null, asignaturas: [], loading: true }));
    const c = renderWithProviders(<MiBoletinPage />);
    expect(c.container.querySelector('.ant-spin, .ant-skeleton')).not.toBeNull();
    c.unmount();

    mocks.miBoletin.mockReturnValue(estado({ boletin: null, asignaturas: [], error: 'Falla del servidor' }));
    renderWithProviders(<MiBoletinPage />);
    expect(screen.getByText(/Falla del servidor/)).toBeInTheDocument();
  });
});

describe('ConsolidadoPage', () => {
  const estado = (extra = {}) => ({
    curso: { materia: 'Matemática', materiaSigla: 'MAT', carrera: 'Sistemas', paralelo: 'A' },
    docente: { nombre: 'Ana', bimestreVigente: 2 },
    estudiantes: [{ nro: 1, nombre: 'PEREZ JUAN', codigo: 'E-1', notaFinal: 70, observacion: 'APROBADO', bimestres: [] }],
    bimestreTitulos: ['Bimestre 1', 'Bimestre 2'],
    bimestresCalendario: [
      { numero: 1, estadoCalendario: 'cerrado' },
      { numero: 2, estadoCalendario: 'abierto' },
    ],
    bimestreVigente: 2,
    notaMinimaAprobacion: 61,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    breadcrumbItems: [{ title: 'Calificaciones' }],
    volverPath: '/mis-cursos',
    asignacionId: 9,
    ...extra,
  });

  it('muestra la ficha del curso y la grilla; abre consolidado o cuaderno según el estado', async () => {
    mocks.consolidado.mockReturnValue(estado());
    renderWithProviders(<ConsolidadoPage />);
    expect(screen.getByRole('heading', { name: 'Matemática' })).toBeInTheDocument();
    expect(screen.getByText('PEREZ JUAN')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Ver consolidado/ }));
    expect(navigate).toHaveBeenLastCalledWith(expect.stringContaining('9'));
    const consolidadoPath = navigate.mock.calls.at(-1)[0];
    await userEvent.click(screen.getByRole('button', { name: /Abrir cuaderno/ }));
    expect(navigate.mock.calls.at(-1)[0]).not.toBe(consolidadoPath);
  });

  it('sin asignación no navega al abrir un bimestre', async () => {
    mocks.consolidado.mockReturnValue(estado({ asignacionId: null }));
    renderWithProviders(<ConsolidadoPage />);
    await userEvent.click(screen.getByRole('button', { name: /Abrir cuaderno/ }));
    expect(navigate).not.toHaveBeenCalled();
  });

  it('volver usa la ruta del hook', async () => {
    mocks.consolidado.mockReturnValue(estado());
    renderWithProviders(<ConsolidadoPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Volver a mis cursos' }));
    expect(navigate).toHaveBeenCalledWith('/mis-cursos');
  });

  it('carga y error con reintento', async () => {
    mocks.consolidado.mockReturnValue(estado({ curso: null, isLoading: true }));
    const a = renderWithProviders(<ConsolidadoPage />);
    expect(screen.getByText('Cargando registro académico…')).toBeInTheDocument();
    a.unmount();
    const s = estado({ curso: null, error: 'Falla' });
    mocks.consolidado.mockReturnValue(s);
    renderWithProviders(<ConsolidadoPage />);
    expect(screen.getByText('No se pudo cargar el registro académico')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(s.refetch).toHaveBeenCalled();
  });
});

describe('BimestreConsolidadoPage', () => {
  const estado = (extra = {}) => ({
    curso: { materia: 'Matemática', carrera: 'Sistemas', paralelo: 'A' },
    docente: { nombre: 'Ana', gestionVigente: '2026' },
    estudiantes: [
      { id: 1, nro: 1, nombre: 'PEREZ JUAN', codigo: 'E-1', practico: 50, teorico: 20, total: 70 },
      { id: 2, nro: 2, nombre: 'ROJAS ANA', codigo: 'E-2', practico: 10, teorico: 5, total: 15 },
    ],
    evaluaciones: [{ id: 1 }, { id: 2 }],
    cuotaTeorico: 30,
    cuotaPractico: 70,
    bimestreActivo: 1,
    bimestreVigente: 2,
    bimestreTitulo: 'Bimestre 1',
    periodoConsolidado: { fechaInicio: '2026-02-01', fechaFin: '2026-04-01' },
    isLoading: false,
    isRefetching: false,
    error: null,
    breadcrumbItems: [{ title: 'Calificaciones' }],
    tituloPagina: 'Consolidado del bimestre 1',
    volverPath: '/registro',
    cursoId: 9,
    esVistaCoordinacion: false,
    reabrirBimestre: vi.fn().mockResolvedValue(undefined),
    ...extra,
  });

  it('muestra contexto, periodo, grilla y leyenda con máximo 100', () => {
    mocks.bimestreCons.mockReturnValue(estado());
    renderWithProviders(<BimestreConsolidadoPage />);
    expect(screen.getByText('Consolidado del bimestre 1')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Datos del curso y bimestre' })).toBeInTheDocument();
    expect(screen.getByText('PEREZ JUAN')).toBeInTheDocument();
    expect(screen.getByText(/máx\. 100 pts/)).toBeInTheDocument();
    expect(screen.getByText('01/02/2026')).toBeInTheDocument();
    expect(mocks.teclado).toHaveBeenCalledWith(expect.objectContaining({ habilitado: true }));
  });

  it('buscar filtra la grilla', async () => {
    mocks.bimestreCons.mockReturnValue(estado());
    renderWithProviders(<BimestreConsolidadoPage />);
    await userEvent.type(screen.getByLabelText('Buscar estudiante'), 'rojas');
    expect(screen.queryByText('PEREZ JUAN')).not.toBeInTheDocument();
    expect(screen.getByText('ROJAS ANA')).toBeInTheDocument();
    expect(screen.getByText('1 de 2')).toBeInTheDocument();
  });

  it('RBAC: registro pedagógico solo con EXPORTAR y exporta con el curso y bimestre', async () => {
    const exportar = vi.fn().mockResolvedValue({ success: true });
    mocks.exportar.mockReturnValue({ exportar, loading: false });
    mocks.bimestreCons.mockReturnValue(estado());
    const a = renderWithProviders(<BimestreConsolidadoPage />);
    expect(screen.queryByRole('button', { name: /Registro pedagógico/ })).not.toBeInTheDocument();
    a.unmount();
    mocks.bimestreCons.mockReturnValue(estado());
    renderWithProviders(<BimestreConsolidadoPage />, {
      auth: { permisos: [permiso('academico.calificacion.cuaderno', 'EXPORTAR')] },
    });
    await userEvent.click(screen.getByRole('button', { name: /Registro pedagógico/ }));
    expect(exportar).toHaveBeenCalledWith(9, 1);
  });

  it('un error de exportación se notifica', async () => {
    mocks.exportar.mockReturnValue({ exportar: vi.fn().mockResolvedValue({ success: false, error: 'Sin plantilla' }), loading: false });
    mocks.bimestreCons.mockReturnValue(estado());
    renderWithProviders(<BimestreConsolidadoPage />, {
      auth: { permisos: [permiso('academico.calificacion.cuaderno', 'EXPORTAR')] },
    });
    await userEvent.click(screen.getByRole('button', { name: /Registro pedagógico/ }));
    expect(await screen.findByText('Sin plantilla')).toBeInTheDocument();
  });

  it('RBAC: reabrir bimestre solo con EDITAR del ajuste administrativo', async () => {
    mocks.bimestreCons.mockReturnValue(estado());
    const a = renderWithProviders(<BimestreConsolidadoPage />);
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    a.unmount();
    const s = estado();
    mocks.bimestreCons.mockReturnValue(s);
    renderWithProviders(<BimestreConsolidadoPage />, {
      auth: { permisos: [permiso('academico.calificacion.bimestre.ajuste_admin', 'EDITAR')] },
    });
    await userEvent.click(screen.getByRole('switch'));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Reabrir' }));
    await waitFor(() => expect(s.reabrirBimestre).toHaveBeenCalled());
    expect(await screen.findByText('Bimestre reabierto')).toBeInTheDocument();
    expect(navigate).toHaveBeenCalled();
  });

  it('error al reabrir se notifica y no navega', async () => {
    const s = estado({ reabrirBimestre: vi.fn().mockRejectedValue(new Error('Cerrado por coordinación')) });
    mocks.bimestreCons.mockReturnValue(s);
    renderWithProviders(<BimestreConsolidadoPage />, {
      auth: { permisos: [permiso('academico.calificacion.bimestre.ajuste_admin', 'EDITAR')] },
    });
    await userEvent.click(screen.getByRole('switch'));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Reabrir' }));
    expect(await screen.findByText('No se pudo reabrir el bimestre')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('volver usa la ruta del hook', async () => {
    mocks.bimestreCons.mockReturnValue(estado());
    renderWithProviders(<BimestreConsolidadoPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Volver al registro académico' }));
    expect(navigate).toHaveBeenCalledWith('/registro');
  });

  it('carga inicial muestra skeleton; error sin datos ofrece reintento', () => {
    mocks.bimestreCons.mockReturnValue(estado({ estudiantes: [], isLoading: true }));
    const a = renderWithProviders(<BimestreConsolidadoPage />);
    expect(screen.getByLabelText('Cargando cuaderno')).toBeInTheDocument();
    expect(mocks.teclado).toHaveBeenLastCalledWith(expect.objectContaining({ habilitado: false }));
    a.unmount();
    mocks.bimestreCons.mockReturnValue(estado({ estudiantes: [], error: 'Falla' }));
    renderWithProviders(<BimestreConsolidadoPage />);
    expect(screen.getByText('No se pudo cargar el consolidado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('error al refrescar con datos se muestra sin ocultar la grilla', () => {
    mocks.bimestreCons.mockReturnValue(estado({ error: 'Se perdió la conexión' }));
    renderWithProviders(<BimestreConsolidadoPage />);
    expect(screen.getByText('Error al actualizar')).toBeInTheDocument();
    expect(screen.getByText('PEREZ JUAN')).toBeInTheDocument();
  });

  it('vista coordinación muestra el nombre del docente', () => {
    mocks.viewMode.mockReturnValue({ contextName: 'Luis Rojas' });
    mocks.bimestreCons.mockReturnValue(estado({ esVistaCoordinacion: true }));
    renderWithProviders(<BimestreConsolidadoPage />);
    expect(screen.getByText('Luis Rojas (vista coordinación)')).toBeInTheDocument();
  });
});

describe('separadores de la hoja', () => {
  it('consolidado: rango, solo fin o sin fechas', () => {
    const { rerender } = render(
      <BimestreConsolidadoSeparador bimestreTitulo="Bimestre 1" fechaInicio="2026-02-01" fechaFin="2026-04-01" onBusquedaChange={vi.fn()} />,
    );
    expect(screen.getByRole('separator')).toHaveTextContent(/periodo del 01\/02\/2026 al 01\/04\/2026/);
    rerender(<BimestreConsolidadoSeparador bimestreTitulo="Bimestre 1" fechaFin="2026-04-01" onBusquedaChange={vi.fn()} />);
    expect(screen.getByRole('separator')).toHaveTextContent(/finalizó el 01\/04\/2026/);
    rerender(<BimestreConsolidadoSeparador onBusquedaChange={vi.fn()} />);
    expect(screen.getByRole('separator')).toHaveTextContent(/Bimestre cerrado\./);
  });

  it('cuaderno: texto por defecto, rango de fechas y búsqueda', async () => {
    const onBusqueda = vi.fn();
    const { rerender } = render(<CuadernoGrillaSeparador onBusquedaChange={onBusqueda} totalEstudiantes={5} filtrados={5} />);
    expect(screen.getByText(/Agregue evaluaciones y registre las notas/)).toBeInTheDocument();
    rerender(
      <CuadernoGrillaSeparador
        bimestreTitulo="Bimestre 2"
        bimestreNum={2}
        fechaInicio="2026-04-02"
        fechaFin="2026-06-02"
        onBusquedaChange={onBusqueda}
        totalEstudiantes={5}
        filtrados={5}
      />,
    );
    expect(screen.getByText('Bimestre 2')).toBeInTheDocument();
    expect(screen.getByText('02/04/2026')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Buscar estudiante'), 'x');
    expect(onBusqueda).toHaveBeenCalledWith('x');
  });
});

describe('conectores de calificaciones', () => {
  it('la entrada de staff incrusta la coordinación', () => {
    mocks.vistaAdmin.mockReturnValue({
      breadcrumbItems: [], gestionVigente: '2026', docentes: [], isLoading: false, error: null, refetch: vi.fn(),
      busquedaInput: '', setBusquedaInput: vi.fn(), esBusquedaActiva: false, busquedaMinChars: 2, prelimLimit: 10,
    });
    renderWithProviders(<CalificacionesEntradaConnector />);
    expect(within(screen.getByTestId('entrada-ACA-CAL')).getByText(/Seleccione\s+uno para revisar sus materias/)).toBeInTheDocument();
  });

  it('el estudiante se redirige a mi boletín', () => {
    mocks.miBoletin.mockReturnValue({ boletin: null, asignaturas: [], loading: true, breadcrumbItems: [] });
    renderWithProviders(<CalificacionesEntradaConnector />, {
      auth: { usuario: { id: 5, rol: { codigo: 'ESTUDIANTE' } } },
    });
    expect(screen.queryByTestId('entrada-ACA-CAL')).not.toBeInTheDocument();
  });

  it('cada conector monta su página', () => {
    mocks.miBoletin.mockReturnValue({ boletin: null, asignaturas: [], loading: false, error: null, breadcrumbItems: [] });
    const a = renderWithProviders(<MiBoletinConnector />);
    expect(screen.getByText('No se encontró su boletín.')).toBeInTheDocument();
    a.unmount();
    mocks.misCursos.mockReturnValue({ titulo: 'Mis cursos', cursos: [], docente: null, esVistaCoordinacion: false, isLoading: false, error: null, refetch: vi.fn(), breadcrumbItems: [], cursoPath: () => '/' });
    const b = renderWithProviders(<MisCursosConnector />);
    expect(screen.getByText('No tiene cursos asignados en la gestión vigente.')).toBeInTheDocument();
    b.unmount();
    mocks.consolidado.mockReturnValue({ curso: null, isLoading: true, estudiantes: [], breadcrumbItems: [], volverPath: '/' });
    const c = renderWithProviders(<ConsolidadoConnector />);
    expect(screen.getByText('Cargando registro académico…')).toBeInTheDocument();
    c.unmount();
    mocks.bimestreCons.mockReturnValue({ estudiantes: [], evaluaciones: [], isLoading: true, breadcrumbItems: [], tituloPagina: 'X' });
    renderWithProviders(<BimestreConsolidadoConnector />);
    expect(screen.getByLabelText('Cargando cuaderno')).toBeInTheDocument();
  });
});
