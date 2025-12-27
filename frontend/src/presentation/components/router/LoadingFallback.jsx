// src/presentation/components/router/LoadingFallback.jsx
/**
 * Componente de carga mientras se cargan las rutas lazy
 * 
 * Single Responsibility: Solo maneja el estado de carga
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente router para mostrar estado de carga
 * - Usa: Skeleton de Ant Design (configurado en componentConfig.Skeleton)
 * - Estilos: Clases CSS desde styles/layout/loading.css (importado en styles/index.css)
 * 
 * El componente depende principalmente del tema de Ant Design via ConfigProvider:
 * - Colores: componentConfig.Skeleton (colorFill, colorFillContent, borderRadius)
 * - Tamaños: Variables CSS del tema (--skeleton-*)
 * - CSS solo para layout específico del componente
 */
import { Skeleton, Space, Flex } from 'antd';

const LoadingFallback = () => {
    return (
        <Flex 
            vertical
            className="loading-fallback"
        >
            <Space orientation="vertical" size="large" className="loading-fallback__content">
                {/* Skeleton para el título - usa className para tamaño específico */}
                <Skeleton.Input 
                    active 
                    size="large" 
                    className="loading-fallback__title"
                />
                
                {/* Skeleton para contenido principal - usa props del componente */}
                <Skeleton 
                    active 
                    paragraph={{ rows: 4 }} 
                    title={{ width: '60%' }}
                />
                
                {/* Skeleton para cards/secciones - usa className para tamaño específico */}
                <Flex gap="large" wrap="wrap">
                    <Skeleton.Image 
                        active 
                        className="loading-fallback__card"
                    />
                    <Skeleton.Image 
                        active 
                        className="loading-fallback__card"
                    />
                </Flex>
                
                {/* Skeleton para tabla o lista - usa props del componente */}
                <Skeleton 
                    active 
                    paragraph={{ rows: 6 }}
                    title={false}
                    className="loading-fallback__list"
                />
            </Space>
        </Flex>
    );
};

export default LoadingFallback;
