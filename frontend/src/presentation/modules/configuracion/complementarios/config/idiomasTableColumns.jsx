/**
 * Columnas — listado de idiomas (catálogo simple).
 * Usa el factory compartido `createSimpleCatalogTableColumns` (ver `incos-ui-system`).
 *
 * Idiomas no tiene `descripcion`; en su lugar muestra `codigoIso` como columna
 * propia (extraColumns), por eso se suprime la columna "Descripción" por defecto
 * (`descripcionField: null`).
 */
import { TableCell } from '@molecules';
import { createSimpleCatalogTableColumns } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import {
  idiomaDetallePath,
  idiomaEditarPath,
} from '@application-configuracion/complementarios/config/paths';

const codigoIsoColumn = {
  title: 'Código ISO',
  dataIndex: 'codigoIso',
  width: 140,
  render: (codigoIso) => <TableCell fallback="—">{codigoIso}</TableCell>,
  sorter: true,
  sortCompare: (a, b) => (a.codigoIso || '').localeCompare(b.codigoIso || '', 'es', { sensitivity: 'base' }),
};

export const createIdiomasTableColumns = ({ navigate, listNavState, refetch }) =>
  createSimpleCatalogTableColumns({
    navigate,
    listNavState,
    refetch,
    entidad: 'el idioma',
    permisoCodigo: 'configuracion.complementario.idiomas',
    getDetallePath: (record) => idiomaDetallePath(record.id),
    getEditarPath: (record) => idiomaEditarPath(record.id),
    useCaseKey: 'eliminarIdioma',
    descripcionField: null,
    extraColumns: [codigoIsoColumn],
    itemDetailsExtra: (record) => [{ label: 'Código ISO', value: record.codigoIso }],
  });
