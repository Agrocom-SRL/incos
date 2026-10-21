import { Flex, Typography } from 'antd';
import { HexColorPicker } from 'react-colorful';

const { Text } = Typography;

/**
 * HexColorPicker (react-colorful): el Form.Item inyecta value/onChange como string #RRGGBB.
 */
const FormHexColorPicker = ({ value, onChange, disabled, readOnly, field }) => {
    const d = disabled || readOnly;
    const safe = typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/i.test(value) ? value : '#1890ff';
    return (
        <Flex vertical gap={8} style={{ maxWidth: 280 }}>
            <div
                style={{ opacity: d ? 0.55 : 1, pointerEvents: d ? 'none' : 'auto' }}
                aria-label={field?.ariaLabel || field?.label}
            >
                <HexColorPicker
                    color={safe}
                    onChange={onChange}
                    style={{ width: '100%', height: 140, borderRadius: 8 }}
                />
            </div>
            {field?.helperText ? (
                <Text type="secondary" style={{ fontSize: 13 }}>
                    {field.helperText}
                </Text>
            ) : null}
            <Text type="secondary" code style={{ fontSize: 12 }}>
                {safe}
            </Text>
        </Flex>
    );
};

export default FormHexColorPicker;
