import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { App } from 'antd';

const router = vi.hoisted(() => ({ params: {}, navigate: vi.fn(), location: { pathname: '/', state: null } }));
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

const permiso = vi.hoisted(() => ({ value: true }));
vi.mock('@/presentation/hooks/usePermiso.js', () => ({ usePermiso: () => permiso.value }));

import { useRolesList } from '../useRolesList';
import { useUsuariosList } from '../useUsuariosList';
import { useUsuarioDetail } from '../useUsuarioDetail';
import { useRolDetail } from '../useRolDetail';
import { usePermisosCatalogo, DOMINIOS_V2 } from '../usePermisosCatalogo';
import { useUsuarioPermisos } from '../useUsuarioPermisos';
import { useRolForm } from '../useRolForm';
import { useSeguridadRolDetailPage } from '../useSeguridadRolDetailPage';
import { useSeguridadRolesListPage } from '../useSeguridadRolesListPage';
import { useSeguridadUsuariosListPage } from '../useSeguridadUsuariosListPage';

const wrapper = ({ children }) => <App>{children}</App>;
const uc = (nombre, ejecutar) => {
  casos[nombre] = () => ({ ejecutar });
  return ejecutar;
};

beforeEach(() => {
  vi.clearAllMocks();
  router.params = {};
  permiso.value = true;
  Object.keys(casos).forEach((k) => delete casos[k]);
});

describe('hooks simples de seguridad', () => {
  it('useRolesList carga y guarda roles; propaga errores', async () => {
    const ejecutar = uc('listarRolesAdmin', vi.fn().mockResolvedValueOnce([{ id: 1 }]).mockRejectedValueOnce(new Error('x')));
    const { result } = renderHook(() => useRolesList());
    await act(async () => {
      await result.current.cargar();
    });
    expect(result.current.roles).toEqual([{ id: 1 }]);
    await act(async () => {
      await expect(result.current.cargar()).rejects.toThrow('x');
    });
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.loading).toBe(false);
    expect(ejecutar).toHaveBeenCalledTimes(2);
  });

  it('useUsuariosList arma la paginación desde la respuesta', async () => {
    uc('listarUsuariosAdmin', vi.fn().mockResolvedValue({ users: [{ id: 1 }], pagination: { page: 2, limit: 10 }, total: 33 }));
    const { result } = renderHook(() => useUsuariosList());
    await act(async () => {
      await result.current.cargar({ page: 2 });
    });
    expect(result.current.usuarios).toHaveLength(1);
    expect(result.current.pagination).toEqual({ current: 2, pageSize: 10, total: 33 });
    act(() => result.current.setSearchText('ana'));
    expect(result.current.searchText).toBe('ana');
  });

  it('useUsuariosList usa defaults y captura el error', async () => {
    uc('listarUsuariosAdmin', vi.fn().mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('boom')));
    const { result } = renderHook(() => useUsuariosList());
    await act(async () => {
      await result.current.cargar();
    });
    expect(result.current.pagination).toEqual({ current: 1, pageSize: 20, total: 0 });
    await act(async () => {
      await expect(result.current.cargar()).rejects.toThrow('boom');
    });
    expect(result.current.error.message).toBe('boom');
  });

  it('useUsuarioDetail delega las mutaciones en sus use cases', async () => {
    uc('obtenerUsuarioAdmin', vi.fn().mockResolvedValue({ id: 3 }));
    const crear = uc('crearUsuarioAdmin', vi.fn().mockResolvedValue('c'));
    const actualizar = uc('actualizarUsuarioAdmin', vi.fn());
    const estado = uc('cambiarEstadoUsuarioAdmin', vi.fn());
    const pass = uc('cambiarPasswordUsuarioAdmin', vi.fn());
    const { result } = renderHook(() => useUsuarioDetail());
    await act(async () => {
      await result.current.cargar(3);
    });
    expect(result.current.usuario).toEqual({ id: 3 });
    await result.current.crear({ a: 1 });
    result.current.actualizar(3, { b: 2 });
    result.current.cambiarEstado(3, 'INACTIVO', 'm');
    result.current.cambiarPassword(3, 'p');
    expect(crear).toHaveBeenCalledWith({ a: 1 });
    expect(actualizar).toHaveBeenCalledWith(3, { b: 2 });
    expect(estado).toHaveBeenCalledWith(3, 'INACTIVO', 'm');
    expect(pass).toHaveBeenCalledWith(3, 'p');
  });

  it('useUsuarioDetail y useRolDetail propagan errores de carga', async () => {
    uc('obtenerUsuarioAdmin', vi.fn().mockRejectedValue(new Error('u')));
    uc('obtenerRolAdmin', vi.fn().mockRejectedValue(new Error('r')));
    const u = renderHook(() => useUsuarioDetail());
    const r = renderHook(() => useRolDetail());
    await act(async () => {
      await expect(u.result.current.cargar(1)).rejects.toThrow('u');
      await expect(r.result.current.cargar(1)).rejects.toThrow('r');
    });
    expect(u.result.current.error.message).toBe('u');
    expect(r.result.current.error.message).toBe('r');
  });

  it('useRolDetail carga el rol', async () => {
    uc('obtenerRolAdmin', vi.fn().mockResolvedValue({ id: 2, nombre: 'Rol' }));
    const { result } = renderHook(() => useRolDetail());
    await act(async () => {
      await result.current.cargar(2);
    });
    expect(result.current.rol.nombre).toBe('Rol');
  });

  it('usePermisosCatalogo agrupa por dominio', async () => {
    const ejecutar = uc('listarPermisosAdmin', vi.fn().mockResolvedValue({ A: [1] }));
    const { result } = renderHook(() => usePermisosCatalogo());
    expect(result.current.dominios).toBe(DOMINIOS_V2);
    await act(async () => {
      await result.current.cargar('MATRICULA');
    });
    expect(ejecutar).toHaveBeenCalledWith('MATRICULA');
    expect(result.current.permisosAgrupados).toEqual({ A: [1] });
  });

  it('useUsuarioPermisos carga (normal y silencioso) y gestiona overrides', async () => {
    uc('obtenerPermisosUsuarioAdmin', vi.fn().mockResolvedValueOnce({ permisos_rol: [1], overrides: [2], efectivos: [3] }).mockResolvedValueOnce(null));
    const add = uc('agregarOverridePermisoAdmin', vi.fn());
    const del = uc('eliminarOverridePermisoAdmin', vi.fn());
    const { result } = renderHook(() => useUsuarioPermisos());
    await act(async () => {
      await result.current.cargar(1);
    });
    expect(result.current).toMatchObject({ permisos_rol: [1], overrides: [2], efectivos: [3], loading: false });
    await act(async () => {
      await result.current.cargar(1, { silent: true });
    });
    expect(result.current.overrides).toEqual([]);
    expect(result.current.refreshingOverrides).toBe(false);
    result.current.agregarOverride(1, { x: 1 });
    result.current.eliminarOverride(1, 9);
    expect(add).toHaveBeenCalledWith(1, { x: 1 });
    expect(del).toHaveBeenCalledWith(1, 9);
  });
});

describe('useRolForm', () => {
  const montar = async (ejecutar) => {
    uc('crearRolAdmin', ejecutar);
    const hook = renderHook(() => useRolForm(), { wrapper });
    return hook;
  };
  it('crea el rol normalizando el código y navega a permisos', async () => {
    const ejecutar = vi.fn().mockResolvedValue({ id: 8 });
    const { result } = await montar(ejecutar);
    result.current.form.validateFields = vi.fn().mockResolvedValue({ codigo: ' coord_1 ', nombre: 'C', tipo: 'X' });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(ejecutar).toHaveBeenCalledWith({ codigo: 'COORD_1', nombre: 'C', tipo: 'X' });
    expect(router.navigate).toHaveBeenCalledWith('/seguridad/roles/8/permisos');
  });
  it('sin id vuelve al listado', async () => {
    const { result } = await montar(vi.fn().mockResolvedValue({}));
    result.current.form.validateFields = vi.fn().mockResolvedValue({ codigo: 'A' });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(router.navigate).toHaveBeenCalledWith('/seguridad/roles');
  });
  it('rechaza códigos inválidos sin llamar al backend', async () => {
    const ejecutar = vi.fn();
    const { result } = await montar(ejecutar);
    result.current.form.validateFields = vi.fn().mockResolvedValue({ codigo: 'a-b' });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.submitError).toMatch(/solo admite mayúsculas/);
    expect(ejecutar).not.toHaveBeenCalled();
  });
  it('maneja errores de validación y de backend', async () => {
    const { result } = await montar(vi.fn().mockRejectedValue({ error: { message: 'Duplicado' } }));
    result.current.form.validateFields = vi.fn().mockRejectedValueOnce({ errorFields: [] }).mockResolvedValue({ codigo: 'A' });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.submitError).toBe('Revise los campos obligatorios');
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.submitError).toBe('Duplicado');
    act(() => result.current.handleVolver());
    expect(router.navigate).toHaveBeenCalledWith('/seguridad/roles');
    expect(result.current.formSections.datosRol.fields.map((f) => f.name)).toEqual(['codigo', 'nombre', 'tipo']);
  });
});

describe('páginas de roles y usuarios', () => {
  it('useSeguridadRolDetailPage carga rol y usuarios paginados, y navega', async () => {
    router.params = { id: '4' };
    uc('obtenerRolAdmin', vi.fn().mockResolvedValue({ id: 4, nombre: 'Admin' }));
    const lista = uc('listarUsuariosPorRolAdmin', vi.fn().mockResolvedValue({ usuarios: [{ id: 1 }], total: 1 }));
    const { result } = renderHook(() => useSeguridadRolDetailPage(), { wrapper });
    await waitFor(() => expect(result.current.usuarios).toHaveLength(1));
    expect(lista).toHaveBeenCalledWith(4, expect.objectContaining({ page: 1, limit: 20 }));
    expect(result.current.rol.nombre).toBe('Admin');
    expect(result.current.breadcrumbItems.at(-1).title).toBe('Admin');
    expect(result.current.puedeGestionarPermisos).toBe(true);
    act(() => {
      result.current.goToRolesList();
      result.current.goToUsuarioDetail(7);
      result.current.goToGestionarPermisos();
    });
    expect(router.navigate.mock.calls.map((c) => c[0])).toEqual(['/seguridad/roles', '/seguridad/usuarios/7', '/seguridad/roles/4/permisos']);
    act(() => result.current.handleSearchChange({ target: { value: 'x' } }));
    expect(result.current.searchText).toBe('x');
  });

  it('useSeguridadRolDetailPage informa errores del listado', async () => {
    router.params = { id: '4' };
    uc('obtenerRolAdmin', vi.fn().mockRejectedValue({ error: { details: [{ message: 'a' }, { message: 'b' }] } }));
    uc('listarUsuariosPorRolAdmin', vi.fn().mockRejectedValue(new Error('x')));
    const { result } = renderHook(() => useSeguridadRolDetailPage(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => expect(result.current.loadingUsuarios).toBe(false));
    expect(result.current.usuarios).toEqual([]);
  });

  it('useSeguridadRolDetailPage sin id válido no consulta', async () => {
    router.params = { id: 'x' };
    const obtener = uc('obtenerRolAdmin', vi.fn());
    const { result } = renderHook(() => useSeguridadRolDetailPage(), { wrapper });
    expect(result.current.rolId).toBeNaN();
    expect(obtener).not.toHaveBeenCalled();
  });

  it('useSeguridadRolesListPage filtra por texto y expone columnas', async () => {
    uc('listarRolesAdmin', vi.fn().mockResolvedValue([{ id: 1, codigo: 'ADMIN', nombre: 'Administrador', tipo: 'X' }, { id: 2, codigo: 'DOC', nombre: 'Docente' }]));
    const { result } = renderHook(() => useSeguridadRolesListPage(), { wrapper });
    await waitFor(() => expect(result.current.filteredRoles).toHaveLength(2));
    expect(result.current.columns.map((c) => c.key)).toEqual(['nro', 'rol', 'tipo', 'acciones']);
    expect(result.current.columns[0].render(null, null, 1, 10)).toBe(12);
    act(() => result.current.onSearchChange({ target: { value: 'doc' } }));
    expect(result.current.filteredRoles.map((r) => r.id)).toEqual([2]);
    expect(result.current.columns[1].render(null, { codigo: 'A', nombre: 'B', tipo: 'X' })).toBeTruthy();
    expect(result.current.columns[2].render(null, { tipo: 'Z' })).toBeTruthy();
    expect(result.current.columns[3].render(null, { id: 1 })).toBeTruthy();
  });

  it('useSeguridadRolesListPage avisa si falla la carga', async () => {
    uc('listarRolesAdmin', vi.fn().mockRejectedValue({ error: 'Sin permiso' }));
    const { result } = renderHook(() => useSeguridadRolesListPage(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.filteredRoles).toEqual([]);
  });

  it('useSeguridadUsuariosListPage consulta con categoría y búsqueda', async () => {
    const listar = uc('listarUsuariosAdmin', vi.fn().mockResolvedValue({ users: [{ id: 1 }], total: 1 }));
    const eliminar = uc('eliminarUsuarioAdmin', vi.fn());
    const { result } = renderHook(() => useSeguridadUsuariosListPage(), { wrapper });
    await waitFor(() => expect(result.current.usuarios).toHaveLength(1));
    expect(listar).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 20 }));
    expect(result.current.columns.length).toBeGreaterThan(0);
    act(() => result.current.handleCreateUsuario());
    expect(router.navigate).toHaveBeenCalledWith('/seguridad/usuarios/nuevo');
    act(() => result.current.handleSearchChange({ target: { value: 'ana' } }));
    expect(result.current.searchText).toBe('ana');
    act(() => result.current.setCategoria('DOCENTE'));
    await waitFor(() => expect(listar).toHaveBeenCalledWith(expect.objectContaining({ categoria: 'DOCENTE' })));
    expect(eliminar).not.toHaveBeenCalled();
  });

  it('useSeguridadUsuariosListPage devuelve lista vacía si el backend falla', async () => {
    uc('listarUsuariosAdmin', vi.fn().mockRejectedValue({ error: { message: 'Mal' } }));
    const { result } = renderHook(() => useSeguridadUsuariosListPage(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.usuarios).toEqual([]);
  });
});
