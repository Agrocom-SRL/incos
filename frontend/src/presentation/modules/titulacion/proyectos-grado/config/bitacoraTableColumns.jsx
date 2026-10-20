/**
 * Columnas de la bitácora de tutoría de un proyecto (módulo TIT · T14-T17).
 *
 * Se usa en DOS pantallas (mismo lenguaje visual, acciones distintas):
 *  - Ficha-hub (tutor/admin): editar entrada — bitacora·EDITAR (T16).
 *  - Mi proyecto (estudiante, `modoEstudiante`): confirmar entrada — firma
 *    digital de la planilla (T17, acción LISTAR + guard de pertenencia en el
 *    servidor). La confirmación pide Popconfirm porque equivale a una firma.
 */

import { Popconfirm, Progress } from 'antd';
import { CalendarOutlined, CheckOutlined, EditOutlined, FileTextOutlined } from '@ant-design/icons';
import { ActionButton, StatusPill, InfoLinesCell } from '@atoms';
import { TableActions } from '@molecules';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import {
  formatEstadoBitacora,
  formatTipoBitacora,
  getEstadoBitacoraPillClass,
} from '@application-titulacion/utils/titulacionPills';

/** Celda de confirmación: pill firmada o botón "Confirmar" (solo estudiante). */
const renderConfirmacion = (record, { modoEstudiante, onConfirmar, confirmandoId }) => {
  if (record.confirmadoEstudiante) {
    return (
      <InfoLinesCell
        lines={[
          {
            icon: <CheckOutlined />,
            label: 'Confirmada',
          },
          record.fechaConfirmacionLabel ? { label: record.fechaConfirmacionLabel } : null,
        ].filter(Boolean)}
      />
    );
  }
  if (!modoEstudiante || !onConfirmar) {
    return (
      <StatusPill label="Sin confirmar" className="cfg-materia-pill cfg-materia-pill--default" />
    );
  }
  return (
    <Popconfirm
      title="Confirmar entrada del cronograma de progreso"
      description="Su confirmación equivale a la firma de la planilla de seguimiento. ¿Desea continuar?"
      okText="Confirmar"
      cancelText="Volver"
      onConfirm={() => onConfirmar(record)}
    >
      <ActionButton
        permiso={TITULACION_PERMISOS.bitacora}
        accion="LISTAR"
        variant="primary"
        size="small"
        icon={<CheckOutlined />}
        loading={confirmandoId === record.id}
      >
        Confirmar
      </ActionButton>
    </Popconfirm>
  );
};

export const createBitacoraTableColumns = ({
  onEditar = null,
  modoEstudiante = false,
  onConfirmar = null,
  confirmandoId = null,
} = {}) => {
  return [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    {
      title: 'Fecha y tipo',
      key: 'fechaTipo',
      width: 170,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            { icon: <CalendarOutlined />, label: record.fechaLabel || 'Sin fecha' },
            { icon: <FileTextOutlined />, label: formatTipoBitacora(record.tipo) },
          ]}
        />
      ),
      sorter: true,
      sortCompare: (a, b) => String(a.fecha || '').localeCompare(String(b.fecha || '')),
    },
    {
      title: 'Actividad y observaciones',
      key: 'actividad',
      width: 320,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            record.actividad ? { label: record.actividad } : null,
            record.observaciones ? { label: record.observaciones } : null,
          ].filter(Boolean)}
        />
      ),
    },
    {
      title: 'Avance',
      key: 'avance',
      width: 130,
      render: (_, record) =>
        record.porcentajeAvance != null ? (
          <Progress percent={record.porcentajeAvance} size="small" />
        ) : (
          '—'
        ),
      sorter: true,
      sortCompare: (a, b) => (a.porcentajeAvance || 0) - (b.porcentajeAvance || 0),
    },
    {
      title: 'Estado',
      key: 'estado',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <StatusPill
          label={formatEstadoBitacora(record.estado)}
          className={getEstadoBitacoraPillClass(record.estado)}
        />
      ),
    },
    {
      title: modoEstudiante ? 'Firma' : 'Confirmación',
      key: 'confirmacion',
      width: 150,
      align: 'center',
      render: (_, record) =>
        renderConfirmacion(record, { modoEstudiante, onConfirmar, confirmandoId }),
    },
    // La columna de acciones solo existe en la ficha (tutor/admin edita, T16).
    ...(onEditar
      ? [
          {
            title: 'Acciones',
            key: 'acciones',
            width: 90,
            align: 'right',
            render: (_, record) => (
              <TableActions
                record={record}
                extraActions={[
                  {
                    key: 'editar',
                    icon: <EditOutlined />,
                    variant: 'warning',
                    tooltip: 'Editar entrada',
                    permiso: TITULACION_PERMISOS.bitacora,
                    accion: 'EDITAR',
                    onClick: () => onEditar(record),
                  },
                ]}
              />
            ),
          },
        ]
      : []),
  ];
};
