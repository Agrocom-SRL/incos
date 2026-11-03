import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import HorariosGestionSidebarResumen from '../components/organisms/HorariosGestionSidebarResumen';

const navigate = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));

const paralelos = [
  { id: 1, paralelo: 'B', carrera: 'Sistemas', periodo: '1° año', turno: 'NOCHE', boardBucket: 'completo', paraleloGestionId: 71 },
  { id: 2, paralelo: 'A', carrera: 'Sistemas', periodo: '1° año', turno: 'NOCHE', boardBucket: 'sin_aulas', paraleloGestionId: 72 },
  { id: 3, paralelo: 'C', carrera: 'Contaduría', turno: 'MAÑANA', boardBucket: 'sin_docentes', paraleloGestionId: 73 },
];
const bloques = [
  { paraleloId: 2, paraleloNombre: 'A', paraleloTurno: 'NOCHE', items: [
    { materiaSigla: 'MAT-1', dia: 'MARTES', horaInicio: '19:00:00', horaFin: '19:45:00' },
    { materiaSigla: 'FIS-1', dia: 'LUNES', horaInicio: '20:00:00', horaFin: '20:45:00' },
  ] },
];
const cursosSinDocente = [
  { paraleloId: 3, paraleloNombre: 'C', paraleloTurno: 'MAÑANA', carreraNombre: 'Contaduría', periodoNombre: '1° año', items: [{ cursoId: 900, materiaNombre: 'Contabilidad' }, { materiaNombre: 'sin id' }] },
  { paraleloId: 99, items: [{ cursoId: 901 }] },
];
const conflictos = [
  { docenteId: 5, docenteNombre: 'Luna Pérez', tiposConflicto: ['horario'], lineasDetalle: ['MAT-1 · lun', 'MAT-1 · mar', 'FIS-1 · lun', 'QUI · lun', 'LEN · lun'] },
  { docenteId: null, docenteNombre: null },
];

const auth = { permisos: [permiso('institucional.horario.armado', 'EDITAR'), permiso('institucional.oferta.paralelo-gestion', 'EDITAR')] };
const props = { filteredParallels: paralelos, bloquesSinAulaPorParalelo: bloques, cursosSinDocentePorParalelo: cursosSinDocente, docentesConConflictosOperativos: conflictos };

beforeEach(() => navigate.mockClear());

describe('HorariosGestionSidebarResumen', () => {
  it('sin datos no muestra tarjetas', () => {
    renderWithProviders(<HorariosGestionSidebarResumen />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('muestra una tarjeta por indicador con su conteo', () => {
    renderWithProviders(<HorariosGestionSidebarResumen {...props} />, { auth });
    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(screen.getByText('Paralelos por turno')).toBeInTheDocument();
    expect(screen.getByText('2 turno(s) distintos con los filtros actuales')).toBeInTheDocument();
    expect(screen.getByText('Bloques sin aula')).toBeInTheDocument();
    expect(screen.getByText('Cursos sin docente')).toBeInTheDocument();
    expect(screen.getByText('Docentes con conflictos')).toBeInTheDocument();
  });

  it('paralelos: el detalle es un árbol turno > carrera > periodo con el estado', async () => {
    renderWithProviders(<HorariosGestionSidebarResumen {...props} />, { auth });
    await userEvent.click(screen.getByText('Planificación'));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Turno NOCHE')).toBeInTheDocument();
    expect(within(dialog).getByText('Turno MAÑANA')).toBeInTheDocument();
    expect(within(dialog).getByText('Completo')).toBeInTheDocument();
    expect(within(dialog).getByText('Sin aulas')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cerrar' }));
    expect(navigate).not.toHaveBeenCalled();
  });

  it('se abre también con el teclado (Enter)', async () => {
    renderWithProviders(<HorariosGestionSidebarResumen {...props} />, { auth });
    screen.getByText('Planificación').closest('[role="button"]').focus();
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('aulas: filtra por día, ordena y lleva a la oferta con permiso', async () => {
    renderWithProviders(<HorariosGestionSidebarResumen {...props} />, { auth });
    await userEvent.click(screen.getByText('Aulas'));
    const dialog = await screen.findByRole('dialog');
    const tabs = within(dialog).getAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toEqual(['LUNES', 'MARTES']);
    expect(within(dialog).getByText('FIS-1')).toBeInTheDocument();
    expect(within(dialog).queryByText('MAT-1')).not.toBeInTheDocument();
    await userEvent.click(tabs[1]);
    expect(within(dialog).getByText('MAT-1')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Ir a Oferta académica' }));
    expect(navigate).toHaveBeenCalledWith('/institucional/oferta');
  });

  it('aulas: RBAC oculta el botón a la oferta', async () => {
    renderWithProviders(<HorariosGestionSidebarResumen {...props} />);
    await userEvent.click(screen.getByText('Aulas'));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).queryByRole('button', { name: 'Ir a Oferta académica' })).not.toBeInTheDocument();
  });

  it('docentes: lista cursos sin docente y navega al detalle de la oferta del paralelo', async () => {
    renderWithProviders(<HorariosGestionSidebarResumen {...props} />, { auth });
    await userEvent.click(screen.getByText('Docencia'));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/Materia: Contabilidad/)).toBeInTheDocument();
    // La materia se resalta con el color primario del tema (`Text type="primary"` no es un tipo válido de AntD 6).
    expect(within(dialog).getByText(/Materia: Contabilidad/)).toHaveStyle({ color: 'var(--color-primary)' });
    expect(within(dialog).getByText(/Materia: Curso/)).toBeInTheDocument();
    const botones = within(dialog).getAllByRole('button', { name: /Asignar materia/ });
    expect(botones).toHaveLength(2);
    expect(botones[1]).toBeDisabled();
    await userEvent.click(botones[0]);
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('conflictos: resume las líneas por materia y ofrece resolver', async () => {
    renderWithProviders(<HorariosGestionSidebarResumen {...props} />, { auth });
    await userEvent.click(screen.getByText('Alertas'));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Luna Pérez')).toBeInTheDocument();
    expect(within(dialog).getByText('MAT-1 · 2 aviso(s)')).toBeInTheDocument();
    expect(within(dialog).getByText('Otras materias (1) · 1 aviso(s)')).toBeInTheDocument();
    expect(within(dialog).getByText('Sin resumen disponible.')).toBeInTheDocument();
    expect(within(dialog).getByText('Docente #null')).toBeInTheDocument();
    const acciones = within(dialog).getAllByRole('button').filter((b) => b.closest('.horarios-sidebar-modal-docentes-list__row'));
    expect(acciones[1]).toBeDisabled();
    await userEvent.click(acciones[0]);
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('conflictos: sin permiso de armado no hay acciones', async () => {
    renderWithProviders(<HorariosGestionSidebarResumen {...props} />);
    await userEvent.click(screen.getByText('Alertas'));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).queryAllByRole('button').filter((b) => b.closest('.horarios-sidebar-modal-docentes-list__row'))).toHaveLength(0);
  });
});
