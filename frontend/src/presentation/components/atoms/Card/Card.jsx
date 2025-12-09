// src/presentation/components/atoms/Card/Card.jsx
import { Card as AntCard } from 'antd';
import '@styles/components/atoms/card.css';

const { Meta } = AntCard;

/**
 * Componente Card atómico
 * Wrapper de Ant Design Card con estilos del tema INCOS
 * 
 * @param {React.ReactNode} children - Contenido de la tarjeta
 * @param {string} className - Clases CSS adicionales
 * @param {object} props - Props adicionales de Ant Design Card
 */
const Card = ({ children, className = '', ...props }) => {
    return (
        <AntCard className={`incos-card ${className}`} {...props}>
            {children}
        </AntCard>
    );
};

Card.Meta = Meta;

export default Card;
