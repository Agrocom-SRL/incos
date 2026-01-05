/**
 * FieldTextarea - Componente atómico para campos de texto multilínea
 * 
 * Single Responsibility: Renderizar textarea con configuración básica
 * 
 * Atomic Design: Atom
 * - Wrapper simple de Input.TextArea de Ant Design
 * - No combina átomos propios, solo adapta un componente de Ant Design
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 */

import { Input } from 'antd';

const { TextArea } = Input;

const FieldTextarea = ({
  placeholder,
  disabled = false,
  readOnly = false,
  maxLength,
  rows = 4,
  minRows,
  value,
  defaultValue,
  onChange,
  className = '',
  ...props
}) => {
  const textareaClassName = className ? `field-textarea ${className}`.trim() : 'field-textarea';

  // Usar autoSize con minRows para establecer altura mínima basada en rows
  // Esto previene que el textarea se reduzca por debajo del tamaño mínimo
  const textareaProps = {
    className: textareaClassName,
    placeholder,
    disabled: disabled || readOnly,
    maxLength,
    value,
    defaultValue,
    onChange,
    autoSize: { minRows: minRows !== undefined ? minRows : rows, maxRows: undefined },
    ...props,
  };

  return <TextArea {...textareaProps} />;
};

export default FieldTextarea;

