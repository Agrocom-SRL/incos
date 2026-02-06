/**
 * step2PeriodoYParalelos - Paso 2: Periodo y Paralelos
 *
 * La carrera ya fue seleccionada en el paso anterior. Aquí se elige el periodo
 * y un paralelo para tener las materias y armar el horario.
 */

import { Text } from '@atoms';
import { Typography } from 'antd';

const { Title } = Typography;

const PERIODO_PARALELOS_HEADER = {
  title: 'Periodo y Paralelos',
};

const PERIODO_PARALELOS_FIELDS = [
  {
    name: 'periodo',
    type: 'select',
    label: 'Periodo académico',
    placeholder: 'Seleccione el periodo',
    required: true,
    span: 12,
  },
  {
    name: 'infoPeriodoParalelos',
    type: 'alert',
    label: '',
    message: 'Información',
    description: 'Seleccione el periodo. Luego elija un paralelo para ver las materias y armar el horario.',
    alertType: 'info',
    span: 12,
    required: false,
  },
  {
    name: 'listaMaterias',
    type: 'activity',
    label: 'Materias disponibles',
    span: 12,
    required: false,
    emptyMessage: 'Seleccione un paralelo para ver las materias.',
  },
  {
    name: 'listaParalelos',
    type: 'cards',
    label: 'Paralelos disponibles',
    span: 12,
    required: false,
    emptyMessage: 'Seleccione un periodo para ver los paralelos.',
    renderItem: (paralelo) => {
      const periodoNombre = paralelo.nombre || paralelo.codigo || 'Sin nombre';
      const descripcionCompleta = paralelo.descripcion || '';
      const descripcion = descripcionCompleta.split(' - ')[0] || '';
      const carreraNombre = paralelo.carreraNombre || '';
      const turno = paralelo.turno || '';
      const estadisticas = paralelo.estadisticas || {};
      const totalInscritos = Number(estadisticas.totalInscritos) || 0;
      const totalHombres = Number(estadisticas.totalHombres) || 0;
      const totalMujeres = Number(estadisticas.totalMujeres) || 0;

      return (
        <>
          <Title level={4}>{periodoNombre}</Title>
          <div className="paralelo-card-info">
            {carreraNombre && <Text strong>{carreraNombre}</Text>}
            {turno && (
              <Text strong style={{ fontSize: '16px', color: '#1890ff', fontWeight: 600, marginTop: '8px', marginBottom: '8px', display: 'block' }}>
                Turno: {turno}
              </Text>
            )}
            {descripcion && <Text type="secondary" className="paralelo-card-descripcion">{descripcion}</Text>}
            <div className="paralelo-card-estadisticas" style={{ marginTop: '12px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', border: '1px solid #d9d9d9' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Text style={{ fontSize: '16px', fontWeight: 600 }}><Text strong>Total:</Text> <span className="estadistica-valor">{totalInscritos}</span> estudiante{totalInscritos !== 1 ? 's' : ''}</Text>
                <Text style={{ fontSize: '16px', fontWeight: 600, color: '#1890ff' }}><Text strong>Hombres:</Text> <span className="estadistica-valor">{totalHombres}</span></Text>
                <Text style={{ fontSize: '16px', fontWeight: 600, color: '#eb2f96' }}><Text strong>Mujeres:</Text> <span className="estadistica-valor">{totalMujeres}</span></Text>
              </div>
            </div>
          </div>
        </>
      );
    },
  },
];

export const getStep2PeriodoYParalelosFields = () => ({
  periodoYParalelos: {
    ...PERIODO_PARALELOS_HEADER,
    fields: PERIODO_PARALELOS_FIELDS,
  },
});
