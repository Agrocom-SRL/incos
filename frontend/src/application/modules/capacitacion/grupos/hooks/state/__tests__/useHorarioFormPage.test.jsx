import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import dayjs from 'dayjs';

const ctx = vi.hoisted(() => ({ value: {} }));
const nav = vi.hoisted(() => ({ navigate: vi.fn() }));
const notif = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
const form = vi.hoisted(() => ({ validateFields: vi.fn(), setFieldsValue: vi.fn() }));

vi.mock('antd', () => ({
  App: { useApp: () => ({ notification: notif }) },
  Form: { useForm: () => [form] },
}));
vi.mock('react-router-dom', () => ({
  useNavigate: () => nav.navigate,
  useLocation: () => ({ state: null }),
}));
vi.mock('@application-capacitacion/grupos/hooks/context/useHorarioFormContext', () => ({
  useHorarioFormContext: () => ctx.value,
}));

import { useHorarioFormPage } from '../useHorarioFormPage';

const franja = { horaInicio: dayjs().hour(19).minute(0), horaFin: dayjs().hour(21).minute(0) };

describe('useHorarioFormPage · días', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ctx.value = { horarioId: null, horario: null, loadingHorario: false, saving: false, guardarHorario: vi.fn().mockResolvedValue({ success: true }) };
  });

  it('alta con varios días crea un horario por día con la misma franja', async () => {
    form.validateFields.mockResolvedValue({ ...franja, dia: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'] });
    const { result } = renderHook(() => useHorarioFormPage('create'));
    await act(async () => {
      await result.current.handleSubmit();
    });
    const { guardarHorario } = ctx.value;
    expect(guardarHorario).toHaveBeenCalledTimes(5);
    expect(guardarHorario.mock.calls.map(([a]) => a.payload.dia)).toEqual(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']);
    expect(guardarHorario.mock.calls[0][0].payload).toMatchObject({ horaInicio: '19:00', horaFin: '21:00' });
    expect(notif.success).toHaveBeenCalledWith(expect.objectContaining({ title: '5 horarios guardados' }));
  });

  it('edición guarda un solo día', async () => {
    ctx.value.horarioId = 3;
    form.validateFields.mockResolvedValue({ ...franja, dia: 'SABADO' });
    const { result } = renderHook(() => useHorarioFormPage('edit'));
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(ctx.value.guardarHorario).toHaveBeenCalledTimes(1);
    expect(ctx.value.guardarHorario.mock.calls[0][0]).toMatchObject({ id: 3, payload: { dia: 'SABADO' } });
  });
});
