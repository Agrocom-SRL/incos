/**
 * Evaluaciones finales habilitadas — tarjetas activables (estilo método de pago).
 */

import { Form, Switch, Typography, Flex } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { Card } from '@atoms';

const { Paragraph, Text } = Typography;

const PoliticaEvaluacionesFinalesSection = ({ tipos = [] }) => (
  <Card
    title="Evaluaciones finales habilitadas"
    className="cal-politica-panel-card"
    headerColor="primary"
    variant="outlined"
    shadow={false}
  >
    <Paragraph type="secondary" className="cal-politica-panel-card__desc">
      Tipos que los docentes pueden activar en sus cursos. Si no está habilitado aquí, no aparece en
      Ajustes del curso.
    </Paragraph>

    <Form.List name="evaluacionesFinalesDisponibles">
      {(fields) => (
        <div className="cal-politica-finales-grid">
          {fields.map((field, index) => {
            const tipo = tipos[index];
            return (
              <div key={tipo?.codigo ?? field.key} className="cal-politica-final-card">
                <Flex align="center" justify="space-between" gap={12}>
                  <Flex align="center" gap={12}>
                    <span className="cal-politica-final-card__icon" aria-hidden>
                      <FileTextOutlined />
                    </span>
                    <div>
                      <Text strong className="cal-politica-final-card__nombre">
                        {tipo?.nombre}
                      </Text>
                      <Text type="secondary" className="cal-politica-final-card__codigo">
                        {tipo?.codigo}
                      </Text>
                    </div>
                  </Flex>
                  <Form.Item
                    name={[field.name, 'habilitadaInstitucional']}
                    valuePropName="checked"
                    noStyle
                  >
                    <Switch />
                  </Form.Item>
                </Flex>
              </div>
            );
          })}
        </div>
      )}
    </Form.List>
  </Card>
);

export default PoliticaEvaluacionesFinalesSection;
