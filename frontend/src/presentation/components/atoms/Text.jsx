/**
 * Text - Componente atómico para texto/parágrafos
 * 
 * Single Responsibility: Renderizar texto con estilos consistentes
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado
 * 
 * Ant Design aplica automáticamente:
 * - colorText (desde theme.components.Typography.colorText)
 * - fontSize (desde theme.components.Typography.fontSize)
 */

import { Typography } from 'antd';

const { Text: AntText, Paragraph } = Typography;

const Text = ({
  children,
  type = 'default', // 'default' | 'secondary' | 'success' | 'warning' | 'danger'
  strong = false,
  className = '',
  ...props
}) => {
  const textClassName = className ? `text ${className}`.trim() : 'text';

  if (type === 'paragraph') {
    return (
      <Paragraph className={textClassName} {...props}>
        {children}
      </Paragraph>
    );
  }

  return (
    <AntText
      type={type !== 'default' ? type : undefined}
      strong={strong}
      className={textClassName}
      {...props}
    >
      {children}
    </AntText>
  );
};

export default Text;

