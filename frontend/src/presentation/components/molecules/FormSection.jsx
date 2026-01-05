// components/molecules/FormSection.jsx
/**
 * FormSection: Molécula para renderizar secciones de formulario
 * 
 * Single Responsibility: Renderizar una sección de formulario con campos organizados
 * 
 * Atomic Design: Usa moléculas (FormField) y componentes nativos de Ant Design (Row, Col, Divider)
 * 
 * Estructura:
 * - Opcionalmente muestra un título si se proporciona (usando Text)
 * - Opcionalmente muestra un divider si se proporciona
 * - Renderiza campos usando FormField
 */

import { Row, Col, Divider } from 'antd';
import { Text } from '@atoms';
import { FormField } from '@molecules';

const FormSection = ({
  title,
  fields = [],
  form,
  resolveOptions = () => [],
  showDivider = false,
  readOnly = false
}) => {
  // Asegurar que fields siempre sea un array
  const safeFields = Array.isArray(fields) ? fields : [];

  // Si no hay campos, no renderizar nada
  if (safeFields.length === 0) {
    return null;
  }

  return (
    <section className="form-section">
      {/* Título opcional */}
      {title && (
        <Text strong className="form-section-title">
          {title}
        </Text>
      )}

      {/* Divider opcional */}
      {showDivider && <Divider />}

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
              xs={24}        // < 576px (Móviles): siempre 1 columna (100% ancho)
              sm={span >= 12 ? 24 : span}  // ≥ 576px (Tablets pequeñas): si span >= 12, usar 24, sino usar el span
              md={span >= 8 ? 12 : span}   // ≥ 768px (Tablets): si span >= 8, usar 12, sino usar el span
              lg={span >= 8 ? 12 : span}   // ≥ 992px (Desktop): si span >= 8, usar 12, sino usar el span
              xl={span}      // ≥ 1200px (Desktop grande): usar el span definido
              xxl={span}     // ≥ 1600px (Desktop extra grande): usar el span definido
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
    </section>
  );
};

export default FormSection;
