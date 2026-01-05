/**
 * FieldSwitch - Componente atómico para campos de switch (toggle)
 * 
 * Single Responsibility: Wrapper de Switch de Ant Design
 * 
 * Atomic Design: Átomo
 * - Componente básico que encapsula Switch de Ant Design
 * - Acepta todas las props de Switch de Ant Design
 * 
 * @param {boolean} disabled - Si el campo está deshabilitado
 * @param {boolean} readOnly - Si el campo es solo lectura
 * @param {boolean} checked - Si está activado (valor controlado)
 * @param {boolean} defaultChecked - Si está activado por defecto
 * @param {Function} onChange - Callback cuando cambia el valor
 * @param {string} checkedChildren - Texto cuando está activado
 * @param {string} unCheckedChildren - Texto cuando está desactivado
 * @param {string} className - Clases CSS adicionales
 * @param {any} ...props - Otras props de Switch de Ant Design
 */

import { Switch } from 'antd';

const FieldSwitch = ({
  disabled = false,
  readOnly = false,
  checked,
  defaultChecked = false,
  onChange,
  checkedChildren,
  unCheckedChildren,
  className = '',
  ...props
}) => {
  const switchClassName = className ? `field-switch ${className}`.trim() : 'field-switch';

  return (
    <Switch
      className={switchClassName}
      disabled={disabled || readOnly}
      checked={checked}
      defaultChecked={defaultChecked}
      onChange={onChange}
      checkedChildren={checkedChildren}
      unCheckedChildren={unCheckedChildren}
      {...props}
    />
  );
};

export default FieldSwitch;

