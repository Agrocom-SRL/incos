/**
 * Columnas de la bandeja del docente supervisor "Mis pasantías supervisadas"
 * (módulo TUT).
 *
 * Mismo lenguaje visual que el listado admin (patrón misTutoradosTableColumns),
 * con las acciones propias del supervisor: abrir ficha (pasantia·DETALLE) y
 * registrar seguimiento (seguimiento·CREAR — fail-closed: TableActions oculta
 * la acción si el rol no tiene la acción sembrada).
 */

import {
  BookOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  FileAddOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { StatusPill, IdentidadCelda, InfoLinesCell } from '@atoms';
import { TableActions } from '@molecules';
import { TUTORIAS_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import {
  formatEstadoPasantia,
  formatTipoPasantia,
  getEstadoPasantiaPillClass,
  getTipoPasantiaPillClass,
} from '@application-titulacion/utils/pasantiasPills';

/** Estados en los que registrar seguimiento tiene sentido (trámite vigente). */
const ESTADOS_CON_SEGUIMIENTO = ['SOLICITADA', 'EN_CURSO'];

export const createMisPasantiasTableColumns = ({ onVerPasantia, onRegistrarSeguimiento }) => {
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
        <div className="cfg-identidad-clamp2" title={record.estudianteNombre || undefined}>
          <IdentidadCelda
            codigo={record.codigoEstudiante || record.estudianteCi || undefined}
            nombre={(record.estudianteNombre || 'Sin nombre').toUpperCase()}
          />
        </div>
      ),
      sorter: true,
      sortCompare: (a, b) =>
        (a.estudianteNombre || '').localeCompare(b.estudianteNombre || '', 'es', {
          sensitivity: 'base',
        }),
    },
    {
      title: 'Carrera y empresa',
      key: 'carreraEmpresa',
      width: 230,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            record.carreraNombre ? { icon: <BookOutlined />, label: record.carreraNombre } : null,
            { icon: <ShopOutlined />, label: record.empresaNombre || 'Sin empresa asignada' },
          ].filter(Boolean)}
        />
      ),
    },
    {
      title: 'Camino',
      key: 'tipo',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <StatusPill
          label={formatTipoPasantia(record.tipo)}
          className={getTipoPasantiaPillClass(record.tipo)}
        />
      ),
    },
    {
      title: 'Horas y periodo',
      key: 'horas',
      width: 180,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            { icon: <FieldTimeOutlined />, label: record.horasLabel || 'Sin horas registradas' },
            record.fechaInicioLabel
              ? {
                  icon: <CalendarOutlined />,
                  label: `Desde ${record.fechaInicioLabel}`,
                }
              : null,
          ].filter(Boolean)}
        />
      ),
      sorter: true,
      sortCompare: (a, b) => (a.porcentajeHoras || 0) - (b.porcentajeHoras || 0),
    },
    {
      title: 'Estado',
      key: 'estado',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <StatusPill
          label={formatEstadoPasantia(record.estado)}
          className={getEstadoPasantiaPillClass(record.estado)}
        />
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 110,
      align: 'right',
      render: (_, record) => (
        <TableActions
          record={record}
          onView={() => onVerPasantia(record)}
          extraActions={[
            ...(ESTADOS_CON_SEGUIMIENTO.includes(record.estado)
              ? [
                  {
                    key: 'seguimiento',
                    icon: <FileAddOutlined />,
                    variant: 'info',
                    tooltip: 'Registrar seguimiento',
                    permiso: TUTORIAS_PERMISOS.pasantiaSeguimiento,
                    accion: 'CREAR',
                    onClick: () => onRegistrarSeguimiento(record),
                  },
                ]
              : []),
          ]}
          permisos={{
            ver: { codigo: TUTORIAS_PERMISOS.pasantia, accion: 'DETALLE' },
          }}
        />
      ),
    },
  ];
};
