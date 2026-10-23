/**
 * Organismo: tab "Capacitaciones" de la ficha de participante (CAP): historial de
 * los cursos en los que se inscribió (el más reciente primero), con grupo, fecha,
 * estado de la inscripción, estado de pago y saldo. Cada fila abre la ficha de la
 * inscripción (permiso DETALLE de inscripción). Estado vacío cubierto. Recibe props
 * ya mapeadas; no llama hooks.
 */

import { Empty, Table } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, HistoryOutlined, ReadOutlined } from '@ant-design/icons';
import { DetailInfoCard, TableActions } from '@molecules';
import { InfoLinesCell, StatusPill } from '@atoms';
import { formatBs } from '@application/utils/formatters';
import {
  formatEstadoInscripcionCap,
  getEstadoInscripcionCapPillClass,
  formatEstadoPagoCap,
  getEstadoPagoCapPillClass,
} from '@application-capacitacion/utils/capacitacionPills';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';

const crearColumnas = ({ onVerInscripcion }) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index) => index + 1,
  },
  {
    title: 'Curso',
    key: 'curso',
    render: (_, inscripcion) => (
      <InfoLinesCell
        lines={[
          { icon: <ReadOutlined />, label: inscripcion.capacitacionTitulo },
          inscripcion.capacitacionFechasLabel
            ? { icon: <CalendarOutlined />, label: inscripcion.capacitacionFechasLabel }
            : null,
        ].filter(Boolean)}
      />
    ),
  },
  {
    title: 'Grupo',
    key: 'grupo',
    render: (_, inscripcion) => (
      <InfoLinesCell
        lines={[
          inscripcion.grupoNombre ? { label: inscripcion.grupoNombre } : null,
          inscripcion.grupoHorariosEtiqueta
            ? { icon: <ClockCircleOutlined />, label: inscripcion.grupoHorariosEtiqueta }
            : null,
        ].filter(Boolean)}
      />
    ),
  },
  {
    title: 'Inscripción',
    key: 'inscripcion',
    width: 150,
    render: (_, inscripcion) => (
      <InfoLinesCell
        lines={[
          { icon: <CalendarOutlined />, label: inscripcion.fechaInscripcionLabel || '—' },
          {
            label: (
              <StatusPill
                label={formatEstadoInscripcionCap(inscripcion.estado)}
                className={getEstadoInscripcionCapPillClass(inscripcion.estado)}
              />
            ),
          },
        ]}
      />
    ),
  },
  {
    title: 'Pago',
    key: 'pago',
    width: 170,
    render: (_, inscripcion) => (
      <InfoLinesCell
        lines={[
          {
            label: (
              <StatusPill
                label={formatEstadoPagoCap(inscripcion.estadoPago)}
                className={getEstadoPagoCapPillClass(inscripcion.estadoPago)}
              />
            ),
          },
          { label: `Saldo: Bs ${formatBs(inscripcion.saldoTotal)}` },
        ]}
      />
    ),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 100,
    align: 'right',
    render: (_, inscripcion) => (
      <TableActions
        record={inscripcion}
        onView={() => onVerInscripcion(inscripcion)}
        permisos={{ ver: { codigo: CAPACITACION_PERMISOS.inscripcion, accion: 'DETALLE' } }}
      />
    ),
  },
];

const ParticipanteHistorialSection = ({ inscripciones = [], onVerInscripcion }) => (
  <div className="sd-tab-body">
    <DetailInfoCard
      title={`Historial de capacitaciones (${inscripciones.length})`}
      icon={<HistoryOutlined />}
      cols={1}
    >
      {inscripciones.length > 0 ? (
        <Table
          dataSource={inscripciones}
          columns={crearColumnas({ onVerInscripcion })}
          rowKey="id"
          size="small"
          pagination={false}
        />
      ) : (
        <Empty description="El participante aún no se inscribió a ningún curso." />
      )}
    </DetailInfoCard>
  </div>
);

export default ParticipanteHistorialSection;
