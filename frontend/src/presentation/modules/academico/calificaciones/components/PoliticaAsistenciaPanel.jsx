/**
 * Política de asistencia: tarjetas seleccionables + campos según modo.
 */

import { Form, Radio, Typography, Flex } from 'antd';
import { TeamOutlined, StopOutlined, WarningOutlined } from '@ant-design/icons';
import { Card } from '@atoms';
import PoliticaPorcentajeSlider from './PoliticaPorcentajeSlider.jsx';
import { POLITICAS_ASISTENCIA } from '@application-academico/calificaciones/utils/politicasAsistencia.js';

const { Text, Paragraph } = Typography;

const ICONOS = {
  NO_AFECTA: TeamOutlined,
  COMPUTA_NOTA: WarningOutlined,
  CAUSA_REPROBACION: StopOutlined,
};

const COLORES = {
  NO_AFECTA: { color: '#595959', bg: '#fafafa' },
  COMPUTA_NOTA: { color: '#196b45', bg: '#e8f5ec' },
  CAUSA_REPROBACION: { color: '#cf1322', bg: '#fff1f0' },
};

const PoliticaAsistenciaPanel = ({ form, disabled = false }) => {
  const pad = Form.useWatch('politicaAsistenciaDefault', form) ?? {};
  const politica = pad.politica;

  return (
    <Card
      title="Política de asistencia (default)"
      className="cal-politica-panel-card"
      headerColor="primary"
      variant="outlined"
      shadow={false}
    >
      <Paragraph type="secondary" className="cal-politica-panel-card__desc">
        Define qué ocurre con la asistencia a nivel institucional. Los docentes pueden ajustarla por
        curso.
      </Paragraph>

      <Form.Item
        name={['politicaAsistenciaDefault', 'politica']}
        rules={[{ required: true, message: 'Seleccioná una política' }]}
        className="cal-politica-asistencia-radio"
      >
        <Radio.Group disabled={disabled} style={{ width: '100%' }}>
          <div className="cal-politica-asistencia-grid">
            {POLITICAS_ASISTENCIA.map((p) => {
              const Icon = ICONOS[p.value] ?? TeamOutlined;
              const { color, bg } = COLORES[p.value] ?? COLORES.NO_AFECTA;
              const selected = politica === p.value;
              return (
                <Radio.Button
                  key={p.value}
                  value={p.value}
                  className="cal-politica-asistencia-option"
                  style={{
                    borderColor: selected ? color : '#e8e8e8',
                    background: selected ? bg : '#fff',
                  }}
                >
                  <Flex align="flex-start" gap={12}>
                    <Icon style={{ fontSize: 22, color, marginTop: 2 }} />
                    <div>
                      <Text strong>{p.label}</Text>
                      <Paragraph type="secondary" style={{ margin: '4px 0 0', fontSize: 12 }}>
                        {p.descripcion}
                      </Paragraph>
                    </div>
                  </Flex>
                </Radio.Button>
              );
            })}
          </div>
        </Radio.Group>
      </Form.Item>

      {politica === 'COMPUTA_NOTA' ? (
        <div className="cal-politica-asistencia-campos">
          <Text className="cal-politica-asistencia-campos__titulo">Parámetros — aporta al práctico</Text>
          <Form.Item
            name={['politicaAsistenciaDefault', 'pesoAsistencia']}
            rules={[{ required: true, message: 'Indicá el peso' }]}
          >
            <PoliticaPorcentajeSlider
              label="Porcentaje de la nota que proviene de asistencia"
              disabled={disabled}
              color="#196b45"
            />
          </Form.Item>
        </div>
      ) : null}

      {politica === 'CAUSA_REPROBACION' ? (
        <div className="cal-politica-asistencia-campos cal-politica-asistencia-campos--reprobacion">
          <Text className="cal-politica-asistencia-campos__titulo">
            Parámetros — reprobación por inasistencia
          </Text>
          <Form.Item
            name={['politicaAsistenciaDefault', 'minimoAsistencia']}
            rules={[{ required: true, message: 'Indicá el mínimo' }]}
          >
            <PoliticaPorcentajeSlider
              label="Asistencia mínima exigida"
              disabled={disabled}
              color="#d97706"
            />
          </Form.Item>
          <Form.Item
            name={['politicaAsistenciaDefault', 'notaReprobada']}
            rules={[{ required: true, message: 'Indicá la nota' }]}
          >
            <PoliticaPorcentajeSlider
              label="Nota asignada si no alcanza la asistencia mínima"
              disabled={disabled}
              color="#cf1322"
            />
          </Form.Item>
        </div>
      ) : null}
    </Card>
  );
};

export default PoliticaAsistenciaPanel;
