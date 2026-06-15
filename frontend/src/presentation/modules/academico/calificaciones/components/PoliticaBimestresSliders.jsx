/**
 * Pesos de los 4 bimestres (suma 100%, sliders vinculados).
 */

import { Flex } from 'antd';
import PoliticaPorcentajeSlider from './PoliticaPorcentajeSlider.jsx';
import { ajustarPesosMultiples } from '@application-academico/calificaciones/utils/politicaPorcentajeUtils.js';

const COLORES = ['#196b45', '#22854f', '#399f53', '#6db088'];

const PoliticaBimestresSliders = ({ pesos = [], onChange, disabled = false }) => {
  const safe = pesos.length === 4 ? pesos : [25, 25, 25, 25];

  const handleChange = (index, value) => {
    const next = ajustarPesosMultiples(safe, index, value);
    onChange?.(next);
  };

  return (
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
    </Flex>
  );
};

export default PoliticaBimestresSliders;
