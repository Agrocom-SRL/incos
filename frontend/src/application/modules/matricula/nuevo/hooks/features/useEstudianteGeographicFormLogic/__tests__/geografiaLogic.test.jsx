import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useTipoOrigenLogic } from '../useTipoOrigenLogic';
import { usePrimeraNacionalidadLogic } from '../usePrimeraNacionalidadLogic';
import { useDepartamentoLogic } from '../useDepartamentoLogic';
import { useProvinciaLogic } from '../useProvinciaLogic';
import {
  clearBolivianaFields,
  clearDependentFields,
  clearExtranjeraFields,
  loadProvinciasForDepartamento,
} from '../../../helpers/geographicFieldHelpers';

/** Formulario falso con estado mutable: lee por campos y fusiona los `setFieldsValue`. */
const makeForm = (inicial = {}) => {
  const values = { ...inicial };
  return {
    values,
    getFieldsValue: vi.fn((fields) => (fields ? Object.fromEntries(fields.map((f) => [f, values[f]])) : { ...values })),
    setFieldsValue: vi.fn((v) => Object.assign(values, v)),
  };
};

/** Monta el hook, cambia el formulario y vuelve a renderizar con un `allFormValues` nuevo. */
const cambiar = (useHook, form, props, cambios) => {
  const { rerender } = renderHook((p) => useHook(p), { initialProps: { ...props, form, allFormValues: {} } });
  Object.assign(form.values, cambios);
  rerender({ ...props, form, allFormValues: { v: Math.random() } });
};

describe('geographicFieldHelpers', () => {
  it('limpia los campos bolivianos y extranjeros con y sin prefijo', () => {
    const f = makeForm();
    clearBolivianaFields(f);
    expect(f.setFieldsValue).toHaveBeenLastCalledWith({ departamentoId: undefined, provinciaId: undefined, municipioId: undefined, localidadComunidad: undefined });
    clearBolivianaFields(f, 'segunda');
    expect(f.setFieldsValue).toHaveBeenLastCalledWith({ segundaDepartamentoId: undefined, segundaProvinciaId: undefined, segundaMunicipioId: undefined, segundaLocalidadComunidad: undefined });
    clearExtranjeraFields(f);
    expect(f.setFieldsValue).toHaveBeenLastCalledWith({ paisId: undefined, ciudadNacimiento: undefined });
    clearExtranjeraFields(f, 'segunda');
    expect(f.setFieldsValue).toHaveBeenLastCalledWith({ segundaPaisId: undefined, segundaCiudadNacimiento: undefined });
  });

  it('limpia dependientes y carga provincias según el contexto', () => {
    const f = makeForm();
    const loadProvincias = vi.fn();
    const loadMunicipios = vi.fn();
    clearDependentFields(f, 'residencia', loadProvincias, loadMunicipios, 'residencia');
    expect(f.setFieldsValue).toHaveBeenLastCalledWith({ provinciaResidenciaId: undefined, municipioResidenciaId: undefined });
    expect(loadProvincias).toHaveBeenCalledWith(null, 'residencia');
    expect(loadMunicipios).toHaveBeenCalledWith(null, 'residencia');
    clearDependentFields(f);
    expect(f.setFieldsValue).toHaveBeenLastCalledWith({ provinciaId: undefined, municipioId: undefined });

    loadProvinciasForDepartamento(f, 3, 'segunda', loadProvincias, loadMunicipios, 'segunda');
    expect(loadProvincias).toHaveBeenLastCalledWith(3, 'segunda');
    expect(f.setFieldsValue).toHaveBeenLastCalledWith({ segundaProvinciaId: undefined, segundaMunicipioId: undefined });
    loadProvinciasForDepartamento(f, 3, '', loadProvincias);
    loadProvincias.mockClear();
    loadProvinciasForDepartamento(f, 3, '', undefined, loadMunicipios);
    expect(loadProvincias).not.toHaveBeenCalled();
  });
});

describe('useTipoOrigenLogic', () => {
  it('no hace nada sin formulario o sin cambio', () => {
    renderHook(() => useTipoOrigenLogic({ form: null }));
    const f = makeForm({ tipoOrigen: 'BOLIVIANA' });
    renderHook(() => useTipoOrigenLogic({ form: f, allFormValues: {} }));
    expect(f.setFieldsValue).not.toHaveBeenCalled();
  });

  it('boliviana limpia lo extranjero y carga departamentos', () => {
    const f = makeForm({ tipoOrigen: 'EXTRANJERA' });
    const loadDepartamentos = vi.fn();
    cambiar(useTipoOrigenLogic, f, { loadDepartamentos }, { tipoOrigen: 'BOLIVIANA' });
    expect(loadDepartamentos).toHaveBeenCalled();
    expect(f.setFieldsValue).toHaveBeenCalledWith({ paisId: undefined, ciudadNacimiento: undefined });
  });

  it('extranjera limpia lo boliviano; doble nacionalidad limpia todo', () => {
    const f = makeForm({ tipoOrigen: 'BOLIVIANA' });
    cambiar(useTipoOrigenLogic, f, {}, { tipoOrigen: 'EXTRANJERA' });
    expect(f.setFieldsValue).toHaveBeenCalledWith(expect.objectContaining({ departamentoId: undefined }));
    const g = makeForm({ tipoOrigen: 'BOLIVIANA' });
    cambiar(useTipoOrigenLogic, g, {}, { tipoOrigen: 'DOBLE_NACIONALIDAD' });
    expect(g.setFieldsValue).toHaveBeenCalledTimes(4);
    const h = makeForm({ tipoOrigen: 'BOLIVIANA' });
    cambiar(useTipoOrigenLogic, h, {}, { tipoOrigen: 'OTRO' });
    expect(h.setFieldsValue).not.toHaveBeenCalled();
  });
});

describe('usePrimeraNacionalidadLogic', () => {
  it('solo reacciona en doble nacionalidad', () => {
    renderHook(() => usePrimeraNacionalidadLogic({ form: null }));
    const f = makeForm({ tipoOrigen: 'BOLIVIANA', primeraNacionalidad: 'BOLIVIANA' });
    cambiar(usePrimeraNacionalidadLogic, f, {}, { primeraNacionalidad: 'EXTRANJERA' });
    expect(f.setFieldsValue).not.toHaveBeenCalled();
  });

  it('boliviana limpia lo extranjero y extranjera limpia lo boliviano, cargando departamentos', () => {
    const loadDepartamentos = vi.fn();
    const a = makeForm({ tipoOrigen: 'DOBLE_NACIONALIDAD', primeraNacionalidad: 'EXTRANJERA' });
    cambiar(usePrimeraNacionalidadLogic, a, { loadDepartamentos }, { primeraNacionalidad: 'BOLIVIANA' });
    expect(a.setFieldsValue).toHaveBeenCalledWith({ paisId: undefined, ciudadNacimiento: undefined });
    const b = makeForm({ tipoOrigen: 'DOBLE_NACIONALIDAD', primeraNacionalidad: 'BOLIVIANA' });
    cambiar(usePrimeraNacionalidadLogic, b, { loadDepartamentos }, { primeraNacionalidad: 'EXTRANJERA' });
    expect(b.setFieldsValue).toHaveBeenCalledWith(expect.objectContaining({ municipioId: undefined }));
    expect(loadDepartamentos).toHaveBeenCalledTimes(2);
    const c = makeForm({ tipoOrigen: 'DOBLE_NACIONALIDAD', primeraNacionalidad: 'BOLIVIANA' });
    cambiar(usePrimeraNacionalidadLogic, c, {}, { primeraNacionalidad: 'OTRA' });
    expect(c.setFieldsValue).not.toHaveBeenCalled();
  });
});

describe('useDepartamentoLogic', () => {
  const props = () => ({ departamentoField: 'departamentoId', prefix: '', loadProvincias: vi.fn(), loadMunicipios: vi.fn(), contexto: 'origen' });

  it('sin formulario o sin cambios no carga', () => {
    renderHook(() => useDepartamentoLogic({ form: null }));
    const p = props();
    cambiar(useDepartamentoLogic, makeForm({ departamentoId: 1 }), p, {});
    expect(p.loadProvincias).not.toHaveBeenCalled();
  });

  it('al elegir un departamento carga sus provincias y limpia las dependientes', () => {
    const p = props();
    const f = makeForm({});
    cambiar(useDepartamentoLogic, f, p, { departamentoId: 4 });
    expect(p.loadProvincias).toHaveBeenCalledWith(4, 'origen');
    expect(f.setFieldsValue).toHaveBeenCalledWith({ provinciaId: undefined, municipioId: undefined });
  });

  it('al vaciar el departamento limpia dependientes solo si antes había uno', () => {
    const p = props();
    const f = makeForm({ departamentoId: 4 });
    cambiar(useDepartamentoLogic, f, p, { departamentoId: undefined });
    expect(p.loadProvincias).toHaveBeenCalledWith(null, 'origen');
    const q = props();
    cambiar(useDepartamentoLogic, makeForm({}), q, { departamentoId: null });
    expect(q.loadProvincias).not.toHaveBeenCalled();
  });
});

describe('useProvinciaLogic', () => {
  const props = (extra = {}) => ({ provinciaField: 'provinciaId', municipioField: 'municipioId', loadMunicipios: vi.fn(), contexto: 'origen', clearMunicipioOnChange: true, ...extra });

  it('sin formulario o sin cambio no hace nada', () => {
    renderHook(() => useProvinciaLogic({ form: null }));
    const p = props();
    cambiar(useProvinciaLogic, makeForm({ provinciaId: 1 }), p, {});
    expect(p.loadMunicipios).not.toHaveBeenCalled();
  });

  it('al cambiar de provincia limpia el municipio y carga los nuevos', () => {
    const p = props();
    const f = makeForm({ provinciaId: 1, municipioId: 9 });
    cambiar(useProvinciaLogic, f, p, { provinciaId: 2 });
    expect(f.setFieldsValue).toHaveBeenCalledWith({ municipioId: undefined });
    expect(p.loadMunicipios).toHaveBeenCalledWith(2, 'origen');
  });

  it('al vaciar la provincia vacía los municipios; la primera elección no limpia', () => {
    const p = props();
    cambiar(useProvinciaLogic, makeForm({ provinciaId: 1 }), p, { provinciaId: undefined });
    expect(p.loadMunicipios).toHaveBeenCalledWith(null, 'origen');
    const q = props({ clearMunicipioOnChange: false });
    const f = makeForm({});
    cambiar(useProvinciaLogic, f, q, { provinciaId: 3 });
    expect(f.setFieldsValue).not.toHaveBeenCalled();
    const sin = props({ loadMunicipios: undefined });
    expect(() => cambiar(useProvinciaLogic, makeForm({ provinciaId: 1 }), sin, { provinciaId: 2 })).not.toThrow();
  });
});
