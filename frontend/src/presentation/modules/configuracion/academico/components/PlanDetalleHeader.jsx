/**
 * Cabecera de entidad del plan — patrón armado de horarios / sd-profile.
 */

import { Tag, Typography } from 'antd';
import { BookOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Card } from '@atoms';

const { Text, Title } = Typography;

const PlanDetalleHeader = ({ planMeta, carrera, carreraColor }) => {
  if (!planMeta) return null;

  return (
    <Card className="cfg-plan-header cfg-academico-resumen-card" styles={{ body: { padding: 24 } }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: carreraColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 22,
            }}
          >
            <BookOutlined />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {planMeta.nombre_plan || `Plan #${planMeta.id}`}
            </Title>
            <Text type="secondary">
              {carrera ? (
                <>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      backgroundColor: carreraColor,
                      marginRight: 6,
                    }}
                  />
                  {carrera.codigo} {carrera.nombre}
                </>
              ) : (
                '—'
              )}
            </Text>
            {planMeta.resolucion_ministerial ? (
              <div>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {planMeta.resolucion_ministerial}
                </Text>
              </div>
            ) : null}
          </div>
        </div>
        <div>
          {planMeta.vigente ? (
            <Tag icon={<CheckCircleOutlined />} color="success">
              Vigente
            </Tag>
          ) : (
            <Tag color="default">Histórico</Tag>
          )}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 24,
          marginTop: 16,
          flexWrap: 'wrap',
          fontSize: 14,
        }}
      >
        <span>
          <Text type="secondary">Horas/semana: </Text>
          <Text strong>{planMeta.horas_semana ?? '—'}</Text>
        </span>
        {planMeta.duracion_anios != null ? (
          <span>
            <Text type="secondary">Duración: </Text>
            <Text strong>{planMeta.duracion_anios} años</Text>
          </span>
        ) : null}
        {planMeta.carga_horaria_total != null ? (
          <span>
            <Text type="secondary">Carga total: </Text>
            <Text strong>{planMeta.carga_horaria_total} h</Text>
          </span>
        ) : null}
      </div>
      <Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
        Edite horas y modalidad en la matriz. La suma por periodo debe coincidir con las horas semanales del plan.
      </Text>
    </Card>
  );
};

export default PlanDetalleHeader;
