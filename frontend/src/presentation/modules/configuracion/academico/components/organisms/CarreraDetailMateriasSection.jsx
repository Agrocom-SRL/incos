/**
 * Organismo: tab Materias por periodo — detalle de carrera.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Empty, Table, Tag } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import DetailInfoCard from '@molecules/DetailInfoCard';
import IdentidadCelda from '@atoms/IdentidadCelda';
import StatusPill from '@atoms/StatusPill';
import {
  getMateriaTipoLabel,
  getMateriaTipoPillClass,
} from '@application-configuracion/academico/config/materiaTipoPill';
import { materiaDetallePath } from '@application-configuracion/academico/config/paths';

const periodoTitulo = (p) =>
  p.periodoNombre || (p.periodoNumero != null ? `Periodo ${p.periodoNumero}` : 'Sin periodo');

const CarreraDetailMateriasSection = ({ periodos = [], puedeVerMateria = false }) => {
  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        title: 'Materia',
        key: 'materia',
        render: (_, row) => (
          <IdentidadCelda
            codigo={row.materiaSigla}
            nombre={(row.materiaNombre || '—').toUpperCase()}
          />
        ),
      },
      {
        title: 'Plan',
        dataIndex: 'planNombre',
        render: (nombre, row) => (
          <span>
            {nombre || `Plan #${row.planEstudioId}`}
            {row.planVigente ? (
              <Tag color="success" className="cfg-planes-tag-vigente">
                Vigente
              </Tag>
            ) : null}
          </span>
        ),
      },
      {
        title: 'Tipo',
        dataIndex: 'materiaTipo',
        width: 140,
        render: (tipo) => (
          <StatusPill label={getMateriaTipoLabel(tipo)} className={getMateriaTipoPillClass(tipo)} />
        ),
      },
      {
        title: 'h/sem',
        dataIndex: 'horasSemanales',
        width: 80,
        align: 'right',
        render: (h) => (h != null ? h : '—'),
      },
      {
        title: 'Créditos',
        dataIndex: 'creditos',
        width: 80,
        align: 'right',
        render: (c) => (c != null && c !== '' ? c : '—'),
      },
      {
        title: 'Prerreq.',
        key: 'prerrequisitos',
        width: 90,
        align: 'center',
        render: (_, row) => (row.tienePrerrequisitos ? <Tag color="processing">Sí</Tag> : <Tag>No</Tag>),
      },
      {
        title: '',
        key: 'acciones',
        width: 100,
        align: 'right',
        render: (_, row) =>
          puedeVerMateria && row.materiaId ? (
            <button
              type="button"
              className="sd-btn sd-btn--outline"
              onClick={() => navigate(materiaDetallePath(row.materiaId))}
            >
              Materia
            </button>
          ) : null,
      },
    ],
    [navigate, puedeVerMateria],
  );

  if (!periodos.length) {
    return <Empty description="No hay materias asignadas en los planes de esta carrera." />;
  }

  return periodos.map((periodo) => (
    <DetailInfoCard
      key={periodo.periodoId ?? periodoTitulo(periodo)}
      title={periodoTitulo(periodo)}
      icon={<BookOutlined />}
      cols={1}
    >
      {(periodo.materias ?? []).length === 0 ? (
        <Empty description="Sin materias en este periodo." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Table
          size="small"
          rowKey={(row) => row.asignaturaPlanId ?? `${row.materiaId}-${row.planEstudioId}`}
          dataSource={periodo.materias}
          columns={columns}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      )}
    </DetailInfoCard>
  ));
};

export default CarreraDetailMateriasSection;
