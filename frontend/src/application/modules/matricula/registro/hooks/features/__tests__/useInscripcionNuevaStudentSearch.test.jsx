import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { App } from 'antd';

const R = vi.hoisted(() => ({
  search: { students: [], loading: false, error: null, searchStudent: vi.fn(), refetch: vi.fn() },
  sugg: { students: [], loading: false, error: null, searchStudent: vi.fn() },
  byId: { student: null, loading: false, getStudentById: vi.fn() },
  calls: 0,
}));

vi.mock('@application-matricula/admision/hooks/api', () => ({
  // El hook se usa dos veces por render: la 1.ª llamada es la búsqueda, la 2.ª las sugerencias.
  useSearchStudentsForInscripcion: () => (R.calls++ % 2 === 0 ? R.search : R.sugg),
  useGetStudentById: () => R.byId,
}));

import { useInscripcionNuevaStudentSearch } from '../useInscripcionNuevaStudentSearch';

const wrapper = ({ children }) => <App>{children}</App>;
const render = (options) => {
  R.calls = 0;
  return renderHook(() => {
    R.calls = 0;
    return useInscripcionNuevaStudentSearch(options);
  }, { wrapper });
};

beforeEach(() => {
  vi.clearAllMocks();
  R.search = { students: [], loading: false, error: null, searchStudent: vi.fn(), refetch: vi.fn() };
  R.sugg = { students: [], loading: false, error: null, searchStudent: vi.fn() };
  R.byId = { student: null, loading: false, getStudentById: vi.fn() };
});

describe('useInscripcionNuevaStudentSearch', () => {
  it('carga las sugerencias una sola vez y las muestra mientras no se busque', () => {
    R.sugg.students = [{ id: 1, yaMatriculadoGestionActual: true }, { id: 2, esNuevoSistema: false }, { id: 3, esNuevoSistema: true }];
    const { result, rerender } = render();
    rerender();
    expect(R.sugg.searchStudent).toHaveBeenCalledTimes(1);
    expect(R.sugg.searchStudent).toHaveBeenCalledWith('', { soloNuevos: true, limit: 10 });
    expect(result.current.isShowingSuggestions).toBe(true);
    expect(result.current.students.map((s) => s.id)).toEqual([3, 2, 1]);
    act(() => result.current.retry());
    expect(R.sugg.searchStudent).toHaveBeenCalledTimes(2);
  });

  it('busca solo con dos o más caracteres y cambia a resultados', () => {
    R.search.students = [{ id: 9 }];
    R.search.error = 'mal';
    const { result } = render();
    act(() => result.current.searchStudent(' a '));
    expect(R.search.searchStudent).not.toHaveBeenCalled();
    act(() => result.current.searchStudent(' pérez '));
    expect(R.search.searchStudent).toHaveBeenCalledWith('pérez');
    expect(result.current.isShowingSuggestions).toBe(false);
    expect(result.current.students).toEqual([{ id: 9 }]);
    expect(result.current.error).toBe('mal');
    act(() => result.current.retry());
    expect(R.search.searchStudent).toHaveBeenCalledTimes(2);
    act(() => result.current.searchStudent(null));
    act(() => result.current.retry());
    expect(R.search.searchStudent).toHaveBeenCalledTimes(2);
  });

  it('con studentId no pide sugerencias y carga el estudiante', async () => {
    R.byId.student = {
      student: { id: 4, ci: '123', expedicion: 'LP', nombres: 'Ana', apellidoPaterno: 'Pérez', apellidoMaterno: 'Rojas', codigoEstudiante: 'E4' },
      academicData: { carreraId: 7, carreraNombre: 'Sistemas' },
      transfer: { anioCursado: 'PRIMERO' },
    };
    const { result } = render({ studentId: 4 });
    expect(R.sugg.searchStudent).not.toHaveBeenCalled();
    expect(R.byId.getStudentById).toHaveBeenCalledWith(4);
    await waitFor(() => expect(result.current.selectedStudent?.id).toBe(4));
    expect(result.current.selectedStudent).toMatchObject({ carreraId: 7, tipoAdmision: 'ANTIGUO', carreraNombre: 'Sistemas', traspasoAnioCursado: 'PRIMERO', codigoEstudiante: 'E4' });
    expect(result.current.selectedStudent.nombreCompleto).toContain('Pérez');
  });

  it('acepta distintas formas del payload del estudiante', async () => {
    R.byId.student = { id: 5, nombres: 'Luis' };
    const a = render({ studentId: 5 });
    await waitFor(() => expect(a.result.current.selectedStudent?.id).toBe(5));
    expect(a.result.current.selectedStudent.tipoAdmision).toBe('NUEVO');
    R.byId.student = { data: { student: { id: 6 } } };
    const b = render({ studentId: 6 });
    await waitFor(() => expect(b.result.current.selectedStudent?.id).toBe(6));
  });

  it('al elegir un estudiante bloquea los ya matriculados y completa la carrera si falta', () => {
    const { result } = render();
    act(() => result.current.onSelectStudent(null));
    act(() => result.current.onSelectStudent({ id: 1, nombreCompleto: 'Ana', yaMatriculadoGestionActual: true, gestionActualAnio: 2026 }));
    expect(result.current.selectedStudent).toBeNull();
    act(() => result.current.onSelectStudent({ id: 2, nombreCompleto: 'Luis', esNuevoSistema: true, totalInscripciones: 0 }));
    expect(result.current.selectedStudent).toMatchObject({ id: 2, tipoAdmision: 'NUEVO', esNuevoSistema: true });
    expect(R.byId.getStudentById).toHaveBeenCalledWith(2);
    const prev = result.current.selectedStudent;
    act(() => result.current.onSelectStudent({ id: 2, nombreCompleto: 'otro' }));
    expect(result.current.selectedStudent).toBe(prev);
    R.byId.getStudentById.mockClear();
    act(() => result.current.onSelectStudent({ id: 3, carrera_id: 4, carreraNombre: 'C' }));
    expect(result.current.selectedStudent).toMatchObject({ carreraId: 4, tipoAdmision: 'ANTIGUO' });
    expect(R.byId.getStudentById).not.toHaveBeenCalled();
  });

  it('al completar los datos del seleccionado rellena carrera y tipo de admisión', () => {
    const { result, rerender } = render();
    act(() => result.current.onSelectStudent({ id: 8, nombreCompleto: 'X' }));
    R.byId.student = { student: { id: 8 }, academicData: { careerId: 3, careerName: 'Contaduría' }, transfer: { anioCursado: 'SEGUNDO' } };
    rerender();
    expect(result.current.selectedStudent).toMatchObject({ careerId: 3, tipoAdmision: 'ANTIGUO', carreraNombre: 'Contaduría', traspasoAnioCursado: 'SEGUNDO' });
  });

  it('la carga por id se suma al estado de carga', () => {
    R.byId.loading = true;
    expect(render().result.current.loading).toBe(true);
  });
});
