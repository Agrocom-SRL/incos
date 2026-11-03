import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import ParalelosTable from '../components/organisms/ParalelosTable';
import ParaleloArmadoPlanSection from '../components/organisms/ParaleloArmadoPlanSection';
import ParaleloCoberturaTabSection from '../components/organisms/ParaleloCoberturaTabSection';

const navigate = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));

beforeEach(() => navigate.mockClear());

describe('ParalelosTable', () => {
  const filas = [
    { id: 1, paralelo: 'B', carrera: 'Sistemas', periodo: '1° año', turno: 'NOCHE', boardBucket: 'sin_horarios', cursosTotales: 3, cursosCreados: 1, paraleloAulaId: 2 },
    { id: 2, paralelo: 'A', carrera: 'Sistemas', periodo: '1° año', turno: 'NOCHE', boardBucket: 'sin_docentes' },
    { id: 3, paralelo: 'C', carrera: 'Contaduría', periodo: '2° año', boardBucket: 'sin_aulas' },
    { id: 4, paralelo: 'D', carrera: 'Contaduría', periodo: '2° año', turno: 'TARDE', boardBucket: 'completo' },
  ];
  const auth = {
    permisos: [
      permiso('institucional.horario.armado', 'EDITAR'),
      permiso('institucional.oferta.paralelo-gestion', 'DETALLE'),
    ],
  };

  it('agrupa por carrera y periodo, con el CTA propio de cada grupo', () => {
    renderWithProviders(<ParalelosTable filteredParallels={filas} onOpenArmado={vi.fn()} />, { auth });
    expect(screen.getByText('Contaduría')).toBeInTheDocument();
    expect(screen.getByText('2° año · 2 paralelos')).toBeInTheDocument();
    expect(screen.getByText('1° año · 2 paralelos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Completar cursos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Asignar docentes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Asignar aula' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver horario' })).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('el botón abre el armado con la fila', async () => {
    const onOpen = vi.fn();
    renderWithProviders(<ParalelosTable filteredParallels={filas} onOpenArmado={onOpen} />, { auth });
    await userEvent.click(screen.getByRole('button', { name: 'Asignar aula' }));
    expect(onOpen).toHaveBeenCalledWith(filas[2]);
  });

  it('RBAC: sin permisos no se muestra ninguna acción', () => {
    renderWithProviders(<ParalelosTable filteredParallels={filas} onOpenArmado={vi.fn()} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('sin filas informa el vacío; incrustada no usa tarjeta', () => {
    const { container, rerender } = renderWithProviders(<ParalelosTable filteredParallels={[]} onOpenArmado={vi.fn()} />);
    expect(screen.getByText('Sin paralelos con los filtros actuales.')).toBeInTheDocument();
    expect(container.querySelector('.horarios-paralelos-table-embedded')).toBeNull();
    rerender(<ParalelosTable filteredParallels={null} onOpenArmado={vi.fn()} embedded />);
    expect(container.querySelector('.horarios-paralelos-table-embedded')).not.toBeNull();
  });

  it('un paralelo cuyo solo problema es el choque horario de docente exige permiso de armado', () => {
    const fila = { id: 9, paralelo: 'Z', carrera: 'X', periodo: 'P', boardBucket: 'sin_docentes', conflictoDocenteHorario: true, cursosSinDocente: 0 };
    renderWithProviders(<ParalelosTable filteredParallels={[fila]} onOpenArmado={vi.fn()} />, { auth: { permisos: [permiso('institucional.horario.armado', 'EDITAR')] } });
    expect(screen.getByRole('button', { name: 'Resolver conflictos' })).toBeInTheDocument();
  });
});

describe('ParaleloArmadoPlanSection', () => {
  const schedules = [
    { cursoId: 10, cursoCodigo: 'MAT-1', materiaSigla: 'MAT-1', materiaNombre: 'Matemática', docente: 'Luna', cursoColorHex: '#123456', bloques: [{ cursoHorarioId: 100, dia: 'LUNES', horaInicio: '19:00:00', horaFin: '19:45:00', turno: 'NOCHE', paralelo: 'A', aula: 'A-1' }] },
  ];
  const auth = { permisos: [permiso('institucional.horario.armado', 'EDITAR')] };

  it('solo lectura: avisa y no ofrece guardar ni quitar', () => {
    renderWithProviders(<ParaleloArmadoPlanSection schedules={schedules} onSchedulesChange={vi.fn()} turnoLabel="NOCHE" />, { auth });
    expect(screen.getByText('Solo lectura')).toBeInTheDocument();
    expect(screen.getByText(/Turno NOCHE/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Guardar cambios/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Quitar bloque del plan' })).not.toBeInTheDocument();
  });

  it('editable con cambios: guardar exige EDITAR y delega en onRequestPersist', async () => {
    const onRequestPersist = vi.fn();
    const { unmount } = renderWithProviders(
      <ParaleloArmadoPlanSection schedules={schedules} onSchedulesChange={vi.fn()} editable onRequestPersist={onRequestPersist} />,
      { auth },
    );
    await userEvent.click(screen.getByRole('button', { name: /Guardar cambios/ }));
    expect(onRequestPersist).toHaveBeenCalledTimes(1);
    unmount();
    renderWithProviders(<ParaleloArmadoPlanSection schedules={schedules} onSchedulesChange={vi.fn()} editable />);
    expect(screen.queryByRole('button', { name: /Guardar cambios/ })).not.toBeInTheDocument();
  });

  it('sin onRequestPersist avisa que el guardado no está disponible', async () => {
    renderWithProviders(<ParaleloArmadoPlanSection schedules={schedules} onSchedulesChange={vi.fn()} editable />, { auth });
    await userEvent.click(screen.getByRole('button', { name: /Guardar cambios/ }));
    expect(await screen.findByText('Guardado no disponible')).toBeInTheDocument();
  });

  it('sin cambios locales oculta guardar y muestra la guía', () => {
    renderWithProviders(<ParaleloArmadoPlanSection schedules={schedules} onSchedulesChange={vi.fn()} editable dirty={false} />, { auth });
    expect(screen.queryByRole('button', { name: /Guardar cambios/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Arrastre los bloques en la grilla/)).toBeInTheDocument();
  });

  it('paralelo publicado: reubicar sí, quitar no, con aviso', () => {
    renderWithProviders(<ParaleloArmadoPlanSection schedules={schedules} onSchedulesChange={vi.fn()} editable allowDelete={false} soloReubicacion />, { auth });
    expect(screen.getByText(/Paralelo publicado/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Quitar bloque del plan' })).not.toBeInTheDocument();
  });

  it('quitar un bloque emite el plan sin él', async () => {
    const onSchedulesChange = vi.fn();
    renderWithProviders(<ParaleloArmadoPlanSection schedules={schedules} onSchedulesChange={onSchedulesChange} editable />, { auth });
    await userEvent.click(screen.getByRole('button', { name: 'Quitar bloque del plan' }));
    expect(onSchedulesChange.mock.calls[0][0][0].bloques).toHaveLength(0);
  });

  it('cabecera mínima: solo el botón de guardar cuando hay cambios', () => {
    const { rerender } = renderWithProviders(<ParaleloArmadoPlanSection schedules={schedules} onSchedulesChange={vi.fn()} editable headerMinimal />, { auth });
    expect(screen.queryByText('Plan semanal')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar cambios/ })).toBeInTheDocument();
    rerender(<ParaleloArmadoPlanSection schedules={schedules} onSchedulesChange={vi.fn()} editable dirty={false} headerMinimal />);
    expect(screen.queryByRole('button', { name: /Guardar cambios/ })).not.toBeInTheDocument();
  });

  it('vista previa: resume pendientes o confirma que no hay', () => {
    const { rerender } = renderWithProviders(<ParaleloArmadoPlanSection schedules={schedules} onSchedulesChange={vi.fn()} showPendientesDetalle />, { auth });
    expect(screen.getByText('Resumen del plan')).toBeInTheDocument();
    rerender(<ParaleloArmadoPlanSection schedules={[]} onSchedulesChange={vi.fn()} showPendientesDetalle />);
    expect(screen.getByText('No hay cursos en el paralelo para evaluar la vista previa.')).toBeInTheDocument();
  });

  it('mover un bloque: validatePlacement rechaza con aviso, acepta y emite el plan nuevo', async () => {
    const onSchedulesChange = vi.fn();
    const validatePlacement = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, message: 'Aula ocupada' })
      .mockResolvedValueOnce({ ok: false, silent: true })
      .mockResolvedValueOnce({ ok: true });
    const { container } = renderWithProviders(
      <ParaleloArmadoPlanSection schedules={schedules} onSchedulesChange={onSchedulesChange} editable validatePlacement={validatePlacement} />,
      { auth },
    );
    const store = {};
    const dataTransfer = { setData: (k, v) => { store[k] = v; }, getData: (k) => store[k], effectAllowed: '' };
    fireEvent.dragStart(container.querySelector('.da-cal-semanal__chip--draggable'), { dataTransfer });
    const celdas = [...container.querySelectorAll('td.da-cal-semanal__td')];
    const destino = celdas[celdas.length - 1];
    fireEvent.drop(destino, { dataTransfer });
    expect(await screen.findByText('No se puede mover')).toBeInTheDocument();
    expect(onSchedulesChange).not.toHaveBeenCalled();
    fireEvent.drop(destino, { dataTransfer });
    await vi.waitFor(() => expect(validatePlacement).toHaveBeenCalledTimes(2));
    expect(onSchedulesChange).not.toHaveBeenCalled();
    fireEvent.drop(destino, { dataTransfer });
    await vi.waitFor(() => expect(onSchedulesChange).toHaveBeenCalledTimes(1));
    expect(validatePlacement.mock.calls[0][0]).toMatchObject({ cursoId: 10, cursoHorarioId: 100, sourceDia: expect.anything() });
  });

  it('soltar sin datos o con datos corruptos no cambia el plan', async () => {
    const onSchedulesChange = vi.fn();
    const { container } = renderWithProviders(<ParaleloArmadoPlanSection schedules={schedules} onSchedulesChange={onSchedulesChange} editable />, { auth });
    const celdas = [...container.querySelectorAll('td.da-cal-semanal__td')];
    fireEvent.drop(celdas[0], { dataTransfer: { getData: () => '' } });
    fireEvent.drop(celdas[0], { dataTransfer: { getData: () => '{no-json' } });
    await Promise.resolve();
    expect(onSchedulesChange).not.toHaveBeenCalled();
  });
});

describe('ParaleloCoberturaTabSection', () => {
  const auth = {
    permisos: [
      permiso('institucional.horario.armado', 'EDITAR'),
      permiso('institucional.oferta.paralelo-gestion', 'DETALLE'),
    ],
  };
  const bloque = (n) => ({ cursoHorarioId: n, dia: 'LUNES', horaInicio: '19:00:00', horaFin: '19:45:00' });
  const cursos = [
    { cursoId: 1, asignacionDocenteId: 11, materiaNombre: 'Matemática', materiaSigla: 'MAT-1', docente: 'Luna', docenteId: 5, horasSemanalesPlan: 2, bloques: [bloque(1), bloque(2)], cursoColorHex: '#112233' },
    { cursoId: 2, asignacionDocenteId: 12, materiaNombre: 'Física', docente: 'Sol', docenteId: 6, docenteEnConflictoHorario: true, horasSemanalesPlan: 1, bloques: [] },
    { cursoId: 3, asignacionDocenteId: 13, materiaSigla: 'QUI', docente: null, horasSemanalesPlan: 1, bloques: [] },
    { cursoId: 4, asignacionDocenteId: 14, materiaNombre: 'Historia', docente: 'Mar', horasSemanalesPlan: 1, bloques: [bloque(7), bloque(8)] },
  ];

  it('resume la cobertura por materia y marca faltantes, excedentes y sin docente', () => {
    renderWithProviders(<ParaleloCoberturaTabSection draftSchedules={cursos} paraleloGestionId={7} />, { auth });
    expect(screen.getByText('Cobertura de la semana')).toBeInTheDocument();
    expect(screen.getByText(/1\/3 materias cubiertas · 1 sin docente/)).toBeInTheDocument();
    expect(screen.getByText('Cobertura completa')).toBeInTheDocument();
    expect(screen.getByText('Matemática')).toBeInTheDocument();
    expect(screen.getAllByText('QUI').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1 bloque(s) por generar')).toHaveLength(2);
    expect(screen.getByText('1 bloque(s) sobre el plan')).toBeInTheDocument();
    expect(screen.getByText('(choque de horario — resolver)')).toBeInTheDocument();
    expect(screen.getByText('Sin asignar')).toBeInTheDocument();
    expect(screen.getAllByText('Lunes: 19:00–19:45, 19:00–19:45')).toHaveLength(2);
  });

  it('el docente enlaza a sus asignaciones o, en choque, a sus conflictos', async () => {
    renderWithProviders(<ParaleloCoberturaTabSection draftSchedules={cursos} paraleloGestionId={7} />, { auth });
    await userEvent.click(screen.getByText('Luna'));
    expect(navigate).toHaveBeenLastCalledWith(expect.stringContaining('5'), { state: expect.objectContaining({ returnListPath: '/institucional/horarios/armado?pg=7&tab=cobertura' }) });
    await userEvent.click(screen.getByText('Sol'));
    expect(navigate).toHaveBeenLastCalledWith(expect.stringContaining('6'), { state: expect.anything() });
  });

  it('asignar docente lleva a la oferta del paralelo y exige DETALLE', async () => {
    const { unmount } = renderWithProviders(<ParaleloCoberturaTabSection draftSchedules={cursos} paraleloGestionId={7} />, { auth });
    await userEvent.click(screen.getByRole('button', { name: /Asignar docente/ }));
    expect(navigate).toHaveBeenCalledTimes(1);
    unmount();
    renderWithProviders(<ParaleloCoberturaTabSection draftSchedules={cursos} paraleloGestionId={7} />);
    expect(screen.queryByRole('button', { name: /Asignar docente/ })).not.toBeInTheDocument();
  });

  it('generar cobertura llama al reajuste y exige EDITAR; se oculta si no es reajustable', async () => {
    let fin;
    const onReajustar = vi.fn(() => new Promise((r) => { fin = r; }));
    const { rerender } = renderWithProviders(
      <ParaleloCoberturaTabSection draftSchedules={cursos} paraleloGestionId={7} onReajustarCoberturaParalelo={onReajustar} />,
      { auth },
    );
    await userEvent.click(screen.getByRole('button', { name: /Generar cobertura de la semana/ }));
    expect(onReajustar).toHaveBeenCalledTimes(1);
    fin();
    rerender(<ParaleloCoberturaTabSection draftSchedules={cursos} paraleloGestionId={7} coberturaReajustable={false} />);
    expect(screen.queryByRole('button', { name: /Generar cobertura/ })).not.toBeInTheDocument();
  });

  it('sin docentes en ningún curso la generación está deshabilitada', () => {
    renderWithProviders(<ParaleloCoberturaTabSection draftSchedules={[cursos[2]]} paraleloGestionId={7} />, { auth });
    expect(screen.getByRole('button', { name: /Generar cobertura de la semana/ })).toBeDisabled();
  });

  it('usa las horas de la cobertura persistida cuando el curso no trae carga', () => {
    const curso = { cursoId: 5, asignacionDocenteId: 21, materiaNombre: 'Lengua', docente: 'Ana', bloques: [] };
    renderWithProviders(
      <ParaleloCoberturaTabSection draftSchedules={[curso]} paraleloGestionId={7} coberturaGrilla={[{ asignacionDocenteId: 21, horasSemanalesPlan: 3, bloquesAsignados: 0 }]} />,
      { auth },
    );
    expect(screen.getByText('Lengua')).toBeInTheDocument();
  });

  it('sin cursos invita a completar la oferta y navega a ella', async () => {
    renderWithProviders(<ParaleloCoberturaTabSection draftSchedules={[]} paraleloGestionId={7} />, { auth });
    expect(screen.getByText(/No hay cursos de oferta para este paralelo/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Ir a oferta académica/ }));
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('sin cursos y sin paralelo en gestión no hay acceso a la oferta', () => {
    renderWithProviders(<ParaleloCoberturaTabSection draftSchedules={[]} paraleloGestionId={null} />, { auth });
    expect(screen.queryByRole('button', { name: /Ir a oferta académica/ })).not.toBeInTheDocument();
  });
});
