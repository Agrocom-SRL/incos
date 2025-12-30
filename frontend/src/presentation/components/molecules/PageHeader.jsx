/**
 * PageHeader - Componente molécula para encabezado de página
 * 
 * Single Responsibility: Mostrar título y acciones en el encabezado de una página
 * 
 * Atomic Design: Molecule
 * - Combina átomos: Heading + Button
 * - Layout: flex justify-between para colocar elementos en los bordes
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado
 * 
 * @param {string} title - Título de la página
 * @param {ReactNode} actions - Acciones (botones, etc.) a mostrar a la derecha
 * @param {string} className - Clase CSS adicional
 */

import React from 'react';
import { Flex, Space } from 'antd';
import { allSpacing } from '@theme/tokens';
import { Heading } from '@atoms';

const PageHeader = ({
  title,
  actions,
  className = ''
}) => {
  return (
    <Flex
      className="molecule-page-header"
      justify="space-between"
      align="flex-start"
      wrap="wrap"
      gap={allSpacing.margin}
    >
      <Heading level={2} style={{ margin: 0 }}>
        {title}
      </Heading>

      {actions && (
        <Space>
          {actions}
        </Space>
      )}
    </Flex>
  );
};

export default PageHeader;

