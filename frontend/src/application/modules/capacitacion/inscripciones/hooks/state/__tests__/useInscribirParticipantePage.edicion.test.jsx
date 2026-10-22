import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const ctx = vi.hoisted(() => ({ value: {} }));
const nav = vi.hoisted(() => ({ navigate: vi.fn() }));
const msg = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }));
const formMock = vi.hoisted(() => ({
  validateFields: vi.fn(),
  getFieldsValue: vi.fn(() => ({})),
  getFieldValue: vi.fn(),
  setFieldsValue: vi.fn(),
  scrollToField: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => nav.navigate,
  useLocation: () => ({ state: null }),
}));
vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    App: { useApp: () => ({ message: msg }) },
    Form: { ...actual.Form, useForm: () => [formMock] },
  };
});
vi.mock(
  '@application-capacitacion/inscripciones/hooks/context/useInscribirParticipanteContext',
  () => ({ useInscribirParticipanteContext: () => ctx.value }),
);

import { InscripcionCapacitacionDetailContext } from '@application-capacitacion/inscripciones/context/InscripcionCapacitacionDetailContext';
import { useInscribirParticipantePage } from '../useInscribirParticipantePage';

const grupos = [
  { id: 5, nombre: 'Regular' },
  { id: 6, nombre: 'Intensivo' },
];
const curso = { id: 10, titulo: 'Guaraní', cobraMatricula: true, costoMatricula: 150, grupos, requisitos: [] };

const inscripcion = {
  id: 1,
  estado: 'INSCRITO',
  participanteId: 3,
  participanteNombreCompleto: 'NOCO IPAVARI MAYERLYN',
  participanteCiCompleto: '11340857',
  capacitacionId: 10,
  capacitacionGrupoId: 5,
  requisitos: [
    { requisitoId: 1, descripcion: 'CI', obligatorio: true, entregado: true },
    { requisitoId: 2, descripcion: 'Foto', obligatorio: false, entregado: false },
  ],
};

const buildInscribirCtx = (extra = {}) => ({
  participantes: [],
  loadingBusqueda: false,
  errorBusqueda: null,
  buscarParticipantes: vi.fn(),
  sugeridos: [],
  loadingSugeridos: false,
  cargarSugeridos: vi.fn(),
  cursos: [],
  loadingCursos: false,
  errorCursos: null,
  cursoDetalle: curso,
  loadingCursoDetalle: false,
  errorCursoDetalle: null,
  cargarCursoDetalle: vi.fn().mockResolvedValue({ success: true, data: curso }),
  metodosPago: [],
  cuentasPago: [],
  loadingCatalogos: false,
  errorCatalogos: null,
  inscribir: vi.fn(),
  inscribiendo: false,
  ...extra,
});

const detalleCtx = {
  inscripcionId: 1,
  inscripcion,
  loading: false,
  error: null,
  actualizarInscripcion: vi.fn(),
  actualizandoInscripcion: false,
  guardarRequisitos: vi.fn(),
  guardandoRequisitos: false,
};

const wrapperEdicion = ({ children }) => (
  <InscripcionCapacitacionDetailContext.Provider value={detalleCtx}>
    {children}
  </InscripcionCapacitacionDetailContext.Provider>
);

describe('useInscribirParticipantePage · edición (mismo formulario)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ctx.value = buildInscribirCtx();
    detalleCtx.actualizarInscripcion = vi.fn().mockResolvedValue({ success: true });
    detalleCtx.guardarRequisitos = vi.fn().mockResolvedValue({ success: true });
  });

  it('precarga participante, curso, grupo y requisitos y no carga sugeridos', () => {
    const { result } = renderHook(() => useInscribirParticipantePage(), { wrapper: wrapperEdicion });
    expect(result.current.esEdicion).toBe(true);
    expect(result.current.pageTitle).toBe('Editar inscripción');
    expect(result.current.permisoAccion).toBe('EDITAR');
    expect(result.current.participanteSeleccionado).toMatchObject({ id: 3 });
    expect(result.current.cursoSeleccionadoId).toBe(10);
    expect(result.current.capacitacionGrupoId).toBe(5);
    expect(result.current.requisitosEntregados).toEqual([1]);
    expect(ctx.value.cargarSugeridos).not.toHaveBeenCalled();
    expect(ctx.value.cargarCursoDetalle).toHaveBeenCalledWith(10);
  });

  it('usa los mismos pasos del alta, sin pago, con participante y curso de solo lectura', () => {
    const { result } = renderHook(() => useInscribirParticipantePage(), { wrapper: wrapperEdicion });
    expect(result.current.wizardSteps.map((s) => s.formTitle)).toEqual([
      'Datos del participante',
      'Curso de capacitación',
      'Grupo y requisitos',
      'Resumen de la inscripción',
    ]);
    expect(result.current.wizardSteps[0].description).toMatch(/No se puede cambiar/);
    expect(result.current.ofrecePago).toBe(false);
  });

  it('no deja cambiar el participante ni el curso', async () => {
    const { result } = renderHook(() => useInscribirParticipantePage(), { wrapper: wrapperEdicion });
    act(() => result.current.handleSeleccionarParticipante({ id: 99, nombreCompleto: 'Otro' }));
    await act(async () => {
      await result.current.handleCursoChange(77);
    });
    expect(result.current.participanteSeleccionado.id).toBe(3);
    expect(result.current.cursoSeleccionadoId).toBe(10);
  });

  it('guardar con otro grupo envía SOLO capacitacionGrupoId y vuelve al detalle', async () => {
    const { result } = renderHook(() => useInscribirParticipantePage(), { wrapper: wrapperEdicion });
    act(() => result.current.setCapacitacionGrupoId(6));
    await act(async () => {
      await result.current.handleFinish();
    });
    expect(detalleCtx.actualizarInscripcion).toHaveBeenCalledWith({ capacitacionGrupoId: 6 });
    expect(detalleCtx.guardarRequisitos).not.toHaveBeenCalled();
    expect(nav.navigate).toHaveBeenCalledWith(
      '/capacitacion/inscripciones/1',
      expect.objectContaining({ replace: true, state: expect.not.objectContaining({ descargarFormulario: true }) }),
    );
  });

  it('cambiar requisitos envía el checklist completo', async () => {
    const { result } = renderHook(() => useInscribirParticipantePage(), { wrapper: wrapperEdicion });
    act(() => result.current.setRequisitosEntregados([1, 2]));
    await act(async () => {
      await result.current.handleFinish();
    });
    expect(detalleCtx.actualizarInscripcion).not.toHaveBeenCalled();
    expect(detalleCtx.guardarRequisitos).toHaveBeenCalledWith([
      expect.objectContaining({ requisitoId: 1, entregado: true }),
      expect.objectContaining({ requisitoId: 2, entregado: true }),
    ]);
  });

  it('sin cambios no llama al backend', async () => {
    const { result } = renderHook(() => useInscribirParticipantePage(), { wrapper: wrapperEdicion });
    await act(async () => {
      await result.current.handleFinish();
    });
    expect(detalleCtx.actualizarInscripcion).not.toHaveBeenCalled();
    expect(detalleCtx.guardarRequisitos).not.toHaveBeenCalled();
    expect(msg.info).toHaveBeenCalled();
  });
});

describe('useInscribirParticipantePage · alta', () => {
  it('al crear navega a la ficha pidiendo la descarga inicial del formulario', async () => {
    ctx.value = buildInscribirCtx({
      cursoDetalle: null,
      cursos: [curso],
      inscribir: vi.fn().mockResolvedValue({ success: true, data: { id: 42 } }),
    });
    const { result } = renderHook(() => useInscribirParticipantePage());
    expect(result.current.esEdicion).toBe(false);
    act(() => result.current.handleSeleccionarParticipante({ id: 3, nombreCompleto: 'X' }));
    await act(async () => {
      await result.current.handleCursoChange(10);
    });
    await act(async () => {
      await result.current.handleFinish();
    });
    expect(nav.navigate).toHaveBeenCalledWith(
      '/capacitacion/inscripciones/42',
      expect.objectContaining({ state: expect.objectContaining({ descargarFormulario: true }) }),
    );
  });
});
