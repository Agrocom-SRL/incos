/**
 * Columnas del detalle por proyecto del reporte de avance de tutorías por
 * carrera (módulo TIT, Requisito 2 — extensión 2026-07-31).
 *
 * Mismo lenguaje visual que `proyectosGradoTableColumns` (IdentidadCelda +
 * InfoLinesCell + StatusPill + Progress con tokens del theme), sin acciones
 * de fila: este reporte es de solo lectura.
 */

import { Progress } from 'antd';
import { BookOutlined, UserOutlined } from '@ant-design/icons';
import { StatusPill, IdentidadCelda, InfoLinesCell } from '@atoms';
import {
  formatEstadoProyecto,
  getEstadoProyectoPillClass,
} from '@application-titulacion/utils/titulacionPills';

export const createAvanceTutoriaCarreraTableColumns = () => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Proyecto',
    key: 'proyecto',
    width: 260,
    render: (_, record) => (
      <div className="cfg-identidad-clamp2" title={record.titulo || undefined}>
        <IdentidadCelda
          codigo={record.modalidadCodigo || record.modalidadNombre || undefined}
          nombre={(record.titulo || 'Sin título').toUpperCase()}
        />
      </div>
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.titulo || '').localeCompare(b.titulo || '', 'es', { sensitivity: 'base' }),
  },
  {
    title: 'Carrera y tutor',
    key: 'carreraTutor',
    width: 220,
    render: (_, record) => (
      <InfoLinesCell
        lines={[
          record.carreraNombre ? { icon: <BookOutlined />, label: record.carreraNombre } : null,
          { icon: <UserOutlined />, label: record.tutorNombre || 'Sin tutor asignado' },
        ].filter(Boolean)}
      />
    ),
    sorter: true,
    sortCompare: (a, b) => (a.carreraNombre || '').localeCompare(b.carreraNombre || '', 'es'),
  },
  {
    title: 'Avance',
    key: 'avance',
    width: 150,
    render: (_, record) => (
      <Progress
        percent={record.porcentajeAvance}
        size="small"
        status={record.estado === 'REPROBADO' ? 'exception' : undefined}
      />
    ),
    sorter: true,
    sortCompare: (a, b) => (a.porcentajeAvance || 0) - (b.porcentajeAvance || 0),
  },
  {
    title: 'Última observación',
    key: 'ultimaObservacion',
    width: 260,
    render: (_, record) => record.ultimaObservacion || 'Sin observaciones registradas',
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 150,
    align: 'center',
    render: (_, record) => (
      <StatusPill
        label={formatEstadoProyecto(record.estado)}
        className={getEstadoProyectoPillClass(record.estado)}
      />
    ),
    sorter: true,
    sortCompare: (a, b) => (a.estado || '').localeCompare(b.estado || ''),
  },
];

export default createAvanceTutoriaCarreraTableColumns;
