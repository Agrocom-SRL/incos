import { Select, Space, Typography } from 'antd';
import { allColors, allSpacing } from '@theme/tokens';

const FilterChip = ({ label, value, options, onChange }) => {
    const isActive = value !== 'all';

    return (
        <Space
            size={6}
            style={{
                padding: `${allSpacing.marginXS}px ${allSpacing.paddingSM}px`,
                borderRadius: allSpacing.borderRadius,
                border: `1px solid ${isActive ? allColors.colorPrimaryBorder : allColors.colorBorder}`,
                background: isActive ? allColors.colorPrimaryBg : allColors.colorWhite,
            }}
        >
            <Typography.Text style={{ color: isActive ? allColors.colorPrimaryText : allColors.colorTextSecondary }}>
                {label}
            </Typography.Text>
            <Select
                variant="borderless"
                value={value}
                onChange={onChange}
                style={{ minWidth: 130 }}
                options={[{ value: 'all', label: 'Todos' }, ...(options || []).map((opt) => ({ value: opt, label: opt }))]}
            />
        </Space>
    );
};

export default FilterChip;
