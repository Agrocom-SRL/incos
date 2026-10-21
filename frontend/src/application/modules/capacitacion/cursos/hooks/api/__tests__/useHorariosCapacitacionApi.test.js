import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

const repo = vi.hoisted(() => ({
  obtenerTodos: vi.fn(),
  crear: vi.fn(),
}));
vi.mock('@implementations/HorarioCapacitacionRepository', () => ({ default: repo }));

import dayjs from 'dayjs';
import { useHorariosCapacitacionApi } from '../useHorariosCapacitacionApi';

const sabMan = { horarioId: 1, dia: 'SABADO', horaInicio: '08:00:00', horaFin: '12:00:00' };
const sabTar = { horarioId: 2, dia: 'SABADO', horaInicio: '15:00:00', horaFin: '19:00:00' };

describe('useHorariosCapacitacionApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('carga el catálogo completo', async () => {
    repo.obtenerTodos.mockResolvedValue({ success: true, data: [sabTar, sabMan] });
    const { result } = renderHook(() => useHorariosCapacitacionApi());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(repo.obtenerTodos).toHaveBeenCalledWith();
    expect(result.current.horarios.map((h) => h.etiqueta)).toEqual([
      'SAB 08:00-12:00',
      'SAB 15:00-19:00',
    ]);
  });

  it('expone el error si falla la carga', async () => {
    repo.obtenerTodos.mockResolvedValue({ success: false, error: 'Sin permiso' });
    const { result } = renderHook(() => useHorariosCapacitacionApi());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Sin permiso');
    expect(result.current.horarios).toEqual([]);
  });

  it('crea un horario, lo agrega sin duplicar y lo devuelve', async () => {
    repo.obtenerTodos.mockResolvedValue({ success: true, data: [sabMan] });
    repo.crear.mockResolvedValue({ success: true, data: { horario: sabTar } });
    const { result } = renderHook(() => useHorariosCapacitacionApi());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let creado;
    await act(async () => {
      creado = await result.current.crearHorario({
        dia: 'SABADO',
        horaInicio: dayjs().hour(15).minute(0),
        horaFin: dayjs().hour(19).minute(0),
      });
    });
    expect(repo.crear).toHaveBeenCalledWith({
      dia: 'SABADO',
      horaInicio: '15:00',
      horaFin: '19:00',
    });
    expect(creado.success).toBe(true);
    expect(creado.data.etiqueta).toBe('SAB 15:00-19:00');
    expect(result.current.horarios).toHaveLength(2);

    // find-or-create: el backend devuelve uno existente → no se duplica
    repo.crear.mockResolvedValue({ success: true, data: { horario: sabTar } });
    await act(async () => {
      await result.current.crearHorario({
        dia: 'SABADO',
        horaInicio: dayjs().hour(15),
        horaFin: dayjs().hour(19),
      });
    });
    expect(result.current.horarios).toHaveLength(2);
  });

  it('propaga el error de creación', async () => {
    repo.obtenerTodos.mockResolvedValue({ success: true, data: [] });
    repo.crear.mockResolvedValue({ success: false, error: 'Día inválido' });
    const { result } = renderHook(() => useHorariosCapacitacionApi());
    await waitFor(() => expect(result.current.loading).toBe(false));
    let res;
    await act(async () => {
      res = await result.current.crearHorario({
        dia: 'X',
        horaInicio: dayjs().hour(8),
        horaFin: dayjs().hour(9),
      });
    });
    expect(res).toEqual({ success: false, error: 'Día inválido' });
  });
});
