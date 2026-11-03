import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const R = vi.hoisted(() => ({
  navigate: vi.fn(),
  showMessage: vi.fn(),
  create: { createInscripcion: vi.fn(), loading: false, error: 'eC', validationErrors: ['vC'] },
  update: { updateInscripcion: vi.fn(), loading: false, error: 'eU', validationErrors: ['vU'] },
  hist: { saveHistorialPrevio: vi.fn(), loading: false },
}));

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => R.navigate }));
vi.mock('@application/utils', async (orig) => ({ ...(await orig()), useMessage: () => R.showMessage }));
vi.mock('../../../api/useCreateInscripcion', () => ({ useCreateInscripcion: () => R.create }));
vi.mock('../../../api/useUpdateInscripcion', () => ({ useUpdateInscripcion: () => R.update }));
vi.mock('../../../api/useSaveHistorialPrevio', () => ({ useSaveHistorialPrevio: () => R.hist }));

import { useMatriculaInscripcionSubmit } from '../useMatriculaInscripcionSubmit';

const base = (extra = {}) => ({
  selectedStudent: { id: 1, tipoAdmision: 'NUEVO' },
  selectedParalelo: { id: 3 },
  selectedPeriod: { id: 9 },
  ...extra,
});
const form = () => ({});

beforeEach(() => {
  vi.clearAllMocks();
  R.create.createInscripcion.mockResolvedValue({ success: true, data: { id: 50 } });
  R.update.updateInscripcion.mockResolvedValue({ success: true, data: { enrollment: { id: 77 } } });
  R.hist.saveHistorialPrevio.mockResolvedValue({ success: true });
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

const finish = async (result, fn = 'handleFinish') => {
  let r;
  await act(async () => {
    r = await result.current[fn]();
  });
  return r;
};

describe('useMatriculaInscripcionSubmit: crear', () => {
  it('crea la inscripción, avisa y navega a su ficha', async () => {
    const { result } = renderHook(() => useMatriculaInscripcionSubmit('nuevo', base(), form));
    const r = await finish(result);
    expect(r.success).toBe(true);
    expect(R.create.createInscripcion).toHaveBeenCalledWith(expect.objectContaining({ student_id: 1, periodo_id: 9, parallel_id: 3, enrollment_type: 'NUEVO' }));
    expect(R.showMessage).toHaveBeenCalledWith('success', 'Inscripción completada correctamente');
    expect(R.navigate).toHaveBeenCalledWith('/inscripciones/50', { replace: true });
    expect(result.current.inscripcionResult.success).toBe(true);
    expect(result.current.error).toBe('eC');
    expect(result.current.validationErrors).toEqual(['vC']);
  });

  it('guardar no navega y usa el mensaje de guardado', async () => {
    const { result } = renderHook(() => useMatriculaInscripcionSubmit('nuevo', base(), form));
    await finish(result, 'handleSave');
    expect(R.navigate).not.toHaveBeenCalled();
    expect(R.showMessage).toHaveBeenCalledWith('success', expect.stringMatching(/Puede continuar/));
  });

  it('sin id en la respuesta no navega', async () => {
    R.create.createInscripcion.mockResolvedValue({ success: true, data: {} });
    const { result } = renderHook(() => useMatriculaInscripcionSubmit('nuevo', base(), form));
    await finish(result);
    expect(R.navigate).not.toHaveBeenCalled();
  });

  it('usa los valores del formulario cuando no hay estudiante ni paralelo elegidos', async () => {
    const { result } = renderHook(() =>
      useMatriculaInscripcionSubmit('nuevo', { selectedPeriod: { id: 2 } }, () => ({ student_id: 8, parallel_id: 4 })),
    );
    await finish(result);
    expect(R.create.createInscripcion).toHaveBeenCalledWith(expect.objectContaining({ student_id: 8, parallel_id: 4 }));
    const sinGetter = renderHook(() => useMatriculaInscripcionSubmit('nuevo', {}));
    expect((await finish(sinGetter.result)).success).toBe(false);
  });

  it('muestra el error de validación y no llama al servicio', async () => {
    const { result } = renderHook(() => useMatriculaInscripcionSubmit('nuevo', base({ selectedParalelo: null }), form));
    const r = await finish(result);
    expect(r.success).toBe(false);
    expect(R.showMessage).toHaveBeenCalledWith('error', expect.stringMatching(/paralelo/));
    expect(R.create.createInscripcion).not.toHaveBeenCalled();
  });

  it('envía selección por periodo para estudiantes antiguos', async () => {
    const opts = base({
      selectedStudent: { id: 1, tipoAdmision: 'ANTIGUO' },
      selectedParalelo: null,
      selectedPeriodIds: [1],
      selectedMateriaIdsByPeriod: { 1: [5] },
      selectedParalelosByPeriod: { 1: { id: 6 } },
      planEstudioId: 12,
      buildPriorHistory: () => [{ materia_id: 1 }],
    });
    const { result } = renderHook(() => useMatriculaInscripcionSubmit('nuevo', opts, form));
    await finish(result);
    expect(R.create.createInscripcion).toHaveBeenCalledWith(expect.objectContaining({
      parallel_ids_by_period: { 1: 6 },
      materia_ids_by_period: { 1: [5] },
      plan_estudio_id: 12,
      prior_history: [{ materia_id: 1 }],
    }));
  });

  it('pago pendiente abre el diálogo de pago y se puede cerrar', async () => {
    R.create.createInscripcion.mockResolvedValue({ success: false, error: 'Falta el pago del aporte académico' });
    const { result } = renderHook(() => useMatriculaInscripcionSubmit('nuevo', base(), form));
    await finish(result);
    expect(result.current.paymentRequiredStudentId).toBe(1);
    expect(R.showMessage).not.toHaveBeenCalledWith('error', expect.anything());
    act(() => result.current.clearPaymentRequiredDialog());
    expect(result.current.paymentRequiredStudentId).toBeNull();
  });

  it('otros errores del servicio se traducen y marcan el paso de materias', async () => {
    R.create.createInscripcion.mockResolvedValue({ success: false, error: 'Cannot add: foreign key constraint fails' });
    const { result } = renderHook(() => useMatriculaInscripcionSubmit('nuevo', base(), form));
    await finish(result);
    expect(result.current.materiasStepInvalid).toBe(true);
    expect(R.showMessage).toHaveBeenCalledWith('error', expect.stringMatching(/asignación docente vigente/));
    act(() => result.current.setMateriasStepInvalid(false));
    R.create.createInscripcion.mockResolvedValue({ success: false, error: { message: 'Mal' } });
    await finish(result);
    expect(R.showMessage).toHaveBeenLastCalledWith('error', 'Mal');
    R.create.createInscripcion.mockResolvedValue({ success: false, error: { code: 1 } });
    await finish(result);
    expect(R.showMessage).toHaveBeenLastCalledWith('error', 'Error al completar la inscripción');
    R.create.createInscripcion.mockResolvedValue({ success: false });
    await finish(result);
  });
});

describe('useMatriculaInscripcionSubmit: editar', () => {
  const edit = (extra = {}) => base({ inscripcionId: 77, ...extra });

  it('actualiza y navega usando el id de la respuesta', async () => {
    const { result } = renderHook(() => useMatriculaInscripcionSubmit('editar', edit(), form));
    await finish(result);
    expect(R.update.updateInscripcion).toHaveBeenCalledWith(77, expect.objectContaining({ student_id: 1 }));
    expect(R.showMessage).toHaveBeenCalledWith('success', 'Inscripción actualizada correctamente');
    expect(R.navigate).toHaveBeenCalledWith('/inscripciones/77', { replace: true });
    expect(result.current.error).toBe('eU');
    expect(result.current.validationErrors).toEqual(['vU']);
    R.update.updateInscripcion.mockResolvedValueOnce({ success: true });
    await finish(result);
    expect(R.navigate).toHaveBeenLastCalledWith('/inscripciones/77', { replace: true });
  });

  it('solo historial: guarda las notas sin tocar la inscripción', async () => {
    const opts = edit({
      selectedParalelo: null,
      completarSoloHistorialPrevio: true,
      historialPrevioHasRows: true,
      validatePriorHistory: () => ({ valid: true }),
      buildPriorHistory: () => [{ materia_id: 1, status: 'CONVALIDADO' }],
    });
    const { result } = renderHook(() => useMatriculaInscripcionSubmit('editar', opts, form));
    await finish(result);
    expect(R.hist.saveHistorialPrevio).toHaveBeenCalledWith(77, [{ materia_id: 1, status: 'CONVALIDADO' }]);
    expect(R.update.updateInscripcion).not.toHaveBeenCalled();
    expect(R.navigate).toHaveBeenCalledWith('/inscripciones/77', { replace: true });

    R.hist.saveHistorialPrevio.mockResolvedValueOnce({ success: false, error: 'No guardó' });
    await finish(result);
    expect(R.showMessage).toHaveBeenLastCalledWith('error', 'No guardó');
  });

  it('solo historial sin notas no guarda', async () => {
    const opts = edit({
      selectedParalelo: null,
      completarSoloHistorialPrevio: true,
      historialPrevioHasRows: true,
      validatePriorHistory: () => ({ valid: true }),
      buildPriorHistory: () => [],
    });
    const { result } = renderHook(() => useMatriculaInscripcionSubmit('editar', opts, form));
    const r = await finish(result);
    expect(r).toEqual({ success: false, error: 'Historial previo vacío' });
    expect(R.hist.saveHistorialPrevio).not.toHaveBeenCalled();
  });

  it('el guardado parcial no permite el atajo de solo historial', async () => {
    const opts = edit({
      selectedParalelo: null,
      completarSoloHistorialPrevio: true,
      historialPrevioHasRows: true,
      validatePriorHistory: () => ({ valid: true }),
      buildPriorHistory: () => [{ materia_id: 1 }],
    });
    const { result } = renderHook(() => useMatriculaInscripcionSubmit('editar', opts, form));
    const r = await finish(result, 'handleSave');
    expect(r.success).toBe(false);
    expect(R.hist.saveHistorialPrevio).not.toHaveBeenCalled();
  });
});
