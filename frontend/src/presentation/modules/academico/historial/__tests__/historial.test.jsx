/**
 * Historial académico: cabecera, resumen, transcript, columnas, páginas y conectores.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '../../../../../test/renderWithProviders.jsx';
import { renderCell, renderCells, findColumn } from '../../../../../test/renderColumns.jsx';

const mocks = vi.hoisted(() => ({
  contexto: vi.fn(),
  selector: vi.fn(),
  miId: vi.fn(),
}));
const navigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@application-academico/historial/hooks/context/useHistorialAcademicoContext.js', () => ({
  useHistorialAcademicoContext: () => mocks.contexto(),
}));
vi.mock('@application-academico/historial/hooks/state/useHistorialSelector.js', () => ({
  useHistorialSelector: () => mocks.selector(),
}));
vi.mock('@application-academico/historial/hooks/api/useMiEstudianteId.js', () => ({
  useMiEstudianteId: () => mocks.miId(),
}));
vi.mock('@application-academico/historial/providers/HistorialAcademicoProvider.jsx', () => ({
  HistorialAcademicoProvider: ({ children }) => <div data-testid="prov-historial">{children}</div>,
}));

import HistorialCabecera from '../components/HistorialCabecera.jsx';
import HistorialResumen from '../components/HistorialResumen.jsx';
import HistorialTranscriptTable from '../components/HistorialTranscriptTable.jsx';
import { historialColumns } from '../config/historialColumns.jsx';
import { createHistorialSelectorColumns } from '../config/historialSelectorColumns.jsx';
import HistorialAcademicoPage from '../pages/HistorialAcademicoPage.jsx';
import HistorialSelectorPage from '../pages/HistorialSelectorPage.jsx';
import HistorialAcademicoConnector from '../connectors/HistorialAcademicoConnector.jsx';
import HistorialSelectorConnector from '../connectors/HistorialSelectorConnector.jsx';

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

const estudiante = {
  nombreCompleto: 'PEREZ GOMEZ JUAN',
  ci: '123456',
  expedicion: 'SC',
  matricula: 'M-1',
  nivelFormacion: 'Técnico Superior',
  fechaAdmision: '2023-02-01',
  fechaConclusion: null,
  carreraNombre: 'Sistemas',
  carreraCodigo: 'SIS',
};
const filas = [
  { nro: 1, gestionAnio: 2024, cargaHoraria: 80, periodoNombre: '1er Año', asignaturaSigla: 'MAT-1', asignaturaNombre: 'Matemática', prerrequisitoSigla: null, notaFinal: 70, notaRecuperacion: null, estado: 'APROBADO' },
  { nro: 2, gestionAnio: 2024, cargaHoraria: 60, periodoNombre: '1er Año', asignaturaSigla: 'FIS-1', asignaturaNombre: 'Física', prerrequisitoSigla: 'MAT-1', notaFinal: 30, notaRecuperacion: 45, estado: 'REPROBADO' },
];

describe('HistorialCabecera', () => {
  it('muestra nombre, carrera con código y estadísticas del documento', () => {
    render(<HistorialCabecera estudiante={estudiante} />);
    expect(screen.getByText('PEREZ GOMEZ JUAN')).toBeInTheDocument();
    expect(screen.getByText('Sistemas · SIS')).toBeInTheDocument();
    expect(screen.getByText('ANUAL')).toBeInTheDocument();
    expect(screen.getByText('FORM-SIE-ITT-04')).toBeInTheDocument();
    expect(screen.getByText('Técnico Superior')).toBeInTheDocument();
  });

  it('sin estudiante usa valores de reserva', () => {
    render(<HistorialCabecera />);
    expect(screen.getByText('Historial académico')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(3);
  });

  it('respeta el régimen propio', () => {
    render(<HistorialCabecera estudiante={{ ...estudiante, regimen: 'SEMESTRAL' }} />);
    expect(screen.getByText('SEMESTRAL')).toBeInTheDocument();
  });
});

describe('HistorialResumen', () => {
  it('muestra los tres totales', () => {
    render(<HistorialResumen resumen={{ totalCargaHoraria: 1200, asignaturasAprobadas: 10, asignaturasTotal: 12, promedioGeneral: 68 }} />);
    expect(screen.getByRole('region', { name: 'Resumen del historial académico' })).toBeInTheDocument();
    expect(screen.getByText('1200')).toBeInTheDocument();
    expect(screen.getByText('10 / 12')).toBeInTheDocument();
    expect(screen.getByText('68')).toBeInTheDocument();
  });

  it('sin resumen o con datos parciales cae a guiones', () => {
    const { rerender } = render(<HistorialResumen />);
    expect(screen.getAllByText('—')).toHaveLength(3);
    rerender(<HistorialResumen resumen={{ asignaturasAprobadas: 4 }} />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});

describe('historialColumns y HistorialTranscriptTable', () => {
  it('renderiza las celdas de una fila y usa el índice sin nro', () => {
    const cells = renderCells(historialColumns, filas[0]);
    expect(cells.nro).toBe('1');
    expect(cells.asignaturaNombre).toBe('Matemática');
    expect(cells.prerrequisitoSigla).toBe('—');
    expect(cells.estado).toBe('APROBADO');
    expect(renderCell(findColumn(historialColumns, 'nro'), {}, { index: 4 }).text).toBe('5');
  });

  it.each([
    ['REPROBADO', 'reprobado'],
    ['APROBADO', 'aprobado'],
    ['CONVALIDADO', 'convalidado'],
    ['ABANDONO', 'inactivo'],
  ])('nota de estado %s lleva el modificador %s', (estado, mod) => {
    const { container } = renderCell(findColumn(historialColumns, 'notaFinal'), { notaFinal: 50, estado });
    expect(container.querySelector(`.historial-transcript-grid__nota--${mod}`)).not.toBeNull();
  });

  it('sin estado la observación es un guion', () => {
    expect(renderCell(findColumn(historialColumns, 'estado'), {}).text).toBe('—');
  });

  it('la tabla tiñe las filas reprobadas', () => {
    const { container } = render(<HistorialTranscriptTable filas={filas} />);
    expect(screen.getByText('Física')).toBeInTheDocument();
    expect(container.querySelectorAll('.historial-transcript-grid__row--reprobado')).toHaveLength(1);
  });

  it('usa clave de reserva cuando no hay nro', () => {
    render(<HistorialTranscriptTable filas={[{ gestionAnio: 2024, asignaturaSigla: 'X', periodoNumero: 1, asignaturaNombre: 'Sin nro' }]} />);
    expect(screen.getByText('Sin nro')).toBeInTheDocument();
  });
});

describe('createHistorialSelectorColumns', () => {
  const onVer = vi.fn();
  const columns = createHistorialSelectorColumns({ onVerHistorial: onVer });
  const record = {
    id: 8,
    nombreCompleto: 'perez juan',
    codigoEstudiante: 'E-8',
    ciCompleto: '123 SC',
    gestionIngresoAnio: 2023,
    periodoActualNombre: '2do Año',
    paraleloActual: 'B',
    promedioHistorial: 72.4,
  };

  it('identidad en mayúsculas, C.I., ingreso, año-paralelo y promedio', () => {
    const cells = renderCells(columns, record, { index: 1, rowOffset: 5 });
    expect(cells.nro).toBe('7');
    expect(cells.estudiante).toContain('PEREZ JUAN');
    expect(cells.estudiante).toContain('E-8');
    expect(cells.ci).toContain('123 SC');
    expect(cells.gestionIngresoAnio).toContain('2023');
    expect(cells.periodoParalelo).toContain('2do Año');
    expect(cells.periodoParalelo).toContain('B');
    expect(cells.promedioHistorial).toContain('72');
  });

  it('promedio con tono de aprobado, riesgo o vacío', () => {
    const col = findColumn(columns, 'promedioHistorial');
    expect(renderCell(col, { promedioHistorial: 80 }).container.querySelector('.historial-promedio-tone--aprobado')).not.toBeNull();
    expect(renderCell(col, { promedioHistorial: 20 }).container.querySelector('.historial-promedio-tone--riesgo')).not.toBeNull();
    expect(renderCell(col, { promedioHistorial: null }).text).toContain('—');
  });

  it('año en curso con forma corta y sin nombre', () => {
    const col = findColumn(columns, 'periodoParalelo');
    expect(renderCell(col, { periodoActualNumero: 3 }).text).toContain('3º');
  });

  it('ordenadores', () => {
    expect(findColumn(columns, 'estudiante').sorter({ nombreCompleto: 'A' }, { nombreCompleto: 'B' })).toBeLessThan(0);
    expect(findColumn(columns, 'gestionIngresoAnio').sorter({ gestionIngresoAnio: 2024 }, { gestionIngresoAnio: 2023 })).toBe(1);
    expect(findColumn(columns, 'periodoParalelo').sorter({ periodoActualNumero: 1 }, { periodoActualNumero: 3 })).toBe(-2);
    expect(findColumn(columns, 'promedioHistorial').sorter({ promedioHistorial: 5 }, {})).toBe(6);
  });

  it('RBAC: ver historial solo con DETALLE', async () => {
    const col = findColumn(columns, 'acciones');
    const a = renderCell(col, record);
    expect(screen.queryByRole('button', { name: /Ver historial/ })).not.toBeInTheDocument();
    a.unmount();
    renderCell(col, record, { auth: { permisos: [permiso('academico.historial.academico', 'DETALLE')] } });
    await userEvent.click(screen.getByRole('button', { name: /Ver historial/ }));
    expect(onVer).toHaveBeenCalledWith(record);
  });
});

describe('HistorialAcademicoPage', () => {
  const estado = (extra = {}) => ({
    estudiante,
    filas,
    resumen: { totalCargaHoraria: 140, asignaturasAprobadas: 1, asignaturasTotal: 2, promedioGeneral: 50 },
    loading: false,
    error: null,
    sinFilas: false,
    descargando: false,
    descargandoPdf: false,
    exportarExcel: vi.fn().mockResolvedValue({ success: true }),
    exportarPdf: vi.fn().mockResolvedValue({ success: true }),
    breadcrumbItems: [{ title: 'Historial' }],
    refetch: vi.fn(),
    ...extra,
  });
  const EXPORTAR = { auth: { permisos: [permiso('academico.historial.academico', 'EXPORTAR')] } };

  it('muestra cabecera, resumen y transcript', () => {
    mocks.contexto.mockReturnValue(estado());
    renderWithProviders(<HistorialAcademicoPage />, EXPORTAR);
    expect(screen.getAllByText('PEREZ GOMEZ JUAN').length).toBeGreaterThan(0);
    expect(screen.getByText('Carga horaria total')).toBeInTheDocument();
    expect(screen.getByText('Matemática')).toBeInTheDocument();
  });

  it('RBAC: exportar requiere EXPORTAR', () => {
    mocks.contexto.mockReturnValue(estado());
    renderWithProviders(<HistorialAcademicoPage />);
    expect(screen.queryByRole('button', { name: /Descargar PDF/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Descargar Excel/ })).not.toBeInTheDocument();
  });

  it('exporta Excel y PDF y notifica el resultado', async () => {
    const s = estado();
    mocks.contexto.mockReturnValue(s);
    renderWithProviders(<HistorialAcademicoPage />, EXPORTAR);
    await userEvent.click(screen.getByRole('button', { name: /Descargar Excel/ }));
    expect(s.exportarExcel).toHaveBeenCalled();
    expect(await screen.findByText(/Excel del historial académico/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Descargar PDF/ }));
    expect(s.exportarPdf).toHaveBeenCalled();
    expect(await screen.findByText(/PDF del historial académico/)).toBeInTheDocument();
  });

  it('errores de exportación se notifican', async () => {
    mocks.contexto.mockReturnValue(
      estado({
        exportarExcel: vi.fn().mockResolvedValue({ success: false, error: 'Sin datos' }),
        exportarPdf: vi.fn().mockResolvedValue({ success: false }),
      }),
    );
    renderWithProviders(<HistorialAcademicoPage />, EXPORTAR);
    await userEvent.click(screen.getByRole('button', { name: /Descargar Excel/ }));
    expect(await screen.findByText('Sin datos')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Descargar PDF/ }));
    expect(await screen.findAllByText('No se pudo exportar')).not.toHaveLength(0);
  });

  it('portal del estudiante: solo PDF, sin Excel ni Volver', () => {
    mocks.contexto.mockReturnValue(estado());
    renderWithProviders(<HistorialAcademicoPage />, {
      auth: {
        usuario: { id: 4, rol: { codigo: 'ESTUDIANTE' } },
        permisos: [permiso('academico.historial.academico', 'EXPORTAR')],
      },
    });
    expect(screen.getByRole('button', { name: /Descargar PDF/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Descargar Excel/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Volver/ })).not.toBeInTheDocument();
  });

  it('volver regresa al selector (staff)', async () => {
    mocks.contexto.mockReturnValue(estado());
    renderWithProviders(<HistorialAcademicoPage />);
    await userEvent.click(screen.getByRole('button', { name: /Volver/ }));
    expect(navigate).toHaveBeenCalled();
  });

  it('sin filas: vacío e inhabilita exportar', () => {
    mocks.contexto.mockReturnValue(estado({ filas: [], sinFilas: true }));
    renderWithProviders(<HistorialAcademicoPage />, EXPORTAR);
    expect(screen.getByText('Aún no hay asignaturas registradas en el historial.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Descargar PDF/ })).toBeDisabled();
  });

  it('carga, error con reintento y estudiante inexistente', async () => {
    mocks.contexto.mockReturnValue(estado({ estudiante: null, loading: true }));
    const a = renderWithProviders(<HistorialAcademicoPage />);
    expect(a.container.querySelector('.ant-spin, .ant-skeleton')).not.toBeNull();
    a.unmount();
    const s = estado({ estudiante: null, error: 'Falla del servidor' });
    mocks.contexto.mockReturnValue(s);
    const b = renderWithProviders(<HistorialAcademicoPage />);
    expect(screen.getByText(/Falla del servidor/)).toBeInTheDocument();
    b.unmount();
    mocks.contexto.mockReturnValue(estado({ estudiante: null }));
    renderWithProviders(<HistorialAcademicoPage />);
    expect(screen.getByText('No se encontró el historial de este estudiante.')).toBeInTheDocument();
  });
});

describe('HistorialSelectorPage', () => {
  const estado = (extra = {}) => ({
    query: '',
    onQueryChange: vi.fn(),
    modoBusqueda: false,
    estudiantesLista: [
      { id: 8, nombreCompleto: 'PEREZ JUAN', codigoEstudiante: 'E-8', carreraNombre: 'Sistemas', carreraColorHex: '#336699', ciCompleto: '123' },
    ],
    listaLoading: false,
    listaError: null,
    tablePagination: false,
    resultadosBusqueda: [],
    busquedaLoading: false,
    busquedaError: null,
    ...extra,
  });
  const DETALLE = { auth: { permisos: [permiso('academico.historial.academico', 'DETALLE')] } };

  it('lista estudiantes por carrera y abre su historial', async () => {
    mocks.selector.mockReturnValue(estado());
    renderWithProviders(<HistorialSelectorPage />, DETALLE);
    expect(screen.getByText('Seleccionar estudiante')).toBeInTheDocument();
    expect(screen.getByText('Sistemas')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Ver historial/ }));
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('8'));
  });

  it('el buscador propaga la consulta', async () => {
    const s = estado();
    mocks.selector.mockReturnValue(s);
    renderWithProviders(<HistorialSelectorPage />, DETALLE);
    await userEvent.type(screen.getByPlaceholderText(/Buscar por nombre, código o C\.I\./), 'p');
    expect(s.onQueryChange).toHaveBeenCalledWith('p');
  });

  it('modo búsqueda muestra los resultados', () => {
    mocks.selector.mockReturnValue(
      estado({ modoBusqueda: true, query: 'ro', resultadosBusqueda: [{ id: 9, nombreCompleto: 'ROJAS ANA', ci: '999' }] }),
    );
    renderWithProviders(<HistorialSelectorPage />, DETALLE);
    expect(screen.getByText('ROJAS ANA')).toBeInTheDocument();
  });

  it('error de búsqueda', () => {
    mocks.selector.mockReturnValue(estado({ modoBusqueda: true, query: 'ro', busquedaError: 'No se pudo buscar' }));
    renderWithProviders(<HistorialSelectorPage />, DETALLE);
    expect(screen.getByText(/No se pudo buscar/)).toBeInTheDocument();
  });
});

describe('conectores de historial', () => {
  it('el detalle envuelve la página en su provider', () => {
    mocks.contexto.mockReturnValue({ estudiante: null, loading: true, filas: [], breadcrumbItems: [] });
    renderWithProviders(<HistorialAcademicoConnector />);
    expect(screen.getByTestId('prov-historial')).toBeInTheDocument();
  });

  it('staff ve el selector', () => {
    mocks.selector.mockReturnValue({
      query: '', onQueryChange: vi.fn(), modoBusqueda: false, estudiantesLista: [], listaLoading: false, listaError: null,
      tablePagination: false, resultadosBusqueda: [], busquedaLoading: false, busquedaError: null,
    });
    renderWithProviders(<HistorialSelectorConnector />);
    expect(screen.getByText('Seleccionar estudiante')).toBeInTheDocument();
  });

  it('el estudiante: carga, error y redirección a su historial', () => {
    mocks.miId.mockReturnValue({ estudianteId: null, loading: true, error: null });
    const auth = { usuario: { id: 4, rol: { codigo: 'ESTUDIANTE' } } };
    const a = renderWithProviders(<HistorialSelectorConnector />, { auth });
    expect(screen.getByText('Abriendo su historial…')).toBeInTheDocument();
    a.unmount();
    mocks.miId.mockReturnValue({ estudianteId: null, loading: false, error: 'Sin vínculo' });
    const b = renderWithProviders(<HistorialSelectorConnector />, { auth });
    expect(screen.getByText('No se pudo abrir su historial')).toBeInTheDocument();
    expect(screen.getByText('Sin vínculo')).toBeInTheDocument();
    b.unmount();
    mocks.miId.mockReturnValue({ estudianteId: null, loading: false, error: null });
    const c = renderWithProviders(<HistorialSelectorConnector />, { auth });
    expect(screen.getByText('No se encontró su registro de estudiante.')).toBeInTheDocument();
    c.unmount();
    mocks.miId.mockReturnValue({ estudianteId: 4, loading: false, error: null });
    renderWithProviders(<HistorialSelectorConnector />, { auth });
    expect(screen.queryByText('Seleccionar estudiante')).not.toBeInTheDocument();
    expect(screen.queryByText('No se pudo abrir su historial')).not.toBeInTheDocument();
  });
});
