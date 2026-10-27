/**
 * Nivelaciones: grilla, columnas, drawers (evento y resultado), páginas y conectores.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '../../../../../test/renderWithProviders.jsx';
import { renderCell, renderCells, findColumn } from '../../../../../test/renderColumns.jsx';

const mocks = vi.hoisted(() => ({
  paralelo: vi.fn(),
  paralelos: vi.fn(),
  pendientes: vi.fn(),
  selector: vi.fn(),
  registrar: vi.fn(),
  programar: vi.fn(),
}));
const navigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@application-academico/nivelaciones/hooks/useNivelacionParalelo.js', () => ({
  useNivelacionParalelo: () => mocks.paralelo(),
}));
vi.mock('@application-academico/nivelaciones/hooks/useParalelosNivelacion.js', () => ({
  useParalelosNivelacion: () => mocks.paralelos(),
}));
vi.mock('@application-academico/nivelaciones/hooks/useNivelacionesPendientes.js', () => ({
  useNivelacionesPendientes: () => mocks.pendientes(),
}));
vi.mock('@application-academico/nivelaciones/hooks/useNivelacionSelector.js', () => ({
  useNivelacionSelector: () => mocks.selector(),
}));
vi.mock('@application-academico/nivelaciones/hooks/api', () => ({
  useRegistrarEventoHistorial: () => mocks.registrar(),
  useProgramarNivelacion: () => mocks.programar(),
}));

import NivelacionGrid from '../components/NivelacionGrid.jsx';
import CeldaEstudiante from '../components/CeldaEstudiante.jsx';
import CabeceraAsignatura from '../components/CabeceraAsignatura.jsx';
import EventoHistorialDrawer from '../components/EventoHistorialDrawer.jsx';
import ResultadoNivelacionDrawer from '../components/ResultadoNivelacionDrawer.jsx';
import { createMateriasPendientesEstudianteColumns } from '../config/materiasPendientesEstudianteColumns.jsx';
import { createNivelacionParalelosColumns } from '../config/nivelacionParalelosColumns.jsx';
import { createNivelacionPendientesColumns } from '../config/nivelacionPendientesColumns.jsx';
import { createNivelacionSelectorColumns } from '../config/nivelacionSelectorColumns.jsx';
import NivelacionListarPage from '../pages/NivelacionListarPage.jsx';
import NivelacionParaleloPage from '../pages/NivelacionParaleloPage.jsx';
import NivelacionAprobarPage from '../pages/NivelacionAprobarPage.jsx';
import NivelacionInscribirPage from '../pages/NivelacionInscribirPage.jsx';
import NivelacionListarConnector from '../connectors/NivelacionListarConnector.jsx';
import NivelacionParaleloConnector from '../connectors/NivelacionParaleloConnector.jsx';
import NivelacionAprobarConnector from '../connectors/NivelacionAprobarConnector.jsx';
import NivelacionInscribirConnector from '../connectors/NivelacionInscribirConnector.jsx';

const matchMediaOriginal = window.matchMedia;
beforeEach(() => {
  navigate.mockClear();
  Object.values(mocks).forEach((m) => m.mockReset());
  mocks.registrar.mockReturnValue({ registrarEvento: vi.fn().mockResolvedValue({ success: true, data: { id: 1 } }), loading: false });
  mocks.programar.mockReturnValue({ programar: vi.fn().mockResolvedValue({ success: true, data: { id: 2 } }), loading: false });
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

const con = (...pares) => ({ auth: { permisos: pares.map(([c, ...a]) => permiso(c, ...a)) } });

describe('NivelacionGrid', () => {
  const asignaturas = [
    { ofertaCursoId: 1, sigla: 'MAT', nombre: 'Matemática' },
    { ofertaCursoId: 2, sigla: 'FIS', nombre: 'Física' },
    { ofertaCursoId: 3, sigla: 'QUI', nombre: 'Química' },
  ];
  const evento = { stateType: 'NIVELACION_1RA', transitionDate: '2026-03-01' };
  const estudiantes = [
    {
      estudianteId: 1,
      nombreCompleto: 'PEREZ JUAN',
      codigoEstudiante: 'E-1',
      celdas: { 1: { notaFinal: 70 }, 2: { notaFinal: null, evento }, 3: undefined },
    },
  ];

  it('muestra nota, evento clicable y celda vacía', async () => {
    const onClick = vi.fn();
    renderWithProviders(<NivelacionGrid asignaturas={asignaturas} estudiantes={estudiantes} onCeldaEventoClick={onClick} />);
    expect(screen.getByText('PEREZ JUAN')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Ver detalle: Nivelación 1ra' }));
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ estudianteId: 1 }), asignaturas[1], estudiantes[0].celdas[2]);
  });

  it('vacío', () => {
    renderWithProviders(<NivelacionGrid asignaturas={asignaturas} estudiantes={[]} />);
    expect(screen.getByText('Sin estudiantes matriculados en el paralelo')).toBeInTheDocument();
  });

  it('piezas locales', () => {
    const { rerender } = render(<CeldaEstudiante nombre="X" codigo="C" />);
    expect(screen.getByText('C')).toBeInTheDocument();
    rerender(<CeldaEstudiante nombre="X" />);
    expect(screen.queryByText('C')).not.toBeInTheDocument();
    rerender(<CabeceraAsignatura sigla="MAT" nombre="Matemática" />);
    expect(screen.getByText('MAT')).toBeInTheDocument();
    rerender(<CabeceraAsignatura nombre="Física" />);
    expect(screen.getAllByText('Física').length).toBeGreaterThan(0);
  });
});

describe('columnas de nivelaciones', () => {
  it('paralelos: celdas, orden y RBAC de "Ver grilla"', async () => {
    const onVer = vi.fn();
    const columns = createNivelacionParalelosColumns({ onVerGrilla: onVer });
    const fila = { periodoNombre: '1er Año', paraleloNombre: 'A', turno: 'Noche', totalEstudiantes: 20, totalPendientes: 3 };
    const cells = renderCells(columns, fila, { index: 1, rowOffset: 4 });
    expect(cells.nro).toBe('6');
    expect(cells.paralelo).toContain('1er Año · Paralelo A');
    expect(cells.totalEstudiantes).toBe('20');
    expect(cells.totalPendientes).toBe('3');
    expect(renderCell(findColumn(columns, 'totalPendientes'), { totalPendientes: 0 }).text).toBe('0');
    expect(renderCell(findColumn(columns, 'paralelo'), {}).text).toBe('—');
    expect(findColumn(columns, 'paralelo').sorter({ paraleloNombre: 'A' }, { paraleloNombre: 'B' })).toBeLessThan(0);
    expect(findColumn(columns, 'totalEstudiantes').sorter({ totalEstudiantes: 5 }, {})).toBe(5);
    expect(findColumn(columns, 'totalPendientes').sorter({ totalPendientes: 5 }, { totalPendientes: 2 })).toBe(3);
    const col = findColumn(columns, 'acciones');
    const a = renderCell(col, fila);
    expect(screen.queryByRole('button', { name: /Ver grilla/ })).not.toBeInTheDocument();
    a.unmount();
    renderCell(col, fila, con(['academico.nivelacion.ver', 'LISTAR']));
    await userEvent.click(screen.getByRole('button', { name: /Ver grilla/ }));
    expect(onVer).toHaveBeenCalledWith(fila);
  });

  it('pendientes: celdas, materia arrastrada y RBAC de "Gestionar"', async () => {
    const onGestionar = vi.fn();
    const columns = createNivelacionPendientesColumns({ onGestionar });
    const fila = { nombreCompleto: 'perez juan', codigoEstudiante: 'E-1', asignaturaSigla: 'MAT', asignaturaNombre: 'Matemática', paraleloGestionId: null, stateType: 'NIVELACION_1RA', status: 'PROGRAMADA', examDate: null };
    const cells = renderCells(columns, fila);
    expect(cells.estudiante).toContain('perez juan');
    expect(cells.materia).toContain('MAT — Matemática');
    expect(cells.materia).toContain('Materia arrastrada');
    expect(cells.stateType).toBe('Nivelación 1ra');
    expect(cells.status).toBe('Programada');
    expect(cells.examDate).toBe('Sin programar');
    expect(findColumn(columns, 'estudiante').sorter({ nombreCompleto: 'A' }, { nombreCompleto: 'B' })).toBeLessThan(0);
    expect(findColumn(columns, 'examDate').sorter({ examDate: '2026-01-01' }, { examDate: '2026-02-01' })).toBeLessThan(0);
    const col = findColumn(columns, 'acciones');
    const a = renderCell(col, fila);
    expect(screen.queryByRole('button', { name: /Gestionar/ })).not.toBeInTheDocument();
    a.unmount();
    renderCell(col, fila, con(['academico.nivelacion.aprobar', 'APROBAR']));
    await userEvent.click(screen.getByRole('button', { name: /Gestionar/ }));
    expect(onGestionar).toHaveBeenCalledWith(fila);
  });

  it('selector de estudiante: identidad en mayúsculas y RBAC de "Seleccionar"', async () => {
    const onSel = vi.fn();
    const columns = createNivelacionSelectorColumns({ onSeleccionar: onSel });
    const fila = { nombreCompleto: 'perez juan', codigoEstudiante: 'E-1', ci: '123' };
    const cells = renderCells(columns, fila);
    expect(cells.estudiante).toContain('PEREZ JUAN');
    expect(cells.ci).toContain('123');
    expect(findColumn(columns, 'estudiante').sorter({ nombreCompleto: 'B' }, { nombreCompleto: 'A' })).toBeGreaterThan(0);
    const col = findColumn(columns, 'acciones');
    const a = renderCell(col, fila);
    expect(screen.queryByRole('button', { name: /Seleccionar/ })).not.toBeInTheDocument();
    a.unmount();
    renderCell(col, fila, con(['academico.nivelacion.inscribir', 'CREAR']));
    await userEvent.click(screen.getByRole('button', { name: /Seleccionar/ }));
    expect(onSel).toHaveBeenCalledWith(fila);
  });

  it('materias pendientes del estudiante', async () => {
    const onSel = vi.fn();
    const columns = createMateriasPendientesEstudianteColumns({ onSeleccionar: onSel });
    const fila = { asignaturaSigla: 'MAT', asignaturaNombre: 'Matemática', evento: { stateType: 'VENCIDA', transitionDate: '2026-01-02' } };
    const cells = renderCells(columns, fila);
    expect(cells.materia).toContain('MAT — Matemática');
    expect(cells.tipoEvento).toBe('Materia vencida');
    expect(cells.transitionDate).toBe('2026-01-02');
    expect(renderCell(findColumn(columns, 'transitionDate'), {}).text).toBe('—');
    renderCell(findColumn(columns, 'acciones'), fila, con(['academico.nivelacion.inscribir', 'CREAR']));
    await userEvent.click(screen.getByRole('button', { name: /Registrar evento/ }));
    expect(onSel).toHaveBeenCalledWith(fila);
  });
});

describe('EventoHistorialDrawer', () => {
  const contexto = { estudianteNombre: 'PEREZ JUAN', estudianteCodigo: 'E-1', asignaturaSigla: 'MAT', asignaturaNombre: 'Matemática' };
  const montar = (extra = {}) => {
    const props = { abierto: true, modo: 'crear', contexto, ancla: { subjectEnrollmentId: 3 }, onCerrar: vi.fn(), onGuardado: vi.fn(), ...extra };
    return { props, ...renderWithProviders(<EventoHistorialDrawer {...props} />) };
  };
  const elegirTipo = async (label) => {
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText(label, { selector: '.ant-select-item-option-content' }));
  };

  it('modo crear: contexto read-only y tipos agrupados sin decisión administrativa', async () => {
    montar();
    expect(await screen.findByText('Registrar evento de nivelación')).toBeInTheDocument();
    expect(screen.getByText('E-1 — PEREZ JUAN')).toBeInTheDocument();
    expect(screen.getByText('MAT — Matemática')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('combobox'));
    expect(await screen.findByText('Materia vencida', { selector: '.ant-select-item-option-content' })).toBeInTheDocument();
    expect(screen.queryByText('Abandono', { selector: '.ant-select-item-option-content' })).not.toBeInTheDocument();
  });

  it('exige el tipo de evento', async () => {
    const { props } = montar();
    await userEvent.click(await screen.findByRole('button', { name: 'Registrar' }));
    expect(await screen.findByText('Seleccione un tipo de evento')).toBeInTheDocument();
    expect(props.onGuardado).not.toHaveBeenCalled();
  });

  it('registra un evento sin examen con el ancla y cierra', async () => {
    const registrarEvento = vi.fn().mockResolvedValue({ success: true, data: { id: 9 } });
    mocks.registrar.mockReturnValue({ registrarEvento, loading: false });
    const { props } = montar();
    await elegirTipo('Materia vencida');
    await userEvent.type(screen.getByPlaceholderText('Detalle adicional…'), '  convalidada  ');
    await userEvent.click(screen.getByRole('button', { name: 'Registrar' }));
    await waitFor(() => expect(registrarEvento).toHaveBeenCalled());
    expect(registrarEvento).toHaveBeenCalledWith({
      subjectEnrollmentId: 3,
      stateType: 'VENCIDA',
      transitionDate: null,
      observations: 'convalidada',
    });
    expect(await screen.findByText('Evento registrado')).toBeInTheDocument();
    expect(props.onGuardado).toHaveBeenCalledWith({ id: 9 });
    expect(props.onCerrar).toHaveBeenCalled();
  });

  it('un tipo de examen muestra la programación y usa el caso de uso de examen', async () => {
    const programar = vi.fn().mockResolvedValue({ success: true, data: { id: 5 } });
    mocks.programar.mockReturnValue({ programar, loading: false });
    montar({ ancla: { enrollmentId: 4, planSubjectId: 8 } });
    await elegirTipo('Nivelación 1ra');
    expect(await screen.findByText('Programar examen')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Registrar' }));
    await waitFor(() => expect(programar).toHaveBeenCalled());
    expect(programar).toHaveBeenCalledWith(expect.objectContaining({ enrollmentId: 4, planSubjectId: 8, stateType: 'NIVELACION_1RA' }));
    expect(await screen.findByText('Examen de nivelación programado')).toBeInTheDocument();
  });

  it('un error del servicio se muestra y no cierra', async () => {
    mocks.registrar.mockReturnValue({ registrarEvento: vi.fn().mockResolvedValue({ success: false, error: 'Ya existe un evento' }), loading: false });
    const { props } = montar();
    await elegirTipo('Materia vencida');
    await userEvent.click(screen.getByRole('button', { name: 'Registrar' }));
    expect(await screen.findByText('Ya existe un evento')).toBeInTheDocument();
    expect(props.onCerrar).not.toHaveBeenCalled();
  });

  it('cancelar cierra, y guardando bloquea el cierre', async () => {
    const { props, unmount } = montar();
    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));
    expect(props.onCerrar).toHaveBeenCalled();
    unmount();
    mocks.registrar.mockReturnValue({ registrarEvento: vi.fn(), loading: true });
    const b = montar();
    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));
    expect(b.props.onCerrar).not.toHaveBeenCalled();
  });

  it('modo detalle: solo lectura con nivelación y nota forzada', async () => {
    montar({
      modo: 'detalle',
      detalle: {
        stateType: 'ABANDONO',
        transitionDate: '2026-02-02',
        resultingGrade: 0,
        forcedGrade: true,
        observations: 'Retiro voluntario',
        nivelacion: { status: 'APROBADA', examDate: '2026-02-10' },
      },
    });
    expect(await screen.findByText('Detalle del evento')).toBeInTheDocument();
    expect(screen.getByText('Evento ya registrado')).toBeInTheDocument();
    expect(screen.getByText('Abandono')).toBeInTheDocument();
    expect(screen.getByText('Nota forzada')).toBeInTheDocument();
    expect(screen.getByText('Retiro voluntario')).toBeInTheDocument();
    expect(screen.getByText('Aprobada')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Registrar' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });

  it('modo detalle sin datos usa valores de reserva', async () => {
    montar({ modo: 'detalle', detalle: {} });
    expect(await screen.findByText('Detalle del evento')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(1);
  });
});
