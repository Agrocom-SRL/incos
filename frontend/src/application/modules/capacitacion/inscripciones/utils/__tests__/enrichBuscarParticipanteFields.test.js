import { describe, it, expect, vi } from 'vitest';
import {
  CAMPO_BUSCAR_PARTICIPANTE,
  CAMPO_RESULTADOS_PARTICIPANTES,
  enrichBuscarParticipanteFields,
} from '../enrichBuscarParticipanteFields';

const fields = [
  { name: CAMPO_BUSCAR_PARTICIPANTE, type: 'search' },
  { name: CAMPO_RESULTADOS_PARTICIPANTES, type: 'list', emptyMessage: 'vacío por defecto' },
  { name: 'otro', type: 'input' },
];

const libre = { id: 1, cursoActualId: null };
const inscrito = { id: 2, cursoActualId: 9 };

const lista = (ctx) =>
  enrichBuscarParticipanteFields(fields, ctx).find((f) => f.name === CAMPO_RESULTADOS_PARTICIPANTES);

describe('enrichBuscarParticipanteFields', () => {
  it('el campo search recibe onSearch que delega en onBuscar y deja el resto intacto', () => {
    const onBuscar = vi.fn();
    const [search, , otro] = enrichBuscarParticipanteFields(fields, { onBuscar });
    search.onSearch('ana');
    search.onSearch(undefined);
    expect(onBuscar).toHaveBeenNthCalledWith(1, 'ana');
    expect(onBuscar).toHaveBeenNthCalledWith(2, '');
    expect(otro).toBe(fields[2]);
  });

  it('sin búsqueda: muestra sugeridos, sin pill «Nuevo», con cabecera de sugerencias', () => {
    const f = lista({ searchAttempted: false, sugeridos: [libre], participantes: [inscrito] });
    expect(f.items).toHaveLength(1);
    expect(f.items[0]).toMatchObject({ id: 1, yaInscrito: false, destacarNuevo: false });
    expect(f.header).toBe('Participantes sin inscripción vigente');
  });

  it('con búsqueda: muestra resultados marcando «ya inscrito» y «nuevo»', () => {
    const f = lista({ searchAttempted: true, participantes: [libre, inscrito], sugeridos: [] });
    expect(f.items.map((p) => [p.yaInscrito, p.destacarNuevo])).toEqual([
      [false, true],
      [true, false],
    ]);
    expect(f.header).toBe('Resultados de la búsqueda');
    expect(f.headerExtra).toMatchObject({ count: 2 });
    expect(f.headerExtra.hint).toContain('1 ya inscrito');
  });

  it('selección y carga según la fuente activa', () => {
    const onSeleccionar = vi.fn();
    const f = lista({
      searchAttempted: true,
      loadingBusqueda: true,
      loadingSugeridos: false,
      participanteSeleccionado: libre,
      onSeleccionar,
    });
    expect(f.loading).toBe(true);
    expect(f.selectedItem).toBe(libre);
    expect(f.onSelect).toBe(onSeleccionar);
  });

  it('estados vacíos: sin resultados, sin sugeridos y error', () => {
    const sinResultados = lista({ searchAttempted: true, searchText: 'zzz', participantes: [] });
    expect(sinResultados.emptyTitle).toBe('Sin resultados para «zzz»');
    expect(sinResultados.emptyMessage).toBe('vacío por defecto');
    expect(sinResultados.header).toBeNull();

    const sinSugeridos = lista({ searchAttempted: false, sugeridos: [] });
    expect(sinSugeridos.emptyTitle).toBe('No hay participantes sin inscripción vigente');

    const conError = lista({ searchAttempted: true, errorBusqueda: 'Falló' });
    expect(conError.status).toBe('error');
    expect(conError.emptyMessage).toBe('Falló');
  });
});
