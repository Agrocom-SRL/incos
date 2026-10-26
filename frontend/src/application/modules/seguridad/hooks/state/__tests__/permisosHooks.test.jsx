import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { App } from 'antd';

const router = vi.hoisted(() => ({ params: {}, navigate: vi.fn(), location: { pathname: '/x', state: null } }));
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

import { useRolPermisos, resolverPermisoCodigo } from '../useRolPermisos';
import { useSeguridadRolPermisosPage } from '../useSeguridadRolPermisosPage';
import { useSeguridadUsuarioPermisosPage } from '../useSeguridadUsuarioPermisosPage';
import { useSeguridadUsuarioDetailPage } from '../useSeguridadUsuarioDetailPage';

const wrapper = ({ children }) => <App>{children}</App>;
const uc = (nombre, fn) => {
  casos[nombre] = () => ({ ejecutar: fn });
  return fn;
};

const GRUPO = { grupoUi: 'G1', rutaSidebar: '/g1', grupoNombre: 'Grupo', codigos: ['mat.ver', 'mat.crear', 'mat.editar'], accionesAsignadas: ['LISTAR'] };
const FULL = {
  rol: { id: 5, codigo: 'X', nombre: 'Rol X' },
  permisos_por_dominio: { MATRICULA: [{ permiso_id: 10, codigo: 'mat.ver', acciones: ['LISTAR'] }, { permiso_id: 11, codigo: 'mat.crear', acciones: [] }] },
};

beforeEach(() => {
  vi.clearAllMocks();
  router.params = {};
  router.location = { pathname: '/x', state: null };
  permiso.value = true;
  Object.keys(casos).forEach((k) => delete casos[k]);
});

describe('resolverPermisoCodigo', () => {
  const codigos = ['a.ver', 'a.crear', 'a.editar', 'a.aprobar', 'a.documento'];
  it('mapea acciones a códigos', () => {
    expect(resolverPermisoCodigo([], 'LISTAR')).toBe('');
    expect(resolverPermisoCodigo(codigos, 'LISTAR')).toBe('a.ver');
    expect(resolverPermisoCodigo(codigos, 'CREAR')).toBe('a.crear');
    expect(resolverPermisoCodigo(codigos, 'ELIMINAR')).toBe('a.editar');
    expect(resolverPermisoCodigo(codigos, 'APROBAR')).toBe('a.aprobar');
    expect(resolverPermisoCodigo(codigos, 'GENERAR_PDF')).toBe('a.documento');
    expect(resolverPermisoCodigo(['solo'], 'CREAR')).toBe('solo');
    expect(resolverPermisoCodigo(codigos, 'OTRA')).toBe('a.ver');
  });
});

describe('useRolPermisos', () => {
  const preparar = () => {
    uc('obtenerPermisosRolAdmin', vi.fn().mockResolvedValue(FULL));
    return uc('obtenerPermisosGrillaRolAdmin', vi.fn().mockResolvedValue([GRUPO]));
  };

  it('no carga sin rol o dominio', async () => {
    const { result } = renderHook(() => useRolPermisos());
    await expect(result.current.cargar(null, 'MATRICULA')).resolves.toBeNull();
  });

  it('carga snapshot completo la primera vez y solo la grilla después', async () => {
    const grilla = preparar();
    const { result } = renderHook(() => useRolPermisos());
    await act(async () => {
      await result.current.cargar(5, 'MATRICULA');
    });
    expect(result.current.rol.id).toBe(5);
    expect(result.current.grupos).toEqual([GRUPO]);
    await act(async () => {
      await result.current.cargar(5, 'ACADEMICO');
    });
    expect(casos.obtenerPermisosRolAdmin).toBeDefined();
    expect(grilla).toHaveBeenLastCalledWith(5, 'ACADEMICO');
  });

  it('acumula cambios (toggle) y los revierte al volver al valor del servidor', async () => {
    preparar();
    const { result } = renderHook(() => useRolPermisos());
    await act(async () => {
      await result.current.cargar(5, 'MATRICULA');
    });
    act(() => result.current.toggleAccion(GRUPO, 'CREAR'));
    expect(result.current.hayaCambios).toBe(true);
    expect(result.current.obtenerDelta()).toEqual([{ permiso_codigo: 'mat.crear', accion: 'CREAR', habilitado: true }]);
    act(() => result.current.toggleAccion(GRUPO, 'CREAR'));
    expect(result.current.hayaCambios).toBe(false);
    act(() => result.current.toggleAccion(GRUPO, 'LISTAR'));
    expect(result.current.obtenerDelta()[0].habilitado).toBe(false);
    act(() => result.current.cancelarCambios());
    expect(result.current.hayaCambios).toBe(false);
  });

  it('guarda mezclando la base con el delta y recarga la grilla', async () => {
    const grilla = preparar();
    const actualizar = uc('actualizarPermisosRolAdmin', vi.fn().mockResolvedValue(FULL));
    const { result } = renderHook(() => useRolPermisos());
    await act(async () => {
      await result.current.cargar(5, 'MATRICULA');
    });
    act(() => result.current.toggleAccion(GRUPO, 'CREAR'));
    act(() => result.current.toggleAccion(GRUPO, 'LISTAR'));
    await act(async () => {
      await result.current.guardar(5);
    });
    expect(actualizar).toHaveBeenCalledWith(5, [{ permiso_id: 11, accion: 'CREAR' }]);
    expect(grilla).toHaveBeenCalledTimes(2);
    expect(result.current.hayaCambios).toBe(false);
    expect(result.current.saving).toBe(false);
  });
});

describe('useSeguridadRolPermisosPage', () => {
  it('carga permisos del rol, guarda y navega', async () => {
    router.params = { id: '5' };
    uc('obtenerPermisosRolAdmin', vi.fn().mockResolvedValue(FULL));
    uc('obtenerPermisosGrillaRolAdmin', vi.fn().mockResolvedValue([GRUPO]));
    uc('actualizarPermisosRolAdmin', vi.fn().mockResolvedValue(FULL));
    const { result } = renderHook(() => useSeguridadRolPermisosPage(), { wrapper });
    await waitFor(() => expect(result.current.grupos).toHaveLength(1));
    expect(result.current.rolInfo.nombre).toBe('Rol X');
    expect(result.current.esAdminSistema).toBe(false);
    expect(result.current.breadcrumbItems.at(-1).title).toBe('Rol X');
    act(() => result.current.toggleAccion(GRUPO, 'CREAR'));
    await waitFor(() => expect(result.current.hasChanges).toBe(true));
    await act(async () => {
      await result.current.guardarCambios();
    });
    expect(result.current.hasChanges).toBe(false);
    act(() => result.current.goToRolesList());
    expect(router.navigate).toHaveBeenCalledWith('/seguridad/roles');
    act(() => result.current.setDominioSeleccionado('ACADEMICO'));
    await waitFor(() => expect(result.current.dominioSeleccionado).toBe('ACADEMICO'));
  });

  it('informa errores de guardado sin lanzar', async () => {
    router.params = { id: '5' };
    uc('obtenerPermisosRolAdmin', vi.fn().mockResolvedValue(FULL));
    uc('obtenerPermisosGrillaRolAdmin', vi.fn().mockResolvedValue([]));
    uc('actualizarPermisosRolAdmin', vi.fn().mockRejectedValue({ error: 'Sin permiso' }));
    const { result } = renderHook(() => useSeguridadRolPermisosPage(), { wrapper });
    await waitFor(() => expect(result.current.rolInfo).toBeTruthy());
    await act(async () => {
      await result.current.guardarCambios();
    });
    expect(result.current.saving).toBe(false);
  });

  it('no consulta con id inválido', () => {
    router.params = { id: 'x' };
    const obtener = uc('obtenerPermisosRolAdmin', vi.fn());
    renderHook(() => useSeguridadRolPermisosPage(), { wrapper });
    expect(obtener).not.toHaveBeenCalled();
  });
});

describe('useSeguridadUsuarioPermisosPage', () => {
  const preparar = ({ overrides = [] } = {}) => {
    uc('obtenerPermisosUsuarioAdmin', vi.fn().mockResolvedValue({ usuario: { id: 3, username: 'ana', rol: { id: 5, codigo: 'X' } }, overrides }));
    uc('obtenerUsuarioAdmin', vi.fn().mockResolvedValue({ id: 3, username: 'ana', rol: { id: 5, codigo: 'X' } }));
    uc('listarPermisosAdmin', vi.fn().mockResolvedValue({ MATRICULA: [{ id: 99, codigo: 'mat.crear' }, { id: 98 }] }));
    uc('obtenerPermisosGrillaRolAdmin', vi.fn().mockResolvedValue([GRUPO]));
    router.params = { id: '3' };
  };

  it('carga usuario, grupos y calcula el estado de las celdas', async () => {
    preparar({ overrides: [{ id: 1, codigo: 'mat.crear', accion: 'CREAR', tipo: 'GRANT' }, { id: 2, codigo: 'mat.ver', accion: 'LISTAR', tipo: 'REVOKE' }] });
    const { result } = renderHook(() => useSeguridadUsuarioPermisosPage(), { wrapper });
    await waitFor(() => expect(result.current.grupos).toHaveLength(1));
    expect(result.current.usuario.username).toBe('ana');
    expect(result.current.esAdminSistema).toBe(false);
    expect(result.current.breadcrumbItems.at(-1).title).toBe('Accesos');
    expect(result.current.estadoCelda(GRUPO, 'CREAR')).toBe('otorgado');
    expect(result.current.estadoCelda(GRUPO, 'LISTAR')).toBe('revocado');
    expect(result.current.estadoCelda(GRUPO, 'EDITAR')).toBe('ninguno');
    expect(result.current.estadoCelda({ ...GRUPO, codigos: ['otro'], accionesAsignadas: ['LISTAR'] }, 'LISTAR')).toBe('heredado');
    act(() => result.current.goToUsuarioDetail());
    expect(router.navigate).toHaveBeenCalledWith('/seguridad/usuarios/3');
  });

  it('toggle abre el modal con el permiso resuelto y al confirmar registra el ajuste', async () => {
    preparar();
    const agregar = uc('agregarOverridePermisoAdmin', vi.fn().mockResolvedValue({}));
    const { result } = renderHook(() => useSeguridadUsuarioPermisosPage(), { wrapper });
    await waitFor(() => expect(result.current.grupos).toHaveLength(1));
    await waitFor(() => expect(result.current.puedeEditar).toBe(true));
    // espera a que el catálogo de permisos esté cargado (permiso_id resolvible)
    await waitFor(() => {
      act(() => result.current.toggleCelda(GRUPO, 'CREAR'));
      expect(result.current.overrideOpen).toBe(true);
    });
    expect(result.current.pendingToggle).toMatchObject({ tipo: 'GRANT', permiso_id: 99, accion: 'CREAR' });
    await act(async () => {
      await result.current.onAddOverride({ motivo: 'x' });
    });
    expect(agregar).toHaveBeenCalledWith(3, { motivo: 'x' });
    expect(result.current.overrideOpen).toBe(false);
    expect(result.current.isCeldaToggling(GRUPO, 'CREAR')).toBe(false);
  });

  it('toggle sobre un ajuste existente lo elimina', async () => {
    preparar({ overrides: [{ id: 7, codigo: 'mat.crear', accion: 'CREAR', tipo: 'GRANT' }] });
    const eliminar = uc('eliminarOverridePermisoAdmin', vi.fn().mockResolvedValue({}));
    const { result } = renderHook(() => useSeguridadUsuarioPermisosPage(), { wrapper });
    await waitFor(() => expect(result.current.overrides).toHaveLength(1));
    await act(async () => {
      result.current.toggleCelda(GRUPO, 'CREAR');
    });
    await waitFor(() => expect(eliminar).toHaveBeenCalledWith(3, 7));
    expect(await result.current.removeOverride(7)).toEqual({ success: true });
  });

  it('removeOverride devuelve el error del backend', async () => {
    preparar();
    uc('eliminarOverridePermisoAdmin', vi.fn().mockRejectedValue({ error: 'No' }));
    const { result } = renderHook(() => useSeguridadUsuarioPermisosPage(), { wrapper });
    await waitFor(() => expect(result.current.usuario).toBeTruthy());
    expect(await result.current.removeOverride(1)).toEqual({ success: false, error: 'No' });
  });

  it('sin permiso de edición el toggle no hace nada y sin permiso de ver no hay grupos', async () => {
    preparar();
    permiso.value = false;
    const { result } = renderHook(() => useSeguridadUsuarioPermisosPage(), { wrapper });
    await waitFor(() => expect(result.current.usuario).toBeTruthy());
    act(() => result.current.toggleCelda(GRUPO, 'CREAR'));
    expect(result.current.overrideOpen).toBe(false);
    expect(result.current.grupos).toEqual([]);
  });

  it('muestra error de grupos y permite cerrar el modal', async () => {
    preparar();
    uc('obtenerPermisosGrillaRolAdmin', vi.fn().mockRejectedValue({ error: 'Falla grilla' }));
    const { result } = renderHook(() => useSeguridadUsuarioPermisosPage(), { wrapper });
    await waitFor(() => expect(result.current.errorGrupos).toBe('Falla grilla'));
    act(() => result.current.onCloseOverrideModal());
    expect(result.current.pendingToggle).toBeNull();
  });
});

describe('useSeguridadUsuarioDetailPage', () => {
  const preparar = () => {
    router.params = { id: '3' };
    uc('obtenerUsuarioAdmin', vi.fn().mockResolvedValue({ id: 3, username: 'ana', estado: 'ACTIVO', rol: { codigo: 'DOCENTE' } }));
    uc('obtenerPermisosUsuarioAdmin', vi.fn().mockResolvedValue({ efectivos: [1, 2, 3] }));
  };

  it('carga usuario y cuenta permisos efectivos', async () => {
    preparar();
    const { result } = renderHook(() => useSeguridadUsuarioDetailPage(), { wrapper });
    await waitFor(() => expect(result.current.usuario?.username).toBe('ana'));
    await waitFor(() => expect(result.current.permisosEfectivosCount).toBe(3));
    expect(result.current.estadoInitialValues).toEqual({ estado: 'ACTIVO', motivo: '' });
    expect(result.current.breadcrumbItems.at(-1).title).toBe('ana');
  });

  it('navega a edición según el rol, permisos y listado', async () => {
    preparar();
    const { result } = renderHook(() => useSeguridadUsuarioDetailPage(), { wrapper });
    await waitFor(() => expect(result.current.usuario).toBeTruthy());
    result.current.goToUsuarioEdit();
    expect(router.navigate).toHaveBeenCalledWith('/seguridad/usuarios/3/editar', { state: { editInitialStep: 2 } });
    result.current.goToUsuarioPermisos();
    result.current.goToUsuariosList();
    expect(router.navigate).toHaveBeenCalledWith('/seguridad/usuarios/3/permisos');
    expect(router.navigate).toHaveBeenCalledWith('/seguridad/usuarios');
  });

  it('cambia contraseña y estado', async () => {
    preparar();
    const pass = uc('cambiarPasswordUsuarioAdmin', vi.fn().mockResolvedValue({}));
    const estado = uc('cambiarEstadoUsuarioAdmin', vi.fn().mockResolvedValue({}));
    const { result } = renderHook(() => useSeguridadUsuarioDetailPage(), { wrapper });
    await waitFor(() => expect(result.current.usuario).toBeTruthy());
    act(() => result.current.setOpenPass(true));
    await act(async () => {
      await result.current.savePass('nueva123');
    });
    expect(pass).toHaveBeenCalledWith(3, 'nueva123');
    expect(result.current.openPass).toBe(false);
    act(() => result.current.setOpenEstado(true));
    await act(async () => {
      await result.current.saveEstado({ estado: 'INACTIVO', motivo: 'baja' });
    });
    expect(estado).toHaveBeenCalledWith(3, 'INACTIVO', 'baja');
    expect(result.current.openEstado).toBe(false);
  });

  it('informa errores al cambiar contraseña y abre el modal desde quickAction', async () => {
    preparar();
    uc('cambiarPasswordUsuarioAdmin', vi.fn().mockRejectedValue({ error: 'Débil' }));
    router.location = { pathname: '/seguridad/usuarios/3', state: { quickAction: 'password' } };
    const { result } = renderHook(() => useSeguridadUsuarioDetailPage(), { wrapper });
    await waitFor(() => expect(result.current.openPass).toBe(true));
    expect(router.navigate).toHaveBeenCalledWith('/seguridad/usuarios/3', { replace: true, state: null });
    await act(async () => {
      await result.current.savePass('x');
    });
    expect(result.current.savingPass).toBe(false);
    expect(result.current.openPass).toBe(true);
  });

  it('sin permisos de ver no consulta el conteo', async () => {
    preparar();
    permiso.value = false;
    const { result } = renderHook(() => useSeguridadUsuarioDetailPage(), { wrapper });
    await waitFor(() => expect(result.current.usuario).toBeTruthy());
    expect(result.current.permisosEfectivosCount).toBe(0);
  });
});
