import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { permiso } from '@/test/renderWithProviders';
import { findColumn, renderCell, renderCells } from '@/test/renderColumns';
import { createAulasTableColumns } from '../recursos/config/aulasTableColumns';
import { createParalelosTableColumns } from '../recursos/config/paralelosTableColumns';
import { createTiposEvaluacionTableColumns } from '../recursos/config/tiposEvaluacionTableColumns';
import { createDocumentacionTableColumns } from '../documentacion/config/documentacionTableColumns';
import { createActividadesTableColumns } from '../actividades/config/actividadesTableColumns';
import { createApoderadosTableColumns } from '../complementarios/config/apoderadosTableColumns';
import { createDiscapacidadesTableColumns } from '../complementarios/config/discapacidadesTableColumns';
import { createEstadosCivilesTableColumns } from '../complementarios/config/estadosCivilesTableColumns';
import { createIdiomasTableColumns } from '../complementarios/config/idiomasTableColumns';
import CatalogoUsosCell from '../complementarios/components/atoms/CatalogoUsosCell';
import ParaleloPeriodoCell from '../recursos/components/atoms/ParaleloPeriodoCell';
import ParaleloTurnoHorarioInfo from '../recursos/components/atoms/ParaleloTurnoHorarioInfo';
import TipoEvaluacionRecuperatorioCell from '../recursos/components/atoms/TipoEvaluacionRecuperatorioCell';
import DocumentacionNombreCell from '../documentacion/components/atoms/DocumentacionNombreCell';
import DocumentacionRequisitosCell from '../documentacion/components/atoms/DocumentacionRequisitosCell';
import DocumentacionTipoDescripcionCell from '../documentacion/components/atoms/DocumentacionTipoDescripcionCell';
import ActividadDescripcionCell from '../actividades/components/atoms/ActividadDescripcionCell';

vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));

const ctx = () => ({ navigate: vi.fn(), listNavState: { s: 1 }, refetch: vi.fn(), toggleEstado: vi.fn() });
const accionesCol = (cols) => cols[cols.length - 1];

/** Contrato común de las tablas CRUD de catálogo: columnas base, estado y acciones por permiso. */
const contratoCatalogo = (nombre, fabrica, permisoCodigo, registro) => {
  describe(`columnas de ${nombre}`, () => {
    it('incluye la columna de estado solo si hay toggle y numera con offset', () => {
      const conToggle = fabrica(ctx());
      const sinToggle = fabrica({ ...ctx(), toggleEstado: undefined });
      expect(conToggle.length).toBe(sinToggle.length + 1);
      expect(conToggle[0].render(null, null, 2, 10)).toBe(13);
    });

    it('renderiza todas las celdas con un registro completo y con uno vacío', () => {
      const cols = fabrica(ctx());
      expect(() => renderCells(cols, registro)).not.toThrow();
      expect(() => renderCells(cols, {})).not.toThrow();
    });

    it('las acciones ver / editar / eliminar respetan los permisos y navegan con el id', async () => {
      const c = ctx();
      const acciones = accionesCol(fabrica(c));
      const { unmount } = renderCell(acciones, registro, { auth: { permisos: [permiso(permisoCodigo, 'DETALLE', 'EDITAR')] } });
      await userEvent.click(screen.getByRole('button', { name: 'eye' }));
      await userEvent.click(screen.getByRole('button', { name: 'edit' }));
      expect(c.navigate).toHaveBeenCalledTimes(2);
      expect(c.navigate.mock.calls[0][0]).toContain(String(registro.id));
      expect(c.navigate.mock.calls[0][1]).toEqual({ state: { s: 1 } });
      expect(screen.queryByRole('button', { name: 'delete' })).not.toBeInTheDocument();
      unmount();
      renderCell(acciones, registro);
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });
  });
};

contratoCatalogo('aulas', createAulasTableColumns, 'configuracion.aula', { id: 4, codigo: 'A-1', nombre: 'Aula 1', categoria: 'LABORATORIO', capacidad: 30, observaciones: 'Con proyector' });
contratoCatalogo('paralelos', createParalelosTableColumns, 'configuracion.paralelo', { id: 5, nombre: 'A', turno: 'NOCHE', carreraNombre: 'Sistemas', carreraCodigo: 'SIS', periodoNumero: 1 });
contratoCatalogo('tipos de evaluación', createTiposEvaluacionTableColumns, 'configuracion.tipo-evaluacion', { id: 6, codigo: 'PARCIAL', nombre: 'Parcial', esRecuperatorio: true });
contratoCatalogo('documentación', createDocumentacionTableColumns, 'configuracion.documentacion', { id: 7, nombre: 'Cédula', tipoDocumento: 'IDENTIDAD', requerido: true, aceptaFotocopia: true });
contratoCatalogo('actividades', createActividadesTableColumns, 'configuracion.actividad', { id: 8, nombre: 'Inscripciones', tipo: 'ACADEMICA', icono: 'CalendarOutlined', descripcion: 'Periodo' });
contratoCatalogo('apoderados', createApoderadosTableColumns, 'configuracion.complementario.apoderados', { id: 9, nombre: 'Padre', cantidadEstudiantes: 3 });
contratoCatalogo('discapacidades', createDiscapacidadesTableColumns, 'configuracion.complementario.discapacidad', { id: 10, nombre: 'Visual', cantidadDocentes: 1 });
contratoCatalogo('estados civiles', createEstadosCivilesTableColumns, 'configuracion.complementario.estado-civil', { id: 11, nombre: 'Soltero', abreviatura: 'S', cantidadPersonal: 2 });
contratoCatalogo('idiomas', createIdiomasTableColumns, 'configuracion.complementario.idiomas', { id: 12, nombre: 'Quechua', codigoIso: 'qu', cantidadEstudiantes: 1 });

describe('orden y contenido específico de columnas', () => {
  it('aulas: orden por nombre y capacidad; capacidad ausente no rompe', () => {
    const cols = createAulasTableColumns(ctx());
    const nombre = findColumn(cols, 'nombre');
    expect(nombre.sortCompare({ nombre: 'A' }, { nombre: 'B' })).toBeLessThan(0);
    const capacidad = cols[2];
    expect(capacidad.sortCompare({ capacidad: 5 }, {})).toBe(5);
    const textos = renderCells(cols, { id: 1, nombre: 'Aula 1', capacidad: 25 });
    expect(Object.values(textos).join(' | ')).toMatch(/Capacidad: 25/);
  });

  it('paralelos: periodo, carrera sin nombre y orden', () => {
    const cols = createParalelosTableColumns(ctx());
    expect(Object.values(renderCells(cols, {})).join(' | ')).toMatch(/SIN CARRERA/);
    expect(cols[3].sortCompare({ periodoNumero: 3 }, { periodoNumero: 1 })).toBe(2);
  });

  it('tipos de evaluación: regular vs recuperatorio', () => {
    const cols = createTiposEvaluacionTableColumns(ctx());
    expect(Object.values(renderCells(cols, { id: 1, esRecuperatorio: true })).join(' ')).toMatch(/Recuperatorio/);
    expect(Object.values(renderCells(cols, { id: 1 })).join(' ')).toMatch(/Regular/);
  });

  it('documentación: base vs reemplazo y requisito', () => {
    const cols = createDocumentacionTableColumns(ctx());
    const base = Object.values(renderCells(cols, { id: 1, nombre: 'Cédula', requerido: false })).join(' | ');
    expect(base).toMatch(/Documento base/);
    expect(base).toMatch(/Opcional/);
    expect(Object.values(renderCells(cols, { id: 2, nombre: 'Otra', documentoPadreId: 1 })).join(' ')).toMatch(/Reemplazo/);
    expect(cols[3].sortCompare({ requerido: false }, { requerido: true })).toBe(1);
  });
});

describe('celdas de configuración', () => {
  it('CatalogoUsosCell: sin uso, pluraliza y "personal" invariable', () => {
    const { rerender } = render(<CatalogoUsosCell />);
    expect(screen.getByText('Sin uso')).toBeInTheDocument();
    rerender(<CatalogoUsosCell cantidadEstudiantes={1} cantidadDocentes={2} cantidadPersonal={4} />);
    expect(screen.getByText('1 estudiante')).toBeInTheDocument();
    expect(screen.getByText('2 docentes')).toBeInTheDocument();
    expect(screen.getByText('4 personal')).toBeInTheDocument();
  });

  it('ParaleloPeriodoCell: descripción opcional', () => {
    const { rerender } = render(<ParaleloPeriodoCell record={{ periodoNumero: 2, descripcion: ' Segundo año ' }} />);
    expect(screen.getByTitle('Segundo año')).toBeInTheDocument();
    rerender(<ParaleloPeriodoCell record={{ periodoNumero: 2 }} showDescripcion={false} />);
    expect(screen.queryByText('—')).not.toBeInTheDocument();
    rerender(<ParaleloPeriodoCell record={{ periodoNumero: 2 }} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('ParaleloTurnoHorarioInfo: franjas del turno o nada si es desconocido', () => {
    const { container, rerender } = render(<ParaleloTurnoHorarioInfo turno="NOCHE" />);
    expect(screen.getByText(/Franjas del turno/)).toBeInTheDocument();
    rerender(<ParaleloTurnoHorarioInfo turno="NOCHE" showTitle={false} compact />);
    expect(container.querySelector('.cfg-paralelo-turno-horario--compact')).not.toBeNull();
    expect(screen.queryByText(/Franjas del turno/)).not.toBeInTheDocument();
    rerender(<ParaleloTurnoHorarioInfo turno="DESCONOCIDO" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('TipoEvaluacionRecuperatorioCell', () => {
    const { rerender } = render(<TipoEvaluacionRecuperatorioCell record={{ esRecuperatorio: true, descripcion: 'Segunda instancia' }} />);
    expect(screen.getByText('Recuperatorio')).toBeInTheDocument();
    expect(screen.getByText('Segunda instancia')).toBeInTheDocument();
    rerender(<TipoEvaluacionRecuperatorioCell />);
    expect(screen.getByText('Regular')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('celdas de documentación', () => {
    render(
      <>
        <DocumentacionNombreCell nombre="Cédula" esBase />
        <DocumentacionRequisitosCell requerido aceptaFotocopia={false} />
        <DocumentacionTipoDescripcionCell tipoDocumento="IDENTIDAD" descripcion="Documento de identidad" />
      </>,
    );
    expect(screen.getByText('CÉDULA')).toBeInTheDocument();
    expect(screen.getByText('Requerido')).toBeInTheDocument();
    expect(screen.getByText('Solo original')).toBeInTheDocument();
    expect(screen.getByText('Documento de identidad')).toBeInTheDocument();
  });

  it('ActividadDescripcionCell', () => {
    render(<ActividadDescripcionCell icono="CalendarOutlined" descripcion="Periodo de inscripción" />);
    expect(screen.getByText('Periodo de inscripción')).toBeInTheDocument();
  });
});
