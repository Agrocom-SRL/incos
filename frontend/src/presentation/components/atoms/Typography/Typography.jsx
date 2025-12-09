// src/presentation/components/atoms/Typography/Typography.jsx
import { Typography as AntTypography } from 'antd';
import '@styles/components/atoms/typography.css';

const { Title, Text, Paragraph } = AntTypography;

/**
 * Componente Typography atómico
 * Wrapper de Ant Design Typography con estilos del tema INCOS
 * 
 * @param {React.ReactNode} children - Contenido del texto
 * @param {string} className - Clases CSS adicionales
 * @param {object} props - Props adicionales de Ant Design Typography
 */
const Typography = ({ children, className = '', ...props }) => {
    return (
        <AntTypography className={`incos-typography ${className}`} {...props}>
            {children}
        </AntTypography>
    );
};

/**
 * @param {React.ReactNode} children - Contenido del título
 * @param {string} className - Clases CSS adicionales
 * @param {object} props - Props adicionales de Ant Design Title
 */
Typography.Title = ({ children, className = '', ...props }) => {
    return (
        <Title className={`incos-typography-title ${className}`} {...props}>
            {children}
        </Title>
    );
};

/**
 * @param {React.ReactNode} children - Contenido del texto
 * @param {string} className - Clases CSS adicionales
 * @param {object} props - Props adicionales de Ant Design Text
 */
Typography.Text = ({ children, className = '', ...props }) => {
    return (
        <Text className={`incos-typography-text ${className}`} {...props}>
            {children}
        </Text>
    );
};

/**
 * @param {React.ReactNode} children - Contenido del párrafo
 * @param {string} className - Clases CSS adicionales
 * @param {object} props - Props adicionales de Ant Design Paragraph
 */
Typography.Paragraph = ({ children, className = '', ...props }) => {
    return (
        <Paragraph className={`incos-typography-paragraph ${className}`} {...props}>
            {children}
        </Paragraph>
    );
};

export default Typography;
