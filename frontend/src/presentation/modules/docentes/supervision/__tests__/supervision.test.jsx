/**
 * Supervisión docente: ficha (lectura), formulario, columnas, tab del portal, páginas y conectores.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { renderWithProviders, permiso } from '../../../../../test/renderWithProviders.jsx';
import { renderCell, renderCells, findColumn } from '../../../../../test/renderColumns.jsx';

const mocks = vi.hoisted(() => ({
  lista: vi.fn(),
  detalle: vi.fn(),
  formulario: vi.fn(),
  mis: vi.fn(),
}));
const navigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@application-docentes/supervision/hooks/state/useFichasSeguimientoListPage', () => ({
  useFichasSeguimientoListPage: () => mocks.lista(),
}));
vi.mock('@application-docentes/supervision/hooks/state/useFichaSeguimientoDetailPage', () => ({
  useFichaSeguimientoDetailPage: () => mocks.detalle(),
}));
vi.mock('@application-docentes/supervision/hooks/state/useFichaSeguimientoFormPage', () => ({
  useFichaSeguimientoFormPage: (...a) => mocks.formulario(...a),
}));
vi.mock('@application-docentes/supervision/hooks/state/useMisFichasSeguimientoSection', () => ({
  useMisFichasSeguimientoSection: (...a) => mocks.mis(...a),
}));
vi.mock('@application-docentes/supervision/providers/FichasSeguimientoListProvider', () => ({
  FichasSeguimientoListProvider: ({ children }) => <div data-testid="prov-lista">{children}</div>,
}));
vi.mock('@application-docentes/supervision/providers/FichaSeguimientoDetailProvider', () => ({
  FichaSeguimientoDetailProvider: ({ children, fichaId }) => <div data-testid={`prov-detalle-${fichaId}`}>{children}</div>,
}));
vi.mock('@application-docentes/supervision/providers/FichaSeguimientoFormProvider', () => ({
  FichaSeguimientoFormProvider: ({ children, fichaId }) => <div data-testid={`prov-form-${fichaId ?? 'nuevo'}`}>{children}</div>,
}));

import FichaSeguimientoFichaView from '../components/organisms/FichaSeguimientoFichaView.jsx';
import FichaSeguimientoFormSections from '../components/organisms/FichaSeguimientoFormSections.jsx';
import MisFichasSeguimientoTab from '../components/organisms/MisFichasSeguimientoTab.jsx';
import { createFichasSeguimientoTableColumns } from '../config/fichasSeguimientoTableColumns.jsx';
import FichasSeguimientoList from '../pages/FichasSeguimientoList.jsx';
import FichaSeguimientoDetail from '../pages/FichaSeguimientoDetail.jsx';
import FichaSeguimientoFormPage from '../pages/FichaSeguimientoFormPage.jsx';
import FichasSeguimientoListConnector from '../connectors/FichasSeguimientoListConnector.jsx';
import FichaSeguimientoDetailConnector from '../connectors/FichaSeguimientoDetailConnector.jsx';
import FichaSeguimientoFormCreateConnector from '../connectors/FichaSeguimientoFormCreateConnector.jsx';
import FichaSeguimientoFormEditConnector from '../connectors/FichaSeguimientoFormEditConnector.jsx';

const PERMISO = 'docentes.supervision.ficha';
const con = (...acciones) => ({ auth: { permisos: [permiso(PERMISO, ...acciones)] } });

const matchMediaOriginal = window.matchMedia;
beforeEach(() => {
  navigate.mockClear();
  Object.values(mocks).forEach((m) => m.mockReset());
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

const fichaResumen = {
  id: 4,
  fechaLabel: '10/03/2026',
  fechaSeguimiento: '2026-03-10',
  docenteNombre: 'Ana Gómez',
  evaluadorNombre: 'Luis Rojas',
  asignaturaLabel: 'MAT-1 — Matemática',
  asignaturaSigla: 'MAT-1',
  carreraNombre: 'Sistemas',
  carreraParaleloLabel: 'Sistemas · A',
  cursoParaleloLabel: '1er Año',
  paraleloTurno: 'Noche',
  docsPresentados: 4,
  docsCompletos: '4/4',
  estudiantesEnPlanilla: 30,
  estudiantesAsistentes: 25,
};
const fichaCompleta = {
  ...fichaResumen,
  tieneCronogramaBimestral: true,
  tienePlanBimestral: false,
  tieneRegistroAsistencia: true,
  tieneRegistroPedagogico: null,
  obsDocumentacion: 'Falta plan',
  obsAvanceAsignatura: 'Al día',
  obsRecursos: 'Pizarra',
  otrasObservaciones: 'Ninguna',
};

describe('FichaSeguimientoFichaView', () => {
  it('no renderiza sin ficha', () => {
    const { container } = render(<FichaSeguimientoFichaView ficha={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('ficha completa: documentación Sí/No/—, estructura y otras observaciones', () => {
    render(<FichaSeguimientoFichaView ficha={fichaCompleta} />);
    expect(screen.getByText('Datos de la observación')).toBeInTheDocument();
    expect(screen.getByText('Ana Gómez')).toBeInTheDocument();
    expect(screen.getByText('1er Año · Noche')).toBeInTheDocument();
    expect(screen.getByText('Documentación (lista de asistencia)')).toBeInTheDocument();
    expect(screen.getAllByText('Sí').length).toBe(2);
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Falta plan')).toBeInTheDocument();
    expect(screen.getByText('Estructura mínima de la clase — observaciones')).toBeInTheDocument();
    expect(screen.getByText('Pizarra')).toBeInTheDocument();
    expect(screen.getAllByText('Otras observaciones').length).toBeGreaterThanOrEqual(2);
  });

  it('fila resumen (sin detalle) oculta documentación y observaciones', () => {
    render(<FichaSeguimientoFichaView ficha={fichaResumen} />);
    expect(screen.getByText('Cantidad de estudiantes')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.queryByText('Documentación (lista de asistencia)')).not.toBeInTheDocument();
    expect(screen.queryByText('Estructura mínima de la clase — observaciones')).not.toBeInTheDocument();
  });

  it('cantidades ausentes se muestran como guion', () => {
    render(<FichaSeguimientoFichaView ficha={{ id: 1, docenteNombre: 'X' }} />);
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
  });
});

describe('FichaSeguimientoFormSections', () => {
  const Host = ({ formSections, footer }) => {
    const [form] = Form.useForm();
    return (
      <Form form={form}>
        <FichaSeguimientoFormSections form={form} formSections={formSections} footer={footer} />
      </Form>
    );
  };
  const campo = (name, label) => ({ name, label, type: 'input' });

  it('sin datos de observación no renderiza', () => {
    const { container } = render(<Host formSections={{}} />);
    expect(container.querySelector('.cfg-academico-form-workspace')).toBeNull();
  });

  it('compone la tarjeta con las secciones internas con campos', () => {
    renderWithProviders(
      <Host
        footer={<button type="button">Guardar ficha</button>}
        formSections={{
          datosObservacion: { title: 'Datos de la observación', description: 'Quién y cuándo', fields: [campo('fecha', 'Fecha')] },
          documentacion: { title: 'Documentación', fields: [campo('obsDoc', 'Obs. documentación')] },
          cantidadEstudiantes: { title: 'Cantidad', fields: [] },
          estructuraClase: { title: 'Estructura', fields: [campo('obsAvance', 'Avance')] },
        }}
      />,
    );
    expect(screen.getByText('Datos de la observación')).toBeInTheDocument();
    expect(screen.getByText('Quién y cuándo')).toBeInTheDocument();
    expect(screen.getByText('Fecha')).toBeInTheDocument();
    expect(screen.getByText('Documentación')).toBeInTheDocument();
    expect(screen.getByText('Estructura')).toBeInTheDocument();
    expect(screen.queryByText('Cantidad')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar ficha' })).toBeInTheDocument();
  });
});

describe('createFichasSeguimientoTableColumns', () => {
  const listNavState = { from: 'lista' };
  const columns = createFichasSeguimientoTableColumns({ navigate, listNavState });

  it('renderiza docente, curso, fecha y resultado', () => {
    const cells = renderCells(columns, fichaResumen, { index: 1, rowOffset: 10 });
    expect(cells.nro).toBe('12');
    expect(cells.docente).toContain('Ana Gómez');
    expect(cells.docente).toContain('MAT-1');
    expect(cells.cursoCarrera).toContain('Sistemas · A');
    expect(cells.fechaEvaluador).toContain('10/03/2026');
    expect(cells.fechaEvaluador).toContain('Luis Rojas');
    expect(cells.resultado).toBe('docs 4/4 · asistencia 25/30');
  });

  it('docente ausente y resultado sin asistencia', () => {
    expect(renderCell(findColumn(columns, 'docente'), {}).text).toContain('Sin docente');
    expect(renderCell(findColumn(columns, 'resultado'), { docsPresentados: 2 }).text).toBe('docs 2/4');
  });

  it('comparadores de orden', () => {
    expect(findColumn(columns, 'docente').sortCompare({ docenteNombre: 'A' }, { docenteNombre: 'B' })).toBeLessThan(0);
    expect(findColumn(columns, 'cursoCarrera').sortCompare({ carreraParaleloLabel: 'B' }, { carreraParaleloLabel: 'A' })).toBeGreaterThan(0);
    expect(findColumn(columns, 'fechaEvaluador').sortCompare({ fechaSeguimiento: '2026-01-01' }, { fechaSeguimiento: '2026-02-01' })).toBeLessThan(0);
    expect(findColumn(columns, 'resultado').sortCompare({ docsPresentados: 4 }, { docsPresentados: 1 })).toBe(3);
  });

  it('RBAC: ver y editar solo con su acción y navegan con el estado de la lista', async () => {
    const col = findColumn(columns, 'acciones');
    const a = renderCell(col, fichaResumen);
    expect(a.container.querySelector('[aria-label="eye"]')).toBeNull();
    expect(a.container.querySelector('[aria-label="edit"]')).toBeNull();
    a.unmount();
    const b = renderCell(col, fichaResumen, con('DETALLE', 'EDITAR'));
    await userEvent.click(b.container.querySelector('[aria-label="eye"]').closest('button'));
    expect(navigate).toHaveBeenLastCalledWith('/docentes/supervision/4', { state: listNavState });
    await userEvent.click(b.container.querySelector('[aria-label="edit"]').closest('button'));
    expect(navigate).toHaveBeenLastCalledWith('/docentes/supervision/4/editar', { state: listNavState });
    expect(b.container.querySelector('[aria-label="delete"]')).toBeNull();
  });
});

describe('MisFichasSeguimientoTab', () => {
  const estado = (extra = {}) => ({
    fichas: [fichaCompleta],
    loading: false,
    error: null,
    fichaSeleccionada: null,
    verFicha: vi.fn(),
    cerrarFicha: vi.fn(),
    ...extra,
  });

  it('lista las fichas propias, abre y cierra la ficha', async () => {
    const s = estado();
    mocks.mis.mockReturnValue(s);
    const { rerender } = renderWithProviders(<MisFichasSeguimientoTab />);
    expect(mocks.mis).toHaveBeenCalledWith({ enabled: true });
    expect(screen.getByText('10/03/2026')).toBeInTheDocument();
    expect(screen.getByText('Luis Rojas')).toBeInTheDocument();
    expect(screen.getByText('docs 4/4 · asistencia 25/30')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Ver ficha completa' }));
    expect(s.verFicha).toHaveBeenCalledWith(fichaCompleta);

    mocks.mis.mockReturnValue(estado({ fichaSeleccionada: fichaCompleta }));
    rerender(<MisFichasSeguimientoTab />);
    expect(await screen.findByText('Ficha de seguimiento')).toBeInTheDocument();
    expect(await screen.findByText('Datos de la observación')).toBeInTheDocument();
  });

  it('respeta enabled=false (carga lazy)', () => {
    mocks.mis.mockReturnValue(estado({ fichas: [] }));
    renderWithProviders(<MisFichasSeguimientoTab enabled={false} />);
    expect(mocks.mis).toHaveBeenCalledWith({ enabled: false });
  });

  it('vacío, error y carga', () => {
    mocks.mis.mockReturnValue(estado({ fichas: [] }));
    const a = renderWithProviders(<MisFichasSeguimientoTab />);
    expect(screen.getByText('Aún no tiene fichas de seguimiento registradas.')).toBeInTheDocument();
    a.unmount();
    mocks.mis.mockReturnValue(estado({ fichas: [], error: 'Falla del servidor' }));
    const b = renderWithProviders(<MisFichasSeguimientoTab />);
    expect(screen.getByText('Falla del servidor')).toBeInTheDocument();
    b.unmount();
    mocks.mis.mockReturnValue(estado({ fichas: [], loading: true }));
    const c = renderWithProviders(<MisFichasSeguimientoTab />);
    expect(c.container.querySelector('.ant-spin-spinning')).not.toBeNull();
  });
});

describe('FichasSeguimientoList', () => {
  const lista = (extra = {}) => ({
    fichas: [fichaResumen],
    loading: false,
    error: null,
    searchText: '',
    handleSearchChange: vi.fn(),
    tableColumns: createFichasSeguimientoTableColumns({ navigate, listNavState: {} }),
    breadcrumbItems: [{ title: 'Supervisión' }],
    handleRegistrar: vi.fn(),
    tablePagination: false,
    ...extra,
  });

  it('lista las fichas y RBAC de registrar', async () => {
    const s = lista();
    mocks.lista.mockReturnValue(s);
    const a = renderWithProviders(<FichasSeguimientoList />);
    expect(screen.getByText('Fichas de seguimiento')).toBeInTheDocument();
    expect(screen.getByText(/Ana Gómez/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Registrar ficha/ })).not.toBeInTheDocument();
    a.unmount();
    mocks.lista.mockReturnValue(s);
    renderWithProviders(<FichasSeguimientoList />, con('CREAR'));
    await userEvent.click(screen.getByRole('button', { name: /Registrar ficha/ }));
    expect(s.handleRegistrar).toHaveBeenCalled();
  });

  it('el buscador delega en el hook', async () => {
    const s = lista();
    mocks.lista.mockReturnValue(s);
    renderWithProviders(<FichasSeguimientoList />);
    await userEvent.type(screen.getByPlaceholderText(/Buscar por docente, asignatura o evaluador/), 'a');
    expect(s.handleSearchChange).toHaveBeenCalled();
  });

  it('vacío, error y carga', () => {
    mocks.lista.mockReturnValue(lista({ fichas: [] }));
    const a = renderWithProviders(<FichasSeguimientoList />);
    expect(screen.getByText('Aún no hay fichas de seguimiento registradas.')).toBeInTheDocument();
    a.unmount();
    mocks.lista.mockReturnValue(lista({ fichas: [], error: 'Falla del servidor' }));
    const b = renderWithProviders(<FichasSeguimientoList />);
    expect(screen.getByText(/Falla del servidor/)).toBeInTheDocument();
    b.unmount();
    mocks.lista.mockReturnValue(lista({ fichas: [], loading: true }));
    const c = renderWithProviders(<FichasSeguimientoList />);
    expect(c.container.querySelector('.ant-spin, .ant-skeleton')).not.toBeNull();
  });

  it('el conector envuelve en su provider', () => {
    mocks.lista.mockReturnValue(lista({ fichas: [] }));
    renderWithProviders(<FichasSeguimientoListConnector />);
    expect(screen.getByTestId('prov-lista')).toBeInTheDocument();
  });
});

describe('FichaSeguimientoDetail', () => {
  const detalle = (extra = {}) => ({
    ficha: fichaCompleta,
    loading: false,
    error: null,
    breadcrumbItems: [],
    handleVolver: vi.fn(),
    handleEditar: vi.fn(),
    descargandoPdf: false,
    handleExportarPdf: vi.fn(),
    ...extra,
  });

  it('muestra la ficha y RBAC de exportar y editar', async () => {
    const s = detalle();
    mocks.detalle.mockReturnValue(s);
    const a = renderWithProviders(<FichaSeguimientoDetail />);
    expect(screen.getByText('Ana Gómez')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Exportar PDF/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Editar ficha/ })).not.toBeInTheDocument();
    a.unmount();
    mocks.detalle.mockReturnValue(s);
    renderWithProviders(<FichaSeguimientoDetail />, con('EXPORTAR', 'EDITAR'));
    await userEvent.click(screen.getByRole('button', { name: /Exportar PDF/ }));
    await userEvent.click(screen.getByRole('button', { name: /Editar ficha/ }));
    await userEvent.click(screen.getByRole('button', { name: /Volver/ }));
    expect(s.handleExportarPdf).toHaveBeenCalled();
    expect(s.handleEditar).toHaveBeenCalled();
    expect(s.handleVolver).toHaveBeenCalled();
  });

  it('carga, error y no encontrada', () => {
    mocks.detalle.mockReturnValue(detalle({ ficha: null, loading: true }));
    const a = renderWithProviders(<FichaSeguimientoDetail />);
    expect(a.container.querySelector('.ant-spin-spinning')).not.toBeNull();
    a.unmount();
    mocks.detalle.mockReturnValue(detalle({ ficha: null, error: 'Falla' }));
    const b = renderWithProviders(<FichaSeguimientoDetail />);
    expect(screen.getByText('No se pudo cargar la ficha')).toBeInTheDocument();
    b.unmount();
    mocks.detalle.mockReturnValue(detalle({ ficha: null }));
    renderWithProviders(<FichaSeguimientoDetail />);
    expect(screen.getByText('No se encontró la ficha solicitada.')).toBeInTheDocument();
  });

  it('el conector pasa el id de la URL al provider', () => {
    mocks.detalle.mockReturnValue(detalle());
    renderWithProviders(<FichaSeguimientoDetailConnector />, { route: '/' });
    expect(screen.getByTestId(/prov-detalle-/)).toBeInTheDocument();
  });
});

describe('FichaSeguimientoFormPage', () => {
  const formulario = (extra = {}) => ({
    form: null,
    pageTitle: 'Registrar ficha de seguimiento',
    breadcrumbItems: [],
    permisoAccion: 'CREAR',
    loading: false,
    submitLoading: false,
    error: null,
    formSections: {
      datosObservacion: { title: 'Datos de la observación', fields: [{ name: 'fecha', label: 'Fecha de seguimiento', type: 'input' }] },
    },
    handleVolver: vi.fn(),
    handleSubmit: vi.fn(),
    isInvalidEditId: false,
    ...extra,
  });
  // `form` debe ser una instancia real de AntD: se construye con un envoltorio.
  const Wrapper = ({ mode, extra }) => {
    const [form] = Form.useForm();
    mocks.formulario.mockReturnValue(formulario({ form, ...extra }));
    return <FichaSeguimientoFormPage mode={mode} />;
  };

  it('muestra el formulario y guarda según el permiso de la acción', async () => {
    const handleSubmit = vi.fn();
    const a = renderWithProviders(<Wrapper mode="create" extra={{ handleSubmit }} />);
    expect(screen.getByText('Fecha de seguimiento')).toBeInTheDocument();
    expect(mocks.formulario).toHaveBeenCalledWith('create');
    expect(screen.queryByRole('button', { name: /Guardar ficha/ })).not.toBeInTheDocument();
    a.unmount();
    renderWithProviders(<Wrapper mode="create" extra={{ handleSubmit }} />, con('CREAR'));
    await userEvent.click(screen.getByRole('button', { name: /Guardar ficha/ }));
    expect(handleSubmit).toHaveBeenCalled();
  });

  it('edición usa la acción EDITAR', () => {
    renderWithProviders(<Wrapper mode="edit" extra={{ permisoAccion: 'EDITAR', pageTitle: 'Editar ficha' }} />, con('EDITAR'));
    expect(screen.getByRole('button', { name: /Guardar ficha/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Guardar ficha/ })).toBeEnabled();
  });

  it('error y carga', () => {
    const a = renderWithProviders(<Wrapper mode="create" extra={{ error: 'No se pudo guardar' }} />);
    expect(screen.getByText('No se pudo guardar')).toBeInTheDocument();
    a.unmount();
    const b = renderWithProviders(<Wrapper mode="edit" extra={{ loading: true }} />);
    expect(b.container.querySelector('.ant-spin-spinning')).not.toBeNull();
  });

  it('id de edición inválido y volver', async () => {
    const handleVolver = vi.fn();
    mocks.formulario.mockReturnValue(formulario({ isInvalidEditId: true, handleVolver }));
    const { container } = renderWithProviders(<FichaSeguimientoFormPage mode="edit" />);
    expect(screen.getByText('Identificador de ficha inválido')).toBeInTheDocument();
    await userEvent.click(container.querySelector('.anticon-arrow-left').closest('button'));
    expect(handleVolver).toHaveBeenCalled();
  });

  it('los conectores de alta y edición envuelven su provider', () => {
    const Both = () => {
      const [form] = Form.useForm();
      mocks.formulario.mockReturnValue(formulario({ form }));
      return (
        <>
          <FichaSeguimientoFormCreateConnector />
          <FichaSeguimientoFormEditConnector />
        </>
      );
    };
    renderWithProviders(<Both />);
    // Sin :id en la ruta ambos providers reciben fichaId indefinido.
    expect(screen.getAllByTestId('prov-form-nuevo')).toHaveLength(2);
  });
});
