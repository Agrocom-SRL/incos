import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const ctx = vi.hoisted(() => ({ value: {} }));
const msg = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
const formMock = vi.hoisted(() => ({
  validateFields: vi.fn(),
  getFieldsValue: vi.fn(() => ({})),
  getFieldValue: vi.fn(),
  setFieldsValue: vi.fn(),
  scrollToField: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: null }),
}));
vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    App: { useApp: () => ({ message: msg }) },
    Form: { ...actual.Form, useForm: () => [formMock] },
  };
});
vi.mock(
  '@application-capacitacion/inscripciones/hooks/context/useInscribirParticipanteContext',
  () => ({ useInscribirParticipanteContext: () => ctx.value }),
);

import {
  useInscribirParticipantePage,
  MODO_PARTICIPANTE,
} from '../useInscribirParticipantePage';

const cursoConCosto = { id: 7, titulo: 'Excel', cobraMatricula: true, costoMatricula: 100, tieneCosto: true, costo: 200 };
const cursoGratis = { id: 8, titulo: 'Word', cobraMatricula: false, tieneCosto: false };
const grupos2 = [
  { id: 1, nombre: 'A' },
  { id: 2, nombre: 'B' },
];

const buildContext = (extra = {}) => ({
  participantes: [],
  loadingBusqueda: false,
  errorBusqueda: null,
  buscarParticipantes: vi.fn(),
  sugeridos: [],
  loadingSugeridos: false,
  cargarSugeridos: vi.fn(),
  cursos: [cursoConCosto, cursoGratis],
  loadingCursos: false,
  errorCursos: null,
  cursoDetalle: null,
  loadingCursoDetalle: false,
  errorCursoDetalle: null,
  cargarCursoDetalle: vi.fn().mockResolvedValue({ success: true, data: { grupos: grupos2 } }),
  metodosPago: [],
  cuentasPago: [],
  loadingCatalogos: false,
  errorCatalogos: null,
  inscribir: vi.fn().mockResolvedValue({ success: false, error: 'Falla del servidor' }),
  inscribiendo: false,
  ...extra,
});

describe('useInscribirParticipantePage · pasos y validación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ctx.value = buildContext();
  });

  it('delega los pasos en la config: 4 pasos con curso gratuito y 5 con costo', async () => {
    const { result } = renderHook(() => useInscribirParticipantePage());
    // Sin curso elegido no hay pago que ofrecer.
    expect(result.current.wizardSteps.map((s) => s.formTitle)).toEqual([
      'Datos del participante',
      'Curso de capacitación',
      'Grupo y requisitos',
      'Resumen de la inscripción',
    ]);

    await act(async () => {
      await result.current.handleCursoChange(7);
    });
    // `cursos` del contexto define el curso elegido; con costo aparece «Pago inicial».
    expect(result.current.ofrecePago).toBe(true);
    expect(result.current.wizardSteps.map((s) => s.title)).toContain('Pago inicial');
    expect(result.current.wizardSteps.at(-1).sections).toContain('resumen');
  });

  it('crear participante nuevo cambia el modo y la config del paso 1', () => {
    const { result } = renderHook(() => useInscribirParticipantePage());
    act(() => result.current.handleCrearNuevoParticipante());
    expect(result.current.modoParticipante).toBe(MODO_PARTICIPANTE.NUEVO);
    expect(result.current.wizardSteps[0].config.participante.fields).toEqual([]);
  });

  it('paso 1 sin participante rechaza y handleValidationError deja el mensaje en stepError (sin toast)', async () => {
    const { result } = renderHook(() => useInscribirParticipantePage());
    let error;
    await act(async () => {
      await result.current.onValidateBeforeNext(1).catch((e) => {
        error = e;
      });
    });
    expect(error).toBeInstanceOf(Error);

    act(() => result.current.handleValidationError(error));
    expect(result.current.stepError).toMatch(/seleccione un participante/i);
    expect(msg.error).not.toHaveBeenCalled();
    expect(formMock.scrollToField).not.toHaveBeenCalled();
  });

  it('handleValidationError desplaza la vista al primer campo con error', () => {
    const { result } = renderHook(() => useInscribirParticipantePage());
    act(() =>
      result.current.handleValidationError({ errorFields: [{ name: ['ci'] }, { name: ['nombres'] }] }),
    );
    expect(formMock.scrollToField).toHaveBeenCalledWith(['ci'], {
      behavior: 'smooth',
      block: 'center',
    });
    expect(result.current.stepError).toBe('Revise los datos del paso actual');
  });

  it('handleFinish: faltas de validación van a stepError, no a toasts', async () => {
    const { result } = renderHook(() => useInscribirParticipantePage());
    await act(async () => {
      await result.current.handleFinish();
    });
    expect(result.current.stepError).toMatch(/seleccione el curso/i);
    expect(msg.error).not.toHaveBeenCalled();
    expect(ctx.value.inscribir).not.toHaveBeenCalled();
  });

  it('handleFinish: el error del servidor sí es un toast', async () => {
    const { result } = renderHook(() => useInscribirParticipantePage());
    act(() => result.current.handleSeleccionarParticipante({ id: 5 }));
    await act(async () => {
      await result.current.handleCursoChange(8);
    });
    // Curso gratuito con dos grupos: se elige uno para pasar la validación.
    act(() => result.current.setCapacitacionGrupoId(1));
    await act(async () => {
      await result.current.handleFinish();
    });
    expect(ctx.value.inscribir).toHaveBeenCalledTimes(1);
    expect(msg.error).toHaveBeenCalledWith('Falla del servidor', expect.any(Number));
  });
});
