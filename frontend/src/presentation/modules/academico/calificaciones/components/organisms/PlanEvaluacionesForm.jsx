/**
 * Formulario del plan de calificaciones por bimestre (evaluaciones + pesos).
 */

import { DatePicker, Input, InputNumber, Select, Table, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined, PercentageOutlined, UnorderedListOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ActionButton } from '@atoms';
import CalificacionesBimestreTabs from '../molecules/CalificacionesBimestreTabs.jsx';
import CalificacionesSectionCard from '../molecules/CalificacionesSectionCard.jsx';

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
        <ActionButton
          permiso="academico.calificacion.modificar"
          accion="EDITAR"
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
    <Text className={`cal-peso-hint ${suma === 100 ? 'cal-peso-hint--ok' : 'cal-peso-hint--warn'}`}>
      {label}: {suma}% / 100%
    </Text>
  );

  return (
    <>
      <CalificacionesSectionCard
        title="Reparto teórico / práctico"
        icon={<PercentageOutlined />}
        variant="cabecera"
        bodyClassName="cal-section__body--block"
      >
        <p className="cal-flow-lede">
          Cuotas institucionales por bimestre (tabla configuracion_evaluacion). La suma teórico + práctico debe
          ser 100 puntos.
        </p>
        <div className="cal-plan-cuotas">
          <div className="cal-plan-cuota-field">
            <label htmlFor="cal-cuota-teorico">Teórico</label>
            <InputNumber
              id="cal-cuota-teorico"
              min={0}
              max={100}
              value={plan.cuotas?.teorico}
              addonAfter="pts"
              onChange={(v) => onCuotaChange('teorico', v)}
              style={{ width: '100%' }}
            />
          </div>
          <div className="cal-plan-cuota-field">
            <label htmlFor="cal-cuota-practico">Práctico</label>
            <InputNumber
              id="cal-cuota-practico"
              min={0}
              max={100}
              value={plan.cuotas?.practico}
              addonAfter="pts"
              onChange={(v) => onCuotaChange('practico', v)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </CalificacionesSectionCard>

      <CalificacionesBimestreTabs bimestres={bimestres} value={bimestreActivo} onChange={setBimestreActivo} />

      <CalificacionesSectionCard
        title={`Evaluaciones — bimestre ${bimestreActivo}`}
        icon={<UnorderedListOutlined />}
        variant="resumen"
        bodyClassName="cal-section__body--block"
        extra={
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {pesoHint(sumaPesosTeorico, 'Teórico')}
            {pesoHint(sumaPesosPractico, 'Práctico')}
          </div>
        }
      >
        <div className="cal-plan-table-wrap">
          <Table
            size="small"
            pagination={false}
            rowKey="id"
            columns={columns}
            dataSource={evaluacionesBimestre}
            locale={{ emptyText: 'Agregá al menos una evaluación para este bimestre' }}
          />
        </div>
        <ActionButton
          permiso="academico.calificacion.periodo"
          accion="CREAR"
          type="dashed"
          icon={<PlusOutlined />}
          onClick={onAgregarEvaluacion}
          style={{ marginTop: 12 }}
        >
          Agregar evaluación
        </ActionButton>
      </CalificacionesSectionCard>
    </>
  );
};

export default PlanEvaluacionesForm;
