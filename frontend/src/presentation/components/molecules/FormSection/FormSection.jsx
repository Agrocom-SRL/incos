/**
 * FormSection: Molécula para renderizar secciones de formulario
 * 
 * Single Responsibility: Renderizar una sección de formulario con campos organizados
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente que solo maneja UI
 * - Toda la lógica está en hooks especializados
 * 
 * Atomic Design: Molécula
 * - Usa moléculas (FormField, FormSubsection) y átomos (Card)
 * - Usa componentes nativos de Ant Design (Row, Col)
 * - Usa hooks personalizados para separar lógica de presentación
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI, la lógica está en hooks
 * - Open/Closed: Extensible agregando nuevos tipos de campos sin modificar código existente
 * - Dependency Inversion: Depende de hooks (abstracciones)
 * 
 * Estructura:
 * - Opcionalmente muestra un título si se proporciona
 * - Renderiza campos usando FormField
 * - Soporta campos condicionales basados en valores del formulario
 * - Soporta subsecciones usando FormSubsection
 */

import { Row, Typography } from 'antd';
import { Card } from '@atoms';
import { useFormSectionFields } from './hooks/useFormSectionFields';
import FieldRenderer from './components/FieldRenderer';
import { fieldRowKey } from './utils/fieldColumns';

const { Paragraph } = Typography;

const FormSection = ({
  title,
  /** Texto o nodo React bajo el título (ayuda contextual), p. ej. wizard SEG personal */
  description = null,
  fields = [],
  form,
  resolveOptions = () => [],
  minAge = null,
  readOnly = false,
}) => {
  // Hook que compone toda la lógica de campos de la sección
  const {
    fields: safeFields,
    shouldShowField,
    getColumns,
    hasFields,
  } = useFormSectionFields({
    fields,
    form,
  });

  // Si no hay campos, no renderizar nada
  if (!hasFields) {
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
      {description ? (
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          {description}
        </Paragraph>
      ) : null}
      {/* Campos del formulario */}
      <Row gutter={[24, 16]} className="form-section-fields">
        {safeFields.map((field, index) => (
          <FieldRenderer
            key={fieldRowKey(field, index)}
            field={field}
            index={index}
            form={form}
            resolveOptions={resolveOptions}
            minAge={minAge}
            readOnly={readOnly}
            getColumns={getColumns}
            shouldShowField={shouldShowField}
          />
        ))}
      </Row>
    </Card>
  );
};

export default FormSection;

