import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { App } from 'antd';

const router = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => router.navigate }));

const casos = vi.hoisted(() => ({}));
vi.mock('@container', () => ({ useCasesFactory: new Proxy({}, { get: (_, k) => casos[k] }) }));

const auth = vi.hoisted(() => ({ value: { hasPermiso: () => true, usuario: { username: 'ana', vinculo_perfil: { nombre_completo: 'Ana Pérez' } } } }));
vi.mock('@application-auth', () => ({ useAuth: () => auth.value, useAuthContext: () => auth.value }));

const repo = vi.hoisted(() => ({ obtenerMiResumenDocente: vi.fn(), obtenerMiResumen: vi.fn() }));
vi.mock('@infrastructure/repositories/DashboardRepository.js', () => ({ default: repo }));

const rutas = vi.hoisted(() => ({ findBestMatchingRoute: vi.fn() }));
vi.mock('@navigation-services/routeMapper', () => rutas);
const aviso = vi.hoisted(() => ({ notifyAccessDenied: vi.fn() }));
vi.mock('@navigation/utils/notifyAccessDenied.js', () => aviso);

import {
  buildImageUrl,
  mapCarreraToDashboard,
  mapActividad,
  mapDocente,
  useDashboardData,
} from '../useDashboardData';
import { useDocenteHome, mapCursoDocente, mapHorarioBloquesToCourseSchedules } from '../useDocenteHome';
import { useEstudianteHome } from '../useEstudianteHome';
import { useDashboardGuardedNavigate } from '../useDashboardGuardedNavigate';

const wrapper = ({ children }) => <App>{children}</App>;

beforeEach(() => {
  vi.clearAllMocks();
  auth.value = { hasPermiso: () => true, usuario: { username: 'ana', vinculo_perfil: { nombre_completo: 'Ana Pérez' } } };
  Object.keys(casos).forEach((k) => delete casos[k]);
});

describe('mappers del dashboard', () => {
  it('buildImageUrl y mapCarreraToDashboard', () => {
    expect(buildImageUrl(null)).toBeNull();
    expect(buildImageUrl('/uploads/a.png')).toMatch(/\/uploads\/a\.png$/);
    expect(mapCarreraToDashboard(null)).toBeNull();
    expect(mapCarreraToDashboard({ id: 1, nombre: 'Sis', codigo: 'S', imagenUrl: 'http://x/i.png', color_hex: '#fff' })).toEqual({ id: 1, image: 'http://x/i.png', label: 'Sis', codigo: 'S', colorHex: '#fff' });
    expect(mapCarreraToDashboard({ id: 2, imagen_ruta: '/a.png' }).image).toMatch(/\/a\.png$/);
    expect(mapCarreraToDashboard({ id: 3 })).toMatchObject({ image: null, label: null, colorHex: '#1890ff' });
  });
  it('mapActividad y mapDocente', () => {
    expect(mapActividad(null)).toBeNull();
    const a = mapActividad({ titulo: 'T', detalle: 'D', ocurrido_en: new Date().toISOString(), artefacto_tipo: 'X', artefacto_id: 4, link_path: '/x' });
    expect(a).toMatchObject({ name: 'T', action: 'D', avatarSeed: 'ACT-X-4', linkPath: '/x' });
    expect(a.timeAgo).toBeTruthy();
    expect(mapActividad({})).toMatchObject({ name: '—', timeAgo: null, action: '' });
    expect(mapDocente(null)).toBeNull();
    expect(mapDocente({ id: 2, nombre_completo: 'N', titulo_profesional: 'Lic.' })).toEqual({ id: 2, name: 'N', description: 'Lic.', avatarSeed: 'DOCENTE-2' });
  });
  it('mapCursoDocente y bloques de horario', () => {
    expect(mapCursoDocente(null)).toBeNull();
    expect(mapCursoDocente({ id: 1, horasSemanales: 4, totalBloques: 0, estudiantes: '12' })).toMatchObject({ materia: 'Materia sin nombre', horasSemana: 4, bloques: null, estudiantes: 12 });
    expect(mapHorarioBloquesToCourseSchedules('x')).toEqual([]);
    const r = mapHorarioBloquesToCourseSchedules([
      { materiaSigla: 'MAT', materia: 'Mate', paralelo: 'A', dia: 'LUNES', horaInicio: '08:00', horaFin: '08:45', aula: 'A1' },
      { materiaSigla: 'MAT', paralelo: 'A', dia: 'MARTES' },
      { materia: 'Física' },
      null,
    ]);
    expect(r).toHaveLength(2);
    expect(r[0].bloques).toHaveLength(2);
    expect(r[1].cursoCodigo).toBe('Física');
  });
});

describe('useDashboardData', () => {
  it('carga el resumen y mapea cada sección', async () => {
    const ejecutar = vi.fn().mockResolvedValue({
      success: true,
      data: {
        actividades: [{ titulo: 'A' }],
        carreras: [{ id: 1, nombre: 'C' }],
        ultimosDocentes: [{ id: 2, nombre_completo: 'D' }],
        ultimosEstudiantes: [{ id: 3, nombre_completo: 'E', codigo_estudiante: 'E3' }, { id: 4 }],
        stats: { estudiantesRegistradosHoy: '2', participantesRegistradosMes: 5 },
      },
    });
    casos.obtenerDashboardResumen = () => ({ ejecutar });
    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.actividades).toHaveLength(1);
    expect(result.current.carreras[0].label).toBe('C');
    expect(result.current.ultimosEstudiantes.map((e) => e.description)).toEqual(['Código E3', '']);
    expect(result.current.stats).toEqual({ todayOrders: 2, monthOrders: 0, participantesHoy: 0, participantesMes: 5 });
    expect(result.current.puedeVerDetalleCarreras).toBe(true);
    await act(async () => {
      await result.current.refetch();
    });
    expect(ejecutar).toHaveBeenCalledTimes(2);
  });

  it('tolera secciones ausentes', async () => {
    casos.obtenerDashboardResumen = () => ({ ejecutar: vi.fn().mockResolvedValue({ success: true, data: {} }) });
    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.carreras).toEqual([]);
  });

  it('expone el error del backend o de la excepción', async () => {
    casos.obtenerDashboardResumen = () => ({ ejecutar: vi.fn().mockResolvedValue({ success: false, error: { message: 'Mal' } }) });
    const a = renderHook(() => useDashboardData());
    await waitFor(() => expect(a.result.current.loading).toBe(false));
    expect(a.result.current.error).toBe('Mal');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    casos.obtenerDashboardResumen = () => ({ ejecutar: vi.fn().mockRejectedValue(new Error('Red')) });
    const b = renderHook(() => useDashboardData());
    await waitFor(() => expect(b.result.current.error).toBe('Red'));
  });
});

describe('useDocenteHome', () => {
  it('mapea el resumen del docente', async () => {
    repo.obtenerMiResumenDocente.mockResolvedValue({
      success: true,
      data: {
        docente: { id: 1 },
        gestion: { anio: 2026, bimestre: 2 },
        cursos: [{ id: 1, estudiantes: 10 }, { id: 2, estudiantes: 5 }],
        horarioBloques: [{ materia: 'M', dia: 'LUNES' }],
        stats: { sesionesHoy: '1' },
        actividades: [{ titulo: 'A' }],
      },
    });
    const { result } = renderHook(() => useDocenteHome());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.docente.nombre).toBe('Ana Pérez');
    expect(result.current.carga.totalAsignaciones).toBe(2);
    expect(result.current.totalEstudiantes).toBe(15);
    expect(result.current.stats.sesionesHoy).toBe(1);
    expect(result.current.horarioCursos).toHaveLength(1);
  });
  it('no carga si está deshabilitado y reporta errores', async () => {
    const off = renderHook(() => useDocenteHome(false));
    expect(off.result.current.loading).toBe(false);
    expect(repo.obtenerMiResumenDocente).not.toHaveBeenCalled();
    repo.obtenerMiResumenDocente.mockResolvedValue({ success: false, error: 'Sin datos' });
    const { result } = renderHook(() => useDocenteHome());
    await waitFor(() => expect(result.current.error).toBe('Sin datos'));
    expect(result.current.cursos).toEqual([]);
  });
});

describe('useEstudianteHome', () => {
  it('mapea el resumen del estudiante', async () => {
    repo.obtenerMiResumen.mockResolvedValue({
      success: true,
      data: { estudiante: { codigo: 'E1' }, carrera: { id: 1, nombre: 'Sis' }, docentes: [{ id: 1 }], actividades: [], stats: {}, saldoPendiente: '120.6' },
    });
    const { result } = renderHook(() => useEstudianteHome());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.estudiante).toEqual({ nombre: 'Ana Pérez', codigo: 'E1' });
    expect(result.current.carrera.label).toBe('Sis');
    expect(result.current.saldoPendiente).toBe(121);
  });
  it('maneja error y deshabilitado', async () => {
    repo.obtenerMiResumen.mockResolvedValue({ success: false, error: { message: 'x' } });
    const { result } = renderHook(() => useEstudianteHome());
    await waitFor(() => expect(result.current.error).toBe('x'));
    expect(result.current.saldoPendiente).toBe(0);
    const off = renderHook(() => useEstudianteHome(false));
    expect(off.result.current.loading).toBe(false);
  });
});

describe('useDashboardGuardedNavigate', () => {
  it('navega si hay permiso y avisa si no', () => {
    const { result } = renderHook(() => useDashboardGuardedNavigate(), { wrapper });
    expect(result.current.navigateIfPermiso('/x', 'p.q')).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith('/x');
    auth.value = { ...auth.value, hasPermiso: () => false };
    const { result: denegado } = renderHook(() => useDashboardGuardedNavigate(), { wrapper });
    expect(denegado.current.navigateIfPermiso('/y', 'p.q')).toBe(false);
    expect(aviso.notifyAccessDenied).toHaveBeenCalled();
    expect(denegado.current.navigateIfPermiso('/z', null)).toBe(true);
  });
  it('navigateToPath consulta el permiso de la ruta', () => {
    const { result } = renderHook(() => useDashboardGuardedNavigate(), { wrapper });
    expect(result.current.navigateToPath('')).toBe(false);
    rutas.findBestMatchingRoute.mockReturnValue({ permiso: 'a.b' });
    expect(result.current.navigateToPath('/docentes/?q=1')).toBe(true);
    expect(rutas.findBestMatchingRoute).toHaveBeenCalledWith('/docentes');
    auth.value = { ...auth.value, hasPermiso: () => false };
    const { result: denegado } = renderHook(() => useDashboardGuardedNavigate(), { wrapper });
    expect(denegado.current.navigateToPath('/docentes')).toBe(false);
    rutas.findBestMatchingRoute.mockReturnValue(null);
    expect(denegado.current.navigateToPath('/libre')).toBe(true);
  });
});
