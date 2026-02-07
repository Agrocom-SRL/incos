/**
 * FieldCheckboxGroup - Componente atómico para selección múltiple (checkbox group)
 *
 * Single Responsibility: Renderizar Checkbox.Group con opciones en formato botón u horizontal.
 *
 * Atomic Design: Atom
 * - Wrapper de Checkbox.Group de Ant Design
 * - optionType='button' y checkboxLayout='horizontal' para estilo tipo radio horizontal
 *
 * Uso en wizard inscripción: periodos (varios periodos marcados para ver paralelos de todos).
 */

import { Checkbox } from 'antd';

const FieldCheckboxGroup = ({
  disabled = false,
  readOnly = false,
  options = [],
  value = [],
  defaultValue,
  onChange,
  className = '',
  optionType = 'default',
  checkboxLayout = 'vertical',
  ...props
}) => {
  const groupClassName = className ? `field-checkbox-group ${className}`.trim() : 'field-checkbox-group';
  const isButton = optionType === 'button';
  const isHorizontal = checkboxLayout === 'horizontal';

  const groupStyle = isHorizontal
    ? { display: 'flex', flexWrap: 'wrap', gap: 8 }
    : undefined;

  // Ant Design Checkbox.Group requiere value como array (usa value.includes); normalizar por si Form inyecta un valor escalar
  const safeValue = Array.isArray(value) ? value : value != null ? [value] : [];

  // Ant Design Checkbox.Group no tiene optionType; usamos clase para estilizar como botones en CSS
  const finalClassName = isButton ? `${groupClassName} field-checkbox-group--button` : groupClassName;

  return (
    <Checkbox.Group
      className={finalClassName}
      disabled={disabled || readOnly}
      options={options}
      value={safeValue}
      defaultValue={defaultValue}
      onChange={onChange}
      style={groupStyle}
      {...props}
    />
  );
};

export default FieldCheckboxGroup;
