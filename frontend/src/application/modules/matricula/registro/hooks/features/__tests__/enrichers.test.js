import { describe, it, expect, vi } from 'vitest';
import { enrichStudentListField, enrichStudentSearchField, studentEnrichers } from '../enrichers/studentEnrichers';
import { enrichParaleloListField, paraleloEnrichers } from '../enrichers/paraleloEnrichers';

describe('studentEnrichers', () => {
  it('conecta la búsqueda solo al campo de búsqueda de estudiante', () => {
    const onSearchStudent = vi.fn();
    expect(enrichStudentSearchField({ name: 'buscarEstudiante', type: 'search' }, { onSearchStudent }).onSearch).toBe(onSearchStudent);
    const otro = { name: 'otro', type: 'search' };
    expect(enrichStudentSearchField(otro, { onSearchStudent })).toBe(otro);
    expect(enrichStudentSearchField({ name: 'buscarEstudiante', type: 'search' })).toEqual({ name: 'buscarEstudiante', type: 'search' });
    expect(studentEnrichers).toHaveLength(2);
  });

  const campo = { name: 'resultadosEstudiantes', type: 'list' };

  it('ignora otros campos o sin contexto de búsqueda', () => {
    expect(enrichStudentListField({ name: 'x', type: 'list' }, {})).toEqual({ name: 'x', type: 'list' });
    expect(enrichStudentListField(campo)).toBe(campo);
  });

  it('sugerencias: encabezado fijo y sin agrupar', () => {
    const f = enrichStudentListField(campo, {
      studentSearch: { isShowingSuggestions: true, students: [{ id: 1, esNuevoSistema: true }], loading: true },
      onSelectStudent: 'sel',
    });
    expect(f.header).toBe('Estudiantes nuevos sin matrícula');
    expect(f.headerExtra).toEqual({ count: 1, hint: 'Registro más reciente primero' });
    expect(f.items[0].destacarNuevo).toBe(false);
    expect(f.groups).toBeNull();
    expect(f).toMatchObject({ loading: true, onSelect: 'sel', onRetry: null, selectedItem: null });
  });

  it('sugerencias vacías explican que todos tienen matrícula', () => {
    const f = enrichStudentListField(campo, { studentSearch: { isShowingSuggestions: true, students: [] } });
    expect(f.emptyTitle).toMatch(/No hay estudiantes nuevos/);
    expect(f.header).toBeNull();
    expect(f.headerExtra).toBeNull();
    expect(f.onSelect).toBeNull();
  });

  it('resultados: agrupa disponibles y ya matriculados, con conteos en singular y plural', () => {
    const students = [{ id: 1, esNuevoSistema: true }, { id: 2 }, { id: 3, yaMatriculadoGestionActual: true }];
    const f = enrichStudentListField(campo, { studentSearch: { students, selectedStudent: { id: 1 } } });
    expect(f.groups.map((g) => g.key)).toEqual(['disponibles', 'ya-matriculados']);
    expect(f.items[0].destacarNuevo).toBe(true);
    expect(f.headerExtra.hint).toBe('2 disponibles · 1 ya matriculado');
    expect(f.header).toBe('Resultados de la búsqueda');
    expect(f.selectedItem).toEqual({ id: 1 });
    const uno = enrichStudentListField(campo, { studentSearch: { students: [{ id: 1 }, { id: 2, yaMatriculadoGestionActual: true }] } });
    expect(uno.headerExtra.hint).toBe('1 disponible · 1 ya matriculado');
    const sinBloqueados = enrichStudentListField(campo, { studentSearch: { students: [{ id: 1 }] } });
    expect(sinBloqueados.groups).toBeNull();
    expect(sinBloqueados.headerExtra.hint).toMatch(/aparecen primero/);
  });

  it('resultados vacíos y error', () => {
    const vacio = enrichStudentListField(campo, { studentSearch: { students: [], searchTerm: 'pérez' } });
    expect(vacio.emptyTitle).toBe('Sin resultados para «pérez»');
    expect(vacio.emptyMessage).toMatch(/cédula/);
    const sinTermino = enrichStudentListField({ ...campo, emptyMessage: 'Nada' }, { studentSearch: { students: [] } });
    expect(sinTermino).toMatchObject({ emptyTitle: 'Sin resultados', emptyMessage: 'Nada' });
    const retry = vi.fn();
    const err = enrichStudentListField(campo, { studentSearch: { students: [], error: 'x', retry } });
    expect(err).toMatchObject({ status: 'error', onRetry: retry });
    expect(enrichStudentListField(campo, { studentSearch: { students: [], error: 'x' } }).onRetry).toBeNull();
  });
});

describe('paraleloEnrichers', () => {
  const campo = { name: 'listaParalelos', type: 'cards', required: true, emptyMessage: 'Sin paralelos' };
  const paralelosData = { paralelos: [{ id: 1, carreraId: 5 }, { id: 2, carreraId: 9 }], loading: true, selectedParalelo: { id: 1 } };

  it('ignora otros campos', () => {
    const otro = { name: 'otro', type: 'list' };
    expect(enrichParaleloListField(otro, { paralelosData })).toBe(otro);
    expect(enrichParaleloListField(campo, {})).toBe(campo);
    expect(paraleloEnrichers).toHaveLength(1);
  });

  it('oculta la lista hasta tener carrera y periodo', () => {
    const sinNada = enrichParaleloListField(campo, { paralelosData });
    expect(sinNada).toMatchObject({ items: [], hidden: true, required: false, onSelect: null });
    expect(sinNada.emptyMessage).toMatch(/Seleccione un periodo/);
    const soloPeriodo = enrichParaleloListField(campo, { paralelosData, periodosData: { selectedPeriodIds: [1] } });
    expect(soloPeriodo.emptyMessage).toBe('Seleccione una carrera para ver los paralelos disponibles.');
  });

  it('con carrera y periodo muestra los paralelos con el nombre de la carrera y permite elegir', () => {
    const onSelectParalelo = vi.fn();
    const f = enrichParaleloListField(campo, {
      paralelosData,
      onSelectParalelo,
      carrerasData: { carreras: [{ id: 5, nombre: 'Sistemas' }], selectedCarrera: { id: 5 } },
      periodosData: { selectedPeriod: { id: 3 } },
    });
    expect(f.items.map((p) => p.carreraNombre)).toEqual(['Sistemas', '']);
    expect(f).toMatchObject({ hidden: false, required: true, loading: true, emptyMessage: 'Sin paralelos', selectedItem: { id: 1 } });
    f.onSelect({ id: 2 }, 1);
    f.onSelect(null, 0);
    expect(onSelectParalelo).toHaveBeenCalledTimes(1);
    const porId = enrichParaleloListField({ name: 'listaParalelos', type: 'list' }, {
      paralelosData: { paralelos: undefined },
      carreraIdForParalelos: 5,
      periodosData: { selectedPeriodIds: [1] },
    });
    expect(porId.emptyMessage).toMatch(/No hay paralelos disponibles/);
    expect(porId.required).toBe(false);
    expect(porId.selectedItem).toBeNull();
  });
});
