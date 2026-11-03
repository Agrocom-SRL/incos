/**
 * Prueba parametrizada de los hooks de formulario CRUD de Configuración
 * (idiomas, aulas, actividades...). Todos comparten el mismo contrato:
 * crear/editar, carga por id, validación de id, guardado y navegación.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { App } from 'antd';

const router = vi.hoisted(() => ({
  params: {},
  navigate: vi.fn(),
  location: { pathname: '/', state: null },
}));
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useParams: () => router.params,
  useNavigate: () => router.navigate,
  useLocation: () => router.location,
}));

const casos = vi.hoisted(() => ({}));
vi.mock('@container', () => ({
  useCasesFactory: new Proxy({}, { get: (_, k) => casos[k] }),
}));

import { useIdiomaForm } from '../complementarios/hooks/state/useIdiomaForm';
import { useApoderadoForm } from '../complementarios/hooks/state/useApoderadoForm';
import { useDiscapacidadForm } from '../complementarios/hooks/state/useDiscapacidadForm';
import { useEstadoCivilForm } from '../complementarios/hooks/state/useEstadoCivilForm';
import { useAulaForm } from '../recursos/hooks/state/useAulaForm';
import { useTipoEvaluacionForm } from '../recursos/hooks/state/useTipoEvaluacionForm';
import { useActividadForm } from '../actividades/hooks/state/useActividadForm';
import { useMateriaForm } from '../academico/hooks/state/useMateriaForm';

const wrapper = ({ children }) => <App>{children}</App>;

const CONFIGS = [
  { nombre: 'idioma', hook: useIdiomaForm, get: 'obtenerIdiomaPorId', create: 'crearIdioma', update: 'actualizarIdioma', key: 'idioma', valores: { nombre: ' Quechua ', codigoIso: 'qu' } },
  { nombre: 'apoderado', hook: useApoderadoForm, get: 'obtenerTipoParentescoPorId', create: 'crearTipoParentesco', update: 'actualizarTipoParentesco', key: 'tipoParentesco', valores: { nombre: ' Padre ' } },
  { nombre: 'discapacidad', hook: useDiscapacidadForm, get: 'obtenerDiscapacidadPorId', create: 'crearDiscapacidad', update: 'actualizarDiscapacidad', key: 'discapacidad', valores: { nombre: ' Visual ' } },
  { nombre: 'estado civil', hook: useEstadoCivilForm, get: 'obtenerEstadoCivilPorId', create: 'crearEstadoCivil', update: 'actualizarEstadoCivil', key: 'estadoCivil', valores: { nombre: ' Soltero ' } },
  { nombre: 'aula', hook: useAulaForm, get: 'obtenerAulaPorId', create: 'crearAula', update: 'actualizarAula', key: 'aula', valores: { codigo: 'A1', nombre: 'Aula 1', capacidad: 30 } },
  { nombre: 'tipo de evaluación', hook: useTipoEvaluacionForm, get: 'obtenerTipoEvaluacionPorId', create: 'crearTipoEvaluacion', update: 'actualizarTipoEvaluacion', key: 'tipoEvaluacion', valores: { nombre: 'Examen', codigo: 'EX' } },
  { nombre: 'actividad', hook: useActividadForm, get: 'obtenerActividadPorId', create: 'crearActividad', update: 'actualizarActividad', key: 'actividad', valores: { nombre: 'Feria', tipo: 'FERIA' } },
  { nombre: 'materia', hook: useMateriaForm, get: 'obtenerMateriaPorId', create: 'crearMateria', update: 'actualizarMateria', key: 'materia', valores: { nombre: 'Mate', codigo: 'MAT' } },
];

const registrar = (nombre, ejecutar) => {
  casos[nombre] = () => ({ ejecutar });
  return ejecutar;
};

describe.each(CONFIGS)('formulario CRUD de $nombre', (cfg) => {
  beforeEach(() => {
    vi.clearAllMocks();
    router.params = {};
    router.location = { pathname: '/', state: null };
    Object.keys(casos).forEach((k) => delete casos[k]);
  });

  it('modo crear: sin carga, título y permiso de creación', async () => {
    const { result } = renderHook(() => cfg.hook('create'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isEditMode).toBe(false);
    expect(result.current.permisoAccion).toBe('CREAR');
    expect(result.current.pageTitle).toMatch(/^Nuev/);
    expect(result.current.formSections).toBeTruthy();
    expect(result.current.breadcrumbItems.at(-1).title).toBe(result.current.pageTitle);
    expect(result.current.initialValues).toBeTypeOf('object');
  });

  it('modo editar: carga el registro por id numérico', async () => {
    router.params = { id: '5' };
    const get = registrar(cfg.get, vi.fn().mockResolvedValue({ success: true, data: { [cfg.key]: { id: 5, nombre: 'X' } } }));
    const { result } = renderHook(() => cfg.hook('edit'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(get).toHaveBeenCalledWith(5);
    expect(result.current.permisoAccion).toBe('EDITAR');
    expect(result.current.pageTitle).toMatch(/^Editar/);
    expect(result.current.error).toBeNull();
  });

  it('modo editar: expone el error si la carga falla', async () => {
    router.params = { id: '5' };
    registrar(cfg.get, vi.fn().mockResolvedValue({ success: false, error: 'No existe' }));
    const { result } = renderHook(() => cfg.hook('edit'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('No existe');
  });

  it('modo editar: id inválido no consulta al backend', async () => {
    router.params = { id: 'abc' };
    const get = registrar(cfg.get, vi.fn());
    const { result } = renderHook(() => cfg.hook('edit'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isInvalidEditId).toBe(true);
    expect(get).not.toHaveBeenCalled();
  });

  it('crea con los valores del formulario y navega al detalle', async () => {
    const crear = registrar(cfg.create, vi.fn().mockResolvedValue({ success: true, data: { [cfg.key]: { id: 9 } } }));
    const { result } = renderHook(() => cfg.hook('create'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    result.current.form.validateFields = vi.fn().mockResolvedValue(cfg.valores);
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(crear).toHaveBeenCalledTimes(1);
    expect(crear.mock.calls[0][0]).toBeTypeOf('object');
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('9'), expect.objectContaining({ replace: true }));
    expect(result.current.submitLoading).toBe(false);
  });

  it('actualiza pasando el id y el payload', async () => {
    router.params = { id: '5' };
    registrar(cfg.get, vi.fn().mockResolvedValue({ success: true, data: { id: 5 } }));
    const actualizar = registrar(cfg.update, vi.fn().mockResolvedValue({ success: true, data: { id: 5 } }));
    const { result } = renderHook(() => cfg.hook('edit'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    result.current.form.validateFields = vi.fn().mockResolvedValue(cfg.valores);
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(actualizar).toHaveBeenCalledWith(5, expect.any(Object));
    expect(router.navigate).toHaveBeenCalledWith(expect.stringContaining('5'), expect.objectContaining({ replace: false }));
  });

  it('muestra error si el guardado falla', async () => {
    registrar(cfg.create, vi.fn().mockResolvedValue({ success: false, error: 'Duplicado' }));
    const { result } = renderHook(() => cfg.hook('create'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    result.current.form.validateFields = vi.fn().mockResolvedValue(cfg.valores);
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.error).toBe('Duplicado');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('pide revisar campos cuando la validación falla', async () => {
    const crear = registrar(cfg.create, vi.fn());
    const { result } = renderHook(() => cfg.hook('create'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    result.current.form.validateFields = vi.fn().mockRejectedValue({ errorFields: [{}] });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.error).toBe('Revise los campos obligatorios');
    expect(crear).not.toHaveBeenCalled();
  });

  it('handleVolver regresa al listado', async () => {
    const { result } = renderHook(() => cfg.hook('create'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.handleVolver());
    expect(router.navigate).toHaveBeenCalledTimes(1);
    expect(router.navigate.mock.calls[0][0]).toBeTypeOf('string');
  });
});
