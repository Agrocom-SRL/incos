/**
 * Columnas del listado de actividades del cronograma (patrón Docentes / CFG):
 * #, Etapa (color propio), Actividad (identidad + dot de tipo), Duración, Acciones.
 */

import { CalendarOutlined, FlagOutlined, TagOutlined, IdcardOutlined } from '@ant-design/icons';
import { TableActions } from '@molecules';
import CronogramaEtapaCell from '@institucional/actual/components/atoms/CronogramaEtapaCell';
import CronogramaActividadCell from '@institucional/actual/components/atoms/CronogramaActividadCell';
import CronogramaDuracionCell from '@institucional/actual/components/atoms/CronogramaDuracionCell';
import {
  getActividadTipoLabel,
  getActividadEstadoLabel,
} from '@application-institucional/actual/config/actividadPill.js';
import { formatFechaCorta } from '@application-institucional/actual/utils/bimestresTimeline.js';

const PERMISO = 'institucional.gestion.cronograma';

export const createCronogramaTableColumns = ({ navigate, onVer, onEditar, eliminar, refetch }) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Etapa',
    dataIndex: 'periodoNombre',
    key: 'periodo',
    width: 150,
    render: (nombre, record) => (
      <CronogramaEtapaCell nombre={nombre} colorHex={record.periodoColor} />
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.periodoNumeroOrden ?? 99) - (b.periodoNumeroOrden ?? 99) ||
      (a.periodoNombre || '').localeCompare(b.periodoNombre || '', 'es', { sensitivity: 'base' }),
  },
  {
    title: 'Actividad',
    dataIndex: 'nombre',
    key: 'nombre',
    width: 300,
    ellipsis: true,
    render: (nombre, record) => (
      <CronogramaActividadCell nombre={nombre} codigo={record.codigo} tipo={record.tipo} />
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }),
  },
  {
    title: 'Duración',
    key: 'duracion',
    width: 200,
    render: (_, record) => (
      <CronogramaDuracionCell fechaInicio={record.fechaInicio} fechaFin={record.fechaFin} />
    ),
    sorter: true,
    sortCompare: (a, b) => String(a.fechaInicio || '').localeCompare(String(b.fechaInicio || '')),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 150,
    align: 'right',
    render: (_, record) => {
      const itemName = `la actividad ${record.nombre}`;
      const itemDetails = [
        { label: 'Actividad', value: record.nombre, icon: <TagOutlined /> },
        { label: 'Código', value: record.codigo, icon: <IdcardOutlined /> },
        { label: 'Etapa', value: record.periodoNombre, icon: <CalendarOutlined /> },
        { label: 'Tipo', value: getActividadTipoLabel(record.tipo), icon: <TagOutlined /> },
        {
          label: 'Duración',
          value: record.fechaFin
            ? `${formatFechaCorta(record.fechaInicio)} → ${formatFechaCorta(record.fechaFin)}`
            : `${formatFechaCorta(record.fechaInicio)} · todo el día`,
          icon: <FlagOutlined />,
        },
        { label: 'Estado', value: getActividadEstadoLabel(record.estado), icon: <CalendarOutlined /> },
      ].filter((d) => d.value != null && d.value !== '');

      return (
        <TableActions
          record={record}
          navigate={navigate}
          refetch={refetch}
          deleteFn={(id) => eliminar(id)}
          itemName={itemName}
          itemDetails={itemDetails}
          onView={(r) => onVer(r)}
          onEdit={(r) => onEditar(r)}
          permisos={{
            ver: { codigo: PERMISO, accion: 'DETALLE' },
            editar: { codigo: PERMISO, accion: 'EDITAR' },
            eliminar: { codigo: PERMISO, accion: 'ELIMINAR' },
          }}
        />
      );
    },
  },
];
