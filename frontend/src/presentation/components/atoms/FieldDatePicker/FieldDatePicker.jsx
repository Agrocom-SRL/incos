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
 * @param {Function} disabledDate - (opcional) Restricción extra de negocio; se combina con la de edad
 * @param {boolean} emptyByDefault - Si true, sin valor queda vacío en vez de mostrar la fecha actual
 * @param {any} ...props - Otras props de DatePicker de Ant Design
 */

import { useMemo } from 'react';
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
  disabledDate: disabledDateProp,
  emptyByDefault = false,
  ...props
}) => {
  const datePickerClassName = className ? `field-date-picker ${className}`.trim() : 'field-date-picker';

  // Usar hook para obtener formato, lógica de restricción y valores convertidos
  const { acceptedFormats,
    disabledDate: disabledDateAge,
    value: dayjsValue,
    defaultValue: dayjsDefaultValue
  } = useFieldDatePicker(minAge, value, defaultValue, emptyByDefault);

  // Restricción de fecha: la de edad (si hay minAge) combinada con la del consumidor
  // (rango de negocio, p. ej. acotar a la gestión vigente). Cualquiera deshabilita el día.
  const disabledDate = useMemo(() => {
    if (!disabledDateProp) return disabledDateAge;
    return (current) => disabledDateAge(current) || disabledDateProp(current);
  }, [disabledDateProp, disabledDateAge]);

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

