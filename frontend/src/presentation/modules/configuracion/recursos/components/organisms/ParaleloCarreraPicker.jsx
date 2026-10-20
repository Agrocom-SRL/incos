/**
 * Selección visual de carrera (imagen + color institucional).
 *
 * Wrapper delgado del organismo compartido `@organisms/CarreraCardPicker`
 * (patrón páginas gemelas): conserva el contrato histórico de props
 * (`carreras, loading, error, value, onChange, disabled`) para sus
 * consumidores (ABM de paralelos, planes de estudio, registro de estudiantes).
 */

import { CarreraCardPicker } from '@organisms';

const ParaleloCarreraPicker = ({
  carreras = [],
  loading = false,
  error = null,
  value,
  onChange,
  disabled = false,
}) => (
  <CarreraCardPicker
    carreras={carreras}
    loading={loading}
    error={error}
    value={value}
    onChange={onChange}
    disabled={disabled}
  />
);

export default ParaleloCarreraPicker;
