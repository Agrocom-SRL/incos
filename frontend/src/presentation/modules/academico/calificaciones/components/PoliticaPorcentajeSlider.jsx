/**
 * Slider de porcentaje con etiqueta y valor (estilo INCOS).
 */

import { Flex, Slider, Typography } from 'antd';

const { Text } = Typography;

const PoliticaPorcentajeSlider = ({
  label,
  value,
  onChange,
  disabled = false,
  color = 'var(--color-primary, #196b45)',
}) => (
  <div className="cal-politica-slider">
    <Flex justify="space-between" align="center" className="cal-politica-slider__head">
      <Text className="cal-politica-slider__label">{label}</Text>
      <Text strong className="cal-politica-slider__valor" style={{ color }}>
        {Number(value ?? 0).toFixed(1)}%
      </Text>
    </Flex>
    <Slider
      min={0}
      max={100}
      step={0.5}
      value={Number(value) || 0}
      onChange={onChange}
      disabled={disabled}
      tooltip={{ formatter: (v) => `${v}%` }}
      styles={{
        track: { background: color },
        handle: { borderColor: color },
      }}
    />
  </div>
);

export default PoliticaPorcentajeSlider;
