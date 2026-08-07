/**
 * Columnas del listado de paralelos del Centralizador (P1, dentro de
 * `CarreraTabsListView`). Fila = paralelo en gestión vigente; acción única
 * "Abrir" (permiso `academico.calificacion.centralizador`, LISTAR) hacia el
 * resultado anual del paralelo (P2). Mismo patrón que
 * `nivelacionParalelosColumns.jsx` (P1 nivel 1 de Nivelación, mismo dataset
 * de paralelos).
 */

import { TableOutlined } from '@ant-design/icons';
import { ActionButton } from '@atoms';
import { TableCell } from '@molecules';
import { CENTRALIZADOR_PERMISOS } from '@application-academico/centralizador/utils/centralizadorPermisos.js';

/**
 * @param {Object} params
 * @param {(paralelo: Object) => void} params.onAbrir
 */
export const createCentralizadorParalelosColumns = ({ onAbrir }) => [
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
    title: 'Asignaturas',
    key: 'asignaturas',
    width: 130,
    align: 'center',
    render: (_, record) => (
      <TableCell align="center">
        {record.cursosCreados ?? record.asignaturasRequeridas ?? 0}
      </TableCell>
    ),
    sorter: (a, b) =>
      (Number(a.cursosCreados ?? a.asignaturasRequeridas) || 0) -
      (Number(b.cursosCreados ?? b.asignaturasRequeridas) || 0),
  },
  {
    title: 'Estudiantes',
    dataIndex: 'cantidadEstudiantes',
    width: 130,
    align: 'center',
    render: (valor) => <TableCell align="center">{valor ?? 0}</TableCell>,
    sorter: (a, b) => (Number(a.cantidadEstudiantes) || 0) - (Number(b.cantidadEstudiantes) || 0),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 150,
    align: 'right',
    render: (_, record) => {
      const sinEstudiantes = (record.cantidadEstudiantes ?? 0) === 0;
      return (
        <ActionButton
          permiso={CENTRALIZADOR_PERMISOS.centralizador}
          accion="LISTAR"
          variant="view"
          size="small"
          icon={<TableOutlined />}
          disabled={sinEstudiantes}
          title={
            sinEstudiantes
              ? 'El paralelo no tiene estudiantes matriculados en la gestión vigente'
              : 'Abrir el centralizador de este paralelo'
          }
          onClick={() => onAbrir?.(record)}
        >
          Abrir
        </ActionButton>
      );
    },
  },
];

export default createCentralizadorParalelosColumns;
