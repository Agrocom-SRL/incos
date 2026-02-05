/**
 * FieldRadio - Componente atómico para campos de selección única (radio buttons)
 * 
 * Single Responsibility: Renderizar radio group con opciones configurables
 * 
 * Atomic Design: Atom
 * - Wrapper simple de Radio.Group de Ant Design
 * - No combina átomos propios, solo adapta un componente de Ant Design
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * 
 * Soporta opciones con:
 * - label: Texto principal de la opción
 * - description: Texto descriptivo adicional (opcional)
 * - disabled: Si la opción está deshabilitada (opcional)
 * - value: Valor de la opción
 */

import { Radio, Typography } from 'antd';

const { Text } = Typography;

const FieldRadio = ({
  placeholder,
  disabled = false,
  readOnly = false,
  options = [],
  value,
  defaultValue,
  onChange,
  className = '',
  ...props
}) => {
  const radioClassName = className ? `field-radio ${className}`.trim() : 'field-radio';

  return (
    <Radio.Group
      className={radioClassName}
      disabled={disabled || readOnly}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      {...props}
    >
      {options.map((option) => {
        const optionDisabled = option.disabled !== undefined ? option.disabled : false;
        const hasDescription = option.description && option.description.trim();
        
        return (
          <Radio 
            key={option.value} 
            value={option.value}
            disabled={optionDisabled || disabled || readOnly}
            style={hasDescription ? { display: 'block', marginBottom: 8 } : {}}
          >
            <div>
              <div>{option.label}</div>
              {hasDescription && (
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
                  {option.description}
                </Text>
              )}
            </div>
          </Radio>
        );
      })}
    </Radio.Group>
  );
};

export default FieldRadio;

