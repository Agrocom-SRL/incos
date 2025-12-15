// components/molecules/FormSection/FormSection.jsx
/**
 * FormSection: Molécula genérica para renderizar secciones de formulario
 * 
 * Single Responsibility: Renderizar una sección de formulario con campos organizados
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado
 * 
 * Ant Design aplica automáticamente:
 * - Card: colorBgContainer, borderRadius, colorBorder (desde theme.components.Card)
 * - Typography: colorTextHeading (desde theme.components.Typography)
 */

import { Card, Row, Col } from 'antd';
import FormField from '../FormField';

const FormSection = ({ title, fields, form, resolveOptions }) => {
  return (
    <Card
      type="inner"
      className="molecule-form-section"
      title={title}
    >
      <Row gutter={16}>
        {fields.map((field) => {
          // Sistema de columnas de Ant Design (24 columnas totales)
          // span: 24 = 1 columna (100% ancho)
          // span: 12 = 2 columnas (50% ancho cada una)
          // span: 8 = 3 columnas (33.33% ancho cada una)
          // span: 6 = 4 columnas (25% ancho cada una)
          const span = field.span || 12; // Por defecto: 2 columnas
          
          return (
            <Col 
              key={field.name} 
              xs={24}        // Móviles: siempre 1 columna (100% ancho)
              sm={span > 12 ? 24 : span}  // Tablets: si span > 12, usar 24 (1 columna), sino usar el span
              md={span}      // Desktop: usar el span definido en el config
              lg={span}      // Desktop grande: usar el span definido
            >
              <FormField
                field={field}
                form={form}
                resolveOptions={resolveOptions}
              />
            </Col>
          );
        })}
      </Row>
    </Card>
  );
};

export default FormSection;
