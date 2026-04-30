import { Typography } from 'antd';
import { Card } from '@atoms';
import { allColors, allSpacing, typography } from '@theme/tokens';

const INTENT_COLORS = {
    info: allColors.colorInfo,
    warning: allColors.colorWarning,
    danger: allColors.colorError,
    success: allColors.colorSuccess,
    neutral: allColors.colorPrimary,
};

const KpiCard = ({ label, value, sub, badgeText, intent = 'neutral', percent = 0 }) => {
    const color = INTENT_COLORS[intent] || INTENT_COLORS.neutral;
    return (
        <Card size="small" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: allSpacing.marginSM, background: color }} />
            <div style={{ paddingLeft: allSpacing.marginSM }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography.Text type="secondary">{label}</Typography.Text>
                    <span style={{ fontSize: typography.fontSizeXS, borderRadius: allSpacing.borderRadius, padding: `${allSpacing.marginXS}px ${allSpacing.paddingSM}px`, background: `${color}20`, color }}>
                        {badgeText}
                    </span>
                </div>
                <Typography.Title level={3} style={{ margin: `${allSpacing.marginXS}px 0`, color }}>
                    {value}
                </Typography.Title>
                <Typography.Text type="secondary">{sub}</Typography.Text>
                <div style={{ marginTop: allSpacing.marginSM, height: allSpacing.marginXS, borderRadius: allSpacing.borderRadius, background: allColors.colorBgSpotlight }}>
                    <div style={{ width: `${Math.max(0, Math.min(100, percent))}%`, height: '100%', background: color, borderRadius: allSpacing.borderRadius }} />
                </div>
            </div>
        </Card>
    );
};

export default KpiCard;
