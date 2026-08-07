/**
 * Columnas de la bandeja plana de nivelaciones pendientes (P3,
 * `/academico/nivelaciones/aprobar`). Fila = 1 nivelación PROGRAMADA/EN_CURSO,
 * cruzando todos los paralelos. Acción única "Gestionar" abre
 * `ResultadoNivelacionDrawer` (permiso `academico.nivelacion.aprobar`).
 */

import { EditOutlined } from '@ant-design/icons';
import { ActionButton, IdentidadCelda, StatusPill } from '@atoms';
import { TableCell } from '@molecules';
import { NIVELACION_PERMISOS } from '@application-academico/nivelaciones/utils/nivelacionPermisos.js';
import {
  formatEstadoHistorial,
  getEstadoHistorialPillClass,
  formatEstadoNivelacion,
  getEstadoNivelacionPillClass,
} from '@application-academico/nivelaciones/utils/nivelacionEstados.js';

/**
 * @param {Object} params
 * @param {(fila: Object) => void} params.onGestionar
 */
export const createNivelacionPendientesColumns = ({ onGestionar }) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Estudiante',
    key: 'estudiante',
    ellipsis: true,
    sorter: (a, b) =>
      String(a.nombreCompleto || '').localeCompare(String(b.nombreCompleto || ''), 'es', {
        sensitivity: 'base',
      }),
    render: (_, record) => (
      <IdentidadCelda codigo={record.codigoEstudiante || null} nombre={record.nombreCompleto || 'Sin nombre'} />
    ),
  },
  {
    title: 'Materia',
    key: 'materia',
    ellipsis: true,
    render: (_, record) => (
      <TableCell subtext={record.paraleloGestionId == null ? 'Materia arrastrada' : null}>
        {[record.asignaturaSigla, record.asignaturaNombre].filter(Boolean).join(' — ') || '—'}
      </TableCell>
    ),
  },
  {
    title: 'Tipo',
    dataIndex: 'stateType',
    width: 170,
    render: (stateType) => (
      <StatusPill label={formatEstadoHistorial(stateType)} className={getEstadoHistorialPillClass(stateType)} />
    ),
  },
  {
    title: 'Estado del examen',
    dataIndex: 'status',
    width: 150,
    render: (status) => (
      <StatusPill label={formatEstadoNivelacion(status)} className={getEstadoNivelacionPillClass(status)} />
    ),
  },
  {
    title: 'Fecha de examen',
    dataIndex: 'examDate',
    width: 140,
    render: (fecha) => <TableCell>{fecha || 'Sin programar'}</TableCell>,
    sorter: (a, b) => String(a.examDate || '').localeCompare(String(b.examDate || '')),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 130,
    align: 'right',
    render: (_, record) => (
      <ActionButton
        permiso={NIVELACION_PERMISOS.aprobar}
        accion="APROBAR"
        variant="view"
        size="small"
        icon={<EditOutlined />}
        onClick={() => onGestionar?.(record)}
      >
        Gestionar
      </ActionButton>
    ),
  },
];

export default createNivelacionPendientesColumns;
