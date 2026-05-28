/**
 * Cabecera de entidad del plan — patrón sd-profile / armado horarios.
 */

import { Tag, Typography } from 'antd';
import { BookOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';
import { Card } from '@atoms';
import '../styles/plan-detalle-header.css';

const { Text, Title } = Typography;

const PlanDetalleHeader = ({ planMeta, carrera, carreraColor }) => {
  if (!planMeta) return null;

  const accent = sanitizeDocenteColorHex(carreraColor) || undefined;

  return (
    <Card className="cfg-plan-header cfg-academico-resumen-card" styles={{ body: { padding: 24 } }}>
      <div className="cfg-plan-header__top">
        <div className="cfg-plan-header__identity">
          <div
            className="cfg-plan-header__icon"
            style={accent ? { backgroundColor: accent } : undefined}
          >
            <BookOutlined />
          </div>
          <div>
            <Title level={4} className="cfg-plan-header__title">
              {planMeta.nombre_plan || `Plan #${planMeta.id}`}
            </Title>
            <Text type="secondary">
              {carrera ? (
                <span className="cfg-plan-header__carrera-line">
                  {accent ? (
                    <span className="cfg-plan-header__swatch" style={{ backgroundColor: accent }} />
                  ) : null}
                  {carrera.codigo} {carrera.nombre}
                </span>
              ) : (
                '—'
              )}
            </Text>
            {planMeta.resolucion_ministerial ? (
              <div>
                <Text type="secondary" className="cfg-plan-header__resolucion">
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
      <div className="cfg-plan-header__stats">
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
      <Text type="secondary" className="cfg-plan-header__hint">
        Edite horas y modalidad en la matriz. La suma por periodo debe coincidir con las horas semanales del plan.
      </Text>
    </Card>
  );
};

export default PlanDetalleHeader;
