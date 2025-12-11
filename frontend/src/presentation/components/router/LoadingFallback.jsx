// src/presentation/components/router/LoadingFallback.jsx
/**
 * Componente de carga mientras se cargan las rutas lazy
 * Single Responsibility: Solo maneja el estado de carga
 * Usa Skeleton de Ant Design para mostrar un loader visual similar a Material UI
 */

import { Skeleton, Space, Flex } from 'antd';
import { allSpacing } from '@config/theme/spacing';

const LoadingFallback = () => {
    return (
        <Flex 
            vertical
            style={{ 
                padding: `${allSpacing.paddingLG}px`,
                height: '100vh',
                overflow: 'auto'
            }}
        >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Skeleton para el título */}
                <Skeleton.Input 
                    active 
                    size="large" 
                    style={{ width: 300, height: 32 }} 
                />
                
                {/* Skeleton para contenido principal */}
                <Skeleton 
                    active 
                    paragraph={{ rows: 4 }} 
                    title={{ width: '60%' }}
                />
                
                {/* Skeleton para cards/secciones */}
                <Flex gap={allSpacing.marginLG} wrap="wrap">
                    <Skeleton.Image 
                        active 
                        style={{ width: 300, height: 200 }} 
                    />
                    <Skeleton.Image 
                        active 
                        style={{ width: 300, height: 200 }} 
                    />
                </Flex>
                
                {/* Skeleton para tabla o lista */}
                <Skeleton 
                    active 
                    paragraph={{ rows: 6 }}
                    title={false}
                />
            </Space>
        </Flex>
    );
};

export default LoadingFallback;
