/**
 * Selector de color en popover (mismo patrón que DatePicker — sin modal).
 */
import { useState } from 'react';
import { Flex, Popover, Typography } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import { HexColorPicker } from 'react-colorful';
import { Button } from '@atoms';

const { Text } = Typography;

const normalizeHex = (value) =>
  typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/i.test(value) ? value : '#52c41a';

const ColorPickerPanel = ({ draft, onDraftChange, onConfirm }) => (
  <div className="form-color-popover-picker__panel">
    <HexColorPicker
      color={draft}
      onChange={onDraftChange}
      className="form-color-popover-picker__picker"
    />
    <Flex justify="space-between" align="center" className="form-color-popover-picker__panel-footer">
      <Text code className="form-color-popover-picker__hex-panel">
        {draft}
      </Text>
      <Button variant="primary" size="small" onClick={onConfirm}>
        Listo
      </Button>
    </Flex>
  </div>
);

const FormColorPopoverPicker = ({ value, onChange, disabled, readOnly, field }) => {
  const d = disabled || readOnly;
  const safe = normalizeHex(value);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(safe);

  // Con el popover cerrado, el borrador sigue al valor externo
  // (ajuste durante render con comparación de prev, sin setState en effect).
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevSafe, setPrevSafe] = useState(safe);
  if (open !== prevOpen || safe !== prevSafe) {
    setPrevOpen(open);
    setPrevSafe(safe);
    if (!open) {
      setDraft(safe);
    }
  }

  const handleOpenChange = (next) => {
    if (d) return;
    if (!next && open) {
      onChange?.(draft);
    }
    setOpen(next);
  };

  const handleConfirm = () => {
    onChange?.(draft);
    setOpen(false);
  };

  return (
    <div className="form-color-popover-picker">
      <Flex align="center" gap={12} wrap="wrap" className="form-color-popover-picker__row">
        <span
          className="form-color-popover-picker__swatch"
          style={{ backgroundColor: safe }}
          aria-hidden
        />
        <Text code className="form-color-popover-picker__hex">
          {safe}
        </Text>
        <Popover
          content={
            <ColorPickerPanel draft={draft} onDraftChange={setDraft} onConfirm={handleConfirm} />
          }
          title={field?.label || 'Color identificador'}
          trigger="click"
          open={open}
          onOpenChange={handleOpenChange}
          placement="bottomLeft"
          destroyOnHidden
          classNames={{ root: 'form-color-popover-picker__overlay' }}
        >
          <Button
            variant="danger"
            size="small"
            icon={<BgColorsOutlined />}
            disabled={d}
          >
            Elegir color
          </Button>
        </Popover>
      </Flex>
      {field?.helperText ? (
        <Text type="secondary" className="form-color-popover-picker__hint">
          {field.helperText}
        </Text>
      ) : null}
    </div>
  );
};

export default FormColorPopoverPicker;
