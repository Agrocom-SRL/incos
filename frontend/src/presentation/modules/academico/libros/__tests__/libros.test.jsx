/**
 * Libros de registro: modales, sección de folios, columnas, páginas (listado, ficha, anulados, folio) y conectores.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '../../../../../test/renderWithProviders.jsx';
import { renderCell, renderCells, findColumn } from '../../../../../test/renderColumns.jsx';

const mocks = vi.hoisted(() => ({
  lista: vi.fn(),
  detalle: vi.fn(),
  anulados: vi.fn(),
  folio: vi.fn(),
}));
const navigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@application-academico/libros/hooks', () => ({
  useLibrosList: () => mocks.lista(),
  useLibroDetail: () => mocks.detalle(),
  useLibroAnulados: () => mocks.anulados(),
  useFolioPreview: () => mocks.folio(),
}));

import AbrirLibroModal from '../components/organisms/AbrirLibroModal.jsx';
import AnularFolioModal from '../components/organisms/AnularFolioModal.jsx';
import EditarFilaFolioModal from '../components/organisms/EditarFilaFolioModal.jsx';
import CerrarLibroPendientesModal from '../components/organisms/CerrarLibroPendientesModal.jsx';
import LibroFoliosSection from '../components/organisms/LibroFoliosSection.jsx';
import { createFoliosTableColumns } from '../config/foliosTableColumns.jsx';
import { createLibrosTableColumns } from '../config/librosTableColumns.jsx';
import LibrosListPage from '../pages/LibrosListPage.jsx';
import LibroDetailPage from '../pages/LibroDetailPage.jsx';
import LibroAnuladosPage from '../pages/LibroAnuladosPage.jsx';
import FolioPreviewPage from '../pages/FolioPreviewPage.jsx';
import LibrosListConnector from '../connectors/LibrosListConnector.jsx';
import LibroDetailConnector from '../connectors/LibroDetailConnector.jsx';
import LibroAnuladosConnector from '../connectors/LibroAnuladosConnector.jsx';
import FolioPreviewConnector from '../connectors/FolioPreviewConnector.jsx';

const LIBRO = 'academico.libro';
const con = (...acciones) => ({ auth: { permisos: [permiso(LIBRO, ...acciones)] } });

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

describe('AbrirLibroModal', () => {
  const gestiones = [{ id: 1, nombre: 'Gestión 2026' }, { id: 2, anio: 2025 }, { id: 3 }];

  it('valida los campos obligatorios', async () => {
    const onGuardar = vi.fn();
    render(<AbrirLibroModal open gestiones={gestiones} onGuardar={onGuardar} onCancelar={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir libro' }));
    expect(await screen.findByText('Seleccione la gestión')).toBeInTheDocument();
    expect(screen.getByText('Ingrese el número de libro')).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it('envía los datos normalizados', async () => {
    const onGuardar = vi.fn();
    render(<AbrirLibroModal open gestiones={gestiones} onGuardar={onGuardar} onCancelar={vi.fn()} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('Gestión 2025', { selector: '.ant-select-item-option-content' }));
    fireEvent.change(screen.getByPlaceholderText('Ej. 14'), { target: { value: '14' } });
    await userEvent.type(screen.getByPlaceholderText('Detalle adicional del libro'), '  nota  ');
    await userEvent.click(screen.getByRole('button', { name: 'Abrir libro' }));
    await waitFor(() => expect(onGuardar).toHaveBeenCalled());
    expect(onGuardar).toHaveBeenCalledWith({
      gestionId: 2,
      numeroLibro: 14,
      codigoRegistro: '81981609',
      folioInicial: 1,
      fechaApertura: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      observaciones: 'nota',
    });
  });

  it('ofrece etiquetas de reserva para gestiones sin nombre', async () => {
    render(<AbrirLibroModal open gestiones={gestiones} onGuardar={vi.fn()} onCancelar={vi.fn()} />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(await screen.findByText('Gestión 3', { selector: '.ant-select-item-option-content' })).toBeInTheDocument();
    expect(screen.getByText('Gestión 2025', { selector: '.ant-select-item-option-content' })).toBeInTheDocument();
  });

  it('cancelar invoca el callback', async () => {
    const onCancelar = vi.fn();
    render(<AbrirLibroModal open gestiones={[]} onGuardar={vi.fn()} onCancelar={onCancelar} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancelar).toHaveBeenCalled();
  });
});

describe('AnularFolioModal', () => {
  it('exige el motivo y lo envía recortado', async () => {
    const onAnular = vi.fn();
    render(<AnularFolioModal open onAnular={onAnular} onCancelar={vi.fn()} />);
    const botones = screen.getAllByRole('button', { name: 'Anular folio' });
    await userEvent.click(botones.at(-1));
    expect(await screen.findByText('Ingrese el motivo de la anulación')).toBeInTheDocument();
    expect(onAnular).not.toHaveBeenCalled();
    await userEvent.type(screen.getByPlaceholderText(/Explique por qué se anula/), '  duplicado  ');
    await userEvent.click(screen.getAllByRole('button', { name: 'Anular folio' }).at(-1));
    await waitFor(() => expect(onAnular).toHaveBeenCalledWith('duplicado'));
  });
});

describe('EditarFilaFolioModal', () => {
  it('precarga la observación y guarda; vacío envía null', async () => {
    const onGuardar = vi.fn();
    render(
      <EditarFilaFolioModal open fila={{ nombreCompleto: 'PEREZ JUAN', observaciones: 'Beca' }} onGuardar={onGuardar} onCancelar={vi.fn()} />,
    );
    expect(screen.getByText('Editar observación · PEREZ JUAN')).toBeInTheDocument();
    const area = screen.getByPlaceholderText('Observación de la fila');
    await waitFor(() => expect(area).toHaveValue('Beca'));
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(onGuardar).toHaveBeenLastCalledWith({ observaciones: 'Beca' }));
    await userEvent.clear(area);
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(onGuardar).toHaveBeenLastCalledWith({ observaciones: null }));
  });

  it('sin fila usa el título genérico', () => {
    render(<EditarFilaFolioModal open fila={null} onGuardar={vi.fn()} onCancelar={vi.fn()} />);
    expect(screen.getByText('Editar observación')).toBeInTheDocument();
  });
});

describe('CerrarLibroPendientesModal', () => {
  const pendientes = {
    total: 3,
    totalParalelos: 2,
    desactualizadas: 1,
    paralelos: [
      {
        paraleloGestionId: 1,
        carreraCodigo: 'SIS-INF',
        carreraColorHex: '#336699',
        cursoLabel: '1er Año · A',
        turno: 'Noche',
        totalEstudiantes: 2,
        folios: [{ numeroFolio: 12, label: 'Folio 12', rangoLabel: 'AÑEZ – CASTRO' }],
      },
      { paraleloGestionId: 2, carreraNombre: 'Contaduría', cursoLabel: '2do Año · B', totalEstudiantes: 1, folios: [{ label: 'Folio 20' }] },
    ],
  };

  it('resume pendientes por paralelo con folios y rangos', () => {
    renderWithProviders(<CerrarLibroPendientesModal open pendientes={pendientes} onConfirmar={vi.fn()} onCancelar={vi.fn()} />);
    expect(screen.getByText('3 estudiantes en 2 paralelos sin nota final.')).toBeInTheDocument();
    expect(screen.getByText('Folio 12')).toBeInTheDocument();
    expect(screen.getByText(/AÑEZ – CASTRO/)).toBeInTheDocument();
    expect(screen.getByText(/1 estudiante ya tiene todas sus notas/)).toBeInTheDocument();
  });

  it('valida el motivo mínimo y pide confirmación final', async () => {
    const onConfirmar = vi.fn();
    renderWithProviders(<CerrarLibroPendientesModal open pendientes={pendientes} onConfirmar={onConfirmar} onCancelar={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar de todos modos' }));
    expect(await screen.findByText('Indique el motivo del cierre')).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText(/Cierre de gestión por plazo/), 'corto');
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar de todos modos' }));
    expect(await screen.findByText('Detalle el motivo con al menos 10 caracteres')).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText(/Cierre de gestión por plazo/), ' ampliado por plazo');
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar de todos modos' }));
    expect((await screen.findAllByText('¿Confirma el cierre del libro con notas pendientes?')).length).toBeGreaterThan(0);
    expect(onConfirmar).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Sí, cerrar el libro' }));
    await waitFor(() => expect(onConfirmar).toHaveBeenCalledWith('corto ampliado por plazo'));
  });

  it('sin pendientes usa singular y valores por defecto', () => {
    renderWithProviders(<CerrarLibroPendientesModal open pendientes={{ total: 1, totalParalelos: 1, paralelos: [] }} onCancelar={vi.fn()} />);
    expect(screen.getByText('1 estudiante en 1 paralelo sin nota final.')).toBeInTheDocument();
  });
});

describe('columnas de libros y folios', () => {
  it('libros: celdas y navegación a la ficha con DETALLE', async () => {
    const columns = createLibrosTableColumns({ navigate });
    const libro = { id: 5, numeroLibro: 14, carrerasConFolio: 'Sistemas', gestionAnio: 2026, codigoRegistro: 'R-1', totalFolios: 8, foliosAnulados: 2, totalEstudiantes: 70, estado: 'ABIERTO' };
    const cells = renderCells(columns, libro, { index: 0 });
    expect(cells.nro).toBe('1');
    expect(cells.numeroLibro).toContain('LIBRO N° 14');
    expect(cells.gestion).toBe('Gestión 2026');
    expect(cells.folios).toContain('Anulados 2');
    expect(cells.estado).toBe('Abierto');
    expect(renderCell(findColumn(columns, 'numeroLibro'), {}).text).toContain('Sin folios generados');
    expect(renderCell(findColumn(columns, 'gestion'), {}).text).toBe('—');
    const col = findColumn(columns, 'acciones');
    const a = renderCell(col, libro);
    expect(a.container.querySelector('[aria-label="eye"]')).toBeNull();
    a.unmount();
    const b = renderCell(col, libro, con('DETALLE'));
    await userEvent.click(b.container.querySelector('[aria-label="eye"]').closest('button'));
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('5'));
    expect(findColumn(columns, 'numeroLibro').sorter({ numeroLibro: 2 }, { numeroLibro: 1 })).toBe(1);
    expect(findColumn(columns, 'folios').sorter({ totalFolios: 1 }, { totalFolios: 4 })).toBe(-3);
    expect(findColumn(columns, 'gestion').sorter({ gestionAnio: 2025 }, { gestionAnio: 2026 })).toBe(-1);
  });

  it('folios: columnas opcionales de carrera y motivo', () => {
    const base = createFoliosTableColumns({ onView: vi.fn() }).map((c) => c.title);
    expect(base).not.toContain('Carrera');
    expect(base).not.toContain('Motivo');
    const todas = createFoliosTableColumns({ onView: vi.fn(), showCarrera: true, showMotivo: true });
    expect(todas.map((c) => c.title)).toEqual(expect.arrayContaining(['Carrera', 'Motivo']));
    const folio = { id: 1, numeroFolio: 3, cursoLabel: '1er Año · A', carreraCodigo: 'SIS', carreraColorHex: '#336699', turno: 'Noche', totalEstudiantes: 10, totalAprobados: 7, totalReprobados: 2, totalAbandonos: 1, estado: 'ANULADO', observaciones: 'Duplicado' };
    const cells = renderCells(todas, folio);
    expect(cells.numeroFolio).toContain('FOLIO N° 3');
    expect(cells.turno).toBe('Noche');
    expect(cells.estudiantes).toContain('Aprobados 7 · Reprobados 2 · Abandonos 1');
    expect(cells.estado).toBe('Anulado');
    expect(cells.observaciones).toBe('Duplicado');
    expect(renderCell(findColumn(todas, 'observaciones'), {}).text).toBe('—');
    expect(findColumn(todas, 'carrera').sorter({ carreraNombre: 'A' }, { carreraNombre: 'B' })).toBeLessThan(0);
    expect(findColumn(todas, 'numeroFolio').sorter({ numeroFolio: 5 }, { numeroFolio: 2 })).toBe(3);
  });

  it('folios: el estado se reconcilia con el del libro y ver exige DETALLE', async () => {
    const onView = vi.fn();
    const columns = createFoliosTableColumns({ onView, libroEstado: 'CERRADO' });
    expect(renderCell(findColumn(columns, 'estado'), { estado: 'BORRADOR' }).text).toBe('Cerrado');
    const col = findColumn(columns, 'acciones');
    const a = renderCell(col, { id: 1 });
    expect(a.container.querySelector('[aria-label="eye"]')).toBeNull();
    a.unmount();
    const b = renderCell(col, { id: 1 }, con('DETALLE'));
    await userEvent.click(b.container.querySelector('[aria-label="eye"]').closest('button'));
    expect(onView).toHaveBeenCalledWith({ id: 1 });
  });
});

describe('LibroFoliosSection', () => {
  const folios = [
    { id: 1, carreraId: 3, carreraNombre: 'Sistemas', carreraCodigo: 'SIS-INF', carreraColorHex: '#336699', cursoLabel: 'A', estado: 'BORRADOR' },
    { id: 2, carreraId: 1, carreraNombre: 'Contaduría', carreraCodigo: 'CON-GEN', carreraColorHex: '#996633', cursoLabel: 'B', estado: 'BORRADOR' },
    { id: 3, carreraId: 1, carreraNombre: 'Contaduría', carreraCodigo: 'CON-GEN', cursoLabel: 'C', estado: 'ANULADO' },
  ];
  const columns = [{ title: 'Curso', dataIndex: 'cursoLabel', key: 'curso' }];

  it('agrupa solo vigentes por carrera con orden canónico y exporta la activa', async () => {
    const onExportar = vi.fn();
    renderWithProviders(<LibroFoliosSection folios={folios} columns={columns} onExportar={onExportar} />, con('EXPORTAR'));
    expect(screen.getByText('Folios registrados (2)')).toBeInTheDocument();
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveTextContent('Contaduría');
    expect(tabs[1]).toHaveTextContent('Sistemas');
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.queryByText('C')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Exportar libro/ }));
    expect(onExportar).toHaveBeenCalledWith(1);
    await userEvent.click(tabs[1]);
    await userEvent.click(screen.getByRole('button', { name: /Exportar libro/ }));
    expect(onExportar).toHaveBeenLastCalledWith(3);
  });

  it('RBAC: sin EXPORTAR no hay botón', () => {
    renderWithProviders(<LibroFoliosSection folios={folios} columns={columns} />);
    expect(screen.queryByRole('button', { name: /Exportar libro/ })).not.toBeInTheDocument();
  });

  it('sin folios vigentes muestra el vacío', () => {
    renderWithProviders(<LibroFoliosSection folios={[folios[2]]} columns={columns} />);
    expect(screen.getByText(/aún no tiene folios generados/)).toBeInTheDocument();
  });
});

describe('LibrosListPage', () => {
  const lista = (extra = {}) => ({
    libros: [{ id: 5, numeroLibro: 14, gestionAnio: 2026, codigoRegistro: 'R-1', totalFolios: 4, estado: 'ABIERTO' }],
    loading: false,
    error: null,
    searchText: '',
    handleSearchChange: vi.fn(),
    tableColumns: createLibrosTableColumns({ navigate }),
    breadcrumbItems: [{ title: 'Libros' }],
    modalOpen: false,
    abrirModal: vi.fn(),
    cerrarModal: vi.fn(),
    handleAbrirLibro: vi.fn(),
    abriendo: false,
    gestiones: [],
    loadingGestiones: false,
    ...extra,
  });

  it('lista libros y RBAC de abrir libro', async () => {
    const s = lista();
    mocks.lista.mockReturnValue(s);
    const a = renderWithProviders(<LibrosListPage />);
    expect(screen.getByText('Libros de registro')).toBeInTheDocument();
    expect(screen.getByText(/LIBRO N° 14/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Abrir libro/ })).not.toBeInTheDocument();
    a.unmount();
    mocks.lista.mockReturnValue(s);
    renderWithProviders(<LibrosListPage />, con('CREAR'));
    await userEvent.click(screen.getByRole('button', { name: /Abrir libro/ }));
    expect(s.abrirModal).toHaveBeenCalled();
  });

  it('vacío, carga y error', () => {
    mocks.lista.mockReturnValue(lista({ libros: [] }));
    const a = renderWithProviders(<LibrosListPage />);
    expect(screen.getByText('Aún no se abrió ningún libro de registro.')).toBeInTheDocument();
    a.unmount();
    mocks.lista.mockReturnValue(lista({ libros: [], loading: true }));
    const b = renderWithProviders(<LibrosListPage />);
    expect(b.container.querySelector('.ant-spin, .ant-skeleton')).not.toBeNull();
    b.unmount();
    mocks.lista.mockReturnValue(lista({ libros: [], error: 'Falla del servidor' }));
    renderWithProviders(<LibrosListPage />);
    expect(screen.getByText(/Falla del servidor/)).toBeInTheDocument();
  });

  it('con el modal abierto, crear delega en el hook', async () => {
    const s = lista({ modalOpen: true, gestiones: [{ id: 1, nombre: 'Gestión 2026' }] });
    mocks.lista.mockReturnValue(s);
    renderWithProviders(<LibrosListPage />, con('CREAR'));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('combobox'));
    await userEvent.click(await screen.findByText('Gestión 2026', { selector: '.ant-select-item-option-content' }));
    fireEvent.change(screen.getByPlaceholderText('Ej. 14'), { target: { value: '9' } });
    const botones = screen.getAllByRole('button', { name: 'Abrir libro' });
    await userEvent.click(botones.at(-1));
    await waitFor(() => expect(s.handleAbrirLibro).toHaveBeenCalledWith(expect.objectContaining({ gestionId: 1, numeroLibro: 9 })));
  });

  it('el conector monta la página', () => {
    mocks.lista.mockReturnValue(lista({ libros: [] }));
    renderWithProviders(<LibrosListConnector />);
    expect(screen.getByText('Libros de registro')).toBeInTheDocument();
  });
});

describe('LibroDetailPage', () => {
  const libro = (extra = {}) => ({
    id: 5,
    libroLabel: 'LIBRO N° 14',
    estado: 'ABIERTO',
    gestionAnio: 2026,
    codigoRegistro: 'R-1',
    carrerasConFolio: 'Sistemas',
    totalFolios: 2,
    foliosAnulados: 1,
    totalEstudiantes: 20,
    folios: [{ id: 1, carreraId: 3, carreraNombre: 'Sistemas', carreraCodigo: 'SIS-INF', cursoLabel: 'A', estado: 'BORRADOR' }],
    ...extra,
  });
  const detalle = (extra = {}) => ({
    libro: libro(),
    loading: false,
    error: null,
    isInvalidId: false,
    breadcrumbItems: [{ title: 'Libro' }],
    tableColumns: [{ title: 'Curso', dataIndex: 'cursoLabel', key: 'curso' }],
    handleVolver: vi.fn(),
    refetch: vi.fn(),
    handleGenerarTodosFolios: vi.fn(),
    generandoTodosFolios: false,
    handleCerrarLibro: vi.fn(),
    handleReabrirLibro: vi.fn(),
    actualizando: false,
    cierrePendientes: null,
    handleConfirmarCierreForzado: vi.fn(),
    handleCancelarCierreForzado: vi.fn(),
    handleExportar: vi.fn(),
    exportando: false,
    ...extra,
  });

  it('muestra la ficha y RBAC de las acciones', async () => {
    const s = detalle();
    mocks.detalle.mockReturnValue(s);
    const a = renderWithProviders(<LibroDetailPage />);
    expect(screen.getByText('LIBRO N° 14')).toBeInTheDocument();
    expect(screen.getByText('Abierto')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Generar todos los folios/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Cerrar libro/ })).not.toBeInTheDocument();
    a.unmount();
    mocks.detalle.mockReturnValue(s);
    renderWithProviders(<LibroDetailPage />, con('CREAR', 'EDITAR', 'DETALLE'));
    await userEvent.click(screen.getByRole('button', { name: /Generar todos los folios/ }));
    expect(s.handleGenerarTodosFolios).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Cerrar libro/ }));
    expect(s.handleCerrarLibro).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Folios anulados/ }));
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('5'));
  });

  it('libro cerrado: reabrir y generar deshabilitado', async () => {
    const s = detalle({ libro: libro({ estado: 'CERRADO', foliosAnulados: 0 }) });
    mocks.detalle.mockReturnValue(s);
    renderWithProviders(<LibroDetailPage />, con('CREAR', 'EDITAR'));
    expect(screen.getByRole('button', { name: /Generar todos los folios/ })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /Cerrar libro/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Folios anulados/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Reabrir libro/ }));
    expect(s.handleReabrirLibro).toHaveBeenCalled();
  });

  it('exporta la carrera activa', async () => {
    const s = detalle();
    mocks.detalle.mockReturnValue(s);
    renderWithProviders(<LibroDetailPage />, con('EXPORTAR'));
    await userEvent.click(screen.getByRole('button', { name: /Exportar libro/ }));
    expect(s.handleExportar).toHaveBeenCalledWith(3);
  });

  it('cierre con pendientes abre el modal de confirmación', () => {
    mocks.detalle.mockReturnValue(
      detalle({ cierrePendientes: { total: 2, totalParalelos: 1, paralelos: [] } }),
    );
    renderWithProviders(<LibroDetailPage />);
    expect(screen.getByText('Notas pendientes al cierre del libro')).toBeInTheDocument();
  });

  it('id inválido, carga, error y no encontrado', async () => {
    mocks.detalle.mockReturnValue(detalle({ libro: null, isInvalidId: true }));
    const a = renderWithProviders(<LibroDetailPage />);
    expect(screen.getByText('Identificador de libro inválido')).toBeInTheDocument();
    a.unmount();
    mocks.detalle.mockReturnValue(detalle({ libro: null, loading: true }));
    const b = renderWithProviders(<LibroDetailPage />);
    expect(b.container.querySelector('.ant-spin, .ant-skeleton')).not.toBeNull();
    b.unmount();
    const s = detalle({ libro: null, error: 'Falla' });
    mocks.detalle.mockReturnValue(s);
    const c = renderWithProviders(<LibroDetailPage />);
    expect(screen.getByText(/Falla/)).toBeInTheDocument();
    c.unmount();
    mocks.detalle.mockReturnValue(detalle({ libro: null }));
    renderWithProviders(<LibroDetailPage />);
    expect(screen.getByText('No se encontró el libro de registro solicitado')).toBeInTheDocument();
  });

  it('el conector monta la página', () => {
    mocks.detalle.mockReturnValue(detalle({ libro: null, isInvalidId: true }));
    renderWithProviders(<LibroDetailConnector />);
    expect(screen.getByText('Identificador de libro inválido')).toBeInTheDocument();
  });
});

describe('LibroAnuladosPage', () => {
  const anuladosState = (extra = {}) => ({
    libro: { libroLabel: 'LIBRO N° 14' },
    anulados: [{ id: 1, cursoLabel: 'A', observaciones: 'Duplicado' }],
    loading: false,
    error: null,
    isInvalidId: false,
    breadcrumbItems: [],
    tableColumns: [{ title: 'Curso', dataIndex: 'cursoLabel', key: 'curso' }],
    handleVolver: vi.fn(),
    refetch: vi.fn(),
    ...extra,
  });

  it('lista los folios anulados', () => {
    mocks.anulados.mockReturnValue(anuladosState());
    renderWithProviders(<LibroAnuladosPage />);
    expect(screen.getByText('Folios anulados · LIBRO N° 14')).toBeInTheDocument();
    expect(screen.getByText('Folios anulados (1)')).toBeInTheDocument();
  });

  it('vacío, error con reintento e id inválido', async () => {
    mocks.anulados.mockReturnValue(anuladosState({ anulados: [] }));
    const a = renderWithProviders(<LibroAnuladosPage />);
    expect(screen.getByText('Este libro no tiene folios anulados.')).toBeInTheDocument();
    a.unmount();
    const s = anuladosState({ libro: null, anulados: [], error: 'Falla' });
    mocks.anulados.mockReturnValue(s);
    const b = renderWithProviders(<LibroAnuladosPage />);
    expect(screen.getAllByText('Folios anulados').length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole('button', { name: /Reintentar/ }));
    expect(s.refetch).toHaveBeenCalled();
    b.unmount();
    mocks.anulados.mockReturnValue(anuladosState({ libro: null, anulados: [], isInvalidId: true }));
    renderWithProviders(<LibroAnuladosPage />);
    expect(screen.getByText('Identificador de libro inválido')).toBeInTheDocument();
  });

  it('el conector monta la página', () => {
    mocks.anulados.mockReturnValue(anuladosState());
    renderWithProviders(<LibroAnuladosConnector />);
    expect(screen.getByText('Folios anulados (1)')).toBeInTheDocument();
  });
});

describe('FolioPreviewPage', () => {
  const folio = (extra = {}) => ({
    estado: 'BORRADOR',
    libroEstado: 'ABIERTO',
    folioLabel: 'FOLIO N° 12',
    cursoLabel: '1er Año · A',
    turno: 'Noche',
    codigoRegistro: 'R-1',
    numeroLibro: 14,
    numeroFolio: 12,
    gestionNombre: 'Gestión 2026',
    carreraNombre: 'Sistemas',
    asignaturas: [{ ofertaCursoId: 1, sigla: 'MAT', nombre: 'Matemática' }, { ofertaCursoId: 2, nombre: 'Física' }],
    estudiantes: [
      { id: 1, numeroOrden: 1, nombreCompleto: 'PEREZ JUAN', ci: '123', expedicion: 'SC', celdas: { 1: 70 }, estadoAcademico: 'APROBADO', observaciones: 'Beca' },
    ],
    ...extra,
  });
  const preview = (extra = {}) => ({
    folio: folio(),
    loading: false,
    error: null,
    isInvalidId: false,
    breadcrumbItems: [],
    handleVolverAlLibro: vi.fn(),
    handleAnular: vi.fn().mockResolvedValue({ success: true }),
    cambiandoEstado: false,
    filaEnEdicion: null,
    abrirEdicionFila: vi.fn(),
    cerrarEdicionFila: vi.fn(),
    handleGuardarFila: vi.fn(),
    guardandoFila: false,
    ...extra,
  });

  it('muestra el documento: cabecera, nómina, NP y borrador sin firmas', () => {
    mocks.folio.mockReturnValue(preview());
    renderWithProviders(<FolioPreviewPage />);
    expect(screen.getByText('FOLIO N° 12')).toBeInTheDocument();
    expect(screen.getByText('PEREZ JUAN')).toBeInTheDocument();
    expect(screen.getByText('123 SC')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument();
    expect(screen.getByText('NP')).toHaveClass('folio-sheet__np');
    expect(screen.getByText('Aprobado')).toBeInTheDocument();
    expect(screen.getByText(/DOCUMENTO BORRADOR/)).toBeInTheDocument();
  });

  it('libro cerrado muestra las firmas y congela la edición', () => {
    mocks.folio.mockReturnValue(preview({ folio: folio({ libroEstado: 'CERRADO' }) }));
    const { container } = renderWithProviders(<FolioPreviewPage />, con('EDITAR'));
    expect(container.querySelector('.folio-sheet__firmas')).not.toBeNull();
    expect(screen.queryByText(/DOCUMENTO BORRADOR/)).not.toBeInTheDocument();
    expect(screen.queryByTitle('Editar observación')).not.toBeInTheDocument();
  });

  it('RBAC: editar observación solo con EDITAR y libro abierto', async () => {
    const s = preview();
    mocks.folio.mockReturnValue(s);
    const a = renderWithProviders(<FolioPreviewPage />);
    expect(screen.queryByTitle('Editar observación')).not.toBeInTheDocument();
    a.unmount();
    mocks.folio.mockReturnValue(s);
    renderWithProviders(<FolioPreviewPage />, con('EDITAR'));
    await userEvent.click(screen.getByTitle('Editar observación'));
    expect(s.abrirEdicionFila).toHaveBeenCalledWith(s.folio.estudiantes[0]);
  });

  it('folio anulado no es editable ni anulable', () => {
    mocks.folio.mockReturnValue(preview({ folio: folio({ estado: 'ANULADO' }) }));
    renderWithProviders(<FolioPreviewPage />, con('EDITAR', 'APROBAR'));
    expect(screen.queryByTitle('Editar observación')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Anular folio/ })).not.toBeInTheDocument();
  });

  it('RBAC: anular exige APROBAR, pide motivo y cierra el modal al terminar', async () => {
    const s = preview();
    mocks.folio.mockReturnValue(s);
    const a = renderWithProviders(<FolioPreviewPage />);
    expect(screen.queryByRole('button', { name: /Anular folio/ })).not.toBeInTheDocument();
    a.unmount();
    mocks.folio.mockReturnValue(s);
    renderWithProviders(<FolioPreviewPage />, con('APROBAR'));
    await userEvent.click(screen.getByRole('button', { name: /Anular folio/ }));
    await userEvent.type(await screen.findByPlaceholderText(/Explique por qué se anula/), 'duplicado');
    await userEvent.click(screen.getAllByRole('button', { name: 'Anular folio' }).at(-1));
    await waitFor(() => expect(s.handleAnular).toHaveBeenCalledWith('duplicado'));
  });

  it('id inválido, carga, error y no encontrado', () => {
    mocks.folio.mockReturnValue(preview({ folio: null, isInvalidId: true }));
    const a = renderWithProviders(<FolioPreviewPage />);
    expect(screen.getByText('Identificador de libro o folio inválido')).toBeInTheDocument();
    a.unmount();
    mocks.folio.mockReturnValue(preview({ folio: null, loading: true }));
    const b = renderWithProviders(<FolioPreviewPage />);
    expect(b.container.querySelector('.ant-spin-spinning')).not.toBeNull();
    b.unmount();
    mocks.folio.mockReturnValue(preview({ folio: null, error: 'Falla del servidor' }));
    const c = renderWithProviders(<FolioPreviewPage />);
    expect(screen.getByText('No se pudo cargar el folio')).toBeInTheDocument();
    c.unmount();
    mocks.folio.mockReturnValue(preview({ folio: null }));
    renderWithProviders(<FolioPreviewPage />);
    expect(screen.getByText('No se encontró el folio solicitado.')).toBeInTheDocument();
  });

  it('el conector monta la página', () => {
    mocks.folio.mockReturnValue(preview({ folio: null, isInvalidId: true }));
    renderWithProviders(<FolioPreviewConnector />);
    expect(screen.getByText('Identificador de libro o folio inválido')).toBeInTheDocument();
  });
});
