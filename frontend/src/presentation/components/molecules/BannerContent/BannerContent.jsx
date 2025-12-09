// src/presentation/components/molecules/BannerContent/BannerContent.jsx
import { Flex } from 'antd';
import { Typography, Button } from '@atoms';
import '@styles/components/molecules/banner-content.css';

/**
 * Componente molecular BannerContent
 * Combina Typography y Buttons para crear el contenido de un banner
 * 
 * @param {string} title - Título del banner
 * @param {string} description - Descripción del banner
 * @param {string} primaryButtonText - Texto del botón primario (opcional)
 * @param {string} secondaryButtonText - Texto del botón secundario (opcional)
 * @param {function} onPrimaryClick - Callback del botón primario
 * @param {function} onSecondaryClick - Callback del botón secundario
 * @param {string} className - Clases CSS adicionales
 */
const BannerContent = ({
    title,
    description,
    primaryButtonText,
    secondaryButtonText,
    onPrimaryClick,
    onSecondaryClick,
    className = '',
}) => {
    return (
        <Flex vertical gap="30px" className={`banner-content ${className}`}>
            <Flex vertical align="flex-start">
                <Typography.Title level={3} strong>
                    {title}
                </Typography.Title>
                <Typography.Text type="secondary" strong>
                    {description}
                </Typography.Text>
            </Flex>

            <Flex gap="large">
                {primaryButtonText && (
                    <Button type="primary" size="large" onClick={onPrimaryClick}>
                        {primaryButtonText}
                    </Button>
                )}
                {secondaryButtonText && (
                    <Button size="large" onClick={onSecondaryClick}>
                        {secondaryButtonText}
                    </Button>
                )}
            </Flex>
        </Flex>
    );
};

export default BannerContent;
