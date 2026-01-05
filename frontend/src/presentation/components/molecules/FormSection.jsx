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
 * - Soporta campos condicionales basados en valores del formulario
 */

import { Row, Col, Form } from 'antd';
import { Card } from '@atoms';
import { FormField, FormSubsection } from '@molecules';

const FormSection = ({
  title,
  fields = [],
  form,
  resolveOptions = () => [],
  minAge = null,
  readOnly = false,
}) => {
  // Asegurar que fields siempre sea un array
  const safeFields = Array.isArray(fields) ? fields : [];

  // Observar todos los campos del formulario para hacer reactivo el componente
  // cuando cambien los campos condicionales
  const allFormValues = Form.useWatch([], form);

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
        {safeFields.map((field, index) => {
          // Si es una sub-sección, renderizarla usando FormSubsection
          if (field.type === 'subsection') {
            return (
              <FormSubsection
                key={`subsection-${index}`}
                subsectionTitle={field.subsectionTitle}
                fields={field.fields || []}
                form={form}
                resolveOptions={resolveOptions}
                minAge={minAge}
                readOnly={readOnly}
                conditional={field.conditional || false}
                dependsOn={field.dependsOn}
                showIf={field.showIf}
              />
            );
          }

          // Si el campo es condicional, verificar si debe mostrarse
          if (field.conditional) {
            if (field.dependsOn) {
              const dependsOnValue = allFormValues?.[field.dependsOn];
              
              // Si el campo tiene showIf, evaluar la condición
              if (field.showIf) {
                const shouldShow = field.showIf(dependsOnValue);
                if (!shouldShow) return null;
              } else {
                // Por defecto, mostrar si el valor es truthy
                if (!dependsOnValue) return null;
              }
            } else {
              // Si es condicional pero no tiene dependsOn, no mostrar
              return null;
            }
          }

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
              sm={24}     // ≥ 576px (Tablets pequeñas): usar 24 columnas (100% ancho)
              md={24}     // ≥ 768px (Tablets): usar 24 columnas (100% ancho)
              lg={span >= 8 ? 12 : span}     // ≥ 992px (Desktop): si span >= 8, usar 12, sino usar el span
              xl={span}   // ≥ 1200px (Desktop grande): usar el span definido
              xxl={span}  // ≥ 1600px (Desktop extra grande): usar el span definido
            >
              <FormField
                field={field}
                form={form}
                resolveOptions={resolveOptions}
                minAge={minAge}
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
