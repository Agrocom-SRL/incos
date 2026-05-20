/**
 * Ponderación de los 4 bimestres en la nota anual (suma 100%, sliders vinculados).
 */

import { Form, Flex, Typography } from 'antd';
import PoliticaPorcentajeSlider from './PoliticaPorcentajeSlider.jsx';
import { ajustarPesosMultiples } from '@application-academico/calificaciones/utils/politicaPorcentajeUtils.js';

const { Text } = Typography;

const COLORES = ['#196b45', '#22854f', '#399f53', '#6db088'];
const DEFAULT_PESOS = [25, 25, 25, 25];

const PoliticaPonderacionBimestres = ({ form, disabled = false }) => {
  const pesos = Form.useWatch('pesosBimestres', form);
  const safe = Array.isArray(pesos) && pesos.length === 4 ? pesos : DEFAULT_PESOS;

  const handleChange = (index, value) => {
    const next = ajustarPesosMultiples(safe, index, value);
    form.setFieldValue('pesosBimestres', next);
  };

  return (
    <>
      <Form.Item name="pesosBimestres" hidden initialValue={[25, 25, 25, 25]}>
        <input type="hidden" aria-hidden tabIndex={-1} />
      </Form.Item>
      <Flex vertical gap="large" className="cal-politica-bimestres-sliders">
        {safe.map((p, index) => (
          <PoliticaPorcentajeSlider
            key={`bim-${index + 1}`}
            label={`Bimestre ${index + 1}`}
            value={p}
            onChange={(v) => handleChange(index, v)}
            disabled={disabled}
            color={COLORES[index]}
          />
        ))}
        <Text type="secondary" className="cal-politica-ponderacion-hint">
          Al mover un bimestre, los demás se redistribuyen proporcionalmente (total 100%).
        </Text>
      </Flex>
    </>
  );
};

export default PoliticaPonderacionBimestres;
