/**
 * PlanPeriodoAsignaturasPage: builder drag & drop de asignaturas y prerrequisitos de un periodo.
 * El hook de estado se simula; el arrastre se ejerce invocando los handlers de DndContext.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '../../../../../test/renderWithProviders.jsx';

const state = vi.hoisted(() => ({ builder: vi.fn(), dnd: { current: null } }));

vi.mock('@dnd-kit/core', async (importActual) => {
  const actual = await importActual();
  return {
    ...actual,
    DndContext: (props) => {
      state.dnd.current = props;
      return <div data-testid="dnd-context">{props.children}</div>;
    },
  };
});
vi.mock('@application-configuracion/academico/hooks', () => ({
  usePlanBuilder: () => state.builder(),
}));

import PlanPeriodoAsignaturasPage from '../pages/PlanPeriodoAsignaturasPage.jsx';
import PlanPeriodoAsignaturasConnector from '../connectors/PlanPeriodoAsignaturasConnector.jsx';

const ASIG = 'configuracion.plan-estudio.asignaturas';
const PERIODOS = 'configuracion.plan-estudio.periodos';
const PREREQ = 'configuracion.plan-estudio.prerrequisitos';

const materias = [
  { id: 1, sigla: 'MAT-1', nombre: 'Matemática I', clasificacion: 'Básicas', tipo: 'TEORICA' },
  { id: 2, sigla: 'FIS-1', nombre: 'Física I', clasificacion: 'Básicas', tipo: 'TEORICA_PRACTICA' },
  { id: 3, sigla: 'PRO-1', nombre: 'Programación I', clasificacion: 'Específicas', tipo: 'PRACTICA' },
  { id: 4, sigla: 'ING-0', nombre: 'Inglés 0', clasificacion: 'Básicas', asignadaEn: { periodoNombre: '1er Año' }, esPrerrequisitoValido: true },
  { id: 5, sigla: 'USA-0', nombre: 'Ya usada', clasificacion: 'Básicas', enPeriodoActual: true },
];

const crearEstado = (extra = {}) => ({
  periodoActual: { id: 9 },
  periodoNombre: '2do Año',
  periodoNoEncontrado: false,
  tienePeriodosAnteriores: true,
  materiasCatalogo: materias,
  materiasLoading: false,
  draftFilas: [{ key: 'f1', sigla: 'USA-0', nombre: 'Ya usada', horas: 4, prereqs: [{ key: 'p1', sigla: 'ING-0', nombre: 'Inglés 0' }] }],
  hayCambios: false,
  horasAsignadas: 4,
  horasSemana: 20,
  horasDisponibles: 16,
  breadcrumbItems: [],
  loading: false,
  error: null,
  isInvalidId: false,
  guardando: false,
  agregarMateria: vi.fn(),
  quitarFila: vi.fn(),
  cambiarHoras: vi.fn(),
  agregarPrerrequisito: vi.fn(),
  moverPrerrequisito: vi.fn(),
  quitarPrerrequisito: vi.fn(),
  descartarCambios: vi.fn(),
  guardarCambios: vi.fn(),
  handleVolver: vi.fn(),
  handleEliminarPeriodo: vi.fn(),
  ...extra,
});

const TODOS = {
  auth: {
    permisos: [
      permiso(ASIG, 'CREAR', 'ELIMINAR'),
      permiso(PERIODOS, 'ELIMINAR'),
      permiso(PREREQ, 'CREAR'),
    ],
  },
};

beforeEach(() => {
  state.builder.mockReset();
  state.dnd.current = null;
});

const arrastrar = (active, over) =>
  act(() => {
    state.dnd.current.onDragStart({ active: { data: { current: active } } });
    state.dnd.current.onDragEnd({
      active: { data: { current: active } },
      over: over ? { data: { current: over } } : null,
    });
  });

describe('PlanPeriodoAsignaturasPage', () => {
  it('muestra catálogo por clasificación, asignaturas del periodo, horas y prerrequisitos', () => {
    state.builder.mockReturnValue(crearEstado());
    renderWithProviders(<PlanPeriodoAsignaturasPage />, TODOS);
    expect(screen.getByText('Asignaturas — 2do Año')).toBeInTheDocument();
    expect(screen.getByText('Catálogo de materias')).toBeInTheDocument();
    // La clasificación activa es la primera alfabética: «Básicas»
    expect(screen.getByText('Matemática I')).toBeInTheDocument();
    expect(screen.getByText('Física I')).toBeInTheDocument();
    expect(screen.queryByText('Programación I')).not.toBeInTheDocument();
    expect(screen.getByText('Materias de años anteriores')).toBeInTheDocument();
    expect(screen.getByText('Inglés 0')).toBeInTheDocument();
    expect(screen.getByText('4 / 20')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Horas asignadas: 4 de 20' })).toBeInTheDocument();
    expect(screen.getByText('Prerrequisitos')).toBeInTheDocument();
    expect(screen.getByText(/arrastre una materia de un año anterior/)).toBeInTheDocument();
  });

  it('la búsqueda cruza clasificaciones', async () => {
    state.builder.mockReturnValue(crearEstado());
    renderWithProviders(<PlanPeriodoAsignaturasPage />, TODOS);
    await userEvent.type(screen.getByPlaceholderText('Buscar materia'), 'program');
    expect(screen.getByText('Programación I')).toBeInTheDocument();
    expect(screen.queryByText('Matemática I')).not.toBeInTheDocument();
    await userEvent.clear(screen.getByPlaceholderText('Buscar materia'));
    await userEvent.type(screen.getByPlaceholderText('Buscar materia'), 'zzzz');
    expect(screen.getByText('Sin materias disponibles')).toBeInTheDocument();
  });

  it('sin periodos anteriores oculta años anteriores y prerrequisitos', () => {
    state.builder.mockReturnValue(crearEstado({ tienePeriodosAnteriores: false }));
    renderWithProviders(<PlanPeriodoAsignaturasPage />, TODOS);
    expect(screen.queryByText('Materias de años anteriores')).not.toBeInTheDocument();
    expect(screen.queryByText('Prerrequisitos')).not.toBeInTheDocument();
  });

  it('periodo sin asignaturas muestra el placeholder y avisa en prerrequisitos', () => {
    state.builder.mockReturnValue(crearEstado({ draftFilas: [], horasAsignadas: 0 }));
    renderWithProviders(<PlanPeriodoAsignaturasPage />, TODOS);
    expect(screen.getByText('Arrastre aquí una materia del catálogo')).toBeInTheDocument();
    expect(screen.getByText('Agregue asignaturas al periodo')).toBeInTheDocument();
  });

  it('edita las horas y quita la fila (permisos completos)', async () => {
    const s = crearEstado();
    state.builder.mockReturnValue(s);
    renderWithProviders(<PlanPeriodoAsignaturasPage />, TODOS);
    await userEvent.click(screen.getByRole('button', { name: 'Quitar Ya usada del periodo' }));
    expect(s.quitarFila).toHaveBeenCalledWith('f1');
    expect(screen.getByLabelText('Horas semanales de Ya usada')).toBeInTheDocument();
  });

  it('RBAC: sin permisos no hay quitar ni eliminar periodo', () => {
    state.builder.mockReturnValue(crearEstado());
    renderWithProviders(<PlanPeriodoAsignaturasPage />);
    expect(screen.queryByRole('button', { name: /Quitar Ya usada/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Eliminar periodo/ })).not.toBeInTheDocument();
  });

  it('guardar está deshabilitado sin cambios; con cambios se puede guardar o descartar', async () => {
    state.builder.mockReturnValue(crearEstado());
    const b = renderWithProviders(<PlanPeriodoAsignaturasPage />, TODOS);
    expect(screen.getByRole('button', { name: /Guardar cambios/ })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Descartar' })).not.toBeInTheDocument();
    b.unmount();
    const s = crearEstado({ hayCambios: true });
    state.builder.mockReturnValue(s);
    renderWithProviders(<PlanPeriodoAsignaturasPage />, TODOS);
    await userEvent.click(screen.getByRole('button', { name: /Guardar cambios/ }));
    expect(s.guardarCambios).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(s.descartarCambios).toHaveBeenCalled();
  });

  it('eliminar periodo pide confirmación', async () => {
    const s = crearEstado();
    state.builder.mockReturnValue(s);
    renderWithProviders(<PlanPeriodoAsignaturasPage />, TODOS);
    await userEvent.click(screen.getByRole('button', { name: /Eliminar periodo/ }));
    expect(await screen.findByText('Se eliminará el periodo y debe estar sin asignaturas. ¿Continuar?')).toBeInTheDocument();
    expect(s.handleEliminarPeriodo).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar', exact: true }));
    expect(s.handleEliminarPeriodo).toHaveBeenCalled();
  });

  it('volver sin cambios sale directo; con cambios pide confirmación', async () => {
    const a0 = crearEstado();
    state.builder.mockReturnValue(a0);
    const a = renderWithProviders(<PlanPeriodoAsignaturasPage />, TODOS);
    await userEvent.click(a.container.querySelector('.anticon-arrow-left').closest('button'));
    expect(a0.handleVolver).toHaveBeenCalled();
    a.unmount();

    const b0 = crearEstado({ hayCambios: true });
    state.builder.mockReturnValue(b0);
    const b = renderWithProviders(<PlanPeriodoAsignaturasPage />, TODOS);
    await userEvent.click(b.container.querySelector('.anticon-arrow-left').closest('button'));
    expect((await screen.findAllByText('Cambios sin guardar')).length).toBeGreaterThan(0);
    expect(b0.handleVolver).not.toHaveBeenCalled();
    const botones = [...document.querySelectorAll('.ant-modal-confirm-btns')].at(-1);
    await userEvent.click(within(botones).getByRole('button', { name: 'Salir sin guardar' }));
    expect(b0.handleVolver).toHaveBeenCalled();
  });

  describe('arrastrar y soltar', () => {
    const libre = materias[0];
    const anterior = materias[3];

    it('materia libre sobre la zona del periodo la agrega', () => {
      const s = crearEstado();
      state.builder.mockReturnValue(s);
      renderWithProviders(<PlanPeriodoAsignaturasPage />, TODOS);
      arrastrar({ type: 'materia', materia: libre }, { type: 'periodo-zone' });
      expect(s.agregarMateria).toHaveBeenCalledWith(libre);
    });

    it('materia de año anterior sobre la zona del periodo avisa y no agrega', async () => {
      const s = crearEstado();
      state.builder.mockReturnValue(s);
      renderWithProviders(<PlanPeriodoAsignaturasPage />, TODOS);
      arrastrar({ type: 'materia', materia: anterior }, { type: 'periodo-zone' });
      expect(s.agregarMateria).not.toHaveBeenCalled();
      expect(await screen.findByText('Materia ya asignada')).toBeInTheDocument();
      expect(screen.getByText(/pertenece a 1er Año; solo puede usarse como prerrequisito/)).toBeInTheDocument();
    });

    it('materia sobre un slot de prerrequisito lo agrega a esa fila', () => {
      const s = crearEstado();
      state.builder.mockReturnValue(s);
      renderWithProviders(<PlanPeriodoAsignaturasPage />, TODOS);
      arrastrar({ type: 'materia', materia: anterior }, { type: 'prereq-slot', filaKey: 'f1' });
      expect(s.agregarPrerrequisito).toHaveBeenCalledWith('f1', anterior);
    });

    it('un tag de prerrequisito se mueve entre filas y no a otras zonas', () => {
      const s = crearEstado();
      state.builder.mockReturnValue(s);
      renderWithProviders(<PlanPeriodoAsignaturasPage />, TODOS);
      const tag = { type: 'prereq-tag', fromFilaKey: 'f1', prereq: { key: 'p1' } };
      arrastrar(tag, { type: 'prereq-slot', filaKey: 'f2' });
      expect(s.moverPrerrequisito).toHaveBeenCalledWith('f1', 'f2', 'p1');
      arrastrar(tag, { type: 'periodo-zone' });
      expect(s.moverPrerrequisito).toHaveBeenCalledTimes(1);
    });

    it('soltar fuera de una zona o sin datos no hace nada', () => {
      const s = crearEstado();
      state.builder.mockReturnValue(s);
      renderWithProviders(<PlanPeriodoAsignaturasPage />, TODOS);
      arrastrar({ type: 'materia', materia: libre }, null);
      act(() => {
        state.dnd.current.onDragEnd({ active: { data: { current: null } }, over: { data: { current: { type: 'periodo-zone' } } } });
        state.dnd.current.onDragEnd({ active: { data: { current: {} } }, over: { data: { current: { type: 'periodo-zone' } } } });
        state.dnd.current.onDragEnd({ active: { data: { current: { type: 'materia', materia: libre } } }, over: { data: { current: undefined } } });
      });
      expect(s.agregarMateria).not.toHaveBeenCalled();
      expect(s.agregarPrerrequisito).not.toHaveBeenCalled();
    });
  });

  it('id inválido, periodo inexistente, error y carga', () => {
    state.builder.mockReturnValue(crearEstado({ isInvalidId: true, periodoActual: null }));
    const a = renderWithProviders(<PlanPeriodoAsignaturasPage />);
    expect(screen.getByText('Identificador de plan o periodo inválido')).toBeInTheDocument();
    a.unmount();
    state.builder.mockReturnValue(crearEstado({ periodoActual: null, periodoNoEncontrado: true, periodoNombre: null }));
    const b = renderWithProviders(<PlanPeriodoAsignaturasPage />);
    expect(screen.getByText('Este periodo ya no existe en el plan')).toBeInTheDocument();
    expect(screen.getByText('Asignaturas del periodo')).toBeInTheDocument();
    b.unmount();
    state.builder.mockReturnValue(crearEstado({ error: 'Falla del servidor' }));
    const c = renderWithProviders(<PlanPeriodoAsignaturasPage />);
    expect(screen.getByText('Falla del servidor')).toBeInTheDocument();
    c.unmount();
    state.builder.mockReturnValue(crearEstado({ loading: true, periodoActual: null }));
    const d = renderWithProviders(<PlanPeriodoAsignaturasPage />);
    expect(d.container.querySelector('.ant-spin-spinning')).not.toBeNull();
  });

  it('horas excedidas se marcan', () => {
    state.builder.mockReturnValue(crearEstado({ horasAsignadas: 24, horasDisponibles: -4 }));
    const { container } = renderWithProviders(<PlanPeriodoAsignaturasPage />, TODOS);
    expect(container.querySelector('.cfg-plan-builder__total--excedido')).not.toBeNull();
  });

  it('el conector monta la página', () => {
    state.builder.mockReturnValue(crearEstado({ isInvalidId: true }));
    renderWithProviders(<PlanPeriodoAsignaturasConnector />);
    expect(screen.getByText('Identificador de plan o periodo inválido')).toBeInTheDocument();
  });
});
