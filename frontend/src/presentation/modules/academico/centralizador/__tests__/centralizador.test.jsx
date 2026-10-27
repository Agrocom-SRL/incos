/**
 * Centralizador de calificaciones: grillas, cabeceras, badges, columnas, páginas y conectores.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '../../../../../test/renderWithProviders.jsx';
import { renderCell, findColumn, renderCells } from '../../../../../test/renderColumns.jsx';

const mocks = vi.hoisted(() => ({
  paralelo: vi.fn(),
  paralelos: vi.fn(),
  observaciones: vi.fn(),
  exportar: vi.fn(),
  badge: vi.fn(),
}));
const navigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@application-academico/centralizador/hooks/useCentralizadorParalelo.js', () => ({
  useCentralizadorParalelo: (...a) => mocks.paralelo(...a),
  BIMESTRES_CENTRALIZADOR: [1, 2, 3, 4],
}));
vi.mock('@application-academico/centralizador/hooks/useParalelosCentralizador.js', () => ({
  useParalelosCentralizador: () => mocks.paralelos(),
}));
vi.mock('@application-academico/centralizador/hooks/useCentralizadorObservacionesBimestre.js', () => ({
  useCentralizadorObservacionesBimestre: (...a) => mocks.observaciones(...a),
}));
vi.mock('@application-academico/centralizador/hooks/api/useExportBoletinEstudiante.js', () => ({
  useExportBoletinEstudiante: () => mocks.exportar(),
}));
vi.mock('@application-academico/nivelaciones/hooks/useNivelacionPendientesBadge.js', () => ({
  useNivelacionPendientesBadge: (...a) => mocks.badge(...a),
}));

import CentralizadorGrid from '../components/CentralizadorGrid.jsx';
import CentralizadorAnualGrid from '../components/CentralizadorAnualGrid.jsx';
import CentralizadorContextoHeader from '../components/CentralizadorContextoHeader.jsx';
import CentralizadorFolioCabecera from '../components/CentralizadorFolioCabecera.jsx';
import CentralizadorLibroBadge from '../components/CentralizadorLibroBadge.jsx';
import CentralizadorNivelacionBadge from '../components/CentralizadorNivelacionBadge.jsx';
import CabeceraAsignatura from '../components/CabeceraAsignatura.jsx';
import CeldaEstudiante from '../components/CeldaEstudiante.jsx';
import { createCentralizadorParalelosColumns } from '../config/centralizadorParalelosColumns.jsx';
import CentralizadorPage from '../pages/CentralizadorPage.jsx';
import CentralizadorAnualPage from '../pages/CentralizadorAnualPage.jsx';
import CentralizadorMatrizPage from '../pages/CentralizadorMatrizPage.jsx';
import CentralizadorConnector from '../connectors/CentralizadorConnector.jsx';
import CentralizadorAnualConnector from '../connectors/CentralizadorAnualConnector.jsx';
import CentralizadorMatrizConnector from '../connectors/CentralizadorMatrizConnector.jsx';

const matchMediaOriginal = window.matchMedia;
beforeEach(() => {
  navigate.mockClear();
  Object.values(mocks).forEach((m) => m.mockReset());
  mocks.observaciones.mockReturnValue({
    puedeEditar: false,
    programarGuardado: vi.fn(),
    registrarValorInicial: vi.fn(),
  });
  mocks.exportar.mockReturnValue({ exportar: vi.fn(), descargandoId: null });
  mocks.badge.mockReturnValue({ totalPendientes: 0 });
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

const asignaturas = [
  { ofertaCursoId: 1, sigla: 'MAT', nombre: 'Matemática', docenteNombre: 'Ana' },
  { ofertaCursoId: 2, sigla: 'FIS', nombre: 'Física', docenteNombre: null },
];
const estudiantes = [
  {
    estudianteId: 10,
    nombreCompleto: 'PEREZ JUAN',
    codigoEstudiante: 'E-1',
    ci: '123',
    folioNumero: 1,
    notas: {
      1: { bim1: 70, bim2: 40, notaAnual: 55, gestionCompleta: true, observacion: 'REPROBADO' },
      2: { bim1: null, notaAnual: 80, gestionCompleta: true, observacion: 'APROBADO' },
    },
    observacionesBimestre: { 1: 'APROBADO/A' },
  },
  {
    estudianteId: 11,
    nombreCompleto: 'ROJAS ANA',
    ci: null,
    folioNumero: 2,
    notas: { 1: { bim1: 90, notaAnual: 90, observacion: null }, 2: { bim1: 62, notaAnual: 62, observacion: null } },
  },
];

describe('CentralizadorGrid (matriz por bimestre)', () => {
  it('muestra nómina, cédula y notas del bimestre, con reprobados y vacíos diferenciados', () => {
    const { container } = renderWithProviders(
      <CentralizadorGrid asignaturas={asignaturas} estudiantes={estudiantes} bimestre={1} notaMinimaAprobacion={61} />,
    );
    expect(screen.getByText('PEREZ JUAN')).toBeInTheDocument();
    expect(screen.getByText('E-1')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument();
    expect(container.querySelectorAll('.cal-centralizador-grid__nota--vacia').length).toBeGreaterThan(0);
    expect(screen.getByRole('note', { name: 'Leyenda del centralizador' })).toBeInTheDocument();
  });

  it('la nota bajo la mínima se marca reprobada', () => {
    const { container } = renderWithProviders(
      <CentralizadorGrid asignaturas={asignaturas} estudiantes={estudiantes} bimestre={1} notaMinimaAprobacion={80} />,
    );
    expect(container.querySelectorAll('.cal-centralizador-grid__nota--reprobado').length).toBe(2);
  });

  it('observación en lectura: pill por veredicto', () => {
    const { container } = renderWithProviders(
      <CentralizadorGrid asignaturas={asignaturas} estudiantes={estudiantes} bimestre={1} />,
    );
    expect(container.querySelector('.cal-centralizador-grid__estado--aprobado')).toHaveTextContent('APROBADO/A');
    expect(container.querySelector('.cal-centralizador-grid__obs-vacio')).toHaveTextContent('—');
  });

  it('observación libre en lectura se muestra como texto', () => {
    const { container } = renderWithProviders(
      <CentralizadorGrid
        asignaturas={[]}
        estudiantes={[{ estudianteId: 1, nombreCompleto: 'X', observacionBimestre: 'Beca parcial' }]}
        bimestre={1}
      />,
    );
    expect(container.querySelector('.cal-centralizador-grid__obs-texto')).toHaveTextContent('Beca parcial');
  });

  it('editable: elegir un veredicto notifica cambio y guardado', async () => {
    const onChange = vi.fn();
    const onBlur = vi.fn();
    renderWithProviders(
      <CentralizadorGrid
        asignaturas={asignaturas}
        estudiantes={[estudiantes[1]]}
        bimestre={1}
        puedeEditarObservaciones
        onObservacionChange={onChange}
        onObservacionBlur={onBlur}
      />,
    );
    await userEvent.click(screen.getByRole('combobox', { name: 'Observaciones del bimestre' }));
    await userEvent.click(await screen.findByText('REPROBADO/A', { selector: '.ant-select-item-option-content' }));
    expect(onChange).toHaveBeenCalledWith(11, 'REPROBADO/A');
    expect(onBlur).toHaveBeenCalledWith(11, 'REPROBADO/A');
  });

  it('sin estudiantes muestra el vacío', () => {
    renderWithProviders(<CentralizadorGrid asignaturas={asignaturas} estudiantes={[]} bimestre={1} />);
    expect(screen.getByText('Sin estudiantes matriculados en el paralelo')).toBeInTheDocument();
  });
});

describe('CentralizadorAnualGrid (resultado anual)', () => {
  it('nota anual por asignatura, promedio y estado de promoción', () => {
    const { container } = renderWithProviders(
      <CentralizadorAnualGrid asignaturas={asignaturas} estudiantes={estudiantes} notaMinimaAprobacion={61} />,
    );
    expect(screen.getByText('55')).toBeInTheDocument();
    expect(screen.getByText('REPROBADO')).toBeInTheDocument();
    expect(screen.getByText('EN CURSO')).toBeInTheDocument();
    // Promedio del primer estudiante: round((55+80)/2) = 68
    expect(screen.getByText('68')).toBeInTheDocument();
    expect(container.querySelector('.cal-centralizador-grid__nota--reprobado')).toHaveTextContent('55');
  });

  it('marca el inicio de cada folio', () => {
    renderWithProviders(<CentralizadorAnualGrid asignaturas={asignaturas} estudiantes={estudiantes} />);
    expect(screen.getByText('FOLIO 1')).toBeInTheDocument();
    expect(screen.getByText('FOLIO 2')).toBeInTheDocument();
  });

  it.each([
    [[{ observacion: 'APROBADO', notaAnual: 80 }], 'APROBADO'],
    [[{ observacion: 'ABANDONO', notaAnual: null }], 'ABANDONO'],
    [[{ observacion: 'REPROBADO', notaAnual: 30 }, { observacion: null }], 'REPROBADO'],
  ])('estado por prioridad %#', (notas, esperado) => {
    renderWithProviders(
      <CentralizadorAnualGrid
        asignaturas={asignaturas.slice(0, notas.length)}
        estudiantes={[
          {
            estudianteId: 1,
            nombreCompleto: 'X',
            notas: Object.fromEntries(notas.map((n, i) => [i + 1, n])),
          },
        ]}
      />,
    );
    expect(screen.getAllByText(esperado).length).toBeGreaterThan(0);
  });

  it('sin celdas el estado queda vacío', () => {
    const { container } = renderWithProviders(
      <CentralizadorAnualGrid asignaturas={asignaturas} estudiantes={[{ estudianteId: 1, nombreCompleto: 'X', notas: {} }]} />,
    );
    expect(container.querySelector('.cal-centralizador-grid__estado')).toBeNull();
  });

  it('RBAC: el boletín solo aparece con el handler y se protege con EXPORTAR', async () => {
    const onDescargar = vi.fn();
    const a = renderWithProviders(
      <CentralizadorAnualGrid asignaturas={asignaturas} estudiantes={estudiantes} paraleloGestionId={5} onDescargarBoletin={onDescargar} />,
    );
    expect(screen.queryByRole('button', { name: /Boletín/ })).not.toBeInTheDocument();
    a.unmount();
    renderWithProviders(
      <CentralizadorAnualGrid
        asignaturas={asignaturas}
        estudiantes={estudiantes}
        paraleloGestionId={5}
        onDescargarBoletin={onDescargar}
        descargandoBoletinId={11}
      />,
      { auth: { permisos: [permiso('academico.calificacion.centralizador', 'EXPORTAR')] } },
    );
    const botones = screen.getAllByRole('button', { name: /Boletín/ });
    expect(botones.length).toBeGreaterThan(0);
    await userEvent.click(botones.find((b) => !b.className.includes('loading')));
    expect(onDescargar).toHaveBeenCalledWith(10);
  });

  it('sin handler no hay columna de boletín', () => {
    renderWithProviders(<CentralizadorAnualGrid asignaturas={asignaturas} estudiantes={estudiantes} paraleloGestionId={5} />, {
      auth: { permisos: [permiso('academico.calificacion.centralizador', 'EXPORTAR')] },
    });
    expect(screen.queryByRole('button', { name: /Boletín/ })).not.toBeInTheDocument();
  });
});

describe('piezas del centralizador', () => {
  it('CeldaEstudiante y CabeceraAsignatura', () => {
    const { rerender } = render(<CeldaEstudiante nombre="PEREZ" codigo="E-1" />);
    expect(screen.getByText('E-1')).toBeInTheDocument();
    rerender(<CeldaEstudiante nombre="PEREZ" />);
    expect(screen.queryByText('E-1')).not.toBeInTheDocument();
    rerender(<CabeceraAsignatura sigla="MAT" nombre="Matemática" />);
    expect(screen.getByText('MAT')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    rerender(<CabeceraAsignatura nombre="Física" docenteNombre="Luis" />);
    expect(screen.getAllByText('Física').length).toBeGreaterThan(0);
  });

  it('CentralizadorContextoHeader: P2 (régimen) y P3 (bimestre)', () => {
    const paralelo = {
      carreraNombre: 'Sistemas',
      periodoNombre: '1er Año',
      paraleloNombre: 'a',
      turno: 'Noche',
      cursosCreados: 8,
      cantidadEstudiantes: 25,
    };
    const { rerender } = render(<CentralizadorContextoHeader paralelo={paralelo} gestionAnio={2026} />);
    expect(screen.getByRole('region', { name: 'Datos del paralelo y la gestión' })).toBeInTheDocument();
    expect(screen.getByText('Sistemas')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('Anual')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    rerender(<CentralizadorContextoHeader paralelo={paralelo} gestionNombre="Gestión 2026" bimestre={2} />);
    expect(screen.getByText('Segundo Bimestre')).toBeInTheDocument();
    expect(screen.getByText('Gestión 2026')).toBeInTheDocument();
  });

  it('CentralizadorContextoHeader sin paralelo usa textos por defecto', () => {
    render(<CentralizadorContextoHeader />);
    expect(screen.getByText('Centralizador de calificaciones')).toBeInTheDocument();
  });

  it('CentralizadorFolioCabecera muestra libro, rango de folio y curso', () => {
    const paralelo = { carreraNombre: 'Sistemas', periodoNombre: '1er Año', paraleloNombre: 'A', turno: 'Noche' };
    const { rerender } = render(
      <CentralizadorFolioCabecera
        paralelo={paralelo}
        gestionAnio={2026}
        bimestre={1}
        libro={{ numeroLibro: 3, codigoRegistro: 'REG-1', folioDesde: 4, folioHasta: 6 }}
      />,
    );
    expect(screen.getByText('REG-1')).toBeInTheDocument();
    expect(screen.getByText('Folio 4–6')).toBeInTheDocument();
    expect(screen.getByText('1er Año · Paralelo A')).toBeInTheDocument();
    rerender(
      <CentralizadorFolioCabecera paralelo={paralelo} bimestre={1} libro={{ numeroLibro: 3, folioDesde: 4, folioHasta: 4 }} />,
    );
    expect(screen.getByText('Folio 4')).toBeInTheDocument();
    rerender(<CentralizadorFolioCabecera bimestre={1} />);
    expect(screen.getAllByText('—').length).toBeGreaterThan(3);
  });

  it('CentralizadorLibroBadge: con folio, sin folio y RBAC del enlace', async () => {
    const onAbrir = vi.fn();
    const a = renderWithProviders(
      <CentralizadorLibroBadge libro={{ numeroLibro: 2, folioDesde: 1, folioHasta: 3 }} />,
    );
    expect(screen.getByText('LIBRO N° 2 · FOLIO 1–3')).toBeInTheDocument();
    a.unmount();
    const b = renderWithProviders(<CentralizadorLibroBadge libro={{ numeroLibro: 2, folioDesde: 5, folioHasta: 5 }} />);
    expect(screen.getByText('LIBRO N° 2 · FOLIO 5')).toBeInTheDocument();
    b.unmount();
    const c = renderWithProviders(<CentralizadorLibroBadge libro={null} onAbrirLibros={onAbrir} />);
    expect(screen.getByText(/Sin folio asignado/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Abrir en Libros de registro' })).not.toBeInTheDocument();
    c.unmount();
    renderWithProviders(<CentralizadorLibroBadge libro={null} onAbrirLibros={onAbrir} />, {
      auth: { permisos: [permiso('academico.libro', 'LISTAR')] },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Abrir en Libros de registro' }));
    expect(onAbrir).toHaveBeenCalled();
  });

  it('CentralizadorNivelacionBadge: singular, plural, sin pendientes y RBAC', async () => {
    const onAbrir = vi.fn();
    const a = renderWithProviders(<CentralizadorNivelacionBadge totalPendientes={1} onAbrirNivelacion={onAbrir} />);
    expect(screen.getByText('1 pendiente de nivelación')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ver en Nivelación' })).not.toBeInTheDocument();
    a.unmount();
    const b = renderWithProviders(<CentralizadorNivelacionBadge totalPendientes={3} onAbrirNivelacion={onAbrir} />, {
      auth: { permisos: [permiso('academico.nivelacion.ver', 'LISTAR')] },
    });
    expect(screen.getByText('3 pendientes de nivelación')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Ver en Nivelación' }));
    expect(onAbrir).toHaveBeenCalled();
    b.unmount();
    renderWithProviders(<CentralizadorNivelacionBadge />);
    expect(screen.getByText('Sin pendientes de nivelación')).toBeInTheDocument();
  });
});

describe('createCentralizadorParalelosColumns', () => {
  const onAbrir = vi.fn();
  const columns = createCentralizadorParalelosColumns({ onAbrir });
  const paralelo = {
    paraleloGestionId: 4,
    periodoNombre: '1er Año',
    paraleloNombre: 'A',
    turno: 'Noche',
    cursosCreados: 7,
    cantidadEstudiantes: 22,
  };

  it('renderiza paralelo, asignaturas y estudiantes', () => {
    const cells = renderCells(columns, paralelo, { index: 2, rowOffset: 10 });
    expect(cells.nro).toBe('13');
    expect(cells.paralelo).toContain('1er Año · Paralelo A');
    expect(cells.paralelo).toContain('Turno Noche');
    expect(cells.asignaturas).toBe('7');
    expect(cells.cantidadEstudiantes).toBe('22');
  });

  it('valores ausentes caen a 0 o guion', () => {
    const cells = renderCells(columns, {});
    expect(cells.paralelo).toBe('—');
    expect(cells.asignaturas).toBe('0');
    expect(cells.cantidadEstudiantes).toBe('0');
  });

  it('ordenadores', () => {
    const paralelosCol = findColumn(columns, 'paralelo');
    expect(paralelosCol.sorter({ paraleloNombre: 'A' }, { paraleloNombre: 'B' })).toBeLessThan(0);
    expect(findColumn(columns, 'asignaturas').sorter({ cursosCreados: 2 }, { asignaturasRequeridas: 5 })).toBe(-3);
    expect(findColumn(columns, 'cantidadEstudiantes').sorter({ cantidadEstudiantes: 9 }, {})).toBe(9);
  });

  it('RBAC y estado del botón Abrir', async () => {
    const col = findColumn(columns, 'acciones');
    const a = renderCell(col, paralelo);
    expect(screen.queryByRole('button', { name: /Abrir/ })).not.toBeInTheDocument();
    a.unmount();
    const auth = { permisos: [permiso('academico.calificacion.centralizador', 'LISTAR')] };
    const b = renderCell(col, paralelo, { auth });
    await userEvent.click(screen.getByRole('button', { name: /Abrir/ }));
    expect(onAbrir).toHaveBeenCalledWith(paralelo);
    b.unmount();
    renderCell(col, { ...paralelo, cantidadEstudiantes: 0 }, { auth });
    expect(screen.getByRole('button', { name: /Abrir/ })).toBeDisabled();
  });
});

const estadoParalelo = (extra = {}) => ({
  paraleloGestionId: 5,
  bimestreActivo: 1,
  paraleloSeleccionado: { carreraNombre: 'Sistemas', periodoNombre: '1er Año', paraleloNombre: 'A', turno: 'Noche' },
  asignaturas,
  estudiantes,
  gestionAnio: 2026,
  gestionNombre: 'Gestión 2026',
  notaMinimaAprobacion: 61,
  libro: null,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
  breadcrumbItems: [{ title: 'Centralizador' }],
  ...extra,
});

describe('CentralizadorPage (P1)', () => {
  const paralelos = [
    { paraleloGestionId: 4, carreraId: 1, carreraNombre: 'Sistemas', carreraColorHex: '#336699', periodoNombre: '1er Año', paraleloNombre: 'A', turno: 'Noche', cursosCreados: 7, cantidadEstudiantes: 22 },
  ];

  it('lista paralelos por carrera y abre el centralizador', async () => {
    mocks.paralelos.mockReturnValue({ paralelos, isLoading: false, error: null, breadcrumbItems: [] });
    renderWithProviders(<CentralizadorPage />, {
      auth: { permisos: [permiso('academico.calificacion.centralizador', 'LISTAR')] },
    });
    expect(screen.getByText('Paralelos en gestión')).toBeInTheDocument();
    expect(screen.getByText('Sistemas')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Abrir/ }));
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('4'));
  });

  it('vacío y carga', () => {
    mocks.paralelos.mockReturnValue({ paralelos: [], isLoading: false, error: null, breadcrumbItems: [] });
    const a = renderWithProviders(<CentralizadorPage />);
    expect(screen.getByText('No hay paralelos en gestión vigente.')).toBeInTheDocument();
    a.unmount();
    mocks.paralelos.mockReturnValue({ paralelos: [], isLoading: true, error: null, breadcrumbItems: [] });
    const b = renderWithProviders(<CentralizadorPage />);
    expect(b.container.querySelector('.ant-spin, .ant-skeleton')).not.toBeNull();
  });

  it('el conector monta la página', () => {
    mocks.paralelos.mockReturnValue({ paralelos: [], isLoading: false, error: null, breadcrumbItems: [] });
    renderWithProviders(<CentralizadorConnector />);
    expect(screen.getAllByText('Centralizador de calificaciones').length).toBeGreaterThan(0);
  });
});

describe('CentralizadorAnualPage (P2)', () => {
  it('muestra contexto, libro, nivelación y desglose por bimestre', async () => {
    mocks.paralelo.mockReturnValue(estadoParalelo({ libro: { numeroLibro: 1, folioDesde: 1, folioHasta: 2 } }));
    mocks.badge.mockReturnValue({ totalPendientes: 2 });
    renderWithProviders(<CentralizadorAnualPage />);
    expect(mocks.paralelo).toHaveBeenCalledWith('ACA-CENTRALIZADOR-ANUAL');
    expect(screen.getByRole('region', { name: 'Datos del paralelo y la gestión' })).toBeInTheDocument();
    expect(screen.getByText('LIBRO N° 1 · FOLIO 1–2')).toBeInTheDocument();
    expect(screen.getByText('2 pendientes de nivelación')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tercer Bimestre' }));
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('3'));
    expect(screen.getByText('PEREZ JUAN')).toBeInTheDocument();
  });

  it('enlaces a libros y nivelación respetan permisos y navegan', async () => {
    mocks.paralelo.mockReturnValue(estadoParalelo());
    mocks.badge.mockReturnValue({ totalPendientes: 1 });
    renderWithProviders(<CentralizadorAnualPage />, {
      auth: {
        permisos: [permiso('academico.libro', 'LISTAR'), permiso('academico.nivelacion.ver', 'LISTAR')],
      },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Abrir en Libros de registro' }));
    await userEvent.click(screen.getByRole('button', { name: 'Ver en Nivelación' }));
    expect(navigate).toHaveBeenCalledTimes(2);
  });

  it('descarga de boletín: éxito y error', async () => {
    const exportar = vi.fn().mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false, error: 'Sin plantilla' });
    mocks.exportar.mockReturnValue({ exportar, descargandoId: null });
    mocks.paralelo.mockReturnValue(estadoParalelo());
    renderWithProviders(<CentralizadorAnualPage />, {
      auth: { permisos: [permiso('academico.calificacion.centralizador', 'EXPORTAR')] },
    });
    const [primero] = screen.getAllByRole('button', { name: /Boletín$/ });
    await userEvent.click(primero);
    expect(exportar).toHaveBeenCalledWith(5, 10);
    expect(await screen.findByText('Boletín generado')).toBeInTheDocument();
    await userEvent.click(primero);
    expect(await screen.findByText('No se pudo descargar el boletín')).toBeInTheDocument();
    expect(screen.getByText('Sin plantilla')).toBeInTheDocument();
  });

  it('volver regresa a la lista de paralelos', async () => {
    mocks.paralelo.mockReturnValue(estadoParalelo());
    renderWithProviders(<CentralizadorAnualPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Volver a la lista de paralelos' }));
    expect(navigate).toHaveBeenCalled();
  });

  it('error con reintento, carga y sin estudiantes', async () => {
    const s = estadoParalelo({ error: 'Falla', estudiantes: [] });
    mocks.paralelo.mockReturnValue(s);
    const a = renderWithProviders(<CentralizadorAnualPage />);
    expect(screen.getByText('No se pudo cargar el centralizador')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(s.refetch).toHaveBeenCalled();
    a.unmount();
    mocks.paralelo.mockReturnValue(estadoParalelo({ isLoading: true, estudiantes: [] }));
    const b = renderWithProviders(<CentralizadorAnualPage />);
    expect(screen.getByText('Cargando centralizador…')).toBeInTheDocument();
    b.unmount();
    mocks.paralelo.mockReturnValue(estadoParalelo({ estudiantes: [] }));
    renderWithProviders(<CentralizadorAnualPage />);
    expect(screen.getByText('Sin estudiantes')).toBeInTheDocument();
  });

  it('el conector monta la página', () => {
    mocks.paralelo.mockReturnValue(estadoParalelo({ estudiantes: [] }));
    renderWithProviders(<CentralizadorAnualConnector />);
    expect(screen.getByText('Sin estudiantes')).toBeInTheDocument();
  });
});

describe('CentralizadorMatrizPage (P3)', () => {
  const obs = (extra = {}) => ({
    puedeEditar: true,
    programarGuardado: vi.fn(),
    registrarValorInicial: vi.fn(),
    ...extra,
  });

  it('muestra cabecera del folio, libro y la matriz del bimestre', () => {
    mocks.paralelo.mockReturnValue(estadoParalelo({ libro: { numeroLibro: 1, codigoRegistro: 'REG-9', folioDesde: 1, folioHasta: 2 } }));
    mocks.observaciones.mockReturnValue(obs({ puedeEditar: false }));
    renderWithProviders(<CentralizadorMatrizPage />);
    expect(mocks.paralelo).toHaveBeenCalledWith('ACA-CENTRALIZADOR-MATRIZ');
    expect(screen.getByRole('article', { name: 'Cabecera del documento oficial' })).toBeInTheDocument();
    expect(screen.getByText('REG-9')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument();
    expect(screen.getByText('APROBADO/A')).toBeInTheDocument();
  });

  it('registra los valores iniciales y guarda la observación elegida', async () => {
    const o = obs();
    mocks.observaciones.mockReturnValue(o);
    mocks.paralelo.mockReturnValue(estadoParalelo());
    renderWithProviders(<CentralizadorMatrizPage />);
    await waitFor(() => expect(o.registrarValorInicial).toHaveBeenCalledWith('10', 'APROBADO/A'));
    const combos = screen.getAllByRole('combobox', { name: 'Observaciones del bimestre' });
    await userEvent.click(combos[1]);
    await userEvent.click(await screen.findByText('ABANDONO', { selector: '.ant-select-item-option-content' }));
    expect(o.programarGuardado).toHaveBeenCalledWith(11, 'ABANDONO');
  });

  it('sin permiso de edición las observaciones son de solo lectura', () => {
    mocks.observaciones.mockReturnValue(obs({ puedeEditar: false }));
    mocks.paralelo.mockReturnValue(estadoParalelo());
    renderWithProviders(<CentralizadorMatrizPage />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('volver regresa al paralelo; estados de error, carga y vacío', async () => {
    const s = estadoParalelo({ error: 'Falla', estudiantes: [] });
    mocks.paralelo.mockReturnValue(s);
    const a = renderWithProviders(<CentralizadorMatrizPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Volver a los bimestres del paralelo' }));
    expect(navigate).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(s.refetch).toHaveBeenCalled();
    a.unmount();
    mocks.paralelo.mockReturnValue(estadoParalelo({ isLoading: true, estudiantes: [] }));
    const b = renderWithProviders(<CentralizadorMatrizPage />);
    expect(screen.getByText('Cargando centralizador…')).toBeInTheDocument();
    b.unmount();
    mocks.paralelo.mockReturnValue(estadoParalelo({ asignaturas: [] }));
    renderWithProviders(<CentralizadorMatrizPage />);
    expect(screen.getByText('Sin datos para este paralelo')).toBeInTheDocument();
  });

  it('el conector monta la página', () => {
    mocks.paralelo.mockReturnValue(estadoParalelo({ estudiantes: [] }));
    renderWithProviders(<CentralizadorMatrizConnector />);
    expect(screen.getByText('Sin datos para este paralelo')).toBeInTheDocument();
  });
});
