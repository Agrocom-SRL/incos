/**
 * Cuota teórico / práctico vinculada (suma 100%).
 */

import { Flex } from 'antd';
import PoliticaPorcentajeSlider from './PoliticaPorcentajeSlider.jsx';
import { ajustarParComplementario } from '@application-academico/calificaciones/utils/politicaPorcentajeUtils.js';

const COLOR_TEORICO = '#196b45';
const COLOR_PRACTICO = '#399f53';

const PoliticaCuotaSliders = ({ teorico, practico, onChange, disabled = false }) => {
  const handleTeorico = (v) => {
    const [t, p] = ajustarParComplementario(teorico, v);
    onChange?.({ cuotaTeorico: t, cuotaPractico: p });
  };

  const handlePractico = (v) => {
    const [p, t] = ajustarParComplementario(practico, v);
    onChange?.({ cuotaTeorico: t, cuotaPractico: p });
  };

  return (
    <Flex vertical gap="large" className="cal-politica-cuota-sliders">
      <PoliticaPorcentajeSlider
        label="Teórico (por bimestre)"
        value={teorico}
        onChange={handleTeorico}
        disabled={disabled}
        color={COLOR_TEORICO}
      />
      <PoliticaPorcentajeSlider
        label="Práctico (por bimestre)"
        value={practico}
        onChange={handlePractico}
        disabled={disabled}
        color={COLOR_PRACTICO}
      />
    </Flex>
  );
};

export default PoliticaCuotaSliders;
