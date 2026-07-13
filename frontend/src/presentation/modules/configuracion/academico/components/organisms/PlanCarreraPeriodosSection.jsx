/**
 * Selector de carrera del plan de estudio — reutiliza `ParaleloCarreraPicker`
 * (configuracion/recursos) tal cual, como `beforeFields` de la sección
 * "Carrera y periodos" dentro de `PlanFormSections` (patrón `sections` de
 * `CfgFormWorkspace`, gemelo de `ParaleloFormSections`).
 *
 * `ParaleloCarreraPicker` expone `value`/`onChange(id)` — contrato estándar
 * de un componente controlado de Ant Design — por lo que basta envolverlo en
 * un `Form.Item` sin adaptadores adicionales (a diferencia de
 * `ParaleloCarreraFormControl`, que solo agrega el efecto secundario de
 * limpiar `periodo_id`, innecesario aquí).
 */
import { Form } from 'antd';
import ParaleloCarreraPicker from '@configuracion-recursos/components/organisms/ParaleloCarreraPicker';

const PlanCarreraPeriodosSection = ({
  carreras = [],
  carrerasLoading = false,
  carrerasError = null,
  disabled = false,
}) => (
  <Form.Item
    name="carreraId"
    label="Carrera"
    rules={[{ required: true, message: 'Seleccione la carrera' }]}
    className="cfg-paralelo-carrera-form-item"
  >
    <ParaleloCarreraPicker
      carreras={carreras}
      loading={carrerasLoading}
      error={carrerasError}
      disabled={disabled}
    />
  </Form.Item>
);

export default PlanCarreraPeriodosSection;
