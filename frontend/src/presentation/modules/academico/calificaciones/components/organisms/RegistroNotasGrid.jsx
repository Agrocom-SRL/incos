/**
 * Grilla de registro de notas: estudiantes × evaluaciones del bimestre.
 */

import { InputNumber, Table, Tag, Typography } from 'antd';
import { FormCard } from '@atoms';

const { Text } = Typography;

const RegistroNotasGrid = ({
  estudiantes,
  evaluacionesColumnas,
  getNota,
  onNotaChange,
  cuotas,
}) => {
  const columns = [
    {
      title: 'Código',
      dataIndex: 'codigo',
      key: 'codigo',
      fixed: 'left',
      width: 100,
    },
    {
      title: 'Estudiante',
      dataIndex: 'nombre',
      key: 'nombre',
      fixed: 'left',
      width: 200,
    },
    ...evaluacionesColumnas.map((ev) => ({
      title: (
        <span>
          {ev.nombre || 'Evaluación'}
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {ev.componente} · {ev.peso}%
          </Text>
        </span>
      ),
      key: ev.id,
      width: 120,
      align: 'center',
      render: (_, row) => (
        <InputNumber
          className="cal-notas-input"
          min={0}
          max={100}
          step={0.01}
          value={getNota(row.matriculaId, ev.id)}
          onChange={(v) => onNotaChange(row.matriculaId, ev.id, v)}
          placeholder="—"
        />
      ),
    })),
  ];

  return (
    <FormCard
      title="Notas por evaluación"
      extra={
        <span>
          <Tag>Teórico {cuotas?.teorico ?? 30}</Tag>
          <Tag>Práctico {cuotas?.practico ?? 70}</Tag>
        </span>
      }
    >
      <p className="cal-cursos-intro">
        Cada nota se guarda en evaluaciones (bimestre_matricula). Al cerrar el bimestre se calculan
        nota_teorico, nota_practico y nota_bimestre en bimestres_matricula.
      </p>
      <div className="cal-notas-grid-wrap cal-notas-grid">
        <Table
          size="small"
          bordered
          pagination={false}
          scroll={{ x: Math.max(600, 300 + evaluacionesColumnas.length * 120) }}
          rowKey="matriculaId"
          columns={columns}
          dataSource={estudiantes}
        />
      </div>
    </FormCard>
  );
};

export default RegistroNotasGrid;
