import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('../useProvinciaLogic', () => ({ useProvinciaLogic: vi.fn() }));

import { useResidenciaLogic } from '../useResidenciaLogic';

const departamentos = [
  { id: 1, nombre: 'La Paz' },
  { id: 7, nombre: 'Santa Cruz' },
];

const makeForm = (values = {}) => ({
  getFieldsValue: vi.fn((fields) => (fields ? Object.fromEntries(fields.map((f) => [f, values[f]])) : values)),
  setFieldsValue: vi.fn(),
});

describe('useResidenciaLogic', () => {
  let loadProvincias;
  let loadMunicipios;
  beforeEach(() => {
    loadProvincias = vi.fn();
    loadMunicipios = vi.fn();
  });

  it('creación: fija Santa Cruz (sin importar mayúsculas) y carga sus provincias', () => {
    const form = makeForm();
    renderHook(() => useResidenciaLogic({
      form, departamentos: [{ id: 1, nombre: 'La Paz' }, { id: 7, nombre: 'santa cruz' }],
      loadProvincias, loadMunicipios,
    }));
    expect(form.setFieldsValue).toHaveBeenCalledWith({ departamentoResidenciaId: 7 });
    expect(loadProvincias).toHaveBeenCalledWith(7, 'residencia');
  });

  it('no fija nada si no hay departamento Santa Cruz y pide cargar departamentos si faltan', () => {
    const form = makeForm();
    const loadDepartamentos = vi.fn();
    renderHook(() => useResidenciaLogic({ form, departamentos: [], loadDepartamentos, loadProvincias, loadMunicipios }));
    expect(loadDepartamentos).toHaveBeenCalled();
    expect(form.setFieldsValue).not.toHaveBeenCalled();

    const form2 = makeForm();
    renderHook(() => useResidenciaLogic({ form: form2, departamentos: [{ id: 1, nombre: 'La Paz' }], loadProvincias, loadMunicipios }));
    expect(form2.setFieldsValue).not.toHaveBeenCalled();
    expect(loadProvincias).not.toHaveBeenCalled();
  });

  it('edición con valores ya establecidos: respeta el departamento y no lo sobrescribe', () => {
    const form = makeForm({ departamentoResidenciaId: 1, provinciaResidenciaId: 5 });
    renderHook(() => useResidenciaLogic({ form, departamentos, loadProvincias, loadMunicipios, isEditMode: true }));
    expect(form.setFieldsValue).not.toHaveBeenCalled();
    expect(loadProvincias).toHaveBeenCalledWith(1, 'residencia');
  });

  it('creación: selecciona la primera provincia y carga sus municipios; en edición no', () => {
    const provincias = [{ id: 11 }, { id: 12 }];
    const form = makeForm();
    renderHook(() => useResidenciaLogic({ form, departamentos, provinciasResidencia: provincias, loadProvincias, loadMunicipios }));
    expect(form.setFieldsValue).toHaveBeenCalledWith({ provinciaResidenciaId: 11 });
    expect(loadMunicipios).toHaveBeenCalledWith(11, 'residencia');

    const formEdit = makeForm();
    const loadMun2 = vi.fn();
    renderHook(() => useResidenciaLogic({
      form: formEdit, departamentos, provinciasResidencia: provincias, loadProvincias, loadMunicipios: loadMun2, isEditMode: true,
    }));
    expect(formEdit.setFieldsValue).not.toHaveBeenCalledWith({ provinciaResidenciaId: 11 });
    expect(loadMun2).not.toHaveBeenCalled();
  });
});
