import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { resolveGruposTab, useGruposPage } from '../useGruposPage';

const navigate = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigate,
}));

const wrapper = (initial) => ({ children }) => (
  <MemoryRouter initialEntries={[initial]}>{children}</MemoryRouter>
);

describe('resolveGruposTab', () => {
  it('acepta horarios y grupos; cualquier otro valor cae en «horarios»', () => {
    expect(resolveGruposTab('grupos')).toBe('grupos');
    expect(resolveGruposTab('horarios')).toBe('horarios');
    expect(resolveGruposTab('xx')).toBe('horarios');
    expect(resolveGruposTab(null)).toBe('horarios');
  });
});

describe('useGruposPage', () => {
  it('lee ?tab= de la URL y cambia de tab con replace', () => {
    const { result } = renderHook(
      () => ({ page: useGruposPage(), loc: useLocation() }),
      { wrapper: wrapper('/capacitacion/grupos?tab=grupos') },
    );
    expect(result.current.page.activeKey).toBe('grupos');
    act(() => result.current.page.onTabChange('horarios'));
    expect(result.current.loc.search).toBe('?tab=horarios');
    expect(result.current.page.activeKey).toBe('horarios');
  });

  it('«Nuevo horario» navega al formulario colgado de Grupos y vuelve al tab Horarios', () => {
    const { result } = renderHook(() => useGruposPage(), {
      wrapper: wrapper('/capacitacion/grupos'),
    });
    expect(result.current.activeKey).toBe('horarios');
    act(() => result.current.handleNuevoHorario());
    expect(navigate).toHaveBeenCalledWith('/capacitacion/grupos/horarios/nuevo', {
      state: { returnListPath: '/capacitacion/grupos?tab=horarios', menuSidebarKey: 'CAP-GRUPOS' },
    });
  });
});
