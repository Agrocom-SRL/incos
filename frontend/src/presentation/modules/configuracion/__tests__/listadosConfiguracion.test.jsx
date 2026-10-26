import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndContext } from '@dnd-kit/core';
import { permiso } from '@/test/renderWithProviders';
import { describeCatalogListPage } from '@/test/pageContracts';
import { renderCell, renderCells } from '@/test/renderColumns';
import ActividadesList from '../actividades/pages/ActividadesList';
import DocumentacionListPage from '../documentacion/pages/DocumentacionListPage';
import AulasList from '../recursos/pages/AulasList';
import ParalelosList from '../recursos/pages/ParalelosList';
import TiposEvaluacionList from '../recursos/pages/TiposEvaluacionList';
import ApoderadosTabPanel from '../complementarios/pages/ApoderadosTabPanel';
import EstadosCivilesTabPanel from '../complementarios/pages/EstadosCivilesTabPanel';
import IdiomasTabPanel from '../complementarios/pages/IdiomasTabPanel';
import DiscapacidadesList from '../complementarios/pages/DiscapacidadesList';
import CarrerasList from '../academico/pages/CarrerasList';
import MateriasList from '../academico/pages/MateriasList';
import { createCarrerasTableColumns } from '../academico/config/carrerasTableColumns';
import { createMateriasTableColumns } from '../academico/config/materiasTableColumns';
import CarreraAreaDescripcionCell from '../academico/components/atoms/CarreraAreaDescripcionCell';
import CarreraMetricasCell from '../academico/components/atoms/CarreraMetricasCell';
import CarreraTituloDotCell from '../academico/components/atoms/CarreraTituloDotCell';
import MateriaCatalogoChip from '../academico/components/atoms/MateriaCatalogoChip';
import PlanHorasCell from '../academico/components/atoms/PlanHorasCell';

const mocks = vi.hoisted(() => {
  const m = {};
  ['actividad', 'documentacion', 'aula', 'paralelo', 'tipoEvaluacion', 'apoderado', 'estadoCivil', 'idioma', 'discapacidad', 'carrera', 'materia'].forEach((k) => { m[k] = vi.fn(); });
  return m;
});

vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('@application-configuracion/actividades/hooks', async (orig) => ({ ...(await orig()), useActividadContext: mocks.actividad }));
vi.mock('@application-configuracion/documentacion/hooks', async (orig) => ({ ...(await orig()), useDocumentacionContext: mocks.documentacion }));
vi.mock('@application-configuracion/recursos/hooks', async (orig) => ({
  ...(await orig()),
  useAulaContext: mocks.aula,
  useParaleloContext: mocks.paralelo,
  useTipoEvaluacionContext: mocks.tipoEvaluacion,
}));
vi.mock('@application-configuracion/complementarios/hooks', async (orig) => ({
  ...(await orig()),
  useApoderadoContext: mocks.apoderado,
  useEstadoCivilContext: mocks.estadoCivil,
  useIdiomaContext: mocks.idioma,
  useDiscapacidadContext: mocks.discapacidad,
}));
vi.mock('@application-configuracion/academico/hooks', async (orig) => ({
  ...(await orig()),
  useCarreraContext: mocks.carrera,
  useMateriaContext: mocks.materia,
}));

const nombre = { id: 1, nombre: 'Entidad de prueba', activo: true };
const TEXTO = 'ENTIDAD DE PRUEBA';

describeCatalogListPage({ name: 'Actividades', Page: ActividadesList, useHook: mocks.actividad, itemsKey: 'actividades', record: nombre, recordText: TEXTO, permisoCodigo: 'configuracion.actividad', newLabel: 'Nueva actividad', searchPlaceholder: 'Buscar por nombre, descripción o icono...' });
describeCatalogListPage({ name: 'Documentación', Page: DocumentacionListPage, useHook: mocks.documentacion, itemsKey: 'documentacion', record: nombre, recordText: TEXTO, permisoCodigo: 'configuracion.documentacion', newLabel: 'Nuevo documento', searchPlaceholder: 'Buscar por nombre, tipo o descripción...' });
describeCatalogListPage({ name: 'Apoderados', Page: ApoderadosTabPanel, useHook: mocks.apoderado, itemsKey: 'apoderados', record: nombre, recordText: TEXTO, permisoCodigo: 'configuracion.complementario.apoderados', newLabel: 'Nuevo apoderado', searchPlaceholder: 'Buscar por nombre o descripción...', embedded: true });
describeCatalogListPage({ name: 'Estados civiles', Page: EstadosCivilesTabPanel, useHook: mocks.estadoCivil, itemsKey: 'estadosCiviles', record: nombre, recordText: TEXTO, permisoCodigo: 'configuracion.complementario.estado-civil', newLabel: 'Nuevo estado civil', searchPlaceholder: 'Buscar por nombre o abreviatura...', embedded: true });
describeCatalogListPage({ name: 'Idiomas', Page: IdiomasTabPanel, useHook: mocks.idioma, itemsKey: 'idiomas', record: nombre, recordText: TEXTO, permisoCodigo: 'configuracion.complementario.idiomas', newLabel: 'Nuevo idioma', searchPlaceholder: 'Buscar por nombre o código ISO...', embedded: true });
describeCatalogListPage({ name: 'Tipos de discapacidad', Page: DiscapacidadesList, useHook: mocks.discapacidad, itemsKey: 'discapacidades', record: nombre, recordText: TEXTO, permisoCodigo: 'configuracion.complementario.discapacidad', newLabel: 'Nuevo tipo de discapacidad', searchPlaceholder: 'Buscar por nombre o descripción...', embedded: true });
describeCatalogListPage({ name: 'Carreras', Page: CarrerasList, useHook: mocks.carrera, itemsKey: 'carreras', record: nombre, recordText: TEXTO, permisoCodigo: 'configuracion.carrera', newLabel: 'Nueva carrera', searchPlaceholder: 'Buscar por código, nombre, área o título...', embedded: true });
describeCatalogListPage({ name: 'Materias', Page: MateriasList, useHook: mocks.materia, itemsKey: 'materias', record: nombre, recordText: TEXTO, permisoCodigo: 'configuracion.materia', newLabel: 'Nueva materia', searchPlaceholder: 'Buscar por sigla, nombre o clasificación...', embedded: true });

describe('listados de recursos (el alta vive en la página contenedora)', () => {
  const estado = (key, extra = {}) => ({ [key]: [nombre], loading: false, error: null, searchText: '', setSearchText: vi.fn(), refetch: vi.fn(), toggleEstado: vi.fn(), ...extra });

  it.each([
    ['Aulas', AulasList, 'aula', 'aulas', 'Buscar por código, nombre, categoría u observaciones...'],
    ['Paralelos', ParalelosList, 'paralelo', 'paralelos', 'Buscar por nombre, carrera, periodo o turno...'],
    ['Tipos de evaluación', TiposEvaluacionList, 'tipoEvaluacion', 'tiposEvaluacion', 'Buscar por código, nombre o descripción...'],
  ])('%s: lista, busca y muestra el error', async (_n, Page, hook, key, placeholder) => {
    const s = estado(key);
    mocks[hook].mockReturnValue(s);
    const { unmount } = (await import('@/test/renderWithProviders')).renderWithProviders(<Page embedded />);
    await userEvent.type(screen.getByPlaceholderText(placeholder), 'a');
    expect(s.setSearchText).toHaveBeenCalledWith('a');
    expect(screen.getAllByText(/ENTIDAD DE PRUEBA|SIN CARRERA/).length).toBeGreaterThan(0);
    unmount();
    mocks[hook].mockReturnValue(estado(key, { [key]: [], error: 'Falla de red' }));
    (await import('@/test/renderWithProviders')).renderWithProviders(<Page />);
    expect(screen.getByText(/Falla de red/)).toBeInTheDocument();
  });
});

describe('columnas de carreras y materias', () => {
  const c = () => ({ navigate: vi.fn(), listNavState: { s: 1 }, refetch: vi.fn() });

  it('carreras: celdas, orden y acciones', async () => {
    const cols = createCarrerasTableColumns(c());
    const textos = Object.values(renderCells(cols, { id: 3, codigo: 'SIS', nombre: 'Sistemas', areaFormacion: 'Tecnología', tituloOtorgado: 'Técnico Superior', cantidadMaterias: 30, cantidadPeriodos: 6, colorHex: '#112233' })).join(' | ');
    expect(textos).toMatch(/SISTEMAS/);
    expect(textos).toMatch(/Tecnología/);
    expect(textos).toMatch(/30 materias/);
    expect(cols[4].sortCompare({ cantidadMaterias: 5 }, {})).toBe(5);
    expect(cols[3].sortCompare({ tituloOtorgado: 'A' }, { tituloOtorgado: 'B' })).toBeLessThan(0);
    const nav = c();
    const acciones = createCarrerasTableColumns(nav).at(-1);
    const { unmount } = renderCell(acciones, { id: 3, nombre: 'Sistemas' }, { auth: { permisos: [permiso('configuracion.carrera', 'DETALLE', 'EDITAR')] } });
    await userEvent.click(screen.getByRole('button', { name: 'eye' }));
    expect(nav.navigate).toHaveBeenCalledWith(expect.stringContaining('3'), { state: { s: 1 } });
    unmount();
  });

  it('materias: tipo, clasificación y acciones', async () => {
    const cols = createMateriasTableColumns(c());
    const textos = Object.values(renderCells(cols, { id: 1, sigla: 'mat-101', nombre: 'Álgebra', tipo: 'TEORICA', clasificacion: 'Fundamental' })).join(' | ');
    expect(textos).toMatch(/ÁLGEBRA/);
    expect(textos).toMatch(/Fundamental/);
    expect(Object.values(renderCells(cols, {})).join(' ')).toMatch(/SIN NOMBRE/);
    expect(cols[2].sortCompare({ tipo: 'TEORICA' }, { tipo: 'PRACTICA' })).not.toBe(0);
    const nav = c();
    const acciones = createMateriasTableColumns(nav).at(-1);
    renderCell(acciones, { id: 1, nombre: 'Álgebra' }, { auth: { permisos: [permiso('configuracion.materia', 'EDITAR')] } });
    expect(screen.getByRole('button', { name: 'edit' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'delete' })).not.toBeInTheDocument();
  });
});

describe('celdas del catálogo académico', () => {
  it('CarreraAreaDescripcionCell / CarreraMetricasCell / CarreraTituloDotCell', () => {
    const { rerender } = render(<CarreraAreaDescripcionCell areaFormacion="Tecnología" descripcion="Carrera técnica" />);
    expect(screen.getByText('Carrera técnica')).toBeInTheDocument();
    rerender(<CarreraAreaDescripcionCell />);
    expect(screen.getAllByText('—')).toHaveLength(2);
    rerender(<CarreraMetricasCell cantidadMaterias={4} cantidadPeriodos={2} />);
    expect(screen.getByText('4 materias')).toBeInTheDocument();
    rerender(<CarreraTituloDotCell tituloOtorgado="Técnico" colorHex="#112233" />);
    expect(screen.getByText('Técnico')).toBeInTheDocument();
    rerender(<CarreraTituloDotCell />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('MateriaCatalogoChip dentro de DndContext muestra sigla, tipo y asignación', () => {
    render(
      <DndContext>
        <MateriaCatalogoChip materia={{ id: 1, sigla: 'MAT-101', nombre: 'Álgebra', tipo: 'TEORICA', asignadaEn: { periodoNombre: 'Primer año' } }} />
      </DndContext>,
    );
    expect(screen.getByText('MAT-101')).toBeInTheDocument();
    expect(screen.getByText('Primer año')).toBeInTheDocument();
    expect(screen.getByText('Álgebra')).toBeInTheDocument();
  });

  it('PlanHorasCell notifica solo valores no nulos', async () => {
    const onChange = vi.fn();
    render(<PlanHorasCell value={4} max={10} onChange={onChange} ariaLabel="Horas de álgebra" />);
    const campo = screen.getByLabelText('Horas de álgebra');
    await userEvent.clear(campo);
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.type(campo, '6');
    expect(onChange).toHaveBeenCalledWith(6);
  });
});
