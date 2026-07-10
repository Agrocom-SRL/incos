/**
 * Selector visual del campo `icono` (kebab-case) de Actividad: fila con
 * preview + código + botón (mismo patrón que `FormColorPopoverPicker`) que
 * abre un Popover con la grilla de íconos de `ACTIVIDAD_ICON_MAP`.
 */
import { createElement, useState } from 'react';
import { Flex, Popover, Tooltip, Typography } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { Button } from '@atoms';
import {
  ACTIVIDAD_ICON_MAP,
  getActividadIconComponent,
} from '@configuracion/actividades/config/actividadIconMap';

const { Text } = Typography;

const ICON_ENTRIES = Object.entries(ACTIVIDAD_ICON_MAP);

const IconGrid = ({ value, onSelect }) => (
  <div className="form-icon-picker__grid">
    {ICON_ENTRIES.map(([key, IconComponent]) => {
      const selected = key === value;
      return (
        <Tooltip key={key} title={key}>
          <button
            type="button"
            className={
              selected
                ? 'form-icon-picker__cell form-icon-picker__cell--selected'
                : 'form-icon-picker__cell'
            }
            onClick={() => onSelect(key)}
            aria-label={key}
            aria-pressed={selected}
          >
            {createElement(IconComponent)}
          </button>
        </Tooltip>
      );
    })}
  </div>
);

const FormIconPicker = ({ value, onChange, disabled = false, readOnly = false, field }) => {
  const d = disabled || readOnly;
  const [open, setOpen] = useState(false);

  const handleOpenChange = (next) => {
    if (d) return;
    setOpen(next);
  };

  const handleSelect = (key) => {
    onChange?.(key);
    setOpen(false);
  };

  const CurrentIcon = getActividadIconComponent(value);

  return (
    <div className="form-icon-picker">
      <Flex align="center" gap={12} wrap="wrap" className="form-icon-picker__row">
        <span className="form-icon-picker__swatch" aria-hidden>
          {createElement(CurrentIcon)}
        </span>
        <Text code className="form-icon-picker__code">
          {value || 'Sin ícono'}
        </Text>
        <Popover
          content={<IconGrid value={value} onSelect={handleSelect} />}
          title={field?.label || 'Ícono'}
          trigger="click"
          open={!d && open}
          onOpenChange={handleOpenChange}
          placement="bottomLeft"
          destroyOnHidden
          classNames={{ root: 'form-icon-picker__overlay' }}
        >
          <Button variant="primary" size="small" icon={<AppstoreOutlined />} disabled={d}>
            Elegir ícono
          </Button>
        </Popover>
      </Flex>
      {field?.helperText ? (
        <Text type="secondary" className="form-icon-picker__hint">
          {field.helperText}
        </Text>
      ) : null}
    </div>
  );
};

export default FormIconPicker;
