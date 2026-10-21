/**
 * Control de un campo `custom`: Form.Item inyecta `value`/`onChange` y se reenvían a `field.render`.
 */
const FormCustomControl = ({ field, disabled, readOnly, id, value, onChange }) =>
  field.render?.({ id, value, onChange, disabled: disabled || readOnly }) ?? null;

export default FormCustomControl;
