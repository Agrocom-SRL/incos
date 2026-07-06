/**
 * Columnas — listado de actividades (catálogo maestro). Usa el factory
 * compartido `createSimpleCatalogTableColumns` (ver `incos-ui-system`).
 *
 * Extras: "Tipo" (StatusPill mapeado por `actividadTipoPill.js`) e "Icono"
 * (preview de texto simple — el campo es texto libre kebab-case, no se mapea
 * a un set de iconos AntD).
 */
import { Typography } from 'antd';
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

const { Text } = Typography;

const tipoColumn = {
  title: 'Tipo',
  dataIndex: 'tipo',
  width: 170,
  render: (tipo) => <StatusPill label={getActividadTipoLabel(tipo)} className={getActividadTipoPillClass(tipo)} />,
  sorter: true,
  sortCompare: (a, b) =>
    getActividadTipoLabel(a.tipo).localeCompare(getActividadTipoLabel(b.tipo), 'es', { sensitivity: 'base' }),
};

const iconoColumn = {
  title: 'Icono',
  dataIndex: 'icono',
  width: 160,
  render: (icono) => (icono ? <Text code>{icono}</Text> : <Text type="secondary">—</Text>),
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
    extraColumns: [tipoColumn, iconoColumn],
    itemDetailsExtra: (record) => [
      { label: 'Tipo', value: getActividadTipoLabel(record.tipo) },
      { label: 'Icono', value: record.icono },
    ],
  });
