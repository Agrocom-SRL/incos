import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { App } from 'antd';

const auth = vi.hoisted(() => ({ value: { usuario: null, isLoading: false, refreshMe: vi.fn() } }));
vi.mock('@/application/modules/auth/hooks/useAuth.js', () => ({ useAuth: () => auth.value }));

const repos = vi.hoisted(() => ({
  estudiante: { obtenerMisDatos: vi.fn() },
  calificacion: { obtenerMiBoletin: vi.fn() },
  perfil: { cambiarMiPassword: vi.fn() },
  docenteHome: vi.fn(),
  estudianteHome: vi.fn(),
}));
vi.mock('@infrastructure/repositories/EstudianteRepository.js', () => ({ default: repos.estudiante }));
vi.mock('@infrastructure/repositories/CalificacionRepository.js', () => ({ default: repos.calificacion }));
vi.mock('@/infrastructure/repositories/auth/PerfilRepository.js', () => ({ default: repos.perfil }));
vi.mock('@application-dashboard/hooks/useDocenteHome.js', () => ({ useDocenteHome: (...a) => repos.docenteHome(...a) }));
vi.mock('@application-dashboard/hooks/useEstudianteHome.js', () => ({ useEstudianteHome: (...a) => repos.estudianteHome(...a) }));

import { useMisDatosEstudiante } from '../state/useMisDatosEstudiante';
import { usePerfilEstudianteResumen } from '../state/usePerfilEstudianteResumen';
import { usePerfilDocenteResumen } from '../state/usePerfilDocenteResumen';
import { usePerfilPage } from '../state/usePerfilPage';

const wrapper = ({ children }) => <App>{children}</App>;

beforeEach(() => {
  vi.clearAllMocks();
  repos.docenteHome.mockReturnValue({ gestion: { nombre: 'G26', anio: 2026, bimestreNombre: 'B2' }, carga: { totalAsignaciones: 3, horasSemanales: 12 }, loading: false, error: null });
  repos.estudianteHome.mockReturnValue({ carrera: { label: 'Sistemas' }, saldoPendiente: 50, loading: false });
  auth.value = { usuario: null, isLoading: false, refreshMe: vi.fn() };
});

describe('useMisDatosEstudiante', () => {
  it('no consulta si está deshabilitado', () => {
    const { result } = renderHook(() => useMisDatosEstudiante(false));
    expect(result.current.loadingMisDatos).toBe(false);
    expect(repos.estudiante.obtenerMisDatos).not.toHaveBeenCalled();
  });
  it('carga los datos propios', async () => {
    repos.estudiante.obtenerMisDatos.mockResolvedValue({ success: true, data: { student: { ci: '1' } } });
    const { result } = renderHook(() => useMisDatosEstudiante(true));
    await waitFor(() => expect(result.current.loadingMisDatos).toBe(false));
    expect(result.current.misDatos.student.ci).toBe('1');
  });
  it('reporta error de resultado o excepción', async () => {
    repos.estudiante.obtenerMisDatos.mockResolvedValueOnce({ success: false, error: 'No' });
    const { result } = renderHook(() => useMisDatosEstudiante(true));
    await waitFor(() => expect(result.current.errorMisDatos).toBe('No'));
    repos.estudiante.obtenerMisDatos.mockRejectedValueOnce(new Error('Red'));
    await act(async () => {
      await result.current.refetchMisDatos();
    });
    expect(result.current.errorMisDatos).toBe('Red');
    expect(result.current.misDatos).toBeNull();
  });
});

describe('resúmenes de perfil', () => {
  it('estudiante: combina home, datos y promedio', async () => {
    repos.estudiante.obtenerMisDatos.mockResolvedValue({ success: true, data: { student: { studentCode: 'E1', ci: '123' } } });
    repos.calificacion.obtenerMiBoletin.mockResolvedValue({ success: true, data: { promedioGeneral: 78 } });
    const { result } = renderHook(() => usePerfilEstudianteResumen(true));
    await waitFor(() => expect(result.current.loadingResumen).toBe(false));
    expect(result.current).toMatchObject({ carrera: 'Sistemas', codigo: 'E1', ci: '123', saldoPendiente: 50, promedioGeneral: 78 });
  });
  it('estudiante: promedio nulo si falla', async () => {
    repos.estudiante.obtenerMisDatos.mockResolvedValue({ success: true, data: {} });
    repos.calificacion.obtenerMiBoletin.mockRejectedValue(new Error('x'));
    const { result } = renderHook(() => usePerfilEstudianteResumen(true));
    await waitFor(() => expect(result.current.loadingResumen).toBe(false));
    expect(result.current.promedioGeneral).toBeNull();
    expect(result.current.codigo).toBeNull();
  });
  it('docente: expone carga o nulos', () => {
    const a = renderHook(() => usePerfilDocenteResumen(true));
    expect(a.result.current).toMatchObject({ cursos: 3, horasSemanales: 12, gestion: 'G26', bimestreNombre: 'B2' });
    const b = renderHook(() => usePerfilDocenteResumen(false));
    expect(b.result.current.cursos).toBeNull();
    repos.docenteHome.mockReturnValue({ gestion: { anio: 2026 }, carga: {}, loading: false, error: 'x' });
    const c = renderHook(() => usePerfilDocenteResumen(true));
    expect(c.result.current.gestion).toBeNull();
    repos.docenteHome.mockReturnValue({ gestion: { anio: 2026 }, carga: { totalAsignaciones: 1, horasSemanales: 2 }, loading: false, error: null });
    expect(renderHook(() => usePerfilDocenteResumen(true)).result.current.gestion).toBe('2026');
  });
});

describe('usePerfilPage', () => {
  it('calcula datos de presentación según el rol', () => {
    auth.value = { ...auth.value, usuario: { username: 'ana', email: 'a@x', rol: { codigo: 'DOCENTE', is_system: true }, vinculo_perfil: { nombre_completo: 'Ana P' } } };
    const { result } = renderHook(() => usePerfilPage(), { wrapper });
    expect(result.current).toMatchObject({ esDocente: true, esEstudiante: false, tipoRol: 'Sistema', nombreMostrado: 'Ana P', correo: 'a@x' });
    expect(result.current.breadcrumbItems).toHaveLength(2);
  });
  it('valores por defecto sin usuario', () => {
    const { result } = renderHook(() => usePerfilPage(), { wrapper });
    expect(result.current).toMatchObject({ tipoRol: '—', correo: 'Sin correo', rol: null });
  });
  it('cambia la contraseña y maneja errores', async () => {
    auth.value = { ...auth.value, usuario: { username: 'u', rol: { codigo: 'X' } } };
    const { result } = renderHook(() => usePerfilPage(), { wrapper });
    act(() => result.current.setOpenPass(true));
    repos.perfil.cambiarMiPassword.mockResolvedValueOnce({});
    let ok;
    await act(async () => {
      ok = await result.current.cambiarPassword({ password_actual: 'a', password_nuevo: 'b' });
    });
    expect(ok).toBe(true);
    expect(result.current.openPass).toBe(false);
    repos.perfil.cambiarMiPassword.mockRejectedValueOnce({ error: { details: [{ message: 'Débil' }] } });
    await act(async () => {
      ok = await result.current.cambiarPassword({});
    });
    expect(ok).toBe(false);
    expect(result.current.saving).toBe(false);
  });
});
