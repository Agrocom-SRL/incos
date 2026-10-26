import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const R = vi.hoisted(() => ({
  reg: { registerStudent: vi.fn(), loading: false, error: 'eR', validationErrors: ['vR'] },
  upd: { updateStudent: vi.fn(), loading: false, error: 'eU', validationErrors: ['vU'] },
}));
vi.mock('../../api/useRegisterStudent', () => ({ useRegisterStudent: () => R.reg }));
vi.mock('../../api/useUpdateStudent', () => ({ useUpdateStudent: () => R.upd }));

import { useStudentFormHandlers } from '../useStudentFormHandlers';
import { useStudentFormOptions } from '../useStudentFormOptions';
import { useContactosEmergenciaDinamicos } from '../useContactosEmergenciaDinamicos';

const formFalso = (values) => ({ getFieldsValue: vi.fn(() => values) });

beforeEach(() => {
  vi.clearAllMocks();
  R.reg.registerStudent.mockResolvedValue({ success: true });
  R.upd.updateStudent.mockResolvedValue({ success: true });
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('useStudentFormHandlers', () => {
  it('sin formulario registrado usa valores vacíos', async () => {
    const { result } = renderHook(() => useStudentFormHandlers(vi.fn()));
    expect(result.current.getFormValues()).toEqual({});
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('eR');
  });

  it('completa el tipo de admisión: NUEVO por defecto, ANTIGUO si hay gestión o carrera', () => {
    const { result } = renderHook(() => useStudentFormHandlers(vi.fn()));
    act(() => result.current.registerForm(formFalso({})));
    expect(result.current.getFormValues().tipoAdmision).toBe('NUEVO');
    act(() => result.current.registerForm(formFalso({ gestionIngresoId: 4 })));
    expect(result.current.getFormValues().tipoAdmision).toBe('ANTIGUO');
    act(() => result.current.registerForm(formFalso({ carreraId: 2, tipoAdmision: '' })));
    expect(result.current.getFormValues().tipoAdmision).toBe('ANTIGUO');
  });

  it('conserva los valores del paso 0 cuando el formulario ya no los tiene', () => {
    const { result } = renderHook(() => useStudentFormHandlers(vi.fn()));
    act(() => result.current.saveStep0Values({ tipoAdmision: 'TRASPASO', gestionIngresoId: 3, carreraId: 8, extra: 1 }));
    act(() => result.current.saveStep0Values(null));
    expect(result.current.getStep0Values()).toEqual({ tipoAdmision: 'TRASPASO', gestionIngresoId: 3, carreraId: 8 });
    act(() => result.current.registerForm(formFalso({ nombres: 'Ana' })));
    expect(result.current.getFormValues()).toMatchObject({ tipoAdmision: 'TRASPASO', gestionIngresoId: 3, carreraId: 8 });
    act(() => result.current.registerForm(formFalso({ tipoAdmision: 'NUEVO', carreraId: null })));
    expect(result.current.getFormValues()).toMatchObject({ tipoAdmision: 'NUEVO', carreraId: 8 });
    expect(result.current.getStep0Values().tipoAdmision).toBe('NUEVO');
  });

  it('completa la documentación con los valores por defecto del documento', () => {
    const docs = [
      { id: 1 },
      { id: 2, entregado: false, en_tramite: true, observaciones: '  nota ' },
      { id: 3, observaciones: '   ' },
      { id: 4 },
    ];
    const { result } = renderHook(() => useStudentFormHandlers(vi.fn(), 'create', null, docs));
    act(() => result.current.registerForm(formFalso({ tipoAdmision: 'TRASPASO', documentacion: { doc_3: { observaciones: ' x ' }, doc_4: { entregado: true, en_tramite: false, observaciones: null } } })));
    const d = result.current.getFormValues().documentacion;
    expect(d.doc_1).toEqual({ entregado: false, en_tramite: false, observaciones: null });
    expect(d.doc_2).toEqual({ entregado: false, en_tramite: true, observaciones: 'nota' });
    expect(d.doc_3).toEqual({ entregado: false, en_tramite: false, observaciones: 'x' });
    expect(d.doc_4).toEqual({ entregado: true, en_tramite: false, observaciones: null });
    act(() => result.current.registerForm(formFalso({ tipoAdmision: 'NUEVO' })));
    expect(result.current.getFormValues().documentacion.doc_1.entregado).toBe(true);
  });

  it('un formulario que falla devuelve valores vacíos', () => {
    const { result } = renderHook(() => useStudentFormHandlers(vi.fn()));
    act(() => result.current.registerForm({ getFieldsValue: () => { throw new Error('x'); } }));
    expect(result.current.getFormValues()).toEqual({});
  });

  it('finalizar registra y avisa; guardar parcial avisa y los errores se muestran', async () => {
    const show = vi.fn();
    const { result } = renderHook(() => useStudentFormHandlers(show));
    act(() => result.current.registerForm(formFalso({ nombres: 'Ana' })));
    await act(async () => result.current.handleFinish(4));
    expect(R.reg.registerStudent).toHaveBeenCalledWith(expect.objectContaining({ nombres: 'Ana' }), 4, true, false);
    expect(show).toHaveBeenLastCalledWith('success', 'Estudiante registrado correctamente');
    expect(result.current.registrationResult).toEqual({ success: true });
    await act(async () => result.current.handleSave(2));
    expect(R.reg.registerStudent).toHaveBeenLastCalledWith(expect.anything(), 2, false, true);
    expect(show).toHaveBeenLastCalledWith('success', 'Datos guardados correctamente. Puede continuar después.');

    R.reg.registerStudent.mockResolvedValueOnce({ success: false, error: { message: 'CI repetido' } });
    await act(async () => result.current.handleFinish(4));
    expect(show).toHaveBeenLastCalledWith('error', 'CI repetido');
    expect(result.current.registrationResult).toBeNull();
    R.reg.registerStudent.mockResolvedValueOnce({ success: false, error: {} });
    await act(async () => result.current.handleFinish(4));
    expect(show).toHaveBeenLastCalledWith('error', 'Error al registrar estudiante');
    R.reg.registerStudent.mockResolvedValueOnce({ success: false, error: 'Texto' });
    await act(async () => result.current.handleSave(1));
    expect(show).toHaveBeenLastCalledWith('error', 'Texto');
    R.reg.registerStudent.mockResolvedValueOnce({ success: false, error: {} });
    await act(async () => result.current.handleSave(1));
    expect(show).toHaveBeenLastCalledWith('error', 'Error al guardar los datos');
    R.reg.registerStudent.mockResolvedValueOnce(undefined);
    await act(async () => result.current.handleFinish(4));
  });

  it('en edición actualiza al estudiante y usa su estado de error', async () => {
    const show = vi.fn();
    const { result } = renderHook(() => useStudentFormHandlers(show, 'edit', 9));
    expect(result.current.error).toBe('eU');
    expect(result.current.validationErrors).toEqual(['vU']);
    act(() => result.current.registerForm(formFalso({ nombres: 'Ana' })));
    await act(async () => result.current.handleFinish(4));
    expect(R.upd.updateStudent).toHaveBeenCalledWith(9, expect.anything(), 4, true, false);
    expect(show).toHaveBeenLastCalledWith('success', 'Estudiante actualizado correctamente');
    await act(async () => result.current.handleSave(2));
    expect(R.upd.updateStudent).toHaveBeenLastCalledWith(9, expect.anything(), 2, false, true);
    R.upd.updateStudent.mockResolvedValueOnce({ success: false, error: {} });
    await act(async () => result.current.handleFinish(4));
    expect(show).toHaveBeenLastCalledWith('error', 'Error al actualizar estudiante');
    const sinMensaje = renderHook(() => useStudentFormHandlers(null, 'edit', 9));
    R.upd.updateStudent.mockResolvedValueOnce({ success: false, error: 'x' });
    await act(async () => sinMensaje.result.current.handleFinish(1));
    await act(async () => sinMensaje.result.current.handleSave(1));
  });
});

describe('useStudentFormOptions', () => {
  it('convierte cada catálogo en opciones y filtra los países extranjeros', () => {
    const { result } = renderHook(() =>
      useStudentFormOptions({
        generos: [{ id: 1, nombre: 'Masculino' }],
        paises: [{ id: 1, nombre: 'Bolivia', codigoIso: 'BOL' }, { id: 2, nombre: 'Perú', codigoIso: 'PER' }],
        gradosDiscapacidad: [{ value: 'ALTO', label: 'Alto' }],
        tiposOrigen: [{ value: 'BOLIVIANA', label: 'Boliviana' }, { value: 'DOBLE_NACIONALIDAD', label: 'Doble' }, { value: 'EXTRANJERA', label: 'Extranjera' }],
        gestiones: [{ id: 5, nombre: 'G' }],
      }),
    );
    const ro = result.current;
    expect(ro('generos')[0]).toMatchObject({ value: 1 });
    expect(ro('paisesExtranjeros').map((o) => o.value)).toEqual([2]);
    expect(ro('gradosDiscapacidad')).toEqual([{ value: 'ALTO', label: 'Alto' }]);
    expect(ro('tiposOrigenPrimera').map((o) => o.value)).toEqual(['BOLIVIANA', 'EXTRANJERA']);
    expect(ro('gestiones')).toHaveLength(1);
    expect(ro('desconocido')).toEqual([]);
    expect(ro('carreras')).toEqual([]);
  });

  it('sin datos devuelve listas vacías', () => {
    const { result } = renderHook(() => useStudentFormOptions());
    expect(result.current('paises')).toEqual([]);
    expect(result.current('paisesExtranjeros')).toEqual([]);
  });
});

describe('useContactosEmergenciaDinamicos', () => {
  it('agrega contactos con índices únicos y conserva al menos uno', () => {
    const { result } = renderHook(() => useContactosEmergenciaDinamicos());
    expect(result.current.contactosIndices).toEqual([0]);
    act(() => result.current.agregarContacto());
    act(() => result.current.agregarContacto());
    expect(result.current.contactosIndices).toEqual([0, 1, 2]);
    act(() => result.current.eliminarContacto(1));
    act(() => result.current.agregarContacto());
    expect(result.current.contactosIndices).toEqual([0, 2, 3]);
    expect(result.current.cantidadContactos).toBe(3);
    act(() => result.current.eliminarContacto(0));
    act(() => result.current.eliminarContacto(2));
    act(() => result.current.eliminarContacto(3));
    expect(result.current.contactosIndices).toHaveLength(1);
  });
});
