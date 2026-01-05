// components/molecules/FormSection.jsx
/**
 * FormSection: Molécula para renderizar secciones de formulario
 * 
 * Single Responsibility: Renderizar una sección de formulario con campos organizados
 * 
 * Atomic Design: Usa moléculas (FormField) y átomos (Text, Card) y componentes nativos de Ant Design (Row, Col, Divider)
 * 
 * Estructura:
 * - Opcionalmente muestra un título si se proporciona (usando Text)
 * - Opcionalmente muestra un divider si se proporciona
 * - Renderiza campos usando FormField
 */

import { Row, Col } from 'antd';
import { Text, Card } from '@atoms';
import { FormField } from '@molecules';

const FormSection = ({
  title,
  fields = [],
  form,
  resolveOptions = () => [],
  readOnly = false,
}) => {
  // Asegurar que fields siempre sea un array
  const safeFields = Array.isArray(fields) ? fields : [];

  // Si no hay campos, no renderizar nada
  if (safeFields.length === 0) {
    return null;
  }

  return (
    <Card
      className="form-section"
      title={title || null}
      variant="outlined"
      shadow={false}
      headerColor="primary"
    >

      {/* Campos del formulario */}
      <Row gutter={[24, 16]} className="form-section-fields">
        {safeFields.map((field) => {
          // Sistema de columnas de Ant Design (24 columnas totales)
          // span: 24 = 1 columna (100% ancho)
          // span: 12 = 2 columnas (50% ancho cada una)
          // span: 8 = 3 columnas (33.33% ancho cada una)
          // span: 6 = 4 columnas (25% ancho cada una)
          const span = field.span || 24; // Por defecto: 1 columna (100% ancho)

          return (
            <Col
              key={field.name}
              xs={24}     // < 576px (Móviles): siempre 24 span (100% ancho)
              sm={24}     // ≥ 576px (Tablets pequeñas): siempre 24 span (100% ancho)
              md={24}     // ≥ 768px (Tablets): siempre 24 span (100% ancho)
              lg={12}     // ≥ 992px (Desktop): siempre 12 span (50% ancho)
              xl={span}   // ≥ 1200px (Desktop grande): usar el span definido
              xxl={span}  // ≥ 1600px (Desktop extra grande): usar el span definido
            >
              <FormField
                field={field}
                form={form}
                resolveOptions={resolveOptions}
                readOnly={readOnly}
              />
            </Col>
          );
        })}
      </Row>
    </Card>
  );
};

export default FormSection;
