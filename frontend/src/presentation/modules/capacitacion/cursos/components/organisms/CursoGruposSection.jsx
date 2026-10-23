/**
 * Organismo: tab "Grupos y horarios" de la ficha de curso (CAP).
 *
 * Tabla de grupos (tipo «paralelo»): nombre, días y horas en columnas separadas (los días que
 * comparten hora van juntos: «Martes y Jueves» · «19:00 - 21:00»), aula y cupo (inscritos /
 * máximo, o solo inscritos si no hay tope). Con matrícula por grupo (el curso cobra matrícula)
 * añade su columna. Estado vacío cubierto. Recibe props ya mapeadas; no llama hooks.
 */

import { Empty, Table } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, TeamOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { InfoLinesCell } from '@atoms';
import { formatBs } from '@application/utils/formatters';
import { bloquesHorarios } from '@application-capacitacion/utils/horarioCapacitacion';

const columns = [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index) => index + 1,
  },
  { title: 'Grupo', dataIndex: 'nombre', key: 'nombre' },
  {
    title: 'Días',
    key: 'dias',
    render: (_, grupo) => (
      <InfoLinesCell
        lines={bloquesHorarios(grupo.horarios).map((b, index) => ({
          key: `d-${index}`,
          icon: <CalendarOutlined />,
          label: b.dias,
        }))}
      />
    ),
  },
  {
    title: 'Horas',
    key: 'horas',
    width: 160,
    render: (_, grupo) => (
      <InfoLinesCell
        lines={bloquesHorarios(grupo.horarios).map((b, index) => ({
          key: `h-${index}`,
          icon: <ClockCircleOutlined />,
          label: b.horas || '—',
        }))}
      />
    ),
  },
  {
    title: 'Aula',
    key: 'aula',
    width: 180,
    render: (_, grupo) => (
      <InfoLinesCell
        lines={[
          grupo.aulaLabel ? { icon: <EnvironmentOutlined />, label: grupo.aulaLabel } : null,
        ].filter(Boolean)}
      />
    ),
  },
  {
    title: 'Cupo',
    key: 'cupo',
    width: 200,
    render: (_, grupo) => (
      <InfoLinesCell
        lines={[
          {
            icon: <TeamOutlined />,
            label:
              grupo.cupoMaximo != null
                ? `${grupo.inscritosCount} / ${grupo.cupoMaximo} inscritos`
                : `${grupo.inscritosCount} inscritos`,
          },
          grupo.cupoDisponible != null ? { label: `${grupo.cupoDisponible} disponibles` } : null,
        ].filter(Boolean)}
      />
    ),
  },
];

/** Matrícula del grupo: la propia o, si no tiene, la del curso. */
const columnaMatricula = (costoMatriculaCurso) => ({
  title: 'Matrícula',
  key: 'matricula',
  width: 130,
  render: (_, grupo) => {
    const monto = Number(grupo.costoMatricula ?? costoMatriculaCurso) || 0;
    return monto > 0 ? `Bs ${formatBs(monto)}` : 'No aplica';
  },
});

const CursoGruposSection = ({ grupos = [], cobraMatricula = false, costoMatriculaCurso = 0 }) => (
  <div className="sd-tab-body">
    <DetailInfoCard
      title={`Grupos y horarios (${grupos.length})`}
      icon={<ClockCircleOutlined />}
      cols={1}
    >
      {grupos.length > 0 ? (
        <Table
          dataSource={grupos}
          columns={cobraMatricula ? [...columns, columnaMatricula(costoMatriculaCurso)] : columns}
          rowKey={(grupo) => grupo.id ?? grupo.nombre}
          size="small"
          pagination={false}
        />
      ) : (
        <Empty description="El curso aún no tiene grupos. Agréguelos desde «Editar» para poder abrir inscripciones." />
      )}
    </DetailInfoCard>
  </div>
);

export default CursoGruposSection;
