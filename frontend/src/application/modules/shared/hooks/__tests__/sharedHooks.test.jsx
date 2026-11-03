import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { App } from 'antd';

const casos = vi.hoisted(() => ({}));
vi.mock('@container', () => ({ useCasesFactory: new Proxy({}, { get: (_, k) => casos[k] }) }));

const auth = vi.hoisted(() => ({ hasPermiso: vi.fn() }));
vi.mock('@application-auth', () => ({ useAuthContext: () => auth }));

import { useToggleEstadoCatalogo } from '../useToggleEstadoCatalogo';
import { useAcciones } from '../useAcciones';

const wrapper = ({ children }) => <App>{children}</App>;

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(casos).forEach((k) => delete casos[k]);
});

describe('useToggleEstadoCatalogo', () => {
  it('cambia el estado y recarga el listado', async () => {
    const ejecutar = vi.fn().mockResolvedValue({ success: true });
    casos.cambiarEstadoIdioma = () => ({ ejecutar });
    const refetch = vi.fn();
    const { result } = renderHook(() => useToggleEstadoCatalogo({ useCaseKey: 'cambiarEstadoIdioma', entidad: 'el idioma', refetch }), { wrapper });
    await result.current({ id: 4, nombre: 'Quechua' }, false);
    expect(ejecutar).toHaveBeenCalledWith(4, false);
    expect(refetch).toHaveBeenCalledTimes(1);
  });
  it('no recarga si el backend rechaza', async () => {
    casos.cambiarEstadoIdioma = () => ({ ejecutar: vi.fn().mockResolvedValue({ success: false, error: 'No' }) });
    const refetch = vi.fn();
    const { result } = renderHook(() => useToggleEstadoCatalogo({ useCaseKey: 'cambiarEstadoIdioma', entidad: 'el idioma', refetch }), { wrapper });
    await result.current({ id: 4 }, true);
    expect(refetch).not.toHaveBeenCalled();
  });
});

describe('useAcciones', () => {
  it('traduce permisos a banderas', () => {
    auth.hasPermiso.mockImplementation((c, a) => ['DETALLE', 'EDITAR'].includes(a));
    const { result } = renderHook(() => useAcciones('x.y'));
    expect(result.current).toMatchObject({ puedeVer: true, puedeCrear: false, puedeEditar: true, puedeEliminar: false, puedeAprobar: false, puedeExportar: false });
    expect(result.current.tiene('EDITAR')).toBe(true);
    expect(auth.hasPermiso).toHaveBeenCalledWith('x.y', 'CREAR');
  });
});
