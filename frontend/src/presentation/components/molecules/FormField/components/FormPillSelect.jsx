/**
 * Select cerrado con pills: solo opciones del listado (sin búsqueda ni texto libre).
 */
import { useCallback, useEffect, useMemo } from 'react';
import { Select } from 'antd';
import StatusPill from '@atoms/StatusPill';

const isValueInOptions = (currentValue, options) => {
  if (currentValue == null || currentValue === '') return true;
  return options.some((o) => String(o.value) === String(currentValue));
};

const FormPillSelect = ({
  placeholder,
  disabled = false,
  readOnly = false,
  options = [],
  value,
  onChange,
  allowClear = true,
  resolvePillClassName,
}) => {
  const d = disabled || readOnly;

  const valueAllowed = useMemo(
    () => isValueInOptions(value, options),
    [value, options],
  );

  const selectValue = useMemo(() => {
    if (value == null || value === '') return undefined;
    if (!valueAllowed) return undefined;
    return value;
  }, [value, valueAllowed]);

  useEffect(() => {
    if (!valueAllowed && value != null && value !== '' && onChange) {
      onChange(undefined);
    }
  }, [valueAllowed, value, onChange]);

  const getPillClass = useCallback(
    (optionValue) => {
      if (typeof resolvePillClassName === 'function') {
        return resolvePillClassName(optionValue);
      }
      return 'cfg-materia-pill cfg-materia-pill--default';
    },
    [resolvePillClassName],
  );

  const renderPill = useCallback(
    (label, optionValue) => (
      <StatusPill label={label} className={getPillClass(optionValue)} />
    ),
    [getPillClass],
  );

  const optionRender = useCallback(
    (option) => {
      const optValue = option.value;
      const label = option.label ?? optValue;
      return (
        <div className="form-pill-select__option">
          {renderPill(label, optValue)}
        </div>
      );
    },
    [renderPill],
  );

  const labelRender = useCallback(
    ({ label, value: optionValue }) => renderPill(label ?? optionValue, optionValue),
    [renderPill],
  );

  return (
    <Select
      className="field-select form-pill-select"
      classNames={{ popup: 'form-pill-select__popup' }}
      placeholder={placeholder}
      disabled={d}
      options={options}
      value={selectValue}
      onChange={onChange}
      allowClear={allowClear}
      showSearch={false}
      optionRender={optionRender}
      labelRender={labelRender}
    />
  );
};

export default FormPillSelect;
