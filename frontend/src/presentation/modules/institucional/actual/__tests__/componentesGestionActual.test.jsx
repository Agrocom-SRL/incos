import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import CalendarMonthMini from '../components/atoms/CalendarMonthMini';
import CronogramaActividadCell from '../components/atoms/CronogramaActividadCell';
import CronogramaActividadSelectorField from '../components/atoms/CronogramaActividadSelectorField';
import CronogramaDuracionCell from '../components/atoms/CronogramaDuracionCell';
import CronogramaEtapaCell from '../components/atoms/CronogramaEtapaCell';
import PeriodoRangePicker from '../components/atoms/PeriodoRangePicker';
import BimestresTimeline from '../components/organisms/BimestresTimeline';
import IniciarGestionCard from '../components/organisms/IniciarGestionCard';
import GestionActualCard from '../components/organisms/GestionActualCard';
import GestionActualKpiStrip from '../components/organisms/GestionActualKpiStrip';
import IniciarGestionProgressModal from '../components/organisms/IniciarGestionProgressModal';
import CerrarBimestreCard from '../components/organisms/CerrarBimestreCard';
import EtapaFormModal from '../components/organisms/EtapaFormModal';

vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));

const editar = { auth: { permisos: [permiso('institucional.gestion.actual', 'EDITAR')] } };

describe('átomos del cronograma', () => {
  it('CalendarMonthMini pinta los días con info y marca hoy', () => {
    const getDiaInfo = (iso) => (iso === '2026-03-10' ? { color: '#ff0000', nombre: 'Feriado' } : null);
    const { container } = render(<CalendarMonthMini year={2026} month={2} getDiaInfo={getDiaInfo} hoyISO="2026-03-15" />);
    expect(screen.getByText('Marzo')).toBeInTheDocument();
    expect(screen.getByTitle('10 — Feriado')).toHaveClass('bim-cal-day--painted');
    expect(container.querySelector('.bim-cal-day--hoy').textContent).toBe('15');
  });

  it('CronogramaActividadCell / Duración / Etapa', () => {
    const { rerender } = render(<CronogramaActividadCell nombre="Inscripciones" codigo="INS" tipo="ACADEMICA" />);
    expect(screen.getByText('INSCRIPCIONES')).toBeInTheDocument();
    rerender(<CronogramaDuracionCell fechaInicio="2026-03-05" />);
    expect(screen.getByText('Todo el día')).toBeInTheDocument();
    rerender(<CronogramaDuracionCell fechaInicio="2026-03-05" fechaFin="2026-03-10" />);
    expect(screen.queryByText('Todo el día')).not.toBeInTheDocument();
    rerender(<CronogramaEtapaCell nombre="Receso" colorHex="#112233" />);
    expect(screen.getByText('Receso')).toBeInTheDocument();
    rerender(<CronogramaEtapaCell colorHex="no-color" />);
    expect(screen.getByText('—')).toHaveClass('cronograma-pill--otro');
  });

  it('CronogramaActividadSelectorField: buscar, quitar y deshabilitado', async () => {
    const onSearch = vi.fn();
    const onClear = vi.fn();
    const { rerender } = render(<CronogramaActividadSelectorField value={3} displayName="Inscripciones" iconName="CalendarOutlined" onSearch={onSearch} onClear={onClear} />);
    expect(screen.getByDisplayValue('Inscripciones')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Buscar/ }));
    expect(onSearch).toHaveBeenCalled();
    await userEvent.click(screen.getByLabelText('Quitar actividad'));
    expect(onClear).toHaveBeenCalled();
    rerender(<CronogramaActividadSelectorField value={null} onSearch={onSearch} />);
    expect(screen.getByPlaceholderText('Busca una actividad del catálogo…')).toBeInTheDocument();
    rerender(<CronogramaActividadSelectorField value={5} disabled onSearch={onSearch} />);
    expect(screen.getByDisplayValue('Actividad #5')).toBeDisabled();
    expect(screen.getByRole('button', { name: /Buscar/ })).toBeDisabled();
  });

  it('PeriodoRangePicker convierte fechas ISO y notifica al cambiar', async () => {
    const onChange = vi.fn();
    render(<PeriodoRangePicker fechaInicio="2026-03-05T00:00:00" fechaFin="2026-03-10" onChange={onChange} />);
    expect(screen.getByDisplayValue('05/03/2026')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10/03/2026')).toBeInTheDocument();
  });
});

describe('BimestresTimeline', () => {
  it('vacío y con bimestres', () => {
    const { unmount } = renderWithProviders(<BimestresTimeline />);
    expect(screen.getByText('No hay bimestres configurados para la gestión vigente')).toBeInTheDocument();
    unmount();
    renderWithProviders(
      <BimestresTimeline timeline={[{ numero: 1, nombre: 'Primer bimestre', stepStatus: 'process', tag: { color: 'processing', label: 'En curso' }, rango: '01/03 – 30/04' }, { numero: 2, stepStatus: 'wait', tag: { color: 'default', label: 'Pendiente' }, rango: '01/05 – 30/06' }]} />,
    );
    expect(screen.getByText('Primer bimestre')).toBeInTheDocument();
    expect(screen.getByText('Bimestre 2')).toBeInTheDocument();
    expect(screen.getByText('En curso')).toBeInTheDocument();
  });
});

describe('tarjetas de gestión actual', () => {
  it('GestionActualCard muestra datos y "Control de bimestres" exige EDITAR', async () => {
    const onIrAControl = vi.fn();
    const { unmount } = renderWithProviders(
      <GestionActualCard gestionVigente={{ nombre: 'Gestión 2026', anio: 2026, codigo: 'G-26' }} estadoLabel="En curso" estadoColor="processing" bimestreVigente={2} onIrAControl={onIrAControl} />,
      editar,
    );
    expect(screen.getByText('Gestión 2026 (2026)')).toBeInTheDocument();
    expect(screen.getByText('B2')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Control de bimestres/ }));
    expect(onIrAControl).toHaveBeenCalled();
    unmount();
    renderWithProviders(<GestionActualCard onIrAControl={onIrAControl} />);
    expect(screen.getByText('Gestión vigente')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Control de bimestres/ })).not.toBeInTheDocument();
  });

  it('GestionActualKpiStrip: iniciada vs pendiente y bimestre', () => {
    const { unmount } = renderWithProviders(<GestionActualKpiStrip iniciada kpis={{ matriculasCursando: 120, totalCursos: 30, totalDocentes: 12, bimestreVigente: 2 }} />);
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('Bimestre 2 de 4')).toBeInTheDocument();
    unmount();
    renderWithProviders(<GestionActualKpiStrip iniciada={false} />);
    expect(screen.getByText('Cursado no iniciado')).toBeInTheDocument();
    expect(screen.getByText('Sin bimestre activo')).toBeInTheDocument();
  });

  it('IniciarGestionCard: habilita el inicio solo cuando corresponde', async () => {
    const onIniciarGestion = vi.fn();
    const { unmount } = renderWithProviders(<IniciarGestionCard iniciada={false} fase={{ fase: 'EN_CURSO' }} onIniciarGestion={onIniciarGestion} />, editar);
    await userEvent.click(screen.getByRole('button', { name: /Habilitar inicio de clases/ }));
    expect(onIniciarGestion).toHaveBeenCalled();
    unmount();
    const { unmount: u2 } = renderWithProviders(<IniciarGestionCard iniciada fase={{ fase: 'EN_CURSO' }} onIniciarGestion={onIniciarGestion} />, editar);
    expect(screen.getByRole('button', { name: /Cursado ya activado/ })).toBeDisabled();
    u2();
    renderWithProviders(<IniciarGestionCard iniciada={false} fase={{ fase: 'PRE_INICIO', ventanaAbierta: false, disponibleDesde: '2026-03-01T12:00:00' }} onIniciarGestion={onIniciarGestion} />, editar);
    expect(screen.getByRole('button', { name: /Habilitar inicio de clases/ })).toBeDisabled();
    expect(screen.getByText(/Disponible a partir del/)).toBeInTheDocument();
  });

  it('CerrarBimestreCard: bloqueada sin gestión iniciada; validación con notas pendientes o lista', async () => {
    const onValidarCierre = vi.fn();
    const onCerrarBimestre = vi.fn();
    const { unmount } = renderWithProviders(<CerrarBimestreCard iniciada={false} bimestreVigente={null} onValidarCierre={onValidarCierre} onCerrarBimestre={onCerrarBimestre} />, editar);
    expect(screen.getByText('Disponible una vez iniciada la gestión.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Validar cierre/ })).toBeDisabled();
    unmount();

    const { unmount: u2 } = renderWithProviders(
      <CerrarBimestreCard iniciada bimestreVigente={2} validacion={{ puedeCerrar: false, cursosConNotasFaltantes: [{ asignacionId: 1, materia: 'Álgebra', docente: 'Luna', paralelo: 'A', cantidadFaltantes: 3 }] }} onValidarCierre={onValidarCierre} onCerrarBimestre={onCerrarBimestre} />,
      editar,
    );
    expect(screen.getByText('Notas pendientes impiden el cierre')).toBeInTheDocument();
    expect(screen.getByText(/Álgebra · Luna \(A\) — 3 sin nota/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Validar cierre/ }));
    await userEvent.click(screen.getByRole('button', { name: /Cerrar bimestre 2/ }));
    expect(onValidarCierre).toHaveBeenCalled();
    expect(onCerrarBimestre).toHaveBeenCalled();
    u2();

    renderWithProviders(<CerrarBimestreCard iniciada bimestreVigente={2} validacion={{ puedeCerrar: true }} />, editar);
    expect(screen.getByText('El bimestre puede cerrarse')).toBeInTheDocument();
  });
});

describe('IniciarGestionProgressModal', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('avanza por los pasos mientras está abierto', async () => {
    render(<IniciarGestionProgressModal open />);
    expect(screen.getByText('Iniciando gestión académica')).toBeInTheDocument();
    expect(screen.getByText('Activando matrículas')).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(1300 * 3); });
    expect(screen.getByText('Habilitando la gestión')).toBeInTheDocument();
  });
});

describe('EtapaFormModal', () => {
  it('exige nombre y fechas y no envía incompleto', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<EtapaFormModal open onCancel={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Crear etapa' }));
    expect(await screen.findByText('Indique un nombre.')).toBeInTheDocument();
    expect(screen.getByText('Seleccione el rango de fechas.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('con nombre y rango envía fechas ISO y color hex', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    renderWithProviders(<EtapaFormModal open onCancel={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByPlaceholderText('Ej. Receso de invierno'), '  Receso  ');
    const [ini, fin] = screen.getAllByPlaceholderText(/Inicio|Fin/);
    await userEvent.type(ini, '05/03/2026{enter}');
    await userEvent.type(fin, '10/03/2026{enter}');
    await userEvent.click(screen.getByRole('button', { name: 'Crear etapa' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ nombre: 'Receso', fechaInicio: '2026-03-05', fechaFin: '2026-03-10', colorHex: '#10b981' });
  });
});
