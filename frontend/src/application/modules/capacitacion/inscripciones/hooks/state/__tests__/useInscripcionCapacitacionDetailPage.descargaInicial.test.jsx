import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

const ctx = vi.hoisted(() => ({ value: {} }));
const loc = vi.hoisted(() => ({ state: null, pathname: '/capacitacion/inscripciones/10' }));
const nav = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock('react-router-dom', () => ({
  useNavigate: () => nav.navigate,
  useLocation: () => loc,
}));
vi.mock('antd', () => ({ App: { useApp: () => ({ message: { success: vi.fn(), error: vi.fn() } }) } }));
vi.mock(
  '@application-capacitacion/inscripciones/hooks/context/useInscripcionCapacitacionDetailContext',
  () => ({ useInscripcionCapacitacionDetailContext: () => ctx.value }),
);

import { useInscripcionCapacitacionDetailPage } from '../useInscripcionCapacitacionDetailPage';

describe('useInscripcionCapacitacionDetailPage · descarga inicial del formulario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ctx.value = {
      inscripcionId: 10,
      inscripcion: { estado: 'PENDIENTE', requisitos: [] },
      loading: false,
      error: null,
      descargarFormularioPdf: vi.fn().mockResolvedValue({ success: true }),
    };
  });

  it('tras crear (state.descargarFormulario) baja el formulario una vez y limpia la marca', () => {
    loc.state = { returnListPath: '/lista', descargarFormulario: true };
    renderHook(() => useInscripcionCapacitacionDetailPage());
    expect(ctx.value.descargarFormularioPdf).toHaveBeenCalledTimes(1);
    expect(nav.navigate).toHaveBeenCalledWith('/capacitacion/inscripciones/10', {
      replace: true,
      state: { returnListPath: '/lista' },
    });
  });

  it('al entrar o recargar la ficha sin la marca, no descarga (la descarga es manual)', () => {
    loc.state = { returnListPath: '/lista' };
    renderHook(() => useInscripcionCapacitacionDetailPage());
    expect(ctx.value.descargarFormularioPdf).not.toHaveBeenCalled();
  });
});
