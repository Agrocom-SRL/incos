import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import DocenteAsignacionCursoModal from '../components/organisms/DocenteAsignacionCursoModal';

const mocks = vi.hoisted(() => ({
  docentes: vi.fn(),
  conflicto: vi.fn(),
  listar: vi.fn(),
  asignar: vi.fn(),
  get: vi.fn(),
}));

vi.mock('@application-institucional/horarios/hooks/api/useDocentesAsignacionModal', () => ({
  useDocentesAsignacionModal: (...a) => mocks.docentes(...a),
}));
vi.mock('@implementations/DocenteRepository', () => ({
  default: {
    getConflictoBloquesCurso: (...a) => mocks.conflicto(...a),
    listarAsignaciones: (...a) => mocks.listar(...a),
    asignarDocenteCurso: (...a) => mocks.asignar(...a),
  },
}));
vi.mock('@api-client', () => ({ default: { get: (...a) => mocks.get(...a) } }));
vi.mock('@api/responseHandler', () => ({ handleSuccessResponse: (r) => r }));

const docentesBase = [
  { id: 1, nombreCompleto: 'Luna Pérez Ana', genero: 'F', tituloProfesional: 'Lic.', maxHorasSemana: 20 },
  { id: 2, nombreCompleto: 'Sol Rojas Beto', genero: 'M', tituloProfesional: 'Ing.', maxHorasSemana: 20 },
  { id: 3, nombreCompleto: 'Mar Vega Carlos', maxHorasSemana: 4, teachingStats: { conflictos: { hasConflictos: true } } },
];

const curso = { cursoId: 50, gestionPlanId: 9, materiaNombre: 'Matemática', horasSemanalesPlan: 4, gestionId: 3 };
const auth = { permisos: [permiso('institucional.horarios.asignacion-docente', 'EDITAR')] };

const montar = (props = {}, opts = { auth }) =>
  renderWithProviders(
    <DocenteAsignacionCursoModal open onClose={props.onClose ?? vi.fn()} selectedCourse={curso} gestionId={3} paraleloLabel="Paralelo A" {...props} />,
    opts,
  );

beforeEach(() => {
  Object.values(mocks).forEach((m) => m.mockReset());
  mocks.docentes.mockReturnValue({ docentes: docentesBase, loading: false });
  mocks.conflicto.mockResolvedValue({ success: true, data: { docenteIdsConChoque: [2] } });
  mocks.listar.mockResolvedValue({ success: true, data: { rows: [] } });
  mocks.get.mockResolvedValue({ success: true, data: { carga_docentes: { docentes: [{ docente_id: 3, carga_semana: 3, max_semana: 4 }] } } });
  mocks.asignar.mockResolvedValue({ success: true, data: {} });
});

describe('DocenteAsignacionCursoModal', () => {
  it('lista candidatos con semáforo y consulta choques, asignaciones y carga de la gestión', async () => {
    montar();
    expect(await screen.findByText('Luna Pérez Ana')).toBeInTheDocument();
    expect(screen.getByText('Libre en estos bloques:')).toBeInTheDocument();
    expect(screen.getByText('Choque en estos bloques:')).toBeInTheDocument();
    expect(screen.getByText(/Excede carga horaria|Carga alta o conflicto general/)).toBeInTheDocument();
    expect(screen.getByText(/Paralelo: Paralelo A · Materia: Matemática/)).toBeInTheDocument();
    await waitFor(() => expect(mocks.conflicto).toHaveBeenCalledWith(50));
    expect(mocks.listar).toHaveBeenCalledWith(expect.objectContaining({ ofertaCursoId: 50, vigente: 'true' }));
    expect(mocks.get).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Sin fecha registrada/)).toBeInTheDocument();
    expect(screen.getByText(/4 h\/semana según esta oferta/)).toBeInTheDocument();
  });

  it('el buscador filtra los candidatos por nombre', async () => {
    montar();
    await screen.findByText('Luna Pérez Ana');
    await userEvent.type(screen.getByPlaceholderText('Buscar docente por nombre'), 'sol');
    await waitFor(() => expect(screen.queryByText('Luna Pérez Ana')).not.toBeInTheDocument());
    expect(screen.getByText('Sol Rojas Beto')).toBeInTheDocument();
  });

  it('guarda la asignación del docente elegido y avisa al padre', async () => {
    const onAssigned = vi.fn();
    const onClose = vi.fn();
    montar({ onAssigned, onClose });
    await userEvent.click(await screen.findByText('Luna Pérez Ana'));
    expect(screen.getByText('Seleccionado')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Guardar asignación/ }));
    await waitFor(() => expect(mocks.asignar).toHaveBeenCalledWith({ gestionPlanId: 9, cursoId: 50, docenteId: 1, vigente: true, confirmar_sobrecarga: false }));
    await waitFor(() => expect(onAssigned).toHaveBeenCalledWith({ cursoId: 50, docenteId: 1, docenteNombre: 'Luna Pérez Ana' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('muestra las advertencias del servidor y deriva a la pestaña sugerida', async () => {
    mocks.asignar.mockResolvedValue({ success: true, data: { warnings: [{ message: 'Revise el aula', suggestedTab: 'cobertura' }] } });
    const onWarning = vi.fn();
    montar({ onWarning, onAssigned: vi.fn() });
    await userEvent.click(await screen.findByText('Luna Pérez Ana'));
    await userEvent.click(screen.getByRole('button', { name: /Guardar asignación/ }));
    expect(await screen.findByText('Revise el aula')).toBeInTheDocument();
    expect(onWarning).toHaveBeenCalledWith('cobertura', expect.objectContaining({ message: 'Revise el aula' }));
  });

  it('un error al guardar informa el motivo y no cierra', async () => {
    mocks.asignar.mockResolvedValue({ success: false, error: 'Docente inactivo' });
    const onClose = vi.fn();
    montar({ onClose });
    await userEvent.click(await screen.findByText('Luna Pérez Ana'));
    await userEvent.click(screen.getByRole('button', { name: /Guardar asignación/ }));
    expect(await screen.findByText('Docente inactivo')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('un docente con choque no puede guardarse', async () => {
    montar();
    await userEvent.click(await screen.findByText('Sol Rojas Beto'));
    expect(screen.getByRole('button', { name: /Guardar asignación/ })).toBeDisabled();
    expect(mocks.asignar).not.toHaveBeenCalled();
  });

  it('sobrecarga proyectada pide confirmación y reenvía con confirmar_sobrecarga', async () => {
    montar();
    await userEvent.click(await screen.findByText('Mar Vega Carlos'));
    await userEvent.click(screen.getByRole('button', { name: /Guardar asignación/ }));
    expect(await screen.findByText(/quedaría en 7\/4 h\/semana/)).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole('button', { name: /Confirmar asignación/ })[0]);
    await waitFor(() => expect(mocks.asignar).toHaveBeenCalledWith(expect.objectContaining({ docenteId: 3, confirmar_sobrecarga: true })));
  });

  it('sobrecarga detectada por el servidor (422) abre la confirmación del servidor', async () => {
    mocks.get.mockResolvedValue({ success: false });
    mocks.asignar.mockResolvedValueOnce({ success: false, errorDetails: { sobrecarga: true, message: 'Supera el máximo semanal' } });
    montar();
    await userEvent.click(await screen.findByText('Luna Pérez Ana'));
    await userEvent.click(screen.getByRole('button', { name: /Guardar asignación/ }));
    expect(await screen.findByText('Supera el máximo semanal')).toBeInTheDocument();
  });

  it('RBAC: sin permiso de asignación avisa y bloquea el guardado', async () => {
    montar({}, { auth: { permisos: [] } });
    expect(await screen.findByText('Sin permiso para asignar docente')).toBeInTheDocument();
    await userEvent.click(await screen.findByText('Luna Pérez Ana'));
    expect(screen.getByRole('button', { name: /Guardar asignación/ })).toBeDisabled();
  });

  it('permiso alternativo docentes.asignar habilita el guardado', async () => {
    montar({}, { auth: { permisos: [permiso('docentes.asignar', 'EDITAR')] } });
    await userEvent.click(await screen.findByText('Luna Pérez Ana'));
    expect(screen.getByRole('button', { name: /Guardar asignación/ })).toBeEnabled();
  });

  it('usa el docente vigente de la asignación y la vista previa informa el docente elegido', async () => {
    mocks.listar.mockResolvedValue({
      success: true,
      data: [{ docente_id: 1, docente_nombre: 'Luna Pérez Ana', fecha_asignacion: '2026-03-01', carga_horaria: 6 }],
    });
    const onPreview = vi.fn();
    montar({ onPreviewDocenteChange: onPreview });
    expect(await screen.findByText('2026-03-01')).toBeInTheDocument();
    expect(screen.getByText('6 h/semana')).toBeInTheDocument();
    await waitFor(() => expect(onPreview).toHaveBeenCalledWith({ cursoId: 50, docenteNombre: 'Luna Pérez Ana', docenteEnConflictoHorario: false }));
    expect(screen.getByText(/Docente actual:/).textContent).toContain('Luna Pérez Ana');
  });

  it('si fallan las consultas del modal no rompe y deja sin selección', async () => {
    mocks.conflicto.mockRejectedValue(new Error('red'));
    const onPreview = vi.fn();
    montar({ onPreviewDocenteChange: onPreview });
    await screen.findByText('Luna Pérez Ana');
    await waitFor(() => expect(onPreview).toHaveBeenCalledWith(null));
    expect(screen.getByText(/Docente actual: Sin asignar/)).toBeInTheDocument();
  });

  it('cerrado no consulta nada', () => {
    montar({ open: false });
    expect(mocks.conflicto).not.toHaveBeenCalled();
  });

  it('con bloques del curso muestra su grilla semanal', async () => {
    const conBloques = { ...curso, bloques: [{ cursoHorarioId: 1, dia: 'LUNES', horaInicio: '19:00:00', horaFin: '19:45:00' }], cursoCodigo: 'MAT' };
    montar({ selectedCourse: conBloques });
    await screen.findByText('Luna Pérez Ana');
    expect(document.querySelector('.da-cal-semanal')).not.toBeNull();
  });
});
