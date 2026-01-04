/**
 * Breadcrumb - Componente atómico para navegación breadcrumb
 * 
 * Single Responsibility: Mostrar la ruta de navegación jerárquica
 * 
 * Atomic Design: Atom
 * - Wrapper de Breadcrumb de Ant Design
 * - Proporciona una API consistente y simplificada
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado si es necesario
 * 
 * @param {Array} items - Array de items del breadcrumb
 * @param {string} separator - Separador entre items (default: '/')
 * @param {string} className - Clase CSS adicional
 * @param {Object} style - Estilos inline adicionales
 */

import React from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';

const Breadcrumb = ({
  items = [],
  separator = '/',
  className = '',
  style = {},
  ...props
}) => {
  return (
    <AntBreadcrumb
      separator={separator}
      items={items}
      className={`breadcrumb ${className}`}
      style={style}
      {...props}
    />
  );
};

export default Breadcrumb;

