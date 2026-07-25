/**
 * Columnas del listado de sesiones de reforzamiento (módulo TUT ·
 * `sesionesReforzamiento`, vista 161).
 *
 * Lenguaje visual de CursosCapacitacionList (CAP): numeración +
 * IdentidadCelda (tema) + celdas multi-línea (InfoLinesCell) + StatusPill del
 * kit + TableActions (ver ficha / editar / eliminar con confirmación).
 * Ordenamiento en CLIENTE (modo loadAll): columnas con `sortCompare`.
 */

import {
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { IdentidadCelda, InfoLinesCell, StatusPill } from '@atoms';
import { TableActions } from '@molecules';
import { TUTORIAS_PERMISOS } from '@application-tutorias/utils/tutoriasPermisos';
import {
  formatEstadoSesion,
  getEstadoSesionPillClass,
} from '@application-tutorias/utils/tutoriasPills';
import { sesionDetallePath, sesionEditarPath } from '@application-tutorias/config/paths';

export const createSesionesTableColumns = ({ navigate, listNavState, refetch, deleteFn }) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Tema',
    key: 'tema',
    width: 250,
    render: (_, record) => (
      <div className="cfg-identidad-clamp2" title={record.tema || undefined}>
        <IdentidadCelda nombre={(record.tema || 'Sin tema').toUpperCase()} />
      </div>
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.tema || '').localeCompare(b.tema || '', 'es', { sensitivity: 'base' }),
  },
  {
    title: 'Curso y docente',
    key: 'cursoDocente',
    width: 230,
    render: (_, record) => (
      <InfoLinesCell
        lines={[
          { icon: <BookOutlined />, label: record.cursoLabel },
          { icon: <UserOutlined />, label: record.docenteNombre },
        ]}
      />
    ),
    sorter: true,
    sortCompare: (a, b) => (a.cursoLabel || '').localeCompare(b.cursoLabel || '', 'es'),
  },
  {
    title: 'Fecha y horario',
    key: 'fechaHorario',
    width: 160,
    render: (_, record) => (
      <InfoLinesCell
        lines={[
          { icon: <CalendarOutlined />, label: record.fechaLabel },
          { icon: <ClockCircleOutlined />, label: record.horarioLabel },
        ]}
      />
    ),
    sorter: true,
    sortCompare: (a, b) => String(a.fecha || '').localeCompare(String(b.fecha || '')),
    defaultSortOrder: 'descend',
  },
  {
    title: 'Modalidad',
    key: 'modalidad',
    width: 170,
    render: (_, record) => (
      <InfoLinesCell
        lines={
          record.modalidad === 'VIRTUAL'
            ? [{ icon: <LinkOutlined />, label: 'Virtual' }]
            : [{ icon: <EnvironmentOutlined />, label: record.aulaLabel || 'Presencial' }]
        }
      />
    ),
    sorter: true,
    sortCompare: (a, b) => (a.modalidad || '').localeCompare(b.modalidad || ''),
  },
  {
    title: 'Participantes',
    key: 'participantes',
    width: 150,
    render: (_, record) => (
      <InfoLinesCell
        lines={[
          {
            icon: <TeamOutlined />,
            label: `${record.participantesTotal} convocado${
              record.participantesTotal === 1 ? '' : 's'
            }`,
          },
          record.estado === 'REALIZADA'
            ? { label: `${record.participantesAsistieron} asistieron` }
            : null,
        ].filter(Boolean)}
      />
    ),
    sorter: true,
    sortCompare: (a, b) => (a.participantesTotal || 0) - (b.participantesTotal || 0),
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 130,
    align: 'center',
    render: (_, record) => (
      <StatusPill
        label={formatEstadoSesion(record.estado)}
        className={getEstadoSesionPillClass(record.estado)}
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
      const itemName = `la sesión «${record.tema || 'sin tema'}»`;
      const itemDetails = [
        { label: 'Tema', value: record.tema },
        { label: 'Curso', value: record.cursoLabel, icon: <BookOutlined /> },
        { label: 'Docente', value: record.docenteNombre, icon: <UserOutlined /> },
        { label: 'Fecha', value: record.fechaLabel, icon: <CalendarOutlined /> },
        { label: 'Estado', value: formatEstadoSesion(record.estado) },
      ].filter((d) => d.value != null && d.value !== '');

      return (
        <TableActions
          record={record}
          navigate={navigate}
          refetch={refetch}
          deleteFn={deleteFn}
          itemName={itemName}
          itemDetails={itemDetails}
          onView={() => navigate(sesionDetallePath(record.id), { state: listNavState })}
          onEdit={() => navigate(sesionEditarPath(record.id), { state: listNavState })}
          editTitle="Editar sesión"
          editDisabled={record.estado !== 'PROGRAMADA'}
          editDisabledTitle="Solo se editan sesiones programadas"
          permisos={{
            ver: { codigo: TUTORIAS_PERMISOS.sesion, accion: 'DETALLE' },
            editar: { codigo: TUTORIAS_PERMISOS.sesion, accion: 'EDITAR' },
            eliminar: { codigo: TUTORIAS_PERMISOS.sesion, accion: 'ELIMINAR' },
          }}
        />
      );
    },
  },
];

export default createSesionesTableColumns;
