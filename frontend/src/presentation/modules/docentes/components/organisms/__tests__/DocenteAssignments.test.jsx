import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import DocenteAssignmentsSection from '../DocenteAssignmentsSection';
import DocenteAssignmentCard from '@docentes/components/molecules/DocenteAssignmentCard';

const asignacion = (extra = {}) => ({
  materia: 'Álgebra',
  siglaMateria: 'MAT-101',
  paralelo: 'A',
  turnoParalelo: 'NOCHE',
  carrera: 'Sistemas',
  periodoMateriaPlan: 'Primer semestre',
  vigente: true,
  cargaHorariaSemanal: 4,
  ...extra,
});

const asignar = { auth: { permisos: [permiso('docentes.asignar', 'CREAR', 'EDITAR', 'ELIMINAR')] } };

describe('DocenteAssignmentCard', () => {
  it('muestra título, metadatos y estado vigente', () => {
    renderWithProviders(<DocenteAssignmentCard assignment={asignacion()} />);
    expect(screen.getByText('Álgebra')).toBeInTheDocument();
    expect(screen.getByText('MAT-101')).toBeInTheDocument();
    expect(screen.getByText('4 h/semana')).toBeInTheDocument();
    expect(screen.getByText('Vigente')).toBeInTheDocument();
  });

  it('marca conflicto y lista su origen', () => {
    renderWithProviders(
      <DocenteAssignmentCard assignment={asignacion({ conflictos: { total: 2, horario: true, aula: true } })} />,
    );
    expect(screen.getByText('Conflicto')).toBeInTheDocument();
    expect(screen.getByText(/Conflicto detectado: horario · aula/)).toBeInTheDocument();
  });

  it('usa las horas del plan si no hay carga semanal y "No vigente" si corresponde', () => {
    renderWithProviders(
      <DocenteAssignmentCard assignment={asignacion({ cargaHorariaSemanal: null, horasPlanMateria: 6, vigente: false })} />,
    );
    expect(screen.getByText('6 h/semana (plan)')).toBeInTheDocument();
    expect(screen.getByText('No vigente')).toBeInTheDocument();
  });

  it('las acciones de editar/eliminar exigen permiso y llaman con la asignación', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const a = asignacion();
    const { unmount } = renderWithProviders(
      <DocenteAssignmentCard assignment={a} showActions onEdit={onEdit} onDelete={onDelete} />,
      asignar,
    );
    await userEvent.click(screen.getByTitle('Editar asignación'));
    await userEvent.click(screen.getByTitle('Dar de baja asignación'));
    expect(onEdit).toHaveBeenCalledWith(a);
    expect(onDelete).toHaveBeenCalledWith(a);
    unmount();

    renderWithProviders(<DocenteAssignmentCard assignment={a} showActions onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.queryByTitle('Editar asignación')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Dar de baja asignación')).not.toBeInTheDocument();
  });
});

describe('DocenteAssignmentsSection', () => {
  it('sin asignaciones muestra el vacío y el botón solo con permiso y callback', async () => {
    const onAsignar = vi.fn();
    const { unmount } = renderWithProviders(
      <DocenteAssignmentsSection puedeAsignarMaterias onAsignarMaterias={onAsignar} />,
      asignar,
    );
    expect(screen.getByText('Sin materias ofertadas vinculadas a este docente')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Asignar materias y paralelos/ }));
    expect(onAsignar).toHaveBeenCalledTimes(1);
    unmount();

    renderWithProviders(<DocenteAssignmentsSection onAsignarMaterias={onAsignar} />, asignar);
    expect(screen.queryByRole('button', { name: /Asignar materias/ })).not.toBeInTheDocument();
  });

  it('agrupa por carrera y periodo', () => {
    renderWithProviders(
      <DocenteAssignmentsSection
        assignments={[
          asignacion(),
          asignacion({ materia: 'Cálculo', siglaMateria: 'MAT-102', periodoMateriaPlan: 'Segundo semestre' }),
          asignacion({ materia: 'Contabilidad', siglaMateria: 'CON-101', carrera: 'Contaduría' }),
        ]}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Sistemas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Contaduría' })).toBeInTheDocument();
    expect(screen.getByText('Segundo semestre')).toBeInTheDocument();
    expect(screen.getByText('Cálculo')).toBeInTheDocument();
  });

  it('muestra "Gestionar asignaciones" en la cabecera cuando se pide', () => {
    renderWithProviders(
      <DocenteAssignmentsSection
        assignments={[asignacion()]}
        puedeAsignarMaterias
        onAsignarMaterias={vi.fn()}
        showManageButtonInCard
      />,
      asignar,
    );
    expect(screen.getByRole('button', { name: /Gestionar asignaciones/ })).toBeInTheDocument();
  });
});
