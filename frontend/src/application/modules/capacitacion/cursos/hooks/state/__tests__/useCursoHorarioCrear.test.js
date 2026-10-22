import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import dayjs from 'dayjs';
import { useCursoHorarioCrear } from '../useCursoHorarioCrear';

const makeForm = (grupos) => {
  const store = { grupos };
  return {
    getFieldValue: (k) => store[k],
    setFieldsValue: vi.fn((v) => Object.assign(store, v)),
    store,
  };
};

const valoresHorario = {
  dia: 'SABADO',
  horaInicio: dayjs().hour(8).minute(0),
  horaFin: dayjs().hour(12).minute(0),
};

describe('useCursoHorarioCrear', () => {
  it('abre y cierra el modal para un grupo', () => {
    const { result } = renderHook(() => useCursoHorarioCrear({ form: makeForm([]), crearHorario: vi.fn() }));
    expect(result.current.crearOpen).toBe(false);
    act(() => result.current.abrirCrear(1));
    expect(result.current.crearOpen).toBe(true);
    act(() => result.current.cerrarCrear());
    expect(result.current.crearOpen).toBe(false);
  });

  it('crea el horario y lo marca solo en el grupo de origen, conservando los que ya tenía', async () => {
    const form = makeForm([
      { key: 'a', nombre: 'G1', horarios: [{ horarioId: 1 }] },
      { key: 'b', nombre: 'G2', horarios: [] },
    ]);
    const crearHorario = vi.fn().mockResolvedValue({ success: true, data: { horarioId: 7 } });
    const { result } = renderHook(() => useCursoHorarioCrear({ form, crearHorario }));

    act(() => result.current.abrirCrear(0));
    await act(async () => {
      await result.current.handleCrearHorario(valoresHorario);
    });

    expect(form.store.grupos[0].horarios).toEqual([{ horarioId: 1 }, { horarioId: 7 }]);
    expect(form.store.grupos[1].horarios).toEqual([]);
    expect(result.current.crearOpen).toBe(false);
  });

  it('con varios días crea un horario por día y los marca todos en el grupo', async () => {
    const form = makeForm([{ key: 'a', nombre: 'G1', horarios: [] }]);
    const crearHorario = vi
      .fn()
      .mockResolvedValueOnce({ success: true, data: { horarioId: 7 } })
      .mockResolvedValueOnce({ success: true, data: { horarioId: 8 } });
    const { result } = renderHook(() => useCursoHorarioCrear({ form, crearHorario }));
    act(() => result.current.abrirCrear(0));
    await act(async () => {
      await result.current.handleCrearHorario({ ...valoresHorario, dia: ['MARTES', 'JUEVES'] });
    });
    expect(crearHorario).toHaveBeenCalledTimes(2);
    expect(crearHorario.mock.calls.map(([v]) => v.dia)).toEqual(['MARTES', 'JUEVES']);
    expect(form.store.grupos[0].horarios).toEqual([{ horarioId: 7 }, { horarioId: 8 }]);
    expect(result.current.crearOpen).toBe(false);
  });

  it('un horario ya marcado no se duplica', async () => {
    const form = makeForm([{ key: 'a', nombre: 'G1', horarios: [{ horarioId: 7 }] }]);
    const crearHorario = vi.fn().mockResolvedValue({ success: true, data: { horarioId: 7 } });
    const { result } = renderHook(() => useCursoHorarioCrear({ form, crearHorario }));
    act(() => result.current.abrirCrear(0));
    await act(async () => {
      await result.current.handleCrearHorario(valoresHorario);
    });
    expect(form.store.grupos[0].horarios).toEqual([{ horarioId: 7 }]);
  });

  it('valida antes de llamar a la API y muestra el error', async () => {
    const crearHorario = vi.fn();
    const { result } = renderHook(() => useCursoHorarioCrear({ form: makeForm([{ horarios: [] }]), crearHorario }));
    act(() => result.current.abrirCrear(0));
    await act(async () => {
      await result.current.handleCrearHorario({ dia: 'SABADO' });
    });
    expect(crearHorario).not.toHaveBeenCalled();
    expect(result.current.errorCrear).toBeTruthy();
    expect(result.current.crearOpen).toBe(true);
  });

  it('si la API falla deja el modal abierto con su mensaje', async () => {
    const crearHorario = vi.fn().mockResolvedValue({ success: false, error: 'Ya existe' });
    const { result } = renderHook(() => useCursoHorarioCrear({ form: makeForm([{ horarios: [] }]), crearHorario }));
    act(() => result.current.abrirCrear(0));
    await act(async () => {
      await result.current.handleCrearHorario(valoresHorario);
    });
    expect(result.current.errorCrear).toBe('Ya existe');
    expect(result.current.crearOpen).toBe(true);
  });
});
