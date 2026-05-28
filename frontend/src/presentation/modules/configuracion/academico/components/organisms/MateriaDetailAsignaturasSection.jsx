/**
 * Organismo: tab Asignatura de materia — matriz en planes.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Empty, Table, Tag } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import DetailInfoCard from '@molecules/DetailInfoCard';
import { planDetallePath } from '@application-configuracion/academico/config/paths';

const periodoLabel = (row) => {
  if (row.periodoNombre) return row.periodoNombre;
  if (row.periodoNumero != null) return `Periodo ${row.periodoNumero}`;
  return '—';
};

const MateriaDetailAsignaturasSection = ({ asignaturas = [], puedeVerPlan = false }) => {
  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        title: 'Plan de estudio',
        dataIndex: 'planNombre',
        render: (nombre, record) => (
          <span>
            {nombre || `Plan #${record.planEstudioId}`}
            {record.planVigente ? (
              <Tag color="success" className="cfg-planes-tag-vigente">
                Vigente
              </Tag>
            ) : null}
          </span>
        ),
      },
      {
        title: 'Carrera',
        key: 'carrera',
        render: (_, record) => record.carreraNombre || record.carreraCodigo || '—',
      },
      {
        title: 'Periodo',
        key: 'periodo',
        render: (_, record) => periodoLabel(record),
      },
      {
        title: 'Carga horaria',
        dataIndex: 'horasSemanales',
        width: 120,
        align: 'right',
        render: (h) => (h != null && h !== '' ? `${h} h/sem` : '—'),
      },
      {
        title: 'Créditos',
        dataIndex: 'creditos',
        width: 90,
        align: 'right',
        render: (c) => (c != null && c !== '' ? c : '—'),
      },
      {
        title: 'Prerrequisitos',
        key: 'prerrequisitos',
        width: 120,
        align: 'center',
        render: (_, record) =>
          record.tienePrerrequisitos ? (
            <Tag icon={<CheckCircleOutlined />} color="processing">
              Sí ({record.cantidadPrerrequisitos})
            </Tag>
          ) : (
            <Tag icon={<CloseCircleOutlined />}>No</Tag>
          ),
      },
      {
        title: '',
        key: 'accion',
        width: 100,
        align: 'right',
        render: (_, record) =>
          record.planEstudioId && puedeVerPlan ? (
            <button
              type="button"
              className="sd-btn sd-btn--outline"
              onClick={() => navigate(planDetallePath(record.planEstudioId))}
            >
              Matriz
            </button>
          ) : null,
      },
    ],
    [navigate, puedeVerPlan],
  );

  return (
    <DetailInfoCard title="Matriz en planes de estudio" icon={<ReadOutlined />} cols={1}>
      {asignaturas.length === 0 ? (
        <Empty description="Esta materia no está asignada a ningún plan de estudio." />
      ) : (
        <Table
          size="small"
          rowKey={(row) => row.asignaturaPlanId ?? `${row.planEstudioId}-${row.periodoId}`}
          dataSource={asignaturas}
          columns={columns}
          pagination={asignaturas.length > 10 ? { pageSize: 10 } : false}
          scroll={{ x: 'max-content' }}
        />
      )}
    </DetailInfoCard>
  );
};

export default MateriaDetailAsignaturasSection;
