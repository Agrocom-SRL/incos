/**
 * Columnas de la tabla de licencias estudiantiles (página dentro de Asistencia · ACA-ASI-LIC).
 *
 * El nombre del estudiante (`estudianteNombre`) viene ya formateado del backend en orden
 * APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES (incos-ui-system §4b) — no se reordena aquí.
 *
 * Acciones de fila (TableActions):
 *  - Ver detalle  → siempre que haya permiso licencia.ver · DETALLE.
 *  - Aprobar / Rechazar → solo si la licencia está PENDIENTE y hay permiso licencia.aprobar · APROBAR
 *    (fail-closed: las extraActions declaran su par permiso+acción y TableActions las filtra).
 */

import { Tag } from 'antd';
import {
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import { TableCell, TableActions } from '@molecules';
import {
  formatEstadoLicencia,
  tagColorEstadoLicencia,
  ESTADOS_LICENCIA,
} from '@application-academico/asistencia/utils/licenciasEstados.js';
import { formatMotivoLicencia } from '@application-academico/asistencia/utils/licenciasMotivos.js';
import {
  etiquetaRangoFechas,
  etiquetaDiaMesAnio,
} from '@application-academico/asistencia/utils/asistenciaFechas.js';
import { ASISTENCIA_PERMISOS } from '@application-academico/asistencia/utils/asistenciaPermisos.js';

/**
 * @param {Object} handlers
 * @param {(licencia: Object) => void} handlers.onVer        - abrir detalle
 * @param {(licencia: Object) => void} handlers.onAprobar    - abrir decisión (aprobar)
 * @param {(licencia: Object) => void} handlers.onRechazar   - abrir decisión (rechazar)
 * @returns {Array} columnas para Ant Design Table
 */
export const createLicenciasTableColumns = ({ onVer, onAprobar, onRechazar } = {}) => [
  {
    title: 'Estudiante',
    dataIndex: 'estudianteNombre',
    ellipsis: true,
    render: (_, record) => (
      <TableCell
        strong
        fallback="—"
        subtext={`Solicitada el ${etiquetaDiaMesAnio(record.fechaSolicitud)}`}
      >
        {record.estudianteNombre || null}
      </TableCell>
    ),
    sorter: (a, b) =>
      (a.estudianteNombre || '').localeCompare(b.estudianteNombre || ''),
  },
  {
    title: 'Rango de fechas',
    dataIndex: 'fechaInicio',
    width: 240,
    render: (_, record) => (
      <TableCell icon={<CalendarOutlined />}>
        {etiquetaRangoFechas(record.fechaInicio, record.fechaFin)}
      </TableCell>
    ),
    sorter: (a, b) => new Date(a.fechaInicio || 0) - new Date(b.fechaInicio || 0),
  },
  {
    title: 'Días',
    dataIndex: 'totalDias',
    width: 96,
    align: 'center',
    render: (totalDias) => (
      <TableCell icon={<FieldTimeOutlined />}>{totalDias ?? '—'}</TableCell>
    ),
    sorter: (a, b) => (a.totalDias || 0) - (b.totalDias || 0),
  },
  {
    title: 'Motivo',
    dataIndex: 'motivo',
    width: 140,
    render: (motivo) => <TableCell>{formatMotivoLicencia(motivo)}</TableCell>,
    sorter: (a, b) =>
      formatMotivoLicencia(a.motivo).localeCompare(formatMotivoLicencia(b.motivo)),
  },
  {
    title: 'Estado',
    dataIndex: 'estado',
    width: 130,
    render: (estado) => (
      <Tag color={tagColorEstadoLicencia(estado)}>{formatEstadoLicencia(estado)}</Tag>
    ),
    sorter: (a, b) =>
      formatEstadoLicencia(a.estado).localeCompare(formatEstadoLicencia(b.estado)),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    fixed: 'right',
    width: 160,
    align: 'right',
    render: (_, record) => {
      const esPendiente = record.estado === ESTADOS_LICENCIA.PENDIENTE;

      // Las acciones de decisión solo se ofrecen sobre licencias PENDIENTES; el permiso
      // licencia.aprobar · APROBAR lo verifica TableActions (extraActions filtradas).
      const extraActions = esPendiente
        ? [
            {
              key: 'aprobar',
              icon: <CheckOutlined />,
              variant: 'success',
              tooltip: 'Aprobar licencia',
              permiso: ASISTENCIA_PERMISOS.licenciaAprobar,
              accion: 'APROBAR',
              onClick: (r) => onAprobar?.(r),
            },
            {
              key: 'rechazar',
              icon: <CloseOutlined />,
              variant: 'error',
              tooltip: 'Rechazar licencia',
              permiso: ASISTENCIA_PERMISOS.licenciaAprobar,
              accion: 'APROBAR',
              onClick: (r) => onRechazar?.(r),
            },
          ]
        : [];

      return (
        <TableActions
          record={record}
          onView={() => onVer?.(record)}
          extraActions={extraActions}
          permisos={{
            ver: { codigo: ASISTENCIA_PERMISOS.licenciaVer, accion: 'DETALLE' },
          }}
        />
      );
    },
  },
];
