/**
 * Columnas — listado de estados civiles (catálogo simple).
 * Usa el factory compartido `createSimpleCatalogTableColumns` (ver `incos-ui-system`).
 *
 * Estados civiles no tiene `descripcion`; en su lugar muestra `abreviatura` como
 * columna propia (extraColumns), por eso se suprime la columna "Descripción" por
 * defecto (`descripcionField: null`). Gemelo de `idiomasTableColumns.jsx`.
 */
import { TableCell } from '@molecules';
import { createSimpleCatalogTableColumns } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import {
  estadoCivilDetallePath,
  estadoCivilEditarPath,
} from '@application-configuracion/complementarios/config/paths';

const abreviaturaColumn = {
  title: 'Abreviatura',
  dataIndex: 'abreviatura',
  width: 140,
  render: (abreviatura) => <TableCell fallback="—">{abreviatura}</TableCell>,
  sorter: true,
  sortCompare: (a, b) =>
    (a.abreviatura || '').localeCompare(b.abreviatura || '', 'es', { sensitivity: 'base' }),
};

export const createEstadosCivilesTableColumns = ({ navigate, listNavState, refetch }) =>
  createSimpleCatalogTableColumns({
    navigate,
    listNavState,
    refetch,
    entidad: 'el estado civil',
    permisoCodigo: 'configuracion.complementario.estado-civil',
    getDetallePath: (record) => estadoCivilDetallePath(record.id),
    getEditarPath: (record) => estadoCivilEditarPath(record.id),
    useCaseKey: 'eliminarEstadoCivil',
    descripcionField: null,
    extraColumns: [abreviaturaColumn],
    itemDetailsExtra: (record) => [{ label: 'Abreviatura', value: record.abreviatura }],
  });
