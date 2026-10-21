/**
 * Organismo: tab "Grupos y horarios" de la ficha de curso (CAP).
 *
 * Tabla de grupos (tipo «paralelo»): nombre, horarios, aula («SAB 08:00-12:00», en
 * orden semanal) y cupo (inscritos / máximo, o solo inscritos si no hay tope).
 * Estado vacío cubierto. Recibe props ya mapeadas; no llama hooks.
 */

import { Empty, Table } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined, TeamOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { InfoLinesCell } from '@atoms';

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
    title: 'Horarios',
    key: 'horarios',
    render: (_, grupo) => (
      <InfoLinesCell
        lines={grupo.horarios.map((h) => ({
          key: h.horarioId,
          icon: <ClockCircleOutlined />,
          label: h.etiqueta,
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

const CursoGruposSection = ({ grupos = [] }) => (
  <div className="sd-tab-body">
    <DetailInfoCard
      title={`Grupos y horarios (${grupos.length})`}
      icon={<ClockCircleOutlined />}
      cols={1}
    >
      {grupos.length > 0 ? (
        <Table
          dataSource={grupos}
          columns={columns}
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
