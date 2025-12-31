// src/presentation/modules/dashboard/pages/Dashboard/Dashboard.jsx
/**
 * Dashboard - Página principal del dashboard
 * 
 * Single Responsibility: Renderizar toda la UI del dashboard con componentes inline
 * 
 * Esta es una página pura de React y Ant Design que:
 * - No contiene lógica de negocio
 * - Obtiene datos del DashboardProvider mediante useDashboardContext
 * - Contiene todos los componentes inline (no usa componentes moleculares no aprobados)
 */

import { Flex, Spin, Card, Typography, Button, Avatar } from 'antd';
import { MainContent, InfoSidebar } from '@templates';
import { allSpacing, componentConfig, allColors, typography, gradients, shadows } from '@theme/tokens';
import { useDashboardContext } from '@application-dashboard';

const { Title, Text } = Typography;

const Dashboard = () => {
    // Obtener datos del contexto del dashboard
    const {
        carreras = [],
        docentesDestacados = [],
        docentesPrincipales = [],
        actividades = [],
        stats = { todayOrders: 0, monthOrders: 0 },
        loading,
    } = useDashboardContext();

    // Colores de acento para avatares (rotando entre los disponibles)
    const accentColors = [
        allColors.colorAccentBeige,
        allColors.colorInfo,
        allColors.colorAccentOlive,
        allColors.colorAccentBrown,
        allColors.colorError,
        allColors.colorAccentGreenLight,
    ];

    // Mostrar loading mientras se cargan los datos
    if (loading) {
        return (
            <Flex justify="center" align="center" style={{ minHeight: '400px' }}>
                <Spin size="large" />
            </Flex>
        );
    }

    return (
        <Flex 
            gap="large" 
            align="flex-start"
            style={{ width: '100%', height: '100%' }}
            className="page-container"
        >
            {/* Contenido Principal - 70% en lg+, expandible en menores */}
            <MainContent>
                {/* Banner Content */}
                <Card
                    style={{
                        backgroundColor: componentConfig.Card.colorBgContainer,
                        borderRadius: `${componentConfig.Card.borderRadius}px`,
                        boxShadow: componentConfig.Card.boxShadow,
                        padding: `${componentConfig.Card.paddingLG}px`,
                    }}
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
                            Bienvenido al Instituto INCOS
                        </Title>
                        
                        <Text
                            style={{
                                color: allColors.colorTextSecondary,
                                fontSize: `${typography.fontSize}px`,
                                lineHeight: typography.lineHeight,
                            }}
                        >
                            Formamos profesionales competentes en Administración de Empresas, Contaduría y Sistemas Informáticos. Únete a nuestra comunidad educativa y construye tu futuro profesional.
                        </Text>
                        
                        <Flex gap={allSpacing.margin}>
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
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = componentConfig.Button.colorPrimaryHover;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = componentConfig.Button.colorPrimary;
                                }}
                            >
                                Ver Carreras
                            </Button>
                            
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
                        </Flex>
                    </Flex>
                </Card>

                {/* Product List Section */}
                <Flex vertical gap={allSpacing.marginLG}>
                    <Flex justify="space-between" align="center">
                        <Title
                            level={4}
                            style={{
                                color: allColors.colorPrimary,
                                fontSize: `${typography.fontSizeHeading4}px`,
                                fontWeight: typography.fontWeightStrong,
                                margin: 0,
                            }}
                        >
                            Nuestras Carreras
                        </Title>
                        
                        <Typography.Link
                            style={{
                                color: allColors.colorPrimary,
                                fontSize: `${typography.fontSize}px`,
                                fontWeight: typography.fontWeightStrong,
                            }}
                        >
                            Ver Todas
                        </Typography.Link>
                    </Flex>
                    
                    <Flex gap={allSpacing.marginLG} wrap="wrap">
                        {carreras.map((product, index) => (
                            <Card
                                key={index}
                                hoverable
                                style={{
                                    backgroundColor: componentConfig.Card.colorBgContainer,
                                    borderRadius: `${componentConfig.Card.borderRadius}px`,
                                    boxShadow: componentConfig.Card.boxShadow,
                                    border: `1px solid ${componentConfig.Card.colorBorder}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    width: '100%',
                                    maxWidth: '300px',
                                    flex: '1 1 300px',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = componentConfig.Card.boxShadowHover;
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = componentConfig.Card.boxShadow;
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                                styles={{
                                    body: {
                                        padding: `${componentConfig.Card.padding}px`,
                                    }
                                }}
                            >
                                {product.image && (
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '200px',
                                            marginBottom: `${allSpacing.margin}px`,
                                            borderRadius: `${componentConfig.Card.borderRadius}px`,
                                            overflow: 'hidden',
                                            backgroundColor: allColors.colorBgElevated,
                                        }}
                                    >
                                        <img
                                            src={product.image}
                                            alt={product.label}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </div>
                                )}
                                
                                {product.label && (
                                    <Text
                                        style={{
                                            color: allColors.colorText,
                                            fontSize: `${typography.fontSize}px`,
                                            fontWeight: typography.fontWeightStrong,
                                        }}
                                    >
                                        {product.label}
                                    </Text>
                                )}
                            </Card>
                        ))}
                    </Flex>
                </Flex>

                {/* Seller Sections */}
                <Flex gap={allSpacing.marginXL} wrap="wrap">
                    {/* Docentes Destacados */}
                    <Flex vertical gap={allSpacing.margin} style={{ flex: '1 1 300px' }}>
                        <Flex justify="space-between" align="center">
                            <Title
                                level={5}
                                style={{
                                    color: allColors.colorPrimary,
                                    fontSize: `${typography.fontSizeHeading5}px`,
                                    fontWeight: typography.fontWeightStrong,
                                    margin: 0,
                                }}
                            >
                                Docentes Destacados
                            </Title>
                            
                            <Typography.Link
                                style={{
                                    color: allColors.colorPrimary,
                                    fontSize: `${typography.fontSizeSM}px`,
                                }}
                            >
                                Ver Todos
                            </Typography.Link>
                        </Flex>
                        
                        <Flex gap={allSpacing.marginSM} align="center" wrap="wrap">
                            {docentesDestacados.map((seller, index) => (
                                <Avatar
                                    key={index}
                                    size={40}
                                    style={{
                                        backgroundColor: accentColors[index % accentColors.length],
                                        color: allColors.colorTextOnDark,
                                    }}
                                >
                                    {seller.name?.[0] || 'U'}
                                </Avatar>
                            ))}
                            {docentesDestacados.length > 3 && (
                                <Avatar
                                    size={40}
                                    style={{
                                        backgroundColor: allColors.colorBgElevated,
                                        color: allColors.colorText,
                                        border: `2px dashed ${allColors.colorBorder}`,
                                    }}
                                >
                                    +{docentesDestacados.length - 3}
                                </Avatar>
                            )}
                        </Flex>
                        
                        {docentesDestacados.length > 0 && docentesDestacados[0].description && (
                            <Text
                                style={{
                                    color: allColors.colorTextSecondary,
                                    fontSize: `${typography.fontSizeSM}px`,
                                }}
                            >
                                {docentesDestacados[0].description}
                            </Text>
                        )}
                    </Flex>

                    {/* Docentes Principales */}
                    <Flex vertical gap={allSpacing.margin} style={{ flex: '1 1 300px' }}>
                        <Flex justify="space-between" align="center">
                            <Title
                                level={5}
                                style={{
                                    color: allColors.colorPrimary,
                                    fontSize: `${typography.fontSizeHeading5}px`,
                                    fontWeight: typography.fontWeightStrong,
                                    margin: 0,
                                }}
                            >
                                Docentes Principales
                            </Title>
                            
                            <Typography.Link
                                style={{
                                    color: allColors.colorPrimary,
                                    fontSize: `${typography.fontSizeSM}px`,
                                }}
                            >
                                Ver Todos
                            </Typography.Link>
                        </Flex>
                        
                        <Flex gap={allSpacing.marginSM} align="center" wrap="wrap">
                            {docentesPrincipales.map((seller, index) => (
                                <Avatar
                                    key={index}
                                    size={40}
                                    style={{
                                        backgroundColor: accentColors[index % accentColors.length],
                                        color: allColors.colorTextOnDark,
                                    }}
                                >
                                    {seller.name?.[0] || 'U'}
                                </Avatar>
                            ))}
                            {docentesPrincipales.length > 3 && (
                                <Avatar
                                    size={40}
                                    style={{
                                        backgroundColor: allColors.colorBgElevated,
                                        color: allColors.colorText,
                                        border: `2px dashed ${allColors.colorBorder}`,
                                    }}
                                >
                                    +{docentesPrincipales.length - 3}
                                </Avatar>
                            )}
                        </Flex>
                        
                        {docentesPrincipales.length > 0 && docentesPrincipales[0].description && (
                            <Text
                                style={{
                                    color: allColors.colorTextSecondary,
                                    fontSize: `${typography.fontSizeSM}px`,
                                }}
                            >
                                {docentesPrincipales[0].description}
                            </Text>
                        )}
                    </Flex>
                </Flex>
            </MainContent>

            {/* Resumen de Información - 30% en lg+ (min-width 300px), col-12 en menores */}
            <InfoSidebar>
                {/* Orders Summary Card */}
                <Card
                    style={{
                        background: gradients.gradientSuccess,
                        borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
                        boxShadow: shadows.shadowPrimary,
                        border: 'none',
                        padding: `${componentConfig.Card.paddingLG}px`,
                        minHeight: '200px',
                    }}
                    styles={{
                        body: {
                            padding: 0,
                        }
                    }}
                >
                    <Flex justify="space-between" align="center" style={{ height: '100%' }}>
                        <Flex vertical gap={allSpacing.marginLG}>
                            <Title
                                level={3}
                                style={{
                                    color: allColors.colorTextOnDark,
                                    fontSize: `${typography.fontSizeHeading4}px`,
                                    fontWeight: typography.fontWeightStrong,
                                    margin: 0,
                                    lineHeight: typography.lineHeightHeading3,
                                }}
                            >
                                Hoy <br />
                                {stats.todayOrders} estudiantes
                            </Title>
                            
                            <Title
                                level={3}
                                style={{
                                    color: allColors.colorTextOnDark,
                                    fontSize: `${typography.fontSizeHeading4}px`,
                                    fontWeight: typography.fontWeightStrong,
                                    margin: 0,
                                    lineHeight: typography.lineHeightHeading3,
                                }}
                            >
                                Este mes <br />
                                {stats.monthOrders} estudiantes
                            </Title>
                        </Flex>
                    </Flex>
                </Card>

                {/* Activity List */}
                <Flex vertical gap={allSpacing.marginLG}>
                    <Flex justify="space-between" align="center">
                        <Title
                            level={4}
                            style={{
                                color: allColors.colorPrimary,
                                fontSize: `${typography.fontSizeHeading4}px`,
                                fontWeight: typography.fontWeightStrong,
                                margin: 0,
                            }}
                        >
                            Actividades Recientes
                        </Title>
                        
                        <Typography.Link
                            style={{
                                color: allColors.colorPrimary,
                                fontSize: `${typography.fontSize}px`,
                                fontWeight: typography.fontWeightStrong,
                            }}
                        >
                            Ver Todas
                        </Typography.Link>
                    </Flex>
                    
                    <Flex vertical gap={allSpacing.marginLG}>
                        {actividades.map((activity, index) => (
                            <Flex key={index} gap={allSpacing.margin} align="flex-start">
                                <Avatar
                                    size={40}
                                    style={{
                                        backgroundColor: activity.avatarColor || accentColors[index % accentColors.length],
                                        color: activity.avatarColor ? allColors.colorTextOnDark : componentConfig.Avatar.colorText,
                                        flexShrink: 0,
                                    }}
                                >
                                    {activity.avatarText || activity.name?.[0] || 'U'}
                                </Avatar>
                                
                                <Flex vertical gap={allSpacing.marginXS} style={{ flex: 1, minWidth: 0 }}>
                                    <Text
                                        strong
                                        style={{
                                            color: allColors.colorText,
                                            fontSize: `${typography.fontSize}px`,
                                        }}
                                    >
                                        {activity.name}
                                    </Text>
                                    
                                    <Text
                                        style={{
                                            color: allColors.colorTextSecondary,
                                            fontSize: `${typography.fontSizeSM}px`,
                                        }}
                                    >
                                        {activity.action}
                                    </Text>
                                    
                                    {activity.timeAgo && (
                                        <Text
                                            type="secondary"
                                            style={{
                                                color: allColors.colorTextTertiary,
                                                fontSize: `${typography.fontSizeSM}px`,
                                            }}
                                        >
                                            {activity.timeAgo}
                                        </Text>
                                    )}
                                </Flex>
                            </Flex>
                        ))}
                    </Flex>
                </Flex>
            </InfoSidebar>
        </Flex>
    );
};

export default Dashboard;
