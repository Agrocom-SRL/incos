/**
 * Breadcrumb - Componente atómico para navegación breadcrumb
 * 
 * Single Responsibility: Mostrar la ruta de navegación jerárquica
 * 
 * Atomic Design: Atom
 * - Wrapper de Breadcrumb de Ant Design
 * - Proporciona una API consistente y simplificada
 * - Estilo moderno con separadores visuales y transiciones suaves
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS personalizado para mejoras visuales modernas
 * 
 * @param {Array} items - Array de items del breadcrumb
 * @param {string|ReactNode} separator - Separador entre items (default: 'chevron-right' icon o '/')
 * @param {string} className - Clase CSS adicional
 * @param {Object} style - Estilos inline adicionales
 * @param {boolean} useModernSeparator - Si usar separador moderno con icono (default: true)
 */

import React from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import { RightOutlined } from '@ant-design/icons';

const Breadcrumb = ({
  items = [],
  separator,
  className = '',
  style = {},
  useModernSeparator = true,
  ...props
}) => {
  // Separador moderno por defecto (icono de chevron)
  const defaultSeparator = useModernSeparator ? (
    <RightOutlined style={{ fontSize: '12px', color: 'var(--color-text-tertiary, #999999)', opacity: 0.7 }} />
  ) : '/';

  return (
    <AntBreadcrumb
      separator={separator !== undefined ? separator : defaultSeparator}
      items={items}
      className={`breadcrumb breadcrumb-modern ${className}`}
      style={style}
      {...props}
    />
  );
};

export default Breadcrumb;

