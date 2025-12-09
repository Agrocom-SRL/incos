// src/presentation/components/molecules/SectionHeader/SectionHeader.jsx
import { Flex } from 'antd';
import { Typography, Button } from '@atoms';
import '@styles/components/molecules/section-header.css';

/**
 * Componente molecular SectionHeader
 * Combina Typography (Title) y Button para crear encabezados de sección
 * 
 * @param {string} title - Título de la sección
 * @param {string} viewAllText - Texto del botón "Ver todo" (opcional)
 * @param {function} onViewAll - Callback al hacer clic en "Ver todo"
 * @param {number} level - Nivel del título (1-5)
 * @param {string} className - Clases CSS adicionales
 */
const SectionHeader = ({ title, viewAllText = 'View All', onViewAll, level = 3, className = '' }) => {
    return (
        <Flex align="center" justify="space-between" className={`section-header ${className}`}>
            <Typography.Title level={level} strong className="primary--color">
                {title}
            </Typography.Title>
            {viewAllText && (
                <Button type="link" className="gray--color" onClick={onViewAll}>
                    {viewAllText}
                </Button>
            )}
        </Flex>
    );
};

export default SectionHeader;
