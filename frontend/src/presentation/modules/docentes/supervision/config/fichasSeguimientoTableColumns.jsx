/**
 * Columnas del listado de fichas de seguimiento en clase (módulo DOC ·
 * `fichasSeguimiento`, vista 174).
 *
 * Lenguaje visual de SesionesList (TUT): IdentidadCelda + InfoLinesCell +
 * StatusPill del kit + TableActions (ver ficha / editar; sin eliminar — la
 * ficha realizada no se borra).
 */

import { BankOutlined, CalendarOutlined, ReadOutlined, UserOutlined } from '@ant-design/icons';
import { IdentidadCelda, InfoLinesCell, StatusPill } from '@atoms';
import { TableActions } from '@molecules';
import {
  SUPERVISION_FICHA_PERMISO,
  fichaSeguimientoDetallePath,
  fichaSeguimientoEditarPath,
} from '@application-docentes/supervision/config/paths';
import {
  formatResultadoFichaLabel,
  getDocsCompletosPillClass,
} from '@application-docentes/supervision/utils/fichaSeguimientoPills';

export const createFichasSeguimientoTableColumns = ({ navigate, listNavState }) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Docente',
    key: 'docente',
    width: 220,
    render: (_, record) => (
      <IdentidadCelda codigo={record.asignaturaSigla} nombre={record.docenteNombre || 'Sin docente'} />
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.docenteNombre || '').localeCompare(b.docenteNombre || '', 'es', { sensitivity: 'base' }),
  },
  {
    title: 'Curso y carrera',
    key: 'cursoCarrera',
    width: 220,
    render: (_, record) => (
      <InfoLinesCell
        lines={[
          { icon: <ReadOutlined />, label: record.asignaturaLabel || record.asignaturaNombre },
          { icon: <BankOutlined />, label: record.carreraParaleloLabel },
        ]}
      />
    ),
    sorter: true,
    sortCompare: (a, b) => (a.carreraParaleloLabel || '').localeCompare(b.carreraParaleloLabel || '', 'es'),
  },
  {
    title: 'Fecha y evaluador',
    key: 'fechaEvaluador',
    width: 200,
    render: (_, record) => (
      <InfoLinesCell
        lines={[
          { icon: <CalendarOutlined />, label: record.fechaLabel },
          { icon: <UserOutlined />, label: record.evaluadorNombre },
        ]}
      />
    ),
    sorter: true,
    sortCompare: (a, b) => String(a.fechaSeguimiento || '').localeCompare(String(b.fechaSeguimiento || '')),
    defaultSortOrder: 'descend',
  },
  {
    title: 'Resultado',
    key: 'resultado',
    width: 190,
    align: 'center',
    render: (_, record) => (
      <StatusPill
        label={formatResultadoFichaLabel(record)}
        className={getDocsCompletosPillClass(record.docsPresentados)}
      />
    ),
    sorter: true,
    sortCompare: (a, b) => (a.docsPresentados || 0) - (b.docsPresentados || 0),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 100,
    align: 'right',
    render: (_, record) => {
      const itemName = `la ficha de seguimiento de «${record.docenteNombre || 'docente'}»`;
      const itemDetails = [
        { label: 'Docente', value: record.docenteNombre, icon: <UserOutlined /> },
        { label: 'Curso', value: record.asignaturaLabel, icon: <ReadOutlined /> },
        { label: 'Fecha', value: record.fechaLabel, icon: <CalendarOutlined /> },
      ].filter((d) => d.value != null && d.value !== '');

      return (
        <TableActions
          record={record}
          navigate={navigate}
          itemName={itemName}
          itemDetails={itemDetails}
          viewNavigateState={listNavState}
          onView={() => navigate(fichaSeguimientoDetallePath(record.id), { state: listNavState })}
          onEdit={() => navigate(fichaSeguimientoEditarPath(record.id), { state: listNavState })}
          editTitle="Editar ficha"
          permisos={{
            ver: { codigo: SUPERVISION_FICHA_PERMISO, accion: 'DETALLE' },
            editar: { codigo: SUPERVISION_FICHA_PERMISO, accion: 'EDITAR' },
          }}
        />
      );
    },
  },
];

export default createFichasSeguimientoTableColumns;
