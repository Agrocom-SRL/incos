/**
 * PageHeader - Componente molécula para encabezado de página
 * 
 * Single Responsibility: Mostrar título, breadcrumb y acciones en el encabezado de una página
 * 
 * Atomic Design: Molecule
 * - Combina átomos: Breadcrumb + Heading
 * - Layout: flex vertical para breadcrumb y título, flex horizontal para acciones
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado
 * 
 * @param {string} title - Título de la página
 * @param {ReactNode} actions - Acciones (botones, etc.) a mostrar a la derecha
 * @param {Array} breadcrumbItems - Items del breadcrumb (opcional)
 * @param {ReactNode} subtitle - Subtítulo opcional bajo el título (opcional)
 * @param {ReactNode} description - Descripción/ayuda opcional bajo el título (opcional)
 * @param {string} className - Clase CSS adicional
 *
 * Nota: cuando `subtitle`/`description` son undefined, el layout es idéntico al
 * previo (no se renderiza ningún nodo extra). El título va envuelto en FadeIn
 * (gateado por useReducedMotion vía el átomo): con reduced-motion es un fade de
 * opacidad simple, sin desplazamiento.
 */

import React from 'react';
import { Flex, Space } from 'antd';
import { allSpacing } from '@theme/tokens';
import { Heading, Breadcrumb } from '@atoms';
import { FadeIn } from '@presentation/motion';

const PageHeader = ({
  title,
  actions,
  breadcrumbItems,
  subtitle,
  description,
  className = ''
}) => {
  return (
    <Flex
      className={`page-header ${className}`}
      vertical
      gap={0}
    >
      {/* Breadcrumb (si existe) - Más sutil y compacto */}
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <Breadcrumb items={breadcrumbItems} />
      )}

      {/* Título y acciones en fila horizontal */}
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={allSpacing.margin}
      >
        <FadeIn>
          <Heading level={3} style={{ margin: 0 }}>
            {title}
          </Heading>
          {subtitle ? (
            <p className="page-header__subtitle">{subtitle}</p>
          ) : null}
          {description ? (
            <p className="page-header__description">{description}</p>
          ) : null}
        </FadeIn>

        {actions && (
          <Space>
            {actions}
          </Space>
        )}
      </Flex>
    </Flex>
  );
};

export default PageHeader;

