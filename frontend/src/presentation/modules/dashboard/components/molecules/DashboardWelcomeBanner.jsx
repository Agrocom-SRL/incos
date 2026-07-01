import { Card, Flex, Typography, Button } from 'antd';
import { allSpacing, componentConfig, allColors, typography, shadows } from '@theme/tokens';

const { Title, Text } = Typography;

/**
 * Molécula: hero de bienvenida con CTA (dashboard).
 */
const DEFAULT_TITLE = 'Bienvenido al Instituto INCOS';
const DEFAULT_DESCRIPTION =
    'Formamos profesionales competentes en Administración de Empresas, Contaduría y Sistemas ' +
    'Informáticos. Únete a nuestra comunidad educativa y construye tu futuro profesional.';

const DashboardWelcomeBanner = ({
    onVerCarreras,
    onRegistrarEstudiante,
    showVerCarreras = true,
    showRegistrarEstudiante = true,
    title = DEFAULT_TITLE,
    description = DEFAULT_DESCRIPTION,
}) => {
    const showActions = showVerCarreras || showRegistrarEstudiante;
    return (
        <Card
            style={{
                backgroundColor: componentConfig.Card.colorBgContainer,
                borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
                boxShadow: shadows.shadowElevation2,
                border: `1px solid ${allColors.colorBorder}`,
                borderLeft: `4px solid ${allColors.colorPrimary}`,
            }}
            styles={{ body: { padding: `${componentConfig.Card.paddingLG}px` } }}
        >
            <Flex vertical gap={allSpacing.marginLG}>
                <Title
                    level={3}
                    style={{
                        color: allColors.colorPrimary,
                        fontSize: `${typography.fontSizeHeading3}px`,
                        fontWeight: typography.fontWeightStrong,
                        margin: 0,
                    }}
                >
                    {title}
                </Title>
                <Text
                    style={{
                        color: allColors.colorTextSecondary,
                        fontSize: `${typography.fontSize}px`,
                        lineHeight: typography.lineHeight,
                    }}
                >
                    {description}
                </Text>
                {showActions ? (
                <Flex gap={allSpacing.margin}>
                    {showVerCarreras ? (
                    <Button
                        type="primary"
                        size="large"
                        style={{
                            backgroundColor: componentConfig.Button.colorPrimary,
                            borderColor: componentConfig.Button.colorPrimaryBorder,
                            color: componentConfig.Button.colorPrimaryText,
                            borderRadius: `${componentConfig.Button.borderRadius}px`,
                            height: `${componentConfig.Button.controlHeightLG}px`,
                            paddingInline: `${componentConfig.Button.paddingInline}px`,
                            fontWeight: typography.fontWeightStrong,
                        }}
                        onClick={onVerCarreras}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = componentConfig.Button.colorPrimaryHover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = componentConfig.Button.colorPrimary;
                        }}
                    >
                        Ver Carreras
                    </Button>
                    ) : null}
                    {showRegistrarEstudiante ? (
                    <Button
                        size="large"
                        style={{
                            backgroundColor: allColors.colorBgContainer,
                            borderColor: allColors.colorBorder,
                            color: allColors.colorText,
                            borderRadius: `${componentConfig.Button.borderRadius}px`,
                            height: `${componentConfig.Button.controlHeightLG}px`,
                            paddingInline: `${componentConfig.Button.paddingInline}px`,
                        }}
                        onClick={onRegistrarEstudiante}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = allColors.colorBgElevated;
                            e.currentTarget.style.borderColor = allColors.colorPrimary;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = allColors.colorBgContainer;
                            e.currentTarget.style.borderColor = allColors.colorBorder;
                        }}
                    >
                        Registrar Estudiante
                    </Button>
                    ) : null}
                </Flex>
                ) : null}
            </Flex>
        </Card>
    );
};

export default DashboardWelcomeBanner;
