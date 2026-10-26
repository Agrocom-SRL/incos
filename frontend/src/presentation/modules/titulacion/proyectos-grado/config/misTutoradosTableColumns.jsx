/**
 * Columnas de la bandeja del docente tutor "Mis tutorados" (módulo TIT).
 *
 * Mismo lenguaje visual que el listado admin, con las acciones propias del
 * tutor: abrir ficha (DETALLE), registrar entrada de bitácora (bitacora ·
 * CREAR) y aprobación final (proyecto·APROBAR — fail-closed: TableActions
 * oculta la acción si el rol no tiene la acción sembrada).
 */

import { Progress } from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FileAddOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { StatusPill, IdentidadCelda, InfoLinesCell } from '@atoms';
import { TableActions } from '@molecules';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import {
  formatEstadoProyecto,
  getEstadoProyectoPillClass,
} from '@application-titulacion/utils/titulacionPills';

/** Estados desde los que el tutor puede emitir la aprobación final (T11). */
const ESTADOS_APROBACION_FINAL = ['DEFENSA', 'PREDEFENSA', 'APROBADO_PREDEFENSA', 'DESARROLLO'];

export const createMisTutoradosTableColumns = ({
  onVerProyecto,
  onRegistrarBitacora,
  onAprobacionFinal,
  aprobandoId,
}) => {
  return [
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
      width: 280,
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
      title: 'Carrera e integrantes',
      key: 'carreraIntegrantes',
      width: 230,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            record.carreraNombre
              ? { icon: <BookOutlined />, label: record.carreraNombre }
              : null,
            {
              icon: <TeamOutlined />,
              label:
                record.integrantesResumen ||
                `${record.cantidadIntegrantes || 0} integrante${
                  (record.cantidadIntegrantes || 0) === 1 ? '' : 's'
                }`,
            },
          ].filter(Boolean)}
        />
      ),
    },
    {
      title: 'Avance',
      key: 'avance',
      width: 150,
      render: (_, record) => <Progress percent={record.porcentajeAvance} size="small" />,
      sorter: true,
      sortCompare: (a, b) => (a.porcentajeAvance || 0) - (b.porcentajeAvance || 0),
    },
    {
      title: 'Última tutoría',
      key: 'ultimaTutoria',
      width: 160,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            {
              icon: <CalendarOutlined />,
              label: record.ultimaTutoriaLabel || 'Sin registros',
            },
            record.observacionesPendientes > 0
              ? {
                  label: `${record.observacionesPendientes} observaci${
                    record.observacionesPendientes === 1 ? 'ón' : 'ones'
                  } pendiente${record.observacionesPendientes === 1 ? '' : 's'}`,
                }
              : null,
          ].filter(Boolean)}
        />
      ),
      sorter: true,
      sortCompare: (a, b) =>
        String(a.ultimaTutoriaFecha || '').localeCompare(String(b.ultimaTutoriaFecha || '')),
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
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 130,
      align: 'right',
      render: (_, record) => (
        <TableActions
          record={record}
          onView={() => onVerProyecto(record)}
          extraActions={[
            {
              key: 'bitacora',
              icon: <FileAddOutlined />,
              variant: 'info',
              tooltip: 'Registrar entrada del cronograma de progreso',
              permiso: TITULACION_PERMISOS.bitacora,
              accion: 'CREAR',
              onClick: () => onRegistrarBitacora(record),
            },
            ...(ESTADOS_APROBACION_FINAL.includes(record.estado)
              ? [
                  {
                    key: 'aprobacionFinal',
                    icon: <CheckCircleOutlined />,
                    variant: 'success',
                    tooltip: 'Aprobación final (informe de viabilidad técnica)',
                    permiso: TITULACION_PERMISOS.proyecto,
                    accion: 'APROBAR',
                    disabled: aprobandoId === record.id,
                    onClick: () => onAprobacionFinal(record),
                  },
                ]
              : []),
          ]}
          permisos={{
            ver: { codigo: TITULACION_PERMISOS.proyecto, accion: 'DETALLE' },
          }}
        />
      ),
    },
  ];
};
