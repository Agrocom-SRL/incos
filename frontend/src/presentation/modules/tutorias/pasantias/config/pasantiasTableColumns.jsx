/**
 * Columnas del listado de trámites de pasantía (módulo TUT).
 *
 * Lenguaje visual de ProyectosGradoList (TUT): numeración + IdentidadCelda
 * (estudiante en orden APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES — la vista
 * 167 ya lo arma) + celdas multi-línea (InfoLinesCell) + StatusPill +
 * TableActions. Horas con Progress AntD (tokens del theme, sin hex).
 * Ordenamiento en CLIENTE (modo loadAll): columnas con `sortCompare`.
 */

import { Progress } from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  ShopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { StatusPill, IdentidadCelda, InfoLinesCell } from '@atoms';
import { TableActions } from '@molecules';
import { TUTORIAS_PERMISOS } from '@application-tutorias/utils/tutoriasPermisos';
import {
  formatEstadoPasantia,
  formatTipoPasantia,
  getEstadoPasantiaPillClass,
  getTipoPasantiaPillClass,
} from '@application-tutorias/utils/pasantiasPills';
import {
  PASANTIAS_LIST_PATH,
  pasantiaDetallePath,
  pasantiaEditarPath,
} from '@application-tutorias/config/paths';

export const createPasantiasTableColumns = ({ navigate, listNavState, refetch, deleteFn }) => {
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
      fixed: 'left',
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
      title: 'Carrera y gestión',
      key: 'carreraGestion',
      width: 210,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            record.carreraNombre ? { icon: <BookOutlined />, label: record.carreraNombre } : null,
            record.gestionLabel ? { icon: <CalendarOutlined />, label: record.gestionLabel } : null,
          ].filter(Boolean)}
        />
      ),
      sorter: true,
      sortCompare: (a, b) => (a.carreraNombre || '').localeCompare(b.carreraNombre || '', 'es'),
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
      sorter: true,
      sortCompare: (a, b) => (a.tipo || '').localeCompare(b.tipo || ''),
    },
    {
      title: 'Empresa y supervisor',
      key: 'empresaSupervisor',
      width: 230,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            { icon: <ShopOutlined />, label: record.empresaNombre || 'Sin empresa asignada' },
            {
              icon: <UserOutlined />,
              label: record.docenteSupervisorNombre || 'Sin supervisor asignado',
            },
          ]}
        />
      ),
      sorter: true,
      sortCompare: (a, b) => (a.empresaNombre || '').localeCompare(b.empresaNombre || '', 'es'),
    },
    {
      title: 'Horas',
      key: 'horas',
      width: 150,
      render: (_, record) =>
        record.porcentajeHoras != null ? (
          <Progress
            percent={record.porcentajeHoras}
            size="small"
            format={() => record.horasLabel}
          />
        ) : (
          record.horasLabel || '—'
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
      sorter: true,
      sortCompare: (a, b) => (a.estado || '').localeCompare(b.estado || ''),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 130,
      align: 'right',
      render: (_, record) => {
        const itemName = `el trámite de ${record.estudianteNombre || 'pasantía'}`;
        const itemDetails = [
          { label: 'Estudiante', value: record.estudianteNombre, icon: <UserOutlined /> },
          { label: 'Camino', value: formatTipoPasantia(record.tipo) },
          { label: 'Carrera', value: record.carreraNombre, icon: <BookOutlined /> },
          { label: 'Empresa', value: record.empresaNombre, icon: <ShopOutlined /> },
          { label: 'Estado', value: formatEstadoPasantia(record.estado) },
        ].filter((d) => d.value != null && d.value !== '');

        return (
          <TableActions
            record={record}
            navigate={navigate}
            refetch={refetch}
            deleteFn={deleteFn}
            itemName={itemName}
            itemDetails={itemDetails}
            onView={() => navigate(pasantiaDetallePath(record.id), { state: listNavState })}
            onEdit={() =>
              navigate(pasantiaEditarPath(record.id), {
                state: { ...listNavState, returnListPath: PASANTIAS_LIST_PATH },
              })
            }
            editTitle="Editar trámite"
            permisos={{
              ver: { codigo: TUTORIAS_PERMISOS.pasantia, accion: 'DETALLE' },
              editar: { codigo: TUTORIAS_PERMISOS.pasantia, accion: 'EDITAR' },
              eliminar: { codigo: TUTORIAS_PERMISOS.pasantia, accion: 'ELIMINAR' },
            }}
          />
        );
      },
    },
  ];
};
