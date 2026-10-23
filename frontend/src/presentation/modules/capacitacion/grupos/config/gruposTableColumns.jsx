/**
 * Columnas del tab «Grupos» (módulo CAP).
 *
 * Lenguaje visual de CursosList: numeración + IdentidadCelda del curso con su
 * `StatusPill` de estado + InfoLinesCell de días, horas y aula + TableActions
 * (ver el curso y editar el grupo en el formulario de su curso). Orden en cliente (modo loadAll): cada columna
 * ordenable declara `sortCompare`.
 */

import { Flex } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { IdentidadCelda, InfoLinesCell, StatusPill } from '@atoms';
import { TableActions } from '@molecules';
import { allSpacing } from '@theme/tokens';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import {
  formatEstadoCurso,
  getEstadoCursoPillClass,
} from '@application-capacitacion/utils/capacitacionPills';

const compareText = (a, b) => (a || '').localeCompare(b || '', 'es', { sensitivity: 'base' });

export const createGruposTableColumns = ({ onVerCurso, onEditarGrupo }) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Curso',
    key: 'curso',
    width: 280,
    render: (_, record) => (
      <Flex vertical gap={allSpacing.marginXS} align="flex-start">
        <div className="cfg-identidad-clamp2" title={record.cursoTitulo}>
          <IdentidadCelda nombre={record.cursoTitulo.toUpperCase()} />
        </div>
        <StatusPill
          label={formatEstadoCurso(record.cursoEstado)}
          className={getEstadoCursoPillClass(record.cursoEstado)}
        />
      </Flex>
    ),
    sorter: true,
    sortCompare: (a, b) => compareText(a.cursoTitulo, b.cursoTitulo),
  },
  {
    title: 'Grupo',
    dataIndex: 'nombre',
    key: 'nombre',
    width: 180,
    sorter: true,
    sortCompare: (a, b) => compareText(a.nombre, b.nombre),
  },
  {
    title: 'Días',
    key: 'dias',
    width: 200,
    render: (_, record) => (
      <InfoLinesCell
        lines={record.bloques.map((bloque, i) => ({
          key: `d-${i}`,
          icon: <CalendarOutlined />,
          label: bloque.dias,
        }))}
      />
    ),
  },
  {
    title: 'Horas',
    key: 'horas',
    width: 150,
    render: (_, record) => (
      <InfoLinesCell
        lines={record.bloques.map((bloque, i) => ({
          key: `h-${i}`,
          icon: <ClockCircleOutlined />,
          label: bloque.horas || '—',
        }))}
      />
    ),
  },
  {
    title: 'Aula',
    key: 'aula',
    width: 180,
    render: (_, record) => (
      <InfoLinesCell
        lines={[
          record.aulaLabel ? { icon: <EnvironmentOutlined />, label: record.aulaLabel } : null,
        ].filter(Boolean)}
      />
    ),
  },
  {
    title: 'Cupo',
    key: 'cupo',
    width: 110,
    align: 'center',
    render: (_, record) => (record.cupoMaximo != null ? record.cupoMaximo : 'Sin tope'),
    sorter: true,
    sortCompare: (a, b) => (a.cupoMaximo ?? Infinity) - (b.cupoMaximo ?? Infinity),
  },
  {
    title: 'Inscritos',
    dataIndex: 'inscritosCount',
    key: 'inscritosCount',
    width: 110,
    align: 'center',
    sorter: true,
    sortCompare: (a, b) => (a.inscritosCount || 0) - (b.inscritosCount || 0),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 130,
    align: 'right',
    render: (_, record) => (
      <TableActions
        record={record}
        onView={() => onVerCurso(record)}
        onEdit={() => onEditarGrupo(record)}
        editTitle="Editar grupo (abre el curso en «Grupos y horarios»)"
        itemName={`el curso «${record.cursoTitulo}»`}
        permisos={{
          ver: { codigo: CAPACITACION_PERMISOS.curso, accion: 'DETALLE' },
          editar: { codigo: CAPACITACION_PERMISOS.curso, accion: 'EDITAR' },
        }}
      />
    ),
  },
];
