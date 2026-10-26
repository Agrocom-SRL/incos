import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, render, screen } from '@testing-library/react';

const router = vi.hoisted(() => ({ navigate: vi.fn(), location: { pathname: '/dashboard', state: null } }));
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => router.navigate,
  useLocation: () => router.location,
}));

const auth = vi.hoisted(() => ({ value: null }));
vi.mock('@application-auth', async (orig) => ({ ...(await orig()), useAuthContext: () => auth.value }));

import { useNavigationMenu } from '../hooks/useNavigationMenu';
import { useNavigationContext } from '../hooks/useNavigationContext';
import { NavigationProvider } from '../providers/NavigationProvider';

const todos = { hasPermiso: () => true, isAuthenticated: true, usuario: { rol: { codigo: 'ADMIN_SISTEMA' } } };

const hojas = (items) => items.flatMap((i) => (i.children?.length ? hojas(i.children) : [i]));
const conHijos = (items) => items.find((i) => i.children?.length);

beforeEach(() => {
  vi.clearAllMocks();
  router.location = { pathname: '/dashboard', state: null };
  auth.value = todos;
});

describe('useNavigationMenu', () => {
  it('genera el menú con iconos para un usuario con todos los permisos', () => {
    const { result } = renderHook(() => useNavigationMenu('DASH'));
    expect(result.current.menuItemsWithIcons.length).toBeGreaterThan(3);
    expect(result.current.selectedKeys).toEqual(['DASH']);
    expect(result.current.menuItemsWithIcons[0].icon).toBeTruthy();
  });

  it('sin ningún permiso solo conserva ítems sin restricción', () => {
    auth.value = { hasPermiso: () => false, isAuthenticated: true, usuario: null };
    const completo = renderHook(() => useNavigationMenu('DASH'));
    auth.value = todos;
    const full = renderHook(() => useNavigationMenu('DASH'));
    expect(hojas(completo.result.current.menuItemsWithIcons).length).toBeLessThan(hojas(full.result.current.menuItemsWithIcons).length);
  });

  it('sin sesión devuelve el menú sin filtrar', () => {
    auth.value = { hasPermiso: () => false, isAuthenticated: false, usuario: null };
    const { result } = renderHook(() => useNavigationMenu('DASH'));
    auth.value = todos;
    const full = renderHook(() => useNavigationMenu('DASH'));
    expect(hojas(result.current.menuItemsWithIcons).length).toBe(hojas(full.result.current.menuItemsWithIcons).length);
  });

  it('el clic en DASH navega, limpia submenús y notifica', () => {
    const onMenuClick = vi.fn();
    const { result } = renderHook(() => useNavigationMenu('DASH', onMenuClick));
    act(() => result.current.handleMenuClick({ key: 'DASH' }));
    expect(router.navigate).toHaveBeenCalled();
    expect(result.current.openKeys).toEqual([]);
    expect(onMenuClick).toHaveBeenCalledWith({ key: 'DASH' });
  });

  it('el clic en un módulo con hijos alterna el submenú; en una hoja navega', () => {
    const { result } = renderHook(() => useNavigationMenu('DASH'));
    const padre = conHijos(result.current.menuItemsWithIcons);
    act(() => result.current.handleMenuClick({ key: padre.key }));
    expect(result.current.openKeys).toContain(padre.key);
    expect(router.navigate).not.toHaveBeenCalled();
    act(() => result.current.handleMenuClick({ key: padre.key }));
    expect(result.current.openKeys).not.toContain(padre.key);
    const hoja = hojas(result.current.menuItemsWithIcons).find((h) => h.key !== 'DASH');
    act(() => result.current.handleMenuClick({ key: hoja.key }));
    // la ruta actual manda sobre la selección local: sigue en DASH hasta que cambie el location
    expect(router.navigate).toHaveBeenCalled();
  });

  it('handleOpenChange limita los submenús abiertos al módulo raíz recién abierto', () => {
    const { result } = renderHook(() => useNavigationMenu('DASH'));
    const raices = result.current.menuItemsWithIcons.filter((i) => i.children?.length);
    expect(raices.length).toBeGreaterThan(1);
    act(() => result.current.handleOpenChange([raices[0].key]));
    expect(result.current.openKeys).toEqual([raices[0].key]);
    act(() => result.current.handleOpenChange([raices[0].key, raices[1].key]));
    expect(result.current.openKeys).toEqual([raices[1].key]);
    act(() => result.current.handleOpenChange([]));
    expect(result.current.openKeys).toEqual([]);
  });

  it('selecciona el ítem según la ruta actual', () => {
    const { result: base } = renderHook(() => useNavigationMenu('DASH'));
    expect(base.current.selectedKeys).toEqual(['DASH']);
    router.location = { pathname: '/configuracion/academico', state: null };
    const { result } = renderHook(() => useNavigationMenu('DASH'));
    expect(result.current.selectedKeys[0]).not.toBe('DASH');
  });
});

describe('NavigationProvider / useNavigationContext', () => {
  it('lanza fuera del provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useNavigationContext())).toThrow('NavigationProvider');
  });
  it('expone el estado del menú a sus hijos', () => {
    function Hijo() {
      const { selectedKeys } = useNavigationContext();
      return <span data-testid="sel">{selectedKeys[0]}</span>;
    }
    render(
      <NavigationProvider defaultSelectedKey="DASH">
        <Hijo />
      </NavigationProvider>,
    );
    expect(screen.getByTestId('sel').textContent).toBe('DASH');
  });
});
