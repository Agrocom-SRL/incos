import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import HorariosKpiStrip from '../components/organisms/HorariosKpiStrip';
import ParalelosBoard from '../components/organisms/ParalelosBoard';
import HorariosBloquesSinAulaPanel from '../components/organisms/HorariosBloquesSinAulaPanel';
import HorariosCursosSinDocentePanel from '../components/organisms/HorariosCursosSinDocentePanel';
import HorariosPlanPendientesLista from '../components/organisms/HorariosPlanPendientesLista';
import HorariosParalelosPorTurnoSidebar from '../components/organisms/HorariosParalelosPorTurnoSidebar';
import HorariosPublicacionParaleloCard from '../components/organisms/HorariosPublicacionParaleloCard';
import HorariosConflictosPlanSection from '../components/organisms/HorariosConflictosPlanSection';

const navigate = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));

describe('HorariosKpiStrip', () => {
  const kpis = { total: 10, completos: 5, sinAulas: 2, sinDocentes: 1, sinHorarios: 2 };

  it('muestra el total y las cuatro tarjetas de estado', () => {
    render(<HorariosKpiStrip kpis={kpis} />);
    expect(screen.getByText('Total paralelos')).toBeInTheDocument();
    ['Completos', 'Sin aulas', 'Sin docentes', 'Sin horarios'].forEach((l) => expect(screen.getByText(l)).toBeInTheDocument());
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('variantes: solo total o solo detalle', () => {
    const { rerender } = render(<HorariosKpiStrip kpis={kpis} variant="total" />);
    expect(screen.getByText('Total paralelos')).toBeInTheDocument();
    expect(screen.queryByText('Completos')).not.toBeInTheDocument();
    rerender(<HorariosKpiStrip kpis={kpis} variant="details" />);
    expect(screen.queryByText('Total paralelos')).not.toBeInTheDocument();
    expect(screen.getByText('Sin aulas')).toBeInTheDocument();
  });

  it('con total 0 y claves ausentes no divide por cero', () => {
    render(<HorariosKpiStrip kpis={{ total: 0 }} variant="details" />);
    expect(screen.getAllByText('0')).toHaveLength(4);
  });
});

describe('ParalelosBoard', () => {
  const item = { id: 1, paralelo: 'A', carrera: 'Sistemas', periodo: '1° año', turno: 'NOCHE', boardBucket: 'sin_horarios', paraleloAulaId: 3 };
  const board = [
    { key: 'sin_aulas', title: 'Sin aulas', items: [] },
    { key: 'sin_horarios', title: 'Sin horarios', items: [item] },
  ];

  it('una columna por grupo; vacía muestra aviso y con datos abre el armado', async () => {
    const onOpen = vi.fn();
    renderWithProviders(<ParalelosBoard boardByStatus={board} onOpenArmado={onOpen} />, {
      auth: { permisos: [permiso('institucional.horario.armado', 'EDITAR')] },
    });
    expect(screen.getByText('Sin aulas')).toBeInTheDocument();
    expect(screen.getByText('Sin paralelos en este grupo con los filtros actuales.')).toBeInTheDocument();
    expect(screen.getByText('Sistemas')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button'));
    expect(onOpen).toHaveBeenCalledWith(item);
  });

  it('sin permiso de armado no ofrece la acción', () => {
    renderWithProviders(<ParalelosBoard boardByStatus={board} onOpenArmado={vi.fn()} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('sin columnas no pinta nada', () => {
    const { container } = renderWithProviders(<ParalelosBoard boardByStatus={[]} />);
    expect(container.querySelectorAll('.horarios-gestion-board__column')).toHaveLength(0);
  });
});

describe('paneles de pendientes por paralelo', () => {
  const grupos = [
    { paraleloId: 1, paraleloNombre: 'A', paraleloTurno: 'NOCHE', items: [{ materiaSigla: 'MAT-1', dia: 'LUNES', horaInicio: '08:00:00', horaFin: '09:30:00' }] },
    { paraleloId: 2, items: [{ materiaNombre: 'Física' }, { cursoCodigo: 'C-7' }, {}] },
    { paraleloId: 3, items: [] },
  ];

  it('bloques sin aula: agrupa por paralelo, formatea la franja y omite grupos vacíos', () => {
    render(<HorariosBloquesSinAulaPanel grupos={grupos} />);
    expect(screen.getByText('Bloques sin aula')).toBeInTheDocument();
    expect(screen.getByText('A · NOCHE')).toBeInTheDocument();
    expect(screen.getByText('MAT-1 · LUNES 08:00–09:30')).toBeInTheDocument();
    expect(screen.getByText('Paralelo #2')).toBeInTheDocument();
    expect(screen.getByText('Física · — –')).toBeInTheDocument();
    expect(screen.getByText('Materia · — –')).toBeInTheDocument();
    expect(screen.queryByText('Paralelo #3')).not.toBeInTheDocument();
  });

  it('cursos sin docente: lista siglas con respaldo y no renderiza sin datos', () => {
    const { container, rerender } = render(<HorariosCursosSinDocentePanel grupos={grupos} />);
    expect(screen.getByText('Cursos sin docente asignado')).toBeInTheDocument();
    expect(screen.getByText('MAT-1')).toBeInTheDocument();
    expect(screen.getByText('C-7')).toBeInTheDocument();
    expect(screen.getByText('Curso')).toBeInTheDocument();
    rerender(<HorariosCursosSinDocentePanel grupos={[{ paraleloId: 1, items: [] }]} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<HorariosBloquesSinAulaPanel />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('HorariosPlanPendientesLista', () => {
  it('ok sin líneas muestra el mensaje de éxito', () => {
    render(<HorariosPlanPendientesLista ok mensajeExito="Todo listo" />);
    expect(screen.getByText('Todo listo')).toBeInTheDocument();
  });

  it('con líneas lista los pendientes aunque ok sea falso', () => {
    render(<HorariosPlanPendientesLista lineas={['Falta docente', 'Choque de aula']} />);
    expect(screen.getByLabelText('Detalle de pendientes del plan')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('sin nada muestra el mensaje vacío por defecto o el propio', () => {
    const { rerender } = render(<HorariosPlanPendientesLista />);
    expect(screen.getByText('Sin detalle para mostrar.')).toBeInTheDocument();
    rerender(<HorariosPlanPendientesLista mensajeVacio="Nada" />);
    expect(screen.getByText('Nada')).toBeInTheDocument();
  });
});

describe('HorariosParalelosPorTurnoSidebar', () => {
  it('agrupa por turno ordenado y rotula el estado de cada paralelo', () => {
    render(
      <HorariosParalelosPorTurnoSidebar
        filteredParallels={[
          { id: 1, paralelo: 'B', turno: 'NOCHE', boardBucket: 'completo' },
          { id: 2, paralelo: 'A', turno: 'MAÑANA', boardBucket: 'sin_aulas' },
          { id: 3, paralelo: 'C', boardBucket: 'sin_docentes' },
          { id: 4, paralelo: 'D', turno: 'NOCHE', cursosTotales: 2, cursosCreados: 2, cursosAsignados: 2, cursosSinBloquesHorario: 0, paraleloAulaId: 9 },
          { id: 5, paralelo: 'E', turno: 'TARDE', boardBucket: 'sin_horarios' },
          { id: 6, paralelo: 'F', turno: 'TARDE', boardBucket: 'otro' },
        ]}
      />,
    );
    const turnos = screen.getAllByText(/^Turno /).map((n) => n.textContent);
    expect(turnos).toEqual(['Turno MAÑANA', 'Turno NOCHE', 'Turno Sin turno', 'Turno TARDE']);
    expect(screen.getAllByText('Completo')).toHaveLength(2);
    expect(screen.getByText('Sin aulas')).toBeInTheDocument();
    expect(screen.getByText('Sin docentes')).toBeInTheDocument();
    expect(screen.getByText('Sin horarios')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('sin paralelos informa que no hay resultados', () => {
    render(<HorariosParalelosPorTurnoSidebar />);
    expect(screen.getByText('No hay paralelos con los filtros actuales.')).toBeInTheDocument();
  });
});

const planBase = (over = {}) => ({
  paralelo: { id: 1, paraleloGestionId: 7, paraleloGestionEstado: 'OFERTADO', nombre: 'Paralelo A', carreraNombre: 'Sistemas', carreraCodigo: 'SIS', periodoNombre: '1° año', turno: 'NOCHE', carreraColorHex: '#336699' },
  schedule: [
    { cursoId: 10, materiaSigla: 'MAT-1', materiaNombre: 'Matemática', docenteId: 5, docenteNombre: 'Luna', horasSemanalesPlan: 2, color: '#123456', horarios: [{ id: 100, ordenSecuencia: 1, aula: 'A-1', horario: { dia: 'LUNES', horaInicio: '19:00:00', horaFin: '20:30:00' } }] },
  ],
  ...over,
});

describe('HorariosPublicacionParaleloCard', () => {
  const auth = { permisos: [permiso('institucional.horario.publicacion', 'EDITAR')] };

  it('muestra la cabecera del paralelo y publica cuando está OFERTADO y sin pendientes', async () => {
    const onPublicar = vi.fn().mockResolvedValue({ success: true });
    renderWithProviders(<HorariosPublicacionParaleloCard plan={planBase({ schedule: [] })} onPublicar={onPublicar} />, { auth });
    expect(screen.getByText('Paralelo A')).toBeInTheDocument();
    expect(screen.getByText('OFERTADO')).toBeInTheDocument();
    expect(screen.getByText(/Sistemas \(SIS\) · 1° año · Turno NOCHE · PG #7/)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /Publicar/ });
    expect(btn).toBeEnabled();
    await userEvent.click(btn);
    expect(onPublicar).toHaveBeenCalledWith(7);
  });

  it('sin permiso EDITAR no hay botón de publicar', () => {
    renderWithProviders(<HorariosPublicacionParaleloCard plan={planBase({ schedule: [] })} onPublicar={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /Publicar/ })).not.toBeInTheDocument();
  });

  it('un paralelo ya PUBLICADO no puede volver a publicarse', () => {
    const plan = planBase({ schedule: [] });
    plan.paralelo.paraleloGestionEstado = 'PUBLICADO';
    renderWithProviders(<HorariosPublicacionParaleloCard plan={plan} onPublicar={vi.fn()} />, { auth });
    expect(screen.getByText('PUBLICADO')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Publicar/ })).toBeDisabled();
  });

  it('pendientes del plan bloquean la publicación y se listan', () => {
    const plan = planBase({ paraleloDashboard: { cursosSinDocente: 2, bloquesSinAula: 1 } });
    renderWithProviders(<HorariosPublicacionParaleloCard plan={plan} onPublicar={vi.fn()} />, { auth });
    expect(screen.getByRole('button', { name: /Publicar/ })).toBeDisabled();
    expect(screen.getByLabelText('Detalle de pendientes del plan')).toBeInTheDocument();
  });

  it('el error de publicación se informa sin romper la tarjeta', async () => {
    const onPublicar = vi.fn().mockResolvedValue({ success: false, error: 'Falla del servidor' });
    renderWithProviders(<HorariosPublicacionParaleloCard plan={planBase({ schedule: [] })} onPublicar={onPublicar} />, { auth });
    await userEvent.click(screen.getByRole('button', { name: /Publicar/ }));
    expect(await screen.findByText('Falla del servidor')).toBeInTheDocument();
  });

  it('editar plan navega al armado del paralelo en gestión', async () => {
    renderWithProviders(<HorariosPublicacionParaleloCard plan={planBase({ schedule: [] })} onPublicar={vi.fn()} />, { auth });
    await userEvent.click(screen.getByRole('button', { name: 'Editar plan semanal del paralelo' }));
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('7'));
  });

  it('sin paralelo en gestión no ofrece publicar', () => {
    renderWithProviders(<HorariosPublicacionParaleloCard plan={{ paralelo: { nombre: 'X' }, schedule: [] }} />, { auth });
    expect(screen.queryByRole('button', { name: /Publicar/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar plan semanal del paralelo' })).not.toBeInTheDocument();
  });

  it('sin plan usa textos de respaldo', () => {
    renderWithProviders(<HorariosPublicacionParaleloCard />, { auth });
    expect(screen.getByText('Paralelo')).toBeInTheDocument();
  });
});

describe('HorariosConflictosPlanSection', () => {
  const schedules = [
    { cursoId: 10, cursoCodigo: 'MAT-1', materiaSigla: 'MAT-1', materiaNombre: 'Matemática', docente: 'Luna', cursoColorHex: '#123456', bloques: [{ cursoHorarioId: 100, dia: 'LUNES', horaInicio: '19:00:00', horaFin: '19:45:00', turno: 'NOCHE', paralelo: 'A', aula: 'A-1' }] },
  ];

  it('guardar exige EDITAR y llama onRequestPersist', async () => {
    const onRequestPersist = vi.fn();
    const { unmount } = renderWithProviders(
      <HorariosConflictosPlanSection schedules={schedules} onSchedulesChange={vi.fn()} onRequestPersist={onRequestPersist} vistaLabel="Plan del docente" vistaHint="Arrastre" turnoLabel="NOCHE" />,
      { auth: { permisos: [permiso('institucional.horario.armado', 'EDITAR')] } },
    );
    expect(screen.getByText('Plan del docente')).toBeInTheDocument();
    expect(screen.getByText('Arrastre')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Guardar cambios/ }));
    expect(onRequestPersist).toHaveBeenCalledTimes(1);
    unmount();
    renderWithProviders(<HorariosConflictosPlanSection schedules={schedules} onSchedulesChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /Guardar cambios/ })).not.toBeInTheDocument();
  });

  it('solo lectura o cabecera mínima ocultan guardar y quitar bloque', () => {
    const { rerender } = renderWithProviders(<HorariosConflictosPlanSection schedules={schedules} onSchedulesChange={vi.fn()} editable={false} />, {
      auth: { permisos: [permiso('institucional.horario.armado', 'EDITAR')] },
    });
    expect(screen.queryByRole('button', { name: /Guardar cambios/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Quitar bloque del plan' })).not.toBeInTheDocument();
    rerender(<HorariosConflictosPlanSection schedules={schedules} onSchedulesChange={vi.fn()} headerMinimal />);
    expect(screen.queryByText('Grilla semanal')).not.toBeInTheDocument();
  });

  it('quitar un bloque notifica el nuevo plan sin ese bloque', async () => {
    const onSchedulesChange = vi.fn();
    renderWithProviders(<HorariosConflictosPlanSection schedules={schedules} onSchedulesChange={onSchedulesChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Quitar bloque del plan' }));
    expect(onSchedulesChange).toHaveBeenCalledTimes(1);
    expect(onSchedulesChange.mock.calls[0][0][0].bloques).toHaveLength(0);
  });

  it('arrastrar un bloque a otra franja valida el destino', async () => {
    const validatePlacement = vi.fn().mockResolvedValue({ ok: false, message: 'Aula ocupada' });
    const { container } = renderWithProviders(
      <HorariosConflictosPlanSection schedules={schedules} onSchedulesChange={vi.fn()} validatePlacement={validatePlacement} />,
    );
    const store = {};
    const dataTransfer = { setData: (k, v) => { store[k] = v; }, getData: (k) => store[k], effectAllowed: '' };
    fireEvent.dragStart(container.querySelector('.da-cal-semanal__chip--draggable'), { dataTransfer });
    expect(Object.keys(store)).toHaveLength(1);
    const celdas = [...container.querySelectorAll('td.da-cal-semanal__td')];
    expect(celdas.length).toBeGreaterThan(0);
    fireEvent.drop(celdas[celdas.length - 1], { dataTransfer });
    await vi.waitFor(() => expect(validatePlacement).toHaveBeenCalled());
  });
});
