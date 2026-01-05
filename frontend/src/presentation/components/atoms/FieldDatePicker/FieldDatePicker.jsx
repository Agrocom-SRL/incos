/**
 * FieldDatePicker - Componente atómico para campos de fecha
 * 
 * Single Responsibility: Wrapper de DatePicker de Ant Design con lógica separada
 * 
 * Atomic Design: Átomo
 * - Componente básico que encapsula DatePicker de Ant Design
 * - Usa hook personalizado (useFieldDatePicker) para separar lógica de presentación
 * - Soporta formato dd-mm-yyyy o dd/mm/yyyy
 * - Soporta restricción de edad mínima
 * 
 * @param {string} placeholder - Texto de ayuda en el campo
 * @param {boolean} disabled - Si el campo está deshabilitado
 * @param {boolean} readOnly - Si el campo es solo lectura
 * @param {string} picker - Tipo de picker: 'date' | 'week' | 'month' | 'quarter' | 'year' (default: 'date')
 * @param {number|null} minAge - Edad mínima requerida (en años). Si es null, no hay restricción
 * @param {string} className - Clases CSS adicionales
 * @param {any} defaultValue - Valor por defecto
 * @param {any} value - Valor controlado
 * @param {Function} onChange - Callback cuando cambia el valor
 * @param {any} ...props - Otras props de DatePicker de Ant Design
 */

import { DatePicker } from 'antd';
import { useFieldDatePicker } from './hooks/useFieldDatePicker';

const FieldDatePicker = ({
  placeholder,
  disabled = false,
  readOnly = false,
  picker = 'date',
  minAge = null,
  value,
  onChange,
  defaultValue,
  className = '',
  ...props
}) => {
  const datePickerClassName = className ? `field-date-picker ${className}`.trim() : 'field-date-picker';

  // Usar hook para obtener formato, lógica de restricción y valores convertidos
  const { acceptedFormats,
    disabledDate,
    value: dayjsValue,
    defaultValue: dayjsDefaultValue
  } = useFieldDatePicker(minAge, value, defaultValue);

  // Handler personalizado para onChange
  const handleChange = (date, dateString) => {
    if (onChange) {
      onChange(date, dateString);
    }
  };

  return (
    <DatePicker
      className={datePickerClassName}
      placeholder={placeholder}
      disabled={disabled || readOnly}
      format={acceptedFormats}
      picker={picker}
      value={dayjsValue}
      defaultValue={dayjsDefaultValue}
      onChange={handleChange}
      disabledDate={disabledDate}
      {...props}
    />
  );
};

export default FieldDatePicker;

