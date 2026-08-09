/**
 * Control de carrera para Form.Item — limpia periodo solo si cambia la carrera.
 */
import ParaleloCarreraPicker from './ParaleloCarreraPicker';

const ParaleloCarreraFormControl = ({ value, onChange, form, ...pickerProps }) => (
  <ParaleloCarreraPicker
    {...pickerProps}
    value={value}
    onChange={(next) => {
      const prev = value;
      onChange?.(next);
      if (form && Number(prev) !== Number(next)) {
        form.setFieldValue('periodo_id', undefined);
        form.setFieldValue('plan_estudio_id', undefined);
      }
    }}
  />
);

export default ParaleloCarreraFormControl;
