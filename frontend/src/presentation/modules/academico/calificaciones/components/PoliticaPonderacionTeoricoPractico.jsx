/**
 * Ponderación teórico / práctico (gestión completa, suma 100%).
 */

import { Form, Flex, Typography, InputNumber } from 'antd';
import PoliticaPorcentajeSlider from './PoliticaPorcentajeSlider.jsx';
import { ajustarParComplementario } from '@application-academico/calificaciones/utils/politicaPorcentajeUtils.js';

const { Text } = Typography;

const COLOR_TEORICO = '#196b45';
const COLOR_PRACTICO = '#399f53';

const PoliticaPonderacionTeoricoPractico = ({ form, disabled = false }) => {
  const teorico = Form.useWatch('cuotaTeorico', form) ?? 30;
  const practico = Form.useWatch('cuotaPractico', form) ?? 70;

  const aplicarPar = (campo, valor) => {
    if (campo === 'cuotaTeorico') {
      const [t, p] = ajustarParComplementario(teorico, valor);
      form.setFieldsValue({ cuotaTeorico: t, cuotaPractico: p });
      return;
    }
    const [p, t] = ajustarParComplementario(practico, valor);
    form.setFieldsValue({ cuotaTeorico: t, cuotaPractico: p });
  };

  return (
    <>
      <Form.Item name="cuotaTeorico" hidden rules={[{ required: true }]}>
        <InputNumber style={{ display: 'none' }} />
      </Form.Item>
      <Form.Item name="cuotaPractico" hidden rules={[{ required: true }]}>
        <InputNumber style={{ display: 'none' }} />
      </Form.Item>
      <Flex vertical gap="large" className="cal-politica-cuota-sliders">
        <PoliticaPorcentajeSlider
          label="Teórico"
          value={teorico}
          onChange={(v) => aplicarPar('cuotaTeorico', v)}
          disabled={disabled}
          color={COLOR_TEORICO}
        />
        <PoliticaPorcentajeSlider
          label="Práctico"
          value={practico}
          onChange={(v) => aplicarPar('cuotaPractico', v)}
          disabled={disabled}
          color={COLOR_PRACTICO}
        />
        <Text type="secondary" className="cal-politica-ponderacion-hint">
          Al mover un control, el otro se ajusta para mantener 100% en la gestión.
        </Text>
      </Flex>
    </>
  );
};

export default PoliticaPonderacionTeoricoPractico;
