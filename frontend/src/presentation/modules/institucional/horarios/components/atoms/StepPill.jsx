import { CheckOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import { allColors, allSpacing, typography } from '@theme/tokens';

const StepPill = ({ label, index, isActive = false, isCompleted = false, onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                border: 'none',
                background: 'transparent',
                padding: `${allSpacing.paddingSM}px`,
                borderBottom: isActive ? `2px solid ${allColors.colorPrimary}` : `2px solid transparent`,
                cursor: 'pointer',
            }}
        >
            <Space size={8}>
                <span
                    style={{
                        width: 20,
                        height: 20,
                        borderRadius: allSpacing.borderRadius,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: typography.fontSizeXS,
                        color: isActive || isCompleted ? allColors.colorWhite : allColors.colorTextSecondary,
                        background: isActive
                            ? allColors.colorPrimary
                            : isCompleted
                              ? allColors.colorPrimaryHover
                              : allColors.colorBgSpotlight,
                    }}
                >
                    {isCompleted ? <CheckOutlined /> : index}
                </span>
                <span style={{ color: isActive ? allColors.colorPrimary : allColors.colorTextSecondary }}>
                    {label}
                </span>
            </Space>
        </button>
    );
};

export default StepPill;
