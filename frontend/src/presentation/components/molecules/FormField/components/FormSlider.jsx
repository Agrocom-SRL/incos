/**
 * Slider con valor en vivo. Sin `styles` de color propio: hereda el tema de
 * Ant Design (`token.colorPrimary`) como cualquier otro control del sistema,
 * en vez de forzar un acento (evita el desajuste con el resto de los inputs).
 * `Form.Item` ya muestra el label arriba; soporta puntos críticos (`field.marks`).
 */
import { Slider, Typography } from 'antd';

const { Text } = Typography;

const FormSlider = ({ value, onChange, disabled = false, readOnly = false, field }) => {
  const min = field.min ?? 0;
  const max = field.max ?? 100;
  const step = field.step ?? 1;
  const suffix = field.suffix ?? '';
  const d = disabled || readOnly;

  return (
    <div className="form-slider">
      <Slider
        min={min}
        max={max}
        step={step}
        value={Number(value) || 0}
        onChange={onChange}
        disabled={d}
        marks={field.marks}
        tooltip={{ formatter: (v) => `${v}${suffix}` }}
      />
      <Text type="secondary" className="form-slider__value">
        {Number(value ?? 0)}
        {suffix}
      </Text>
    </div>
  );
};

export default FormSlider;
