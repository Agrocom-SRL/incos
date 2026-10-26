import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import FilterChip from '../components/atoms/FilterChip';
import KpiCard from '../components/atoms/KpiCard';
import ParaleloPlanSemanaCell from '../components/atoms/ParaleloPlanSemanaCell';
import ProgressBar from '../components/atoms/ProgressBar';
import StatusTag from '../components/atoms/StatusTag';
import StepPill from '../components/atoms/StepPill';
import HorariosAlertBanner from '../components/molecules/HorariosAlertBanner';
import HorariosCapacitySidebar from '../components/molecules/HorariosCapacitySidebar';
import HorariosFiltersBar from '../components/molecules/HorariosFiltersBar';
import HorariosFlowSteps from '../components/molecules/HorariosFlowSteps';
import ParaleloCard from '../components/molecules/ParaleloCard';

const mocks = vi.hoisted(() => ({ flow: vi.fn() }));
vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('@application-institucional/horarios', async (orig) => ({ ...(await orig()), useHorariosFlow: mocks.flow }));

describe('átomos de horarios', () => {
  it('KpiCard: valor, subtítulo de texto o nodo y porcentaje acotado', () => {
    const { container, rerender } = render(<KpiCard label="Paralelos" value={12} sub="Total" badgeText="Hoy" percent={150} />);
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(container.querySelector('[style*="width: 100%"]')).not.toBeNull();
    rerender(<KpiCard label="Paralelos" value={0} sub={<b>nodo</b>} badgeText="x" intent="danger" percent={-5} />);
    expect(screen.getByText('nodo')).toBeInTheDocument();
    expect(container.querySelector('[style*="width: 0%"]')).not.toBeNull();
  });

  it('FilterChip: "Todos" por defecto y notifica el valor elegido', async () => {
    const onChange = vi.fn();
    render(<FilterChip label="Carrera" value="all" options={['Sistemas', 'Contaduría']} onChange={onChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('Sistemas', { selector: '.ant-select-item-option-content' }));
    expect(onChange).toHaveBeenCalledWith('Sistemas', expect.anything());
  });

  it('ProgressBar evita dividir por cero', () => {
    const { rerender } = render(<ProgressBar assigned={3} required={6} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    rerender(<ProgressBar />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('StatusTag: etiqueta del tablero o contenido propio', () => {
    const { rerender } = render(<StatusTag status="completo" />);
    expect(screen.getByText(/Completo|completo/i)).toBeInTheDocument();
    rerender(<StatusTag status="otro">Texto propio</StatusTag>);
    expect(screen.getByText('Texto propio')).toBeInTheDocument();
  });

  it('StepPill: deshabilitado no dispara; completado muestra el check', async () => {
    const onClick = vi.fn();
    const { rerender } = render(<StepPill label="Planes" index={1} onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(<StepPill label="Planes" index={1} disabled onClick={onClick} />);
    expect(screen.getByRole('button')).toBeDisabled();
    rerender(<StepPill label="Planes" index={1} isCompleted onClick={onClick} />);
    expect(screen.getByRole('img', { name: /check/ })).toBeInTheDocument();
  });
});

describe('ParaleloPlanSemanaCell', () => {
  const ev = { cursoCodigo: 'C-1', horaInicio: '08:00:00', horaFin: '09:30:00', materiaSigla: 'MAT-101', materiaNombre: 'Álgebra', carrera: 'Sistemas', paralelo: 'A', turno: 'NOCHE', docente: 'Luna', aula: 'A-1', cursoColorHex: '#112233' };

  it('celda vacía no pinta contenido', () => {
    const { container } = render(<ParaleloPlanSemanaCell />);
    expect(container.querySelector('.da-cal-semanal__cell-inner--empty')).not.toBeNull();
  });

  it('chip de solo lectura: hora recortada, materia, docente y aula', () => {
    render(<ParaleloPlanSemanaCell items={[ev]} />);
    expect(screen.getByText('08:00–09:30')).toBeInTheDocument();
    expect(screen.getByText('Álgebra')).toBeInTheDocument();
    expect(screen.getByText('A · NOCHE')).toBeInTheDocument();
    expect(screen.getByText('A-1')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Quitar bloque del plan' })).not.toBeInTheDocument();
  });

  it('editable: permite quitar el bloque y arrastrarlo', async () => {
    const onDeleteChip = vi.fn();
    const onBeginDragChip = vi.fn();
    const { container } = render(<ParaleloPlanSemanaCell items={[ev]} editable slotDia={1} slotMinutes={480} onDeleteChip={onDeleteChip} onBeginDragChip={onBeginDragChip} />);
    await userEvent.click(screen.getByRole('button', { name: 'Quitar bloque del plan' }));
    expect(onDeleteChip).toHaveBeenCalledWith(ev);
    fireEvent.dragStart(container.querySelector('.da-cal-semanal__chip--draggable'));
    expect(onBeginDragChip).toHaveBeenCalledWith(expect.anything(), ev, 1, 480);
    expect(screen.queryByText('A-1')).not.toBeInTheDocument();
  });

  it('sin materia ni sigla cae en "Asignación"', () => {
    render(<ParaleloPlanSemanaCell items={[{ cursoCodigo: 'C-9' }]} />);
    expect(screen.getByText('Asignación C-9')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('moléculas de horarios', () => {
  it('HorariosAlertBanner: sin líneas no renderiza; con líneas las lista', () => {
    const { container, rerender } = render(<HorariosAlertBanner lineas={[null, '']} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<HorariosAlertBanner lineas={['3 cursos sin docente', '2 bloques sin aula']} />);
    expect(screen.getByText('Pendientes para completar horarios')).toBeInTheDocument();
    expect(screen.getByText('2 bloques sin aula')).toBeInTheDocument();
  });

  it('HorariosCapacitySidebar', () => {
    render(<HorariosCapacitySidebar />);
    expect(screen.getByText('Capacidad operativa')).toBeInTheDocument();
  });

  it('HorariosFiltersBar: campos configurables, "Activo" y limpiar filtros', async () => {
    const onFilterChange = vi.fn();
    const onClearFilters = vi.fn();
    const { rerender } = render(
      <HorariosFiltersBar filters={{ carrera: 'all', periodo: 'all', turno: 'all' }} options={{ carreras: ['Sistemas'], periodos: [], turnos: [] }} onFilterChange={onFilterChange} onClearFilters={onClearFilters} />,
    );
    expect(screen.getByText('Vista de planificación')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
    rerender(
      <HorariosFiltersBar filters={{ carrera: 'Sistemas', periodo: 'all', turno: 'all' }} options={{ carreras: ['Sistemas'] }} onFilterChange={onFilterChange} onClearFilters={onClearFilters} visibleFields={['carrera']} title="Armado" />,
    );
    expect(screen.getByText('Armado')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.queryByText('Turno')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(onClearFilters).toHaveBeenCalled();
    rerender(<HorariosFiltersBar filters={{ carrera: 'Sistemas' }} options={{}} onFilterChange={onFilterChange} onClearFilters={onClearFilters} visibleFields={['carrera']} disabled />);
    expect(screen.getByRole('button', { name: 'Limpiar filtros' })).toBeDisabled();
  });

  it('HorariosFiltersBar: ocultar selectores deja solo el encabezado', () => {
    render(<HorariosFiltersBar filters={{}} options={{}} onFilterChange={vi.fn()} ocultarSelectoresFiltro headerTrailing={<span>extra</span>} />);
    expect(screen.queryByText('Carrera')).not.toBeInTheDocument();
    expect(screen.getByText('extra')).toBeInTheDocument();
  });

  it('HorariosFlowSteps: marca el activo, completa los anteriores y navega', async () => {
    const goToStep = vi.fn();
    mocks.flow.mockReturnValue({ steps: [{ key: 'a', label: 'Planes' }, { key: 'b', label: 'Armado' }, { key: 'c', label: 'Publicar' }], currentStep: { key: 'b' }, currentIndex: 1, goToStep });
    render(<HorariosFlowSteps />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
    await userEvent.click(screen.getByRole('button', { name: /Publicar/ }));
    expect(goToStep).toHaveBeenCalledWith('c');
  });
});

describe('ParaleloCard', () => {
  const base = { paralelo: 'A', carrera: 'Sistemas', periodo: '1° año', turno: 'NOCHE', boardBucket: 'sin_horarios', paraleloAulaId: 3 };

  it('el CTA y el permiso dependen de la columna del tablero', async () => {
    const onOpen = vi.fn();
    const { unmount } = renderWithProviders(<ParaleloCard paralelo={base} onOpen={onOpen} />, { auth: { permisos: [permiso('institucional.horario.armado', 'EDITAR')] } });
    expect(screen.getByText('Sistemas')).toBeInTheDocument();
    expect(screen.getByText('1° año · Turno NOCHE')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button'));
    expect(onOpen).toHaveBeenCalledWith(base);
    unmount();
    renderWithProviders(<ParaleloCard paralelo={{ ...base, boardBucket: 'sin_aulas' }} onOpen={onOpen} />, { auth: { permisos: [permiso('institucional.horario.armado', 'EDITAR')] } });
    expect(screen.queryByRole('button', { name: 'Asignar aula' })).not.toBeInTheDocument();
  });

  it('completo ofrece "Ver horario" y "Gestionar cursos" solo con callback y permiso', async () => {
    const onGestionCursos = vi.fn();
    const auth = { permisos: [permiso('institucional.horario.armado', 'EDITAR'), permiso('institucional.gestion.horarios', 'LISTAR')] };
    renderWithProviders(<ParaleloCard paralelo={{ ...base, boardBucket: 'completo' }} onOpen={vi.fn()} onGestionCursos={onGestionCursos} />, { auth });
    expect(screen.getByRole('button', { name: 'Ver horario' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Gestionar cursos' }));
    expect(onGestionCursos).toHaveBeenCalledWith({ ...base, boardBucket: 'completo' });
  });
});
