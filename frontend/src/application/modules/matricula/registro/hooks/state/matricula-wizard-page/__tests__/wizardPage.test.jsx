import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { App } from 'antd';

import { useMatriculaWizardPageWizardValidation } from '../useMatriculaWizardPageWizardValidation';
import { useMatriculaWizardPageWizardInit } from '../useMatriculaWizardPageWizardInit';

const wrapper = ({ children }) => <App>{children}</App>;

describe('useMatriculaWizardPageWizardValidation', () => {
  const validar = (props, step, form) => {
    const { result } = renderHook(() => useMatriculaWizardPageWizardValidation(props), { wrapper });
    return result.current.handleValidateBeforeNext(step, form);
  };

  it('paso buscar: exige un estudiante salvo en edición', async () => {
    await expect(validar({}, 1)).rejects.toThrow('Estudiante no seleccionado');
    // El resto de pasos avanza si no hay formulario que validar.
    await expect(validar({ studentSearch: { selectedStudent: { id: 1 } } }, 1)).resolves.toBeUndefined();
    await expect(validar({ editData: {} }, 1)).resolves.toBeUndefined();
  });

  it('paso carrera: usa el formulario o la carrera seleccionada', async () => {
    const meta = { stepNumbers: { buscar: 1, carrera: 2, periodo: 3, paralelo: 4, historial: null } };
    await expect(validar({ wizardStepMeta: meta }, 2, { getFieldValue: () => null })).rejects.toThrow('Carrera no seleccionada');
    await expect(validar({ wizardStepMeta: meta }, 2, { getFieldValue: () => 5 })).resolves.toBeUndefined();
    await expect(validar({ wizardStepMeta: meta, carrerasData: { selectedCarrera: { id: 3 } } }, 2)).resolves.toBeUndefined();
  });

  it('paso periodo: exige al menos una materia marcada', async () => {
    await expect(validar({}, 3)).rejects.toThrow('Materias no seleccionadas');
    await expect(validar({ selectedMateriaIdsByPeriod: { 1: [], 2: 'x' } }, 3)).rejects.toThrow();
    await expect(validar({ selectedMateriaIdsByPeriod: { 1: [4] } }, 3)).resolves.toBeUndefined();
  });

  it('paso paralelo: periodos, carga, disponibilidad y un paralelo por periodo', async () => {
    const paralelos = [{ id: 1 }];
    await expect(validar({ periodosData: {} }, 4)).rejects.toThrow('Periodos no seleccionados');
    const periodosData = { selectedPeriodIds: [1, 2], periodos: [{ id: 2, nombre: 'Segundo' }] };
    await expect(validar({ periodosData, paralelosData: { loading: true, paralelos } }, 4)).rejects.toThrow('Paralelos cargando');
    await expect(validar({ periodosData, paralelosData: { paralelos: [] } }, 4)).rejects.toThrow('No hay paralelos disponibles');
    await expect(validar({ periodosData, paralelosData: { paralelos, selectedParalelosByPeriod: { 1: { id: 9 } } } }, 4)).rejects.toThrow('Paralelos no seleccionados');
    await expect(validar({ periodosData, paralelosData: { paralelos, selectedParalelosByPeriod: { 1: { id: 9 }, 2: { id: 8 } } } }, 4)).resolves.toBeUndefined();
    await expect(validar({ periodosData: { selectedPeriodIds: [3] }, paralelosData: { paralelos } }, 4)).rejects.toThrow();
  });

  it('paso historial: valida las notas cuando hay filas', async () => {
    const meta = { stepNumbers: { buscar: 1, periodo: 2, historial: 3, paralelo: 4, carrera: null } };
    const con = (validate) => ({ wizardStepMeta: meta, historialPrevioData: { hasRows: true, validate } });
    await expect(validar(con(() => ({ valid: false, missing: 2 })), 3)).rejects.toThrow('Historial previo incompleto');
    await expect(validar(con(() => ({ valid: false, missing: 0, invalid: [{ reason: 'x' }] })), 3)).rejects.toThrow();
    await expect(validar(con(() => ({ valid: false, missing: 0, invalid: [] })), 3)).rejects.toThrow();
    await expect(validar(con(() => ({ valid: true })), 3)).resolves.toBeUndefined();
    await expect(validar({ wizardStepMeta: meta }, 3)).resolves.toBeUndefined();
  });

  it('otros pasos validan el formulario', async () => {
    const meta = { stepNumbers: { buscar: 1, carrera: null, periodo: 2, paralelo: 3, historial: null } };
    await expect(validar({ wizardStepMeta: meta, studentSearch: { selectedStudent: {} } }, 9, { validateFields: () => Promise.resolve({ a: 1 }) })).resolves.toEqual({ a: 1 });
    await expect(validar({ wizardStepMeta: meta }, 9, { validateFields: () => Promise.reject(new Error('inválido')) })).rejects.toThrow('inválido');
  });
});

describe('useMatriculaWizardPageWizardInit', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const META = { indices: { buscar: 0, carrera: 1, periodo: 2, historial: 3, paralelo: 4 } };
  const SIN_CARRERA = { indices: { buscar: 0, carrera: null, periodo: 1, historial: null, paralelo: 2 } };
  const run = (props) => renderHook((p) => useMatriculaWizardPageWizardInit(p), { initialProps: props });

  it('sin estudiante empieza en la búsqueda', () => {
    expect(run({ studentSearch: {} }).result.current.initialStep).toBe(0);
    expect(run({}).result.current.initialValues).toEqual({});
  });

  it('al elegir un estudiante espera la confirmación antes de avanzar', () => {
    const { result, rerender } = run({ studentSearch: { selectedStudent: null }, wizardStepMeta: META });
    expect(result.current.initialStep).toBe(0);
    rerender({ studentSearch: { selectedStudent: { id: 3 } }, wizardStepMeta: META });
    expect(result.current.initialStep).toBe(0);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.initialStep).toBe(1);
    rerender({ studentSearch: { selectedStudent: { id: 4 } }, wizardStepMeta: META });
    expect(result.current.initialStep).toBe(0);
    rerender({ studentSearch: { selectedStudent: null }, wizardStepMeta: META });
    expect(result.current.initialStep).toBe(0);
  });

  it('un estudiante preseleccionado avanza de inmediato', () => {
    const { result } = run({ studentSearch: { selectedStudent: { id: 3 } }, hasPreselectedStudent: true, wizardStepMeta: SIN_CARRERA });
    expect(result.current.initialStep).toBe(1);
    const nuevo = run({ studentSearch: { selectedStudent: { id: 3 } }, hasPreselectedStudent: true, wizardStepMeta: SIN_CARRERA, isNuevoEstudiante: true, carrerasData: { selectedCarrera: { id: 1 } } });
    expect(nuevo.result.current.initialStep).toBe(2);
    const cargando = run({ studentSearch: { selectedStudent: { id: 3 }, loading: true }, hasPreselectedStudent: true, wizardStepMeta: META });
    expect(cargando.result.current.initialStep).toBe(0);
  });

  it('en edición salta al paso correspondiente y siembra la carrera', () => {
    const form = { setFieldsValue: vi.fn() };
    const carrerasData = { carreras: [{ id: 5 }] };
    const base = { form, carrerasData, wizardStepMeta: META };
    const a = run({ ...base, editData: { carreraId: '5' }, isNuevoEstudiante: true });
    expect(a.result.current.initialStep).toBe(4);
    expect(a.result.current.initialValues).toEqual({ carrera: 5 });
    expect(form.setFieldsValue).toHaveBeenCalledWith({ carrera: 5 });
    expect(run({ ...base, editData: {} }).result.current.initialStep).toBe(2);
    expect(run({ ...base, editData: { completarSoloHistorialPrevio: true } }).result.current.initialStep).toBe(3);
    expect(run({ ...base, wizardStepMeta: SIN_CARRERA, editData: { completarSoloHistorialPrevio: true } }).result.current.initialStep).toBe(1);
    expect(run({ ...base, editData: { carreraId: 99 } }).result.current.initialValues).toEqual({});
  });
});
