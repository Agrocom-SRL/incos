/**
 * Prueba parametrizada de los hooks de ficha (detalle) de Configuración.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

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

import { useIdiomaDetallePage } from '../complementarios/hooks/state/useIdiomaDetallePage';
import { useApoderadoDetallePage } from '../complementarios/hooks/state/useApoderadoDetallePage';
import { useDiscapacidadDetallePage } from '../complementarios/hooks/state/useDiscapacidadDetallePage';
import { useEstadoCivilDetallePage } from '../complementarios/hooks/state/useEstadoCivilDetallePage';
import { useAulaDetallePage } from '../recursos/hooks/state/useAulaDetallePage';
import { useTipoEvaluacionDetallePage } from '../recursos/hooks/state/useTipoEvaluacionDetallePage';
import { useActividadDetallePage } from '../actividades/hooks/state/useActividadDetallePage';
import { useDocumentacionDetallePage } from '../documentacion/hooks/state/useDocumentacionDetallePage';
import { useMateriaDetallePage } from '../academico/hooks/state/useMateriaDetallePage';
import { useCarreraDetallePage } from '../academico/hooks/state/useCarreraDetallePage';

const CONFIGS = [
  { nombre: 'idioma', hook: useIdiomaDetallePage, get: 'obtenerIdiomaPorId' },
  { nombre: 'apoderado', hook: useApoderadoDetallePage, get: 'obtenerTipoParentescoPorId' },
  { nombre: 'discapacidad', hook: useDiscapacidadDetallePage, get: 'obtenerDiscapacidadPorId' },
  { nombre: 'estado civil', hook: useEstadoCivilDetallePage, get: 'obtenerEstadoCivilPorId' },
  { nombre: 'aula', hook: useAulaDetallePage, get: 'obtenerAulaPorId' },
  { nombre: 'tipo de evaluación', hook: useTipoEvaluacionDetallePage, get: 'obtenerTipoEvaluacionPorId' },
  { nombre: 'actividad', hook: useActividadDetallePage, get: 'obtenerActividadPorId' },
  { nombre: 'documentación', hook: useDocumentacionDetallePage, get: 'obtenerDocumentacionPorId' },
  { nombre: 'materia', hook: useMateriaDetallePage, get: 'obtenerMateriaPorId' },
  { nombre: 'carrera', hook: useCarreraDetallePage, get: 'obtenerCarreraPorId' },
];

describe.each(CONFIGS)('ficha de $nombre', (cfg) => {
  beforeEach(() => {
    vi.clearAllMocks();
    router.params = { id: '7' };
    router.location = { pathname: '/', state: null };
    Object.keys(casos).forEach((k) => delete casos[k]);
  });

  it('carga por id y termina sin error', async () => {
    const ejecutar = vi.fn().mockResolvedValue({ success: true, data: { id: 7, nombre: 'Algo' } });
    casos[cfg.get] = () => ({ ejecutar });
    const { result } = renderHook(() => cfg.hook());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(ejecutar).toHaveBeenCalledWith(7);
    expect(result.current.error).toBeNull();
    expect(result.current.isInvalidId).toBe(false);
    expect(result.current.breadcrumbItems.length).toBeGreaterThan(1);
  });

  it('expone el error cuando el backend falla', async () => {
    casos[cfg.get] = () => ({ ejecutar: vi.fn().mockResolvedValue({ success: false, error: 'No existe' }) });
    const { result } = renderHook(() => cfg.hook());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('No existe');
  });

  it('captura excepciones lanzadas por el use case', async () => {
    casos[cfg.get] = () => ({ ejecutar: vi.fn().mockRejectedValue(new Error('Red caída')) });
    const { result } = renderHook(() => cfg.hook());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Red caída');
  });

  it('id inválido: no consulta', async () => {
    router.params = { id: '0' };
    const ejecutar = vi.fn();
    casos[cfg.get] = () => ({ ejecutar });
    const { result } = renderHook(() => cfg.hook());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isInvalidId).toBe(true);
    expect(ejecutar).not.toHaveBeenCalled();
  });

  it('handleVolver y handleEditar navegan', async () => {
    casos[cfg.get] = () => ({ ejecutar: vi.fn().mockResolvedValue({ success: true, data: { id: 7, nombre: 'Algo' } }) });
    const { result } = renderHook(() => cfg.hook());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.handleVolver());
    expect(router.navigate).toHaveBeenCalledTimes(1);
    router.navigate.mockClear();
    act(() => result.current.handleEditar?.());
    if (result.current.handleEditar) expect(router.navigate).toHaveBeenCalled();
  });
});
