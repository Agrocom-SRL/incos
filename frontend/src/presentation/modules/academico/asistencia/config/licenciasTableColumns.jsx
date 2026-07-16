/**
 * Columnas de la tabla de licencias estudiantiles (página dentro de Asistencia · ACA-ASI-LIC).
 * Lenguaje visual de CarrerasList: numeración + IdentidadCelda + celdas multi-línea + StatusPill.
 *
 * El nombre del estudiante (`estudianteNombre`) viene ya formateado del backend en orden
 * APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES (incos-ui-system §4b) — no se reordena aquí.
 *
 * Acciones de fila (TableActions): ver (→ drawer detalle/decisión), editar (solo PENDIENTE),
 * cancelar (PENDIENTE o APROBADA). Aprobar/Rechazar viven en el drawer, no en la fila.
 */

import {
  CalendarOutlined,
  FieldTimeOutlined,
  IdcardOutlined,
  ReadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import StatusPill from '@atoms/StatusPill';
import { TableActions } from '@molecules';
import LicenciaEstudianteCell from '@academico/asistencia/components/atoms/LicenciaEstudianteCell.jsx';
import LicenciaFechasCell from '@academico/asistencia/components/atoms/LicenciaFechasCell.jsx';
import LicenciaAcademicoCell from '@academico/asistencia/components/atoms/LicenciaAcademicoCell.jsx';
import { ESTADOS_LICENCIA } from '@application-academico/asistencia/utils/licenciasEstados.js';
import { formatMotivoLicencia } from '@application-academico/asistencia/utils/licenciasMotivos.js';
import { getMotivoPillClass } from '@application-academico/asistencia/utils/licenciaPills.js';
import {
  etiquetaRangoFechas,
  etiquetaDiaMesAnio,
} from '@application-academico/asistencia/utils/asistenciaFechas.js';
import { ASISTENCIA_PERMISOS } from '@application-academico/asistencia/utils/asistenciaPermisos.js';

/**
 * @param {Object} handlers
 * @param {(licencia: Object) => void} handlers.onVer       - abrir drawer detalle/decisión
 * @param {(licencia: Object) => void} handlers.onEditar    - editar (solo PENDIENTE)
 * @param {(licencia: Object) => void} handlers.onCancelar  - cancelar (PENDIENTE o APROBADA)
 * @returns {Array} columnas para Ant Design Table
 */
export const createLicenciasTableColumns = ({ onVer, onEditar, onCancelar } = {}) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Estudiante',
    dataIndex: 'estudianteNombre',
    ellipsis: true,
    render: (_nombre, record) => (
      <LicenciaEstudianteCell
        codigo={record.codigoEstudiante}
        nombre={record.estudianteNombre}
        estado={record.estado}
      />
    ),
    sorter: (a, b) => (a.estudianteNombre || '').localeCompare(b.estudianteNombre || ''),
  },
  {
    title: 'Académico',
    key: 'academico',
    width: 300,
    render: (_, record) => (
      <LicenciaAcademicoCell
        carreraNombre={record.carreraNombre}
        carreraCodigo={record.carreraCodigo}
        periodoNombre={record.periodoNombre}
        paraleloNombre={record.paraleloNombre}
      />
    ),
  },
  {
    title: 'Fechas',
    dataIndex: 'fechaInicio',
    width: 200,
    render: (_, record) => (
      <LicenciaFechasCell
        fechaInicio={record.fechaInicio}
        fechaFin={record.fechaFin}
        totalDias={record.totalDias}
      />
    ),
    sorter: (a, b) => new Date(a.fechaInicio || 0) - new Date(b.fechaInicio || 0),
  },
  {
    title: 'Motivo',
    dataIndex: 'motivo',
    width: 140,
    render: (motivo) => (
      <StatusPill label={formatMotivoLicencia(motivo)} className={getMotivoPillClass(motivo)} />
    ),
    sorter: (a, b) =>
      formatMotivoLicencia(a.motivo).localeCompare(formatMotivoLicencia(b.motivo)),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 140,
    align: 'right',
    render: (_, record) => {
      const esPendiente = record.estado === ESTADOS_LICENCIA.PENDIENTE;
      const esAprobada = record.estado === ESTADOS_LICENCIA.APROBADA;
      const nombre = record.estudianteNombre || 'Estudiante';

      const itemDetails = [
        { label: 'Estudiante', value: nombre, icon: <UserOutlined /> },
        { label: 'Código', value: record.codigoEstudiante, icon: <IdcardOutlined /> },
        {
          label: 'Periodo',
          value: etiquetaRangoFechas(record.fechaInicio, record.fechaFin),
          icon: <CalendarOutlined />,
        },
        {
          label: 'Solicitada',
          value: etiquetaDiaMesAnio(record.fechaSolicitud),
          icon: <FieldTimeOutlined />,
        },
        { label: 'Motivo', value: formatMotivoLicencia(record.motivo), icon: <ReadOutlined /> },
      ].filter((d) => d.value != null && d.value !== '');

      return (
        <TableActions
          record={record}
          onView={() => onVer?.(record)}
          onEdit={esPendiente ? () => onEditar?.(record) : undefined}
          editTitle="Editar licencia"
          deleteFn={esPendiente || esAprobada ? () => onCancelar?.(record) : undefined}
          itemName={`la licencia de ${nombre}`}
          itemDetails={itemDetails}
          permisos={{
            ver: { codigo: ASISTENCIA_PERMISOS.licenciaVer, accion: 'DETALLE' },
            editar: { codigo: ASISTENCIA_PERMISOS.licenciaCrear, accion: 'EDITAR' },
            eliminar: { codigo: ASISTENCIA_PERMISOS.licenciaCrear, accion: 'ELIMINAR' },
          }}
        />
      );
    },
  },
];
