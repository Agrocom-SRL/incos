/**
 * Columnas del listado de paralelos de Nivelación (P1 nivel 1, dentro de
 * `CarreraTabsListView`). Fila = paralelo en gestión vigente; acción única
 * "Ver grilla" (permiso `academico.nivelacion.ver`, LISTAR).
 */

import { EyeOutlined } from '@ant-design/icons';
import { ActionButton, StatusPill } from '@atoms';
import { TableCell } from '@molecules';
import { NIVELACION_PERMISOS } from '@application-academico/nivelaciones/utils/nivelacionPermisos.js';

/**
 * @param {Object} params
 * @param {(paralelo: Object) => void} params.onVerGrilla
 */
export const createNivelacionParalelosColumns = ({ onVerGrilla }) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Paralelo',
    key: 'paralelo',
    ellipsis: true,
    sorter: (a, b) =>
      String(a.paraleloNombre || '').localeCompare(String(b.paraleloNombre || ''), 'es', {
        sensitivity: 'base',
      }),
    render: (_, record) => (
      <TableCell subtext={record.turno ? `Turno ${record.turno}` : null}>
        {[record.periodoNombre, record.paraleloNombre ? `Paralelo ${record.paraleloNombre}` : null]
          .filter(Boolean)
          .join(' · ') || '—'}
      </TableCell>
    ),
  },
  {
    title: 'Estudiantes',
    dataIndex: 'totalEstudiantes',
    width: 130,
    align: 'center',
    render: (valor) => <TableCell align="center">{valor ?? 0}</TableCell>,
    sorter: (a, b) => (Number(a.totalEstudiantes) || 0) - (Number(b.totalEstudiantes) || 0),
  },
  {
    title: 'Pendientes de nivelación',
    dataIndex: 'totalPendientes',
    width: 180,
    align: 'center',
    render: (valor) =>
      valor > 0 ? (
        <StatusPill label={String(valor)} className="cfg-materia-pill cfg-materia-pill--warning" />
      ) : (
        <StatusPill label="0" className="cfg-materia-pill cfg-materia-pill--default" />
      ),
    sorter: (a, b) => (Number(a.totalPendientes) || 0) - (Number(b.totalPendientes) || 0),
    defaultSortOrder: 'descend',
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 150,
    align: 'right',
    render: (_, record) => (
      <ActionButton
        permiso={NIVELACION_PERMISOS.ver}
        accion="LISTAR"
        variant="view"
        size="small"
        icon={<EyeOutlined />}
        onClick={() => onVerGrilla?.(record)}
      >
        Ver grilla
      </ActionButton>
    ),
  },
];

export default createNivelacionParalelosColumns;
