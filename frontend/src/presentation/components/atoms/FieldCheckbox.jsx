/**
 * FieldCheckbox - Componente atómico para campos de checkbox
 * 
 * Single Responsibility: Wrapper de Checkbox de Ant Design
 * 
 * Atomic Design: Átomo
 * - Componente básico que encapsula Checkbox de Ant Design
 * - Acepta todas las props de Checkbox de Ant Design
 * 
 * @param {boolean} disabled - Si el campo está deshabilitado
 * @param {boolean} readOnly - Si el campo es solo lectura
 * @param {boolean} checked - Si está activado (valor controlado)
 * @param {boolean} defaultChecked - Si está activado por defecto
 * @param {Function} onChange - Callback cuando cambia el valor
 * @param {string} className - Clases CSS adicionales
 * @param {any} ...props - Otras props de Checkbox de Ant Design
 */

import { Checkbox } from 'antd';

const FieldCheckbox = ({
  disabled = false,
  readOnly = false,
  checked,
  defaultChecked = false,
  onChange,
  children,
  className = '',
  ...props
}) => {
  const checkboxClassName = className ? `field-checkbox ${className}`.trim() : 'field-checkbox';

  return (
    <Checkbox
      className={checkboxClassName}
      disabled={disabled || readOnly}
      checked={checked}
      defaultChecked={defaultChecked}
      onChange={onChange}
      {...props}
    >
      {children}
    </Checkbox>
  );
};

export default FieldCheckbox;

