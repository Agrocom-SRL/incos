/**
 * Columnas del listado de proyectos de grado (módulo TUT).
 *
 * Lenguaje visual de CursosCapacitacionList (CAP): numeración +
 * IdentidadCelda + celdas multi-línea (InfoLinesCell) + StatusPill +
 * TableActions. % de avance con Progress AntD (tokens del theme, sin hex).
 * Ordenamiento en CLIENTE (modo loadAll): columnas con `sortCompare`.
 */

import { Progress } from 'antd';
import {
  BookOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { StatusPill, IdentidadCelda, InfoLinesCell } from '@atoms';
import { TableActions } from '@molecules';
import { TUTORIAS_PERMISOS } from '@application-tutorias/utils/tutoriasPermisos';
import {
  formatEstadoProyecto,
  getEstadoProyectoPillClass,
} from '@application-tutorias/utils/tutoriasPills';
import {
  PROYECTOS_GRADO_LIST_PATH,
  proyectoGradoDetallePath,
  proyectoGradoEditarPath,
} from '@application-tutorias/config/paths';

export const createProyectosGradoTableColumns = ({
  navigate,
  listNavState,
  refetch,
  deleteFn,
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
            nombre={(record.titulo || 'Sin título').toUpperCase()}
            descripcion={record.modalidadNombre || record.modalidadCodigo || undefined}
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
            record.carreraNombre
              ? { icon: <BookOutlined />, label: record.carreraNombre }
              : null,
            {
              icon: <UserOutlined />,
              label: record.tutorNombre || 'Sin tutor asignado',
            },
          ].filter(Boolean)}
        />
      ),
      sorter: true,
      sortCompare: (a, b) =>
        (a.carreraNombre || '').localeCompare(b.carreraNombre || '', 'es'),
    },
    {
      title: 'Integrantes',
      key: 'integrantes',
      width: 200,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            {
              icon: <TeamOutlined />,
              label: `${record.cantidadIntegrantes || 0} integrante${
                (record.cantidadIntegrantes || 0) === 1 ? '' : 's'
              }`,
            },
            record.integrantesResumen ? { label: record.integrantesResumen } : null,
          ].filter(Boolean)}
        />
      ),
      sorter: true,
      sortCompare: (a, b) => (a.cantidadIntegrantes || 0) - (b.cantidadIntegrantes || 0),
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
      title: 'Obs. pendientes',
      key: 'pendientes',
      width: 130,
      align: 'center',
      render: (_, record) =>
        record.observacionesPendientes > 0 ? (
          <StatusPill
            label={`${record.observacionesPendientes} pendiente${
              record.observacionesPendientes === 1 ? '' : 's'
            }`}
            className="cfg-materia-pill cfg-materia-pill--warning"
          />
        ) : (
          <StatusPill label="Al día" className="cfg-materia-pill cfg-materia-pill--success" />
        ),
      sorter: true,
      sortCompare: (a, b) => (a.observacionesPendientes || 0) - (b.observacionesPendientes || 0),
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
    {
      title: 'Acciones',
      key: 'acciones',
      width: 130,
      align: 'right',
      render: (_, record) => {
        const itemName = `el proyecto «${record.titulo}»`;
        const itemDetails = [
          { label: 'Proyecto', value: record.titulo },
          { label: 'Modalidad', value: record.modalidadNombre, icon: <SolutionOutlined /> },
          { label: 'Carrera', value: record.carreraNombre, icon: <BookOutlined /> },
          { label: 'Tutor', value: record.tutorNombre, icon: <UserOutlined /> },
          { label: 'Estado', value: formatEstadoProyecto(record.estado) },
        ].filter((d) => d.value != null && d.value !== '');

        return (
          <TableActions
            record={record}
            navigate={navigate}
            refetch={refetch}
            deleteFn={deleteFn}
            itemName={itemName}
            itemDetails={itemDetails}
            onView={() => navigate(proyectoGradoDetallePath(record.id), { state: listNavState })}
            onEdit={() =>
              navigate(proyectoGradoEditarPath(record.id), {
                state: { ...listNavState, returnListPath: PROYECTOS_GRADO_LIST_PATH },
              })
            }
            editTitle="Editar proyecto"
            permisos={{
              ver: { codigo: TUTORIAS_PERMISOS.proyecto, accion: 'DETALLE' },
              editar: { codigo: TUTORIAS_PERMISOS.proyecto, accion: 'EDITAR' },
              eliminar: { codigo: TUTORIAS_PERMISOS.proyecto, accion: 'ELIMINAR' },
            }}
          />
        );
      },
    },
  ];
};
