/**
 * EvaluacionDrawer: crear / editar / eliminar actividad del cuaderno (validación y cuota).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from 'antd';
import { renderWithProviders } from '../../../../../test/renderWithProviders.jsx';

const tiposState = vi.hoisted(() => ({ current: { tipos: [], isLoading: false } }));
vi.mock('@application-academico/calificaciones/hooks/useTiposEvaluacion.js', () => ({
  useTiposEvaluacion: () => tiposState.current,
}));

import EvaluacionDrawer from '../components/EvaluacionDrawer.jsx';

const TIPOS = [
  { id: 1, codigo: 'EXAMEN', nombre: 'Examen' },
  { id: 7, codigo: 'ASISTENCIA', nombre: 'Asistencia' },
];

let props;
beforeEach(() => {
  tiposState.current = { tipos: TIPOS, isLoading: false };
  props = {
    abierto: true,
    modo: 'crear',
    cursoId: 9,
    bimestre: 2,
    evaluacionesActuales: [],
    estudiantes: [],
    cuotaTeorico: 30,
    cuotaPractico: 70,
    onCerrar: vi.fn(),
    onGuardado: vi.fn(),
    onEliminado: vi.fn().mockResolvedValue(undefined),
    crearEvaluacion: vi.fn().mockResolvedValue({ id: 50 }),
    editarEvaluacion: vi.fn().mockResolvedValue({ id: 3 }),
  };
});

const montar = (extra = {}) => renderWithProviders(<EvaluacionDrawer {...props} {...extra} />);

const elegirTipo = async (nombre) => {
  await userEvent.click(screen.getByRole('combobox'));
  await userEvent.click(await screen.findByText(nombre, { selector: '.ant-select-item-option-content' }));
};
const escribirPuntos = (valor) =>
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: String(valor) } });
const escribirNombre = (valor) =>
  fireEvent.change(screen.getByPlaceholderText(/Parcial Tema 3/), { target: { value: valor } });

describe('EvaluacionDrawer · crear', () => {
  it('muestra el título, las secciones y la cuota por defecto del componente práctico', async () => {
    montar();
    expect(await screen.findByText('Agregar actividad', { selector: '.ant-drawer-title' })).toBeInTheDocument();
    expect(screen.getByText('Identificación')).toBeInTheDocument();
    expect(screen.getByText('Componente y evaluaciones')).toBeInTheDocument();
    expect(screen.getByText('Programación')).toBeInTheDocument();
    expect(screen.getByText(/Suma de otras actividades ya creadas/)).toHaveTextContent('0 pts');
    expect(screen.getByText(/cuota total:/)).toHaveTextContent('70 pts');
    expect(screen.getByRole('progressbar', { name: /componente Práctico/ })).toBeInTheDocument();
  });

  it('valida los campos obligatorios antes de enviar', async () => {
    montar();
    await userEvent.click(await screen.findByRole('button', { name: 'Agregar actividad' }));
    expect(await screen.findByText('Seleccione un tipo')).toBeInTheDocument();
    expect(screen.getByText('Ingrese un nombre')).toBeInTheDocument();
    expect(await screen.findByText('Ingrese los puntos')).toBeInTheDocument();
    expect(props.crearEvaluacion).not.toHaveBeenCalled();
  });

  it('crea la actividad con el payload normalizado y cierra', async () => {
    montar();
    await elegirTipo('Examen');
    escribirNombre('  Parcial 1  ');
    escribirPuntos(20);
    await userEvent.click(screen.getByRole('button', { name: 'Agregar actividad' }));
    await waitFor(() => expect(props.crearEvaluacion).toHaveBeenCalled());
    expect(props.crearEvaluacion).toHaveBeenCalledWith({
      tipoEvaluacionId: 1,
      nombre: 'Parcial 1',
      componente: 'PRACTICO',
      puntos: 20,
      fecha: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    });
    expect(await screen.findByText('Actividad creada')).toBeInTheDocument();
    expect(props.onGuardado).toHaveBeenCalledWith({ id: 50 }, { recalcular: false });
    expect(props.onCerrar).toHaveBeenCalled();
  });

  it('el componente teórico usa su propia cuota', async () => {
    montar();
    await userEvent.click(screen.getByText('Teórico', { selector: '.ant-segmented-item-label' }));
    expect(screen.getByText(/cuota total:/)).toHaveTextContent('30 pts');
  });

  it('puntos que superan la cuota bloquean el envío y avisan', async () => {
    montar({
      evaluacionesActuales: [{ id: 1, componente: 'PRACTICO', puntos: 60, tipoEvaluacionId: 1 }],
    });
    expect(screen.getByText(/Suma de otras actividades ya creadas/)).toHaveTextContent('60 pts');
    escribirPuntos(20);
    expect(await screen.findByText(/Superás la cuota del componente Práctico por/)).toHaveTextContent('10 pts');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Agregar actividad' })).toBeDisabled());
  });

  it('cuota completa se informa', async () => {
    montar({
      evaluacionesActuales: [{ id: 1, componente: 'PRACTICO', puntos: 50, tipoEvaluacionId: 1 }],
    });
    escribirPuntos(20);
    expect(await screen.findByText(/Cuota del componente Práctico completa \(70 pts\)/)).toBeInTheDocument();
  });

  it('un error del servicio se muestra y permite reintentar', async () => {
    props.crearEvaluacion = vi.fn().mockRejectedValueOnce(new Error('Bimestre cerrado')).mockResolvedValue({ id: 51 });
    montar();
    await elegirTipo('Examen');
    escribirNombre('Parcial');
    escribirPuntos(10);
    await userEvent.click(screen.getByRole('button', { name: 'Agregar actividad' }));
    expect(await screen.findByText('Bimestre cerrado')).toBeInTheDocument();
    expect(props.onCerrar).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    await waitFor(() => expect(props.crearEvaluacion).toHaveBeenCalledTimes(2));
  });

  it('cancelar cierra el drawer', async () => {
    montar();
    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));
    expect(props.onCerrar).toHaveBeenCalled();
  });

  it('no ofrece Eliminar al crear', async () => {
    montar();
    await screen.findByText('Identificación');
    expect(screen.queryByRole('button', { name: /Eliminar/ })).not.toBeInTheDocument();
  });

  it('cargando tipos deshabilita el selector', async () => {
    tiposState.current = { tipos: [], isLoading: true };
    montar();
    await screen.findByText('Identificación');
    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });

  it('cerrado no pinta el contenido', () => {
    montar({ abierto: false });
    expect(screen.queryByText('Identificación')).not.toBeInTheDocument();
  });
});

describe('EvaluacionDrawer · asistencia', () => {
  it('el tipo asistencia fija el componente práctico y avisa que se calcula solo', async () => {
    montar();
    await userEvent.click(screen.getByText('Teórico', { selector: '.ant-segmented-item-label' }));
    await elegirTipo('Asistencia');
    expect(await screen.findByText('Actividad calculada desde la asistencia')).toBeInTheDocument();
    expect(screen.getByText(/siempre suma al componente práctico/)).toBeInTheDocument();
    expect(screen.getByText(/cuota total:/)).toHaveTextContent('70 pts');
  });

  it('crear asistencia pide recargar el cuaderno', async () => {
    montar();
    await elegirTipo('Asistencia');
    escribirNombre('Asistencia B2');
    escribirPuntos(10);
    await userEvent.click(screen.getByRole('button', { name: 'Agregar actividad' }));
    await waitFor(() => expect(props.onGuardado).toHaveBeenCalledWith({ id: 50 }, { recalcular: true }));
  });

  it('si ya existe una actividad de asistencia el tipo deja de ofrecerse', async () => {
    montar({ evaluacionesActuales: [{ id: 2, componente: 'PRACTICO', puntos: 5, tipoEvaluacionId: 7 }] });
    await userEvent.click(screen.getByRole('combobox'));
    expect(await screen.findByText('Examen', { selector: '.ant-select-item-option-content' })).toBeInTheDocument();
    expect(screen.queryByText('Asistencia', { selector: '.ant-select-item-option-content' })).not.toBeInTheDocument();
  });
});

const confirmarEliminar = async () => {
  await screen.findAllByText('Eliminar actividad', { selector: '.ant-modal-confirm-title' });
  const botones = [...document.querySelectorAll('.ant-modal-confirm-btns')].at(-1);
  await userEvent.click(within(botones).getByRole('button', { name: 'Eliminar' }));
};

describe('EvaluacionDrawer · editar', () => {
  const evaluacion = {
    id: 3,
    tipoEvaluacionId: 1,
    nombre: 'Parcial 1',
    componente: 'TEORICO',
    puntos: 15,
    fecha: '2026-03-10',
  };

  it('precarga los valores y guarda los cambios', async () => {
    montar({ modo: 'editar', evaluacion, evaluacionesActuales: [evaluacion] });
    expect(await screen.findByText('Editar actividad', { selector: '.ant-drawer-title' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByPlaceholderText(/Parcial Tema 3/)).toHaveValue('Parcial 1'));
    expect(screen.getByRole('spinbutton')).toHaveValue('15');
    escribirPuntos(18);
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(props.editarEvaluacion).toHaveBeenCalled());
    expect(props.editarEvaluacion).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ tipoEvaluacionId: 1, componente: 'TEORICO', puntos: 18, fecha: '2026-03-10' }),
    );
    expect(await screen.findByText('Actividad actualizada')).toBeInTheDocument();
    expect(props.onGuardado).toHaveBeenCalledWith({ id: 3 }, { recalcular: false });
  });

  it('no cuenta la propia actividad en la suma de las otras', async () => {
    montar({ modo: 'editar', evaluacion, evaluacionesActuales: [evaluacion] });
    expect(await screen.findByText(/Suma de otras actividades ya creadas/)).toHaveTextContent('0 pts');
  });

  it('eliminar pide confirmación, elimina y cierra', async () => {
    montar({ modo: 'editar', evaluacion, evaluacionesActuales: [evaluacion], estudiantes: [{ id: 1, notas: { 3: 10 } }] });
    await userEvent.click(await waitFor(() => { const b = document.querySelector('.cal-eval-drawer__btn-eliminar'); if (!b) throw new Error('sin botón'); return b; }));
    await confirmarEliminar();
    await waitFor(() => expect(props.onEliminado).toHaveBeenCalledWith(3));
    expect(await screen.findByText('Actividad eliminada')).toBeInTheDocument();
    expect(props.onCerrar).toHaveBeenCalled();
  });

  it('un fallo al eliminar se muestra y no cierra', async () => {
    props.onEliminado = vi.fn().mockRejectedValue(new Error('Tiene notas bloqueadas'));
    montar({ modo: 'editar', evaluacion, evaluacionesActuales: [evaluacion] });
    await userEvent.click(await waitFor(() => { const b = document.querySelector('.cal-eval-drawer__btn-eliminar'); if (!b) throw new Error('sin botón'); return b; }));
    await confirmarEliminar();
    expect(await screen.findByText('Tiene notas bloqueadas')).toBeInTheDocument();
    expect(props.onCerrar).not.toHaveBeenCalled();
  });
});

// Los Modal.confirm son estáticos: se destruyen para que un diálogo previo no contamine la prueba siguiente.
afterEach(() => {
  Modal.destroyAll();
});
