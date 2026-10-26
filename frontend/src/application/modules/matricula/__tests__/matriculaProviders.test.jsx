import { useContext } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const R = vi.hoisted(() => ({
  list: { config: null, ret: null },
  del: vi.fn(),
  refetch: vi.fn(),
  filtros: {},
  pagoGet: { getPagoById: vi.fn(), refetch: vi.fn(), pago: { id: 1 }, loading: false, error: null },
  pagosData: { pagos: [] },
  regData: { loading: false },
  regCalls: [],
}));

vi.mock('@application/utils', async (orig) => ({
  ...(await orig()),
  useServerPaginatedList: (config) => {
    R.list.config = config;
    return R.list.ret;
  },
  useMessage: () => vi.fn(),
}));
vi.mock('@application-matricula/admision/hooks/api/useEstudiantesApi', () => ({ useEstudiantesApi: () => ({ fetch: 'fetchEst' }) }));
vi.mock('@application-matricula/admision/hooks/api/useDeleteStudent', () => ({ useDeleteStudent: () => ({ deleteStudent: R.del, loading: false }) }));
vi.mock('@application-matricula/becas/hooks/api/useBecasAsignadasApi', () => ({ useBecasAsignadasApi: () => ({ fetch: 'fetchBecas' }) }));
vi.mock('@application-matricula/admision/hooks/api/useDeleteBecaAsignada', () => ({ useDeleteBecaAsignada: () => ({ deleteBecaAsignada: R.del, loading: true }) }));
vi.mock('@application-matricula/registro/hooks/api/useInscripcionesApi', () => ({ useInscripcionesApi: () => ({ fetch: 'fetchInsc' }) }));
vi.mock('@application-matricula/registro/hooks/api/useDeleteInscripcion', () => ({ useDeleteInscripcion: () => ({ deleteInscripcion: R.del, loading: false }) }));
vi.mock('@application-matricula/registro/hooks/state/matricula-list/useMatriculaListFilters', () => ({ useMatriculaListFilters: () => R.filtros }));
vi.mock('../aportes/hooks', () => ({
  usePagosApi: () => ({ fetch: 'fetchPagos' }),
  useDeletePagoAporte: () => ({ deletePagoAporte: R.del, loading: false }),
  useGetPagoById: () => R.pagoGet,
  usePagosData: () => R.pagosData,
  usePagosRegistrarData: (id) => (R.regCalls.push(id), R.regData),
}));

import { StudentListProvider } from '../admision/providers/StudentListProvider';
import { BecasListProvider } from '../becas/providers/BecasListProvider';
import { InscripcionesListProvider } from '../registro/providers/InscripcionesListProvider';
import { PagosListProvider } from '../aportes/providers/PagosListProvider';
import { PagosDetailProvider } from '../aportes/providers/PagosDetailProvider';
import { PagosProvider } from '../aportes/providers/PagosProvider';
import { PagosRegistrarProvider } from '../aportes/providers/PagosRegistrarProvider';
import { StudentListContext } from '../admision/context/StudentListContext';
import { BecasListContext } from '../becas/context/BecasListContext';
import { InscripcionesListContext } from '../registro/context/InscripcionesListContext';
import { PagosListContext } from '../aportes/context/PagosListContext';
import { PagosDetailContext } from '../aportes/context/PagosDetailContext';
import { PagosContext } from '../aportes/context/PagosContext';
import { PagosRegistrarContext } from '../aportes/context/PagosRegistrarContext';

/** Monta el provider y devuelve el valor de contexto que recibe un consumidor. */
const valorDe = (Provider, Context, props = {}, route = '/') => {
  const { result } = renderHook(() => useContext(Context), {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[route]}>
        <Provider {...props}>{children}</Provider>
      </MemoryRouter>
    ),
  });
  return result;
};

const baseList = () => ({
  rows: [{ id: 1 }],
  loading: false,
  error: null,
  searchText: 'q',
  setSearchText: vi.fn(),
  tablePagination: { current: 1 },
  refetch: R.refetch,
  pagination: { total: 10 },
});

beforeEach(() => {
  vi.clearAllMocks();
  R.list.ret = baseList();
  R.del.mockResolvedValue({ success: true });
  R.filtros = {
    filters: { carreraId: 1, paraleloId: null, periodoId: 3, tipoInscripcion: 'NUEVO', historialPrevioEstado: null },
    setFilter: vi.fn(),
    clearFilters: vi.fn(),
    hasActiveFilters: true,
    filterOptions: { carreras: [] },
    paralelosForCarrera: [],
    tipoInscripcionOptions: [],
    historialEstadoOptions: [],
  };
});

describe('listas con paginación del servidor', () => {
  it('estudiantes: expone filas, arma la petición y refresca tras eliminar', async () => {
    const r = valorDe(StudentListProvider, StudentListContext);
    expect(r.current.estudiantes).toEqual([{ id: 1 }]);
    expect(R.list.config.fetch).toBe('fetchEst');
    expect(R.list.config.buildRequest({ page: 2, limit: 10, search: '' })).toEqual({ params: { page: 2, limit: 10, search: undefined, sort: 'created_at:DESC' } });
    await act(async () => {
      await r.current.deleteStudent(4);
    });
    expect(R.del).toHaveBeenCalledWith(4);
    expect(R.refetch).toHaveBeenCalledTimes(1);
    R.del.mockResolvedValueOnce({ success: false });
    await act(async () => {
      await r.current.deleteStudent(5);
    });
    expect(R.refetch).toHaveBeenCalledTimes(1);
  });

  it('becas: filtra por scholarshipId de la URL y suma el estado de borrado', async () => {
    const r = valorDe(BecasListProvider, BecasListContext, {}, '/becas?scholarshipId=8');
    expect(r.current.loading).toBe(true);
    expect(R.list.config.extra).toEqual({ scholarshipId: '8' });
    expect(R.list.config.buildRequest({ page: 1, limit: 5, search: 'x', extra: R.list.config.extra }).params).toMatchObject({ search: 'x', scholarshipId: '8' });
    expect(R.list.config.mapResponse({ data: { becas: [{ id: 1 }] }, pagination: { total: 1 } })).toBeDefined();
    await act(async () => {
      await r.current.deleteBeca(1);
    });
    expect(R.refetch).toHaveBeenCalled();
    valorDe(BecasListProvider, BecasListContext);
    expect(R.list.config.extra).toBeNull();
  });

  it('inscripciones: traduce los filtros a parámetros del listado', async () => {
    const r = valorDe(InscripcionesListProvider, InscripcionesListContext);
    expect(R.list.config.extra).toEqual({
      carrera_id: 1,
      paralelo_id: undefined,
      periodo_id: 3,
      tipo_inscripcion: 'NUEVO',
      historial_previo_estado: undefined,
    });
    expect(R.list.config.buildRequest({ page: 1, limit: 5, search: 'a', extra: { carrera_id: 1 } }).params).toMatchObject({ sort: 'fecha_inscripcion:DESC', carrera_id: 1 });
    expect(r.current).toMatchObject({ totalBeforeFilters: 10, hasActiveListFilters: true, listFilters: R.filtros.filters });
    await act(async () => {
      await r.current.deleteInscripcion(2);
    });
    expect(R.refetch).toHaveBeenCalled();
  });

  it('pagos: ordena por fecha de pago descendente', async () => {
    const r = valorDe(PagosListProvider, PagosListContext);
    expect(R.list.config.buildRequest({ page: 1, limit: 5, search: undefined }).params.sort).toBe('fecha_pago:DESC');
    expect(r.current.pagos).toEqual([{ id: 1 }]);
    await act(async () => {
      await r.current.deletePago(2);
    });
    expect(R.refetch).toHaveBeenCalled();
  });
});

describe('providers de pagos', () => {
  it('detalle: carga el pago por id y recarga con el mismo id', () => {
    const r = valorDe(PagosDetailProvider, PagosDetailContext, { pagoId: 12 });
    expect(R.pagoGet.getPagoById).toHaveBeenCalledWith(12);
    r.current.refetch();
    expect(R.pagoGet.refetch).toHaveBeenCalledWith(12);
    expect(r.current.pago).toEqual({ id: 1 });
    R.pagoGet.getPagoById.mockClear();
    valorDe(PagosDetailProvider, PagosDetailContext, {});
    expect(R.pagoGet.getPagoById).not.toHaveBeenCalled();
  });

  it('PagosProvider y PagosRegistrarProvider publican el estado de sus hooks', () => {
    expect(valorDe(PagosProvider, PagosContext).current).toBe(R.pagosData);
    expect(valorDe(PagosRegistrarProvider, PagosRegistrarContext, { studentId: 9 }).current).toBe(R.regData);
    expect(R.regCalls).toContain(9);
  });
});

describe('StudentRegisterProvider', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('compone catálogos y carga gestiones según el tipo de admisión', async () => {
    const S = {
      catalog: { documentacion: [{ id: 1 }], documentacionTraspaso: [], paises: [] },
      geo: { loadDepartamentos: vi.fn(), loadProvincias: vi.fn(), loadMunicipios: vi.fn() },
      ref: { loadTiposParentesco: vi.fn(), loadDiscapacidades: vi.fn() },
      gest: { gestiones: [{ id: 1 }], loading: false, error: null, fetch: vi.fn() },
      handlers: { formRef: {}, handleFinish: vi.fn(), handleSave: vi.fn(), registerForm: vi.fn(), saveStep0Values: vi.fn(), getStep0Values: vi.fn(), loading: false, error: null, validationErrors: null, registrationResult: null },
      catalogArgs: [],
    };
    vi.doMock('@application-matricula/admision/hooks', () => ({
      useStudentCatalogApi: (d) => (S.catalogArgs.push(d), S.catalog),
      useStudentGeographicApi: () => S.geo,
    }));
    vi.doMock('@application/utils', async (orig) => ({ ...(await orig()), useMessage: () => vi.fn() }));
    vi.doMock('@application-configuracion/academico/hooks', () => ({ useCarrerasApi: () => ({ carreras: [{ id: 2 }], loading: false, error: null }) }));
    vi.doMock('@application-matricula/nuevo/hooks/api/useGestionesApi', () => ({ useGestionesApi: () => S.gest }));
    vi.doMock('@application-matricula/nuevo/hooks/api/useStudentReferenceApi', () => ({ useStudentReferenceApi: () => S.ref }));
    vi.doMock('@application-matricula/nuevo/hooks/features/useStudentFormOptions', () => ({ useStudentFormOptions: () => 'resolveOptions' }));
    vi.doMock('@application-matricula/nuevo/hooks/features/useStudentFormHandlers', () => ({ useStudentFormHandlers: () => S.handlers }));
    vi.doMock('@application-matricula/nuevo/hooks/features/useDocumentacionProcesada', () => ({ useDocumentacionProcesada: (d) => ({ documentacion: d }) }));
    vi.doMock('@application-matricula/nuevo/hooks/features/useContactosEmergenciaDinamicos', () => ({
      useContactosEmergenciaDinamicos: () => ({ contactosIndices: [0], agregarContacto: vi.fn(), eliminarContacto: vi.fn() }),
    }));
    const { StudentRegisterProvider } = await import('../nuevo/providers/StudentRegisterProvider');
    const { StudentRegisterContext } = await import('../nuevo/context/StudentRegisterContext');

    let ctx;
    const Consumidor = () => {
      ctx = useContext(StudentRegisterContext);
      return null;
    };
    const { unmount } = render(
      <StudentRegisterProvider mode="create">
        <Consumidor />
      </StudentRegisterProvider>,
    );
    expect(S.ref.loadTiposParentesco).toHaveBeenCalledTimes(1);
    expect(ctx).toMatchObject({ resolveOptions: 'resolveOptions', gestiones: [{ id: 1 }], carreras: [{ id: 2 }], contactosIndices: [0], instituciones: [] });
    expect(ctx.documentacionRaw).toEqual([{ id: 1 }]);
    act(() => ctx.cargarGestiones('ANTIGUO'));
    expect(S.gest.fetch).toHaveBeenLastCalledWith({ params: { vigente: 0 } });
    act(() => ctx.cargarGestiones('TRASPASO'));
    expect(S.gest.fetch).toHaveBeenLastCalledWith();
    S.gest.fetch.mockClear();
    act(() => ctx.cargarGestiones('NUEVO'));
    expect(S.gest.fetch).not.toHaveBeenCalled();
    unmount();

    vi.useFakeTimers();
    S.ref.loadTiposParentesco.mockClear();
    render(
      <StudentRegisterProvider mode="edit" studentId={3}>
        <Consumidor />
      </StudentRegisterProvider>,
    );
    expect(S.catalogArgs).toContain(300);
    expect(S.ref.loadTiposParentesco).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    expect(S.ref.loadTiposParentesco).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
    await waitFor(() => expect(ctx).toBeTruthy());
  });
});
