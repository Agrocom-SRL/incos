/**
 * Formulario del plan de calificaciones por bimestre (evaluaciones + pesos).
 */

import { DatePicker, Input, InputNumber, Select, Table, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Button } from '@atoms';
import { FormCard } from '@atoms';

const { Text } = Typography;

const PlanEvaluacionesForm = ({
  bimestreActivo,
  setBimestreActivo,
  bimestres,
  evaluacionesBimestre,
  componentes,
  tiposSugeridos,
  sumaPesosTeorico,
  sumaPesosPractico,
  plan,
  onCuotaChange,
  onAgregarEvaluacion,
  onActualizarEvaluacion,
  onEliminarEvaluacion,
}) => {
  const columns = [
    {
      title: 'Evaluación',
      key: 'nombre',
      render: (_, row) => (
        <Input
          value={row.nombre}
          placeholder="Ej. Examen parcial 1"
          onChange={(e) => onActualizarEvaluacion(row.id, { nombre: e.target.value })}
        />
      ),
    },
    {
      title: 'Tipo',
      key: 'tipo',
      width: 180,
      render: (_, row) => (
        <Select
          style={{ width: '100%' }}
          value={row.tipoCodigo}
          options={tiposSugeridos
            .filter((t) => t.ambito === 'BIMESTRE')
            .map((t) => ({ value: t.codigo, label: t.nombre }))}
          onChange={(v) => {
            const tipo = tiposSugeridos.find((t) => t.codigo === v);
            onActualizarEvaluacion(row.id, {
              tipoCodigo: v,
              componente: tipo?.componente ?? row.componente,
            });
          }}
        />
      ),
    },
    {
      title: 'Componente',
      key: 'componente',
      width: 120,
      render: (_, row) => (
        <Select
          style={{ width: '100%' }}
          value={row.componente}
          options={componentes.map((c) => ({ value: c.value, label: c.label }))}
          onChange={(v) => onActualizarEvaluacion(row.id, { componente: v })}
        />
      ),
    },
    {
      title: 'Peso %',
      key: 'peso',
      width: 100,
      render: (_, row) => (
        <InputNumber
          min={0}
          max={100}
          value={row.peso}
          onChange={(v) => onActualizarEvaluacion(row.id, { peso: v ?? 0 })}
        />
      ),
    },
    {
      title: 'Fecha',
      key: 'fecha',
      width: 140,
      render: (_, row) => (
        <DatePicker
          value={row.fecha ? dayjs(row.fecha) : null}
          format="DD/MM/YYYY"
          onChange={(d) =>
            onActualizarEvaluacion(row.id, { fecha: d ? d.format('YYYY-MM-DD') : null })
          }
        />
      ),
    },
    {
      title: '',
      key: 'acc',
      width: 48,
      render: (_, row) => (
        <Button
          type="text"
          variant="error"
          icon={<DeleteOutlined />}
          onClick={() => onEliminarEvaluacion(row.id)}
          title="Quitar evaluación"
        />
      ),
    },
  ];

  const pesoHint = (suma, label) => (
    <Text
      className={`cal-peso-hint ${suma === 100 ? 'cal-peso-hint--ok' : 'cal-peso-hint--warn'}`}
    >
      {label}: {suma}% / 100%
    </Text>
  );

  return (
    <>
      <FormCard title="Reparto teórico / práctico (boletín)" className="cal-plan-section">
        <p className="cal-cursos-intro">
          Cuotas institucionales por bimestre (tabla configuracion_evaluacion). La suma debe ser 100.
        </p>
        <div className="cal-plan-cuotas">
          <div>
            <Text type="secondary">Teórico</Text>
            <InputNumber
              min={0}
              max={100}
              value={plan.cuotas?.teorico}
              addonAfter="pts"
              onChange={(v) => onCuotaChange('teorico', v)}
            />
          </div>
          <div>
            <Text type="secondary">Práctico</Text>
            <InputNumber
              min={0}
              max={100}
              value={plan.cuotas?.practico}
              addonAfter="pts"
              onChange={(v) => onCuotaChange('practico', v)}
            />
          </div>
        </div>
      </FormCard>

      <FormCard title="Evaluaciones por bimestre" className="cal-plan-section">
        <Select
          value={bimestreActivo}
          style={{ width: 160, marginBottom: 12 }}
          options={bimestres.map((b) => ({ value: b, label: `Bimestre ${b}` }))}
          onChange={setBimestreActivo}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: 12 }}>
          {pesoHint(sumaPesosTeorico, 'Pesos teórico')}
          {pesoHint(sumaPesosPractico, 'Pesos práctico')}
        </div>
        <Table
          size="small"
          pagination={false}
          rowKey="id"
          columns={columns}
          dataSource={evaluacionesBimestre}
          locale={{ emptyText: 'Agregá al menos una evaluación para este bimestre' }}
        />
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={onAgregarEvaluacion}
          style={{ marginTop: 12 }}
        >
          Agregar evaluación
        </Button>
      </FormCard>
    </>
  );
};

export default PlanEvaluacionesForm;
