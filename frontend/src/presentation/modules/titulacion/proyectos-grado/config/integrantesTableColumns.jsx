/**
 * Columnas de la tabla de integrantes de un proyecto de grado (módulo TUT).
 *
 * Tab "Integrantes" de la ficha-hub: IdentidadCelda + pills del kit +
 * TableActions (retirar/reincorporar gated por proyecto·EDITAR, T13 —
 * fail-closed: sin la acción sembrada no se muestra nada).
 */

import { CalendarOutlined, UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons';
import { StatusPill, IdentidadCelda, InfoLinesCell } from '@atoms';
import { TableActions } from '@molecules';
import { TUTORIAS_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';

/** Rol del integrante → etiqueta + clase de StatusPill (ENUM integrantes_proyecto.rol). */
const ROL_INTEGRANTE_META = {
  TITULAR: { label: 'Titular', pill: 'cfg-materia-pill--info' },
  INTEGRANTE: { label: 'Integrante', pill: 'cfg-materia-pill--default' },
};

/** Estado del integrante → etiqueta + clase (ENUM integrantes_proyecto.estado). */
const ESTADO_INTEGRANTE_META = {
  ACTIVO: { label: 'Activo', pill: 'cfg-materia-pill--success' },
  RETIRADO: { label: 'Retirado', pill: 'cfg-materia-pill--inactiva' },
};

export const createIntegrantesTableColumns = ({ onToggleEstado }) => {
  return [
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
      width: 260,
      render: (_, record) => (
        <IdentidadCelda
          codigo={record.ci ? `C.I. ${record.ci}` : undefined}
          nombre={record.nombreCompleto || 'Sin nombre'}
        />
      ),
    },
    {
      title: 'Rol',
      key: 'rol',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const meta = ROL_INTEGRANTE_META[record.rol] ?? ROL_INTEGRANTE_META.INTEGRANTE;
        return <StatusPill label={meta.label} className={`cfg-materia-pill ${meta.pill}`} />;
      },
    },
    {
      title: 'Incorporación',
      key: 'incorporacion',
      width: 150,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            {
              icon: <CalendarOutlined />,
              label: record.fechaIncorporacionLabel || 'Sin fecha',
            },
            record.observaciones ? { label: record.observaciones } : null,
          ].filter(Boolean)}
        />
      ),
    },
    {
      title: 'Estado',
      key: 'estado',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const meta = ESTADO_INTEGRANTE_META[record.estado] ?? ESTADO_INTEGRANTE_META.ACTIVO;
        return <StatusPill label={meta.label} className={`cfg-materia-pill ${meta.pill}`} />;
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 90,
      align: 'right',
      render: (_, record) => {
        const retirado = record.estado === 'RETIRADO';
        return (
          <TableActions
            record={record}
            extraActions={[
              {
                key: 'toggleEstado',
                icon: retirado ? <UserAddOutlined /> : <UserDeleteOutlined />,
                variant: retirado ? 'success' : 'error',
                tooltip: retirado ? 'Reincorporar al proyecto' : 'Retirar del proyecto',
                permiso: TUTORIAS_PERMISOS.proyecto,
                accion: 'EDITAR',
                onClick: () => onToggleEstado(record),
              },
            ]}
          />
        );
      },
    },
  ];
};
