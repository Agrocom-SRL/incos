import { Card, Typography } from 'antd';
import { allSpacing, componentConfig, allColors, typography } from '@theme/tokens';

const { Text } = Typography;

/**
 * Molécula: tarjeta individual de carrera (dashboard).
 */
const DashboardCarreraCard = ({ carrera, onSelect }) => {
    const colorHex = carrera.colorHex || '#1890ff';
    const hasImage = Boolean(carrera.image);

    return (
        <Card
            hoverable
            onClick={onSelect}
            style={{
                backgroundColor: componentConfig.Card.colorBgContainer,
                borderRadius: `${componentConfig.Card.borderRadius}px`,
                boxShadow: componentConfig.Card.boxShadow,
                border: `1px solid ${componentConfig.Card.colorBorder}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%',
                maxWidth: '320px',
                flex: '1 1 300px',
                overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = componentConfig.Card.boxShadowHover;
                e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = componentConfig.Card.boxShadow;
                e.currentTarget.style.transform = 'translateY(0)';
            }}
            styles={{ body: { padding: 0 } }}
        >
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '220px',
                    borderRadius: `${componentConfig.Card.borderRadius}px`,
                    overflow: 'hidden',
                    backgroundColor: hasImage ? allColors.colorBgElevated : `${colorHex}25`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {hasImage ? (
                    <>
                        <img
                            src={carrera.image}
                            alt={carrera.label || 'Carrera'}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.parentElement) {
                                    e.target.parentElement.style.backgroundColor = `${colorHex}25`;
                                }
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background:
                                    'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                padding: `${allSpacing.marginLG}px`,
                            }}
                        >
                            {carrera.label ? (
                                <Text
                                    style={{
                                        color: '#fff',
                                        fontSize: `${typography.fontSizeHeading5}px`,
                                        fontWeight: typography.fontWeightStrong,
                                        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                                        margin: 0,
                                        lineHeight: 1.3,
                                    }}
                                >
                                    {carrera.label}
                                </Text>
                            ) : null}
                            {carrera.codigo ? (
                                <Text
                                    style={{
                                        color: 'rgba(255,255,255,0.9)',
                                        fontSize: `${typography.fontSizeSM}px`,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                        marginTop: '2px',
                                    }}
                                >
                                    {carrera.codigo}
                                </Text>
                            ) : null}
                        </div>
                    </>
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: allSpacing.marginXS,
                        }}
                    >
                        <span
                            style={{
                                fontSize: '56px',
                                fontWeight: 'bold',
                                color: colorHex,
                            }}
                        >
                            {carrera.codigo?.charAt(0) || '?'}
                        </span>
                        {carrera.label ? (
                            <Text
                                style={{
                                    color: allColors.colorText,
                                    fontSize: `${typography.fontSize}px`,
                                    fontWeight: typography.fontWeightStrong,
                                    textAlign: 'center',
                                    padding: `0 ${allSpacing.margin}px`,
                                }}
                            >
                                {carrera.label}
                            </Text>
                        ) : null}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default DashboardCarreraCard;
