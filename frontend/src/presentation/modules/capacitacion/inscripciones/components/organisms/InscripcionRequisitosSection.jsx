/**
 * Organismo: requisitos de la ficha de inscripción (CAP) — SOLO LECTURA.
 *
 * La ficha es una vista: muestra por requisito si es obligatorio, si fue entregado y la
 * fecha de entrega, sin casillas ni acciones de guardado. El requisito que prueba el
 * depósito del costo del curso lleva además su pill y texto de ayuda.
 */

import { Empty, Table, Typography } from 'antd';
import { CheckSquareOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { StatusPill } from '@atoms';
import { formatFechaCorta } from '@application/utils';
import {
  AYUDA_REQUISITO_ACREDITA,
  REQUISITO_ACREDITA_PILL_CLASS,
} from '@application-capacitacion/utils/capacitacionPills';

const PILL_OBLIGATORIO = 'cfg-materia-pill cfg-materia-pill--warning';
const PILL_OPCIONAL = 'cfg-materia-pill cfg-materia-pill--default';
const PILL_ENTREGADO = 'cfg-materia-pill cfg-materia-pill--success';
const PILL_PENDIENTE = 'cfg-materia-pill cfg-materia-pill--danger';

const columns = [
  {
    title: 'Requisito',
    dataIndex: 'descripcion',
    render: (descripcion, requisito) => (
      <>
        {descripcion}
        {requisito.acreditaPagoCurso ? (
          <div>
            <StatusPill label="Acredita pago del curso" className={REQUISITO_ACREDITA_PILL_CLASS} />{' '}
            <Typography.Text type="secondary">{AYUDA_REQUISITO_ACREDITA}</Typography.Text>
          </div>
        ) : null}
      </>
    ),
  },
  {
    title: 'Obligatorio',
    dataIndex: 'obligatorio',
    width: 130,
    render: (obligatorio) => (
      <StatusPill
        label={obligatorio ? 'Obligatorio' : 'Opcional'}
        className={obligatorio ? PILL_OBLIGATORIO : PILL_OPCIONAL}
      />
    ),
  },
  {
    title: 'Entregado',
    dataIndex: 'entregado',
    width: 130,
    render: (entregado) => (
      <StatusPill
        label={entregado ? 'Entregado' : 'Pendiente'}
        className={entregado ? PILL_ENTREGADO : PILL_PENDIENTE}
      />
    ),
  },
  {
    title: 'Fecha de entrega',
    dataIndex: 'fechaEntrega',
    width: 150,
    render: (fecha) => formatFechaCorta(fecha),
  },
];

const InscripcionRequisitosSection = ({ requisitos = [] }) => (
  <DetailInfoCard
    title={`Requisitos de inscripción (${requisitos.length})`}
    icon={<CheckSquareOutlined />}
    cols={1}
  >
    {requisitos.length > 0 ? (
      <Table
        dataSource={requisitos}
        columns={columns}
        rowKey="requisitoId"
        size="small"
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
    ) : (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="El curso no exige requisitos de inscripción."
      />
    )}
  </DetailInfoCard>
);

export default InscripcionRequisitosSection;
