/**
 * Columnas de los seguimientos de un trámite de pasantía (módulo TIT ·
 * P15-P17).
 *
 * Hoja de seguimiento (FORMULARIO DE SEGUIMIENTO DE PASANTÍA): fecha,
 * trabajo/actividades, nivel de desempeño (escala ALTO/MEDIO/BAJO) y firmas.
 * Edición gated por seguimiento·EDITAR; con `readOnly` (portal del
 * estudiante) se omite la columna de acciones.
 */

import { CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { StatusPill, InfoLinesCell, TruncatedTextCell } from '@atoms';
import { TableActions } from '@molecules';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import {
  formatNivelDesempeno,
  getNivelDesempenoPillClass,
} from '@application-titulacion/utils/pasantiasPills';

export const createSeguimientosPasantiaTableColumns = ({ onEditar, readOnly = false } = {}) => {
  const columns = [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    {
      title: 'Fecha',
      key: 'fecha',
      width: 130,
      render: (_, record) => (
        <InfoLinesCell
          lines={[{ icon: <CalendarOutlined />, label: record.fechaLabel || 'Sin fecha' }]}
        />
      ),
      sorter: true,
      sortCompare: (a, b) => String(a.fecha || '').localeCompare(String(b.fecha || '')),
    },
    {
      title: 'Trabajo desempeñado',
      key: 'descripcionTrabajo',
      width: 260,
      render: (_, record) => <TruncatedTextCell text={record.descripcionTrabajo} />,
    },
    {
      title: 'Principales actividades',
      key: 'principalesActividades',
      width: 260,
      render: (_, record) => <TruncatedTextCell text={record.principalesActividades} />,
    },
    {
      title: 'Desempeño',
      key: 'nivelDesempeno',
      width: 120,
      align: 'center',
      render: (_, record) =>
        record.nivelDesempeno ? (
          <StatusPill
            label={formatNivelDesempeno(record.nivelDesempeno)}
            className={getNivelDesempenoPillClass(record.nivelDesempeno)}
          />
        ) : (
          '—'
        ),
    },
    {
      title: 'Firmas',
      key: 'firmas',
      width: 170,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            record.firmadoDocente
              ? { icon: <CheckCircleOutlined />, label: 'Docente supervisor' }
              : null,
            record.firmadoEmpresa ? { icon: <CheckCircleOutlined />, label: 'Empresa' } : null,
          ].filter(Boolean)}
        />
      ),
    },
  ];

  if (readOnly) {
    return columns;
  }

  return [
    ...columns,
    {
      title: 'Acciones',
      key: 'acciones',
      width: 90,
      align: 'right',
      render: (_, record) => (
        <TableActions
          record={record}
          onEdit={() => onEditar(record)}
          editTitle="Editar seguimiento"
          permisos={{
            editar: { codigo: TITULACION_PERMISOS.pasantiaSeguimiento, accion: 'EDITAR' },
          }}
        />
      ),
    },
  ];
};
