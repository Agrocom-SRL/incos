/**
 * Columnas — listado de actividades (catálogo maestro). Usa el factory
 * compartido `createSimpleCatalogTableColumns` (ver `incos-ui-system`).
 *
 * Suprime la columna "Descripción" genérica del factory (`descripcionField: null`)
 * para reemplazarla por una propia que combina el ícono real (dot circular,
 * mapeado por `actividadIconMap.js`) con el texto truncado — ya no hay columna
 * "Icono" separada. Extra restante: "Tipo" (StatusPill vía `actividadTipoPill.js`).
 */
import StatusPill from '@atoms/StatusPill';
import { createSimpleCatalogTableColumns } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import {
  actividadDetallePath,
  actividadEditarPath,
} from '@application-configuracion/actividades/config/paths';
import {
  getActividadTipoLabel,
  getActividadTipoPillClass,
} from '@application-configuracion/actividades/config/actividadTipoPill';
import ActividadDescripcionCell from '@configuracion/actividades/components/atoms/ActividadDescripcionCell';

const descripcionColumn = {
  title: 'Descripción',
  dataIndex: 'descripcion',
  ellipsis: false,
  render: (descripcion, record) => (
    <ActividadDescripcionCell icono={record.icono} descripcion={descripcion} />
  ),
  sorter: true,
  sortCompare: (a, b) =>
    (a.descripcion || '').localeCompare(b.descripcion || '', 'es', { sensitivity: 'base' }),
};

const tipoColumn = {
  title: 'Tipo',
  dataIndex: 'tipo',
  render: (tipo) => <StatusPill label={getActividadTipoLabel(tipo)} className={getActividadTipoPillClass(tipo)} />,
  sorter: true,
  sortCompare: (a, b) =>
    getActividadTipoLabel(a.tipo).localeCompare(getActividadTipoLabel(b.tipo), 'es', { sensitivity: 'base' }),
};

export const createActividadesTableColumns = ({ navigate, listNavState, refetch }) =>
  createSimpleCatalogTableColumns({
    navigate,
    listNavState,
    refetch,
    entidad: 'la actividad',
    permisoCodigo: 'configuracion.actividad',
    getDetallePath: (record) => actividadDetallePath(record.id),
    getEditarPath: (record) => actividadEditarPath(record.id),
    useCaseKey: 'eliminarActividad',
    descripcionField: null,
    extraColumns: [descripcionColumn, tipoColumn],
    itemDetailsExtra: (record) => [
      { label: 'Descripción', value: record.descripcion },
      { label: 'Tipo', value: getActividadTipoLabel(record.tipo) },
      { label: 'Icono', value: record.icono },
    ],
  });
